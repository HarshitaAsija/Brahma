"""
BRAHMA scraper base — shared dataclass and chunking utilities.
Chunking splits articles by section so RAG and hypothesis generation
work on semantically coherent units (Introduction, Methods, Results…).
"""
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime
import re

SCRAPER_VERSION = "1.0.0"


# --------------------------------------------------------------------------- #
#  Section normalisation — maps raw headings to canonical types
# --------------------------------------------------------------------------- #

# Order matters: more specific patterns listed first
_SECTION_PATTERNS = [
    ("abstract",      ["abstract", "summary"]),
    ("introduction",  ["introduction", "background", "overview", "rationale"]),
    ("methods",       [
        "method", "material", "methodology", "experimental",
        "study design", "patient", "participant", "procedure",
        "protocol", "data collection", "statistical", "analysis",
        "experimental model", "subject detail", "quantification",
    ]),
    ("results",       ["result", "finding", "outcome", "observation"]),
    ("discussion",    ["discussion", "interpretation"]),
    ("conclusion",    ["conclusion", "closing", "implication"]),
    ("references",    ["reference", "bibliography", "literature cited"]),
]

# Noise — exclude from chunks entirely
_NOISE_SECTIONS = {
    "author contributions", "competing interests", "conflict of interest",
    "acknowledgment", "acknowledgments", "acknowledgement", "acknowledgements", "funding", "data availability",
    "supplementary", "disclosures", "appendix", "figure legends",
    "abbreviations", "list of supplementary", "footnotes",
    "follow this preprint", "citation manager formats",
}


def normalize_section_name(raw: str) -> str:
    """
    Map a raw section heading to a canonical section type.

    Examples
    --------
    "1. Introduction"           → "introduction"
    "2.3. Materials and Methods"→ "methods"
    "EXPERIMENTAL MODEL"        → "methods"
    "Competing Interests"       → "_noise_"   (caller should skip)
    """
    # Strip leading numbering: "1.", "2.3.", "A.", etc.
    cleaned = re.sub(r"^[\d]+[\.\d]*\s*", "", raw).strip()
    cleaned = re.sub(r"^[A-Z]\.\s*", "", cleaned).strip()
    lower = cleaned.lower()

    if any(noise in lower for noise in _NOISE_SECTIONS):
        return "_noise_"

    for canonical, keywords in _SECTION_PATTERNS:
        for kw in keywords:
            if kw in lower:
                return canonical

    return lower  # keep as-is if no match


def build_chunks(
    sections: dict,
    abstract: str = "",
    title: str = "",
) -> list:
    """
    Convert a sections dict into a list of chunk dicts ready for
    vector embedding and RAG retrieval.

    Each chunk contains:
      - section_type  : canonical type  (introduction, methods, …)
      - section_label : original heading from the paper
      - text          : section text
      - word_count    : number of words

    Rules:
      - Abstract is always the first chunk (if present).
      - Noise sections (acknowledgements, references, …) are excluded.
      - The "references" section is excluded (not useful for RAG).
    """
    chunks: list = []

    # Abstract first
    if abstract and abstract.strip():
        chunks.append({
            "section_type":  "abstract",
            "section_label": "Abstract",
            "text":          abstract.strip(),
            "word_count":    len(abstract.split()),
        })

    for raw_label, text in sections.items():
        if not text or not text.strip():
            continue

        sec_type = normalize_section_name(raw_label)

        # Drop noise and references
        if sec_type in ("_noise_", "references"):
            continue
        # Skip abstract again if it appears in sections dict
        if sec_type == "abstract":
            continue

        chunks.append({
            "section_type":  sec_type,
            "section_label": raw_label,
            "text":          text.strip(),
            "word_count":    len(text.split()),
        })

    return chunks


# --------------------------------------------------------------------------- #
#  RawArticle dataclass
# --------------------------------------------------------------------------- #

@dataclass
class RawArticle:
    # Core identifiers
    source: str
    source_url: str
    source_external_id: Optional[str] = None
    doi: Optional[str] = None
    pmid: Optional[str] = None

    # Content
    title: Optional[str] = None
    abstract: Optional[str] = None
    full_text: Optional[str] = None
    sections: Optional[dict] = field(default_factory=dict)

    # Metadata
    authors: Optional[list] = field(default_factory=list)
    journal: Optional[str] = None
    publication_date: Optional[str] = None
    article_type: Optional[str] = None
    language: Optional[str] = "en"
    keywords: Optional[list] = field(default_factory=list)
    mesh_terms: Optional[list] = field(default_factory=list)

    # Access
    open_access: Optional[bool] = None
    retracted: Optional[bool] = False
    retraction_reason: Optional[str] = None

    # Scraper provenance
    fetch_timestamp: Optional[str] = field(
        default_factory=lambda: datetime.utcnow().isoformat()
    )
    scraper_version: Optional[str] = SCRAPER_VERSION

    # Not serialised
    raw_html: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "doi":               self.doi,
            "pmid":              self.pmid,
            "title":             self.title,
            "abstract":          self.abstract,
            "full_text":         self.full_text,
            "sections":          self.sections,
            "authors":           self.authors,
            "journal":           self.journal,
            "publication_date":  self.publication_date,
            "article_type":      self.article_type,
            "language":          self.language,
            "keywords":          self.keywords,
            "mesh_terms":        self.mesh_terms,
            "open_access":       self.open_access,
            "retracted":         self.retracted,
            "retraction_reason": self.retraction_reason,
            "source":            self.source,
            "source_external_id": self.source_external_id,
            "source_url":        self.source_url,
            "fetch_timestamp":   self.fetch_timestamp,
            "scraper_version":   self.scraper_version,
        }

    def get_chunks(self) -> list:
        """
        Return chunking-ready list for the vector embedding pipeline.
        Call this after scraping — the chunker module reads these dicts.
        """
        return build_chunks(
            self.sections or {},
            abstract=self.abstract or "",
            title=self.title or "",
        )
