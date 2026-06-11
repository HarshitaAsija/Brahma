import hashlib
import json
from datetime import datetime
from typing import Optional

def _make_hash(doi: str = None, pmid: str = None, title: str = None, source_external_id: str = None) -> str:
    """Unique fingerprint for deduplication — used as ingestion_hash."""
    key = doi or pmid or source_external_id or title or ""
    return hashlib.sha256(key.strip().lower().encode()).hexdigest()

def _parse_date(date_str: str) -> Optional[str]:
    """Try to parse various date formats into YYYY-MM-DD."""
    if not date_str:
        return None
    formats = [
        "%Y-%m-%d", "%Y/%m/%d", "%m/%d/%Y",
        "%Y %b", "%b %Y", "%Y",
        "%d %b %Y", "%B %d, %Y"
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt).strftime("%Y-%m-%d")
        except:
            continue
    # Last resort — extract 4-digit year
    import re
    year = re.search(r"\b(19|20)\d{2}\b", str(date_str))
    if year:
        return f"{year.group()}-01-01"
    return None

def normalize_to_raw_papers(scraped: dict) -> dict:
    """
    Maps scraped article dict → raw_papers table schema.
    This is the L0 layer — immutable audit log of what was scraped.
    Handles data from all 4 sources: pubmed, pmc, biorxiv, medrxiv.
    """
    # Handle both dict (pubmed/biorxiv) and RawArticle object (pmc)
    if hasattr(scraped, "__dict__"):
        scraped = vars(scraped)

    doi = scraped.get("doi") or None
    pmid = scraped.get("pmid") or None
    source_external_id = scraped.get("source_external_id") or scraped.get("pmc_id") or ""
    title = scraped.get("title") or ""

    ingestion_hash = _make_hash(doi, pmid, title, source_external_id)

    pub_date = _parse_date(
        scraped.get("publication_date") or scraped.get("pub_date")
    )

    authors = scraped.get("authors") or []
    if isinstance(authors, str):
        authors = [a.strip() for a in authors.split(",")]

    keywords = scraped.get("keywords") or []
    mesh_terms = scraped.get("mesh_terms") or []

    fetch_ts = scraped.get("fetch_timestamp")
    if not fetch_ts:
        fetch_ts = datetime.utcnow().isoformat()

    return {
        # Identity
        "ingestion_hash"    : ingestion_hash,
        "raw_title"         : title,
        "abstract"          : scraped.get("abstract") or None,
        "full_text"         : scraped.get("full_text") or None,
        # Source
        "source"            : scraped.get("source") or "unknown",
        "source_external_id": source_external_id,
        "source_url"        : scraped.get("source_url") or scraped.get("url") or "",
        # Identifiers
        "doi"               : doi,
        "pmid"              : str(pmid) if pmid else None,
        # Metadata
        "authors"           : json.dumps(authors),
        "journal"           : scraped.get("journal") or None,
        "publication_date"  : pub_date,
        "keywords"          : json.dumps(keywords),
        "mesh_terms"        : json.dumps(mesh_terms),
        "article_type"      : scraped.get("article_type") or None,
        "language"          : scraped.get("language") or "en",
        # Pipeline
        "fetch_timestamp"   : fetch_ts,
        "scraper_version"   : scraped.get("scraper_version") or "1.0.0",
        "pipeline_status"   : "pending",
        "retry_count"       : 0,
    }

def normalize_to_papers(scraped: dict) -> Optional[dict]:
    """
    Maps scraped article dict → papers table schema (L1 canonical layer).
    Only called after raw_papers insert succeeds.
    Returns None if required fields are missing.
    """
    if hasattr(scraped, "__dict__"):
        scraped = vars(scraped)

    doi   = scraped.get("doi") or None
    pmid  = scraped.get("pmid") or None
    title = scraped.get("title") or ""
    source_external_id = scraped.get("source_external_id") or scraped.get("pmc_id") or ""

    if not title:
        return None

    ingestion_hash = _make_hash(doi, pmid, title, source_external_id)

    pub_date = _parse_date(
        scraped.get("publication_date") or scraped.get("pub_date")
    )

    return {
        "ingestion_hash"    : ingestion_hash,
        "doi"               : doi,
        "pmid"              : str(pmid) if pmid else None,
        "title"             : title,
        "abstract"          : scraped.get("abstract") or None,
        "journal"           : scraped.get("journal") or "Unknown",
        "publication_date"  : pub_date or "1900-01-01",
        "article_type"      : scraped.get("article_type") or "Unknown",
        "language"          : scraped.get("language") or "en",
        "open_access"       : bool(scraped.get("open_access", False)),
        "retracted"         : bool(scraped.get("retracted", False)),
        "retraction_reason" : scraped.get("retraction_reason") or None,
        "source"            : scraped.get("source") or "unknown",
        "source_external_id": source_external_id,
    }

def normalize_to_sections(scraped: dict, paper_id: str) -> Optional[dict]:
    """
    Maps sections dict → paper_text_sections table schema.
    Returns None if no sections available.
    """
    if hasattr(scraped, "__dict__"):
        scraped = vars(scraped)

    sections = scraped.get("sections") or {}
    if not sections:
        return None

    def _get_section(*keys) -> str:
        for k in keys:
            for sec_key, text in sections.items():
                if k.lower() in sec_key.lower() and text:
                    return text
        return ""

    return {
        "paper_id"    : paper_id,
        "introduction": _get_section("introduction", "background"),
        "methods"     : _get_section("methods", "materials"),
        "results"     : _get_section("results", "findings"),
        "discussion"  : _get_section("discussion"),
        "conclusion"  : _get_section("conclusion", "summary"),
    }
