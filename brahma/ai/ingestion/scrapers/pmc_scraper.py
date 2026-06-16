# NCBI E-utilities based PMC scraper — no browser, no CAPTCHA
# Get free API key: https://www.ncbi.nlm.nih.gov/account/
# Without key: 3 req/sec | With key: 10 req/sec
NCBI_API_KEY = None

import asyncio
import httpx
import xml.etree.ElementTree as ET
import re
from typing import Optional
from datetime import datetime
from ai.ingestion.scrapers.base import SCRAPER_VERSION

BASE_SEARCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
BASE_FETCH  = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"

def _clean(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip()

def _itertext(el) -> str:
    return "".join(el.itertext()).strip() if el is not None else ""

async def _get_pmc_ids(query: str, max_results: int, client: httpx.AsyncClient) -> list:
    params = {
        "db": "pmc", "term": query,
        "retmax": max_results, "retmode": "json",
        "usehistory": "y",
        "sort": "relevance",
        "field": "title/abstract",
    }
    if NCBI_API_KEY:
        params["api_key"] = NCBI_API_KEY
    try:
        resp = await client.get(BASE_SEARCH, params=params)
        resp.raise_for_status()
        ids = resp.json()["esearchresult"]["idlist"]
        print(f"  [PMC] Found {len(ids)} articles for: {query}")
        return ids
    except Exception as e:
        print(f"  [PMC] Search error: {e}")
        return []

async def _fetch_batch(pmcids: list, client: httpx.AsyncClient) -> list:
    params = {
        "db": "pmc", "id": ",".join(pmcids),
        "retmode": "xml",
    }
    if NCBI_API_KEY:
        params["api_key"] = NCBI_API_KEY

    for attempt in range(3):
        try:
            resp = await client.get(BASE_FETCH, params=params)
            resp.raise_for_status()
            break
        except Exception as e:
            if attempt == 2:
                print(f"  [PMC] Batch fetch failed: {e}")
                return []
            await asyncio.sleep(2 ** attempt)

    root = ET.fromstring(resp.text)
    papers = []

    for article in root.findall(".//article"):
        try:
            # Title
            title_el = article.find(".//title-group/article-title")
            title = _itertext(title_el)

            # Abstract
            abstract_els = article.findall(".//abstract//p")
            abstract = " ".join(_itertext(el) for el in abstract_els).strip()

            # Full text body — all paragraphs
            body_els = article.findall(".//body//p")
            body = " ".join(_itertext(el) for el in body_els).strip()
            full_text = body if body else abstract

            # Structured sections
            sections = {}
            for sec in article.findall(".//body//sec"):
                heading_el = sec.find("title")
                heading = _itertext(heading_el) if heading_el is not None else ""
                paras = sec.findall("p")
                content = " ".join(_itertext(p) for p in paras).strip()
                if heading and content:
                    sections[heading] = content

            # Authors
            authors = []
            for contrib in article.findall(".//contrib[@contrib-type='author']"):
                last  = contrib.findtext(".//surname", "")
                first = contrib.findtext(".//given-names", "")
                name  = f"{first} {last}".strip()
                if name:
                    authors.append(name)

            # Journal
            journal = article.findtext(".//journal-title", "")

            # DOI
            doi = ""
            for id_el in article.findall(".//article-id"):
                if id_el.get("pub-id-type") == "doi":
                    doi = id_el.text or ""

            # PMC ID
            pmcid = ""
            for id_el in article.findall(".//article-id"):
                if id_el.get("pub-id-type") == "pmcid":
                    pmcid = id_el.text or ""
                    break

            # PMID
            pmid = ""
            for id_el in article.findall(".//article-id"):
                if id_el.get("pub-id-type") == "pmid":
                    pmid = id_el.text or ""

            # Publication date
            pub_date = ""
            for pd in article.findall(".//pub-date"):
                year  = pd.findtext("year", "")
                month = pd.findtext("month", "")
                if year:
                    pub_date = f"{year}-{month}".strip("-")
                    break

            # Keywords
            keywords = [
                _itertext(kw)
                for kw in article.findall(".//kwd")
                if _itertext(kw)
            ]

            # MeSH terms
            mesh_terms = [
                _itertext(m)
                for m in article.findall(".//mesh-heading//descriptor-name")
                if _itertext(m)
            ]

            # Article type
            article_type = article.get("article-type", "research-article")

            # Language
            language = article.get("xml:lang", "en")

            word_count = len(full_text.split()) if full_text else 0
            url = f"https://pmc.ncbi.nlm.nih.gov/articles/PMC{pmcid}/" if pmcid else ""

            print(f"    ✓ {title[:70]}")

            papers.append({
                "doi":              doi,
                "pmid":             pmid,
                "title":            title,
                "abstract":         abstract,
                "full_text":        full_text,
                "sections":         sections,
                "authors":          authors,
                "journal":          journal,
                "publication_date": pub_date,
                "article_type":     article_type,
                "language":         language,
                "keywords":         keywords,
                "mesh_terms":       mesh_terms,
                "open_access":      True,
                "retracted":        False,
                "retraction_reason": None,
                "source":           "pmc",
                "source_external_id": pmcid,
                "source_url":       url,
                "word_count":       word_count,
                "fetch_timestamp":  datetime.utcnow().isoformat(),
                "scraper_version":  SCRAPER_VERSION,
            })

        except Exception as e:
            print(f"  [PMC] Parse error: {e}")

    return papers

async def run_pmc(query: str, max_results: int = 10) -> list:
    print(f"\n[PMC] Query: {query}")
    delay = 0.1 if NCBI_API_KEY else 0.35

    async with httpx.AsyncClient(timeout=30) as client:
        ids = await _get_pmc_ids(query, max_results, client)
        if not ids:
            return []

        all_papers = []
        batch_size = 20
        total_batches = (len(ids) + batch_size - 1) // batch_size

        for i in range(0, len(ids), batch_size):
            batch = ids[i: i + batch_size]
            batch_num = i // batch_size + 1
            print(f"  [PMC] Fetching batch {batch_num}/{total_batches} ({len(batch)} papers)...")
            papers = await _fetch_batch(batch, client)
            all_papers.extend(papers)
            await asyncio.sleep(delay)

    print(f"  [PMC] Done. {len(all_papers)} papers fetched.")
    return all_papers

import json
import os

def search_and_scrape(query: str, max_results: int = 10,
                      output_dir: str = "/home/shalu/brahma_workspace/Brahma/brahma/ai/ingestion/output") -> list:
    """Synchronous entry point for PMC scraping — mirrors pubmed_scraper interface."""
    import asyncio
    os.makedirs(output_dir, exist_ok=True)
    papers = asyncio.run(run_pmc(query, max_results))

    results = []
    for paper in papers:
        if not paper.get("title"):
            continue
        pmcid = paper.get("source_external_id", "unknown")
        safe_id = f"pmc_{pmcid}"
        out_path = f"{output_dir}/{safe_id}.json"
        if os.path.exists(out_path):
            print(f"  [SKIP] {safe_id} already saved")
            continue
        with open(out_path, "w") as f:
            json.dump(paper, f, indent=2, ensure_ascii=False)
        print(f"  [SAVED] {safe_id}.json | {paper['title'][:50]} | {paper['word_count']} words")
        results.append(paper)

    print(f"  [PMC] Saved {len(results)} articles.")
    return results
