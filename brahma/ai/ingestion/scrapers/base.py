from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime

SCRAPER_VERSION = "1.0.0"

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
    sections: Optional[dict] = field(default_factory=dict)  # structured sections

    # Metadata
    authors: Optional[list] = field(default_factory=list)
    journal: Optional[str] = None
    publication_date: Optional[str] = None
    article_type: Optional[str] = None
    language: Optional[str] = "en"
    keywords: Optional[list] = field(default_factory=list)
    mesh_terms: Optional[list] = field(default_factory=list)

    # Access info
    open_access: Optional[bool] = None
    retracted: Optional[bool] = False
    retraction_reason: Optional[str] = None

    # Scraper info
    fetch_timestamp: Optional[str] = field(default_factory=lambda: datetime.utcnow().isoformat())
    scraper_version: Optional[str] = SCRAPER_VERSION

    # Raw HTML (not saved to JSON)
    raw_html: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "doi": self.doi,
            "pmid": self.pmid,
            "title": self.title,
            "abstract": self.abstract,
            "full_text": self.full_text,
            "sections": self.sections,
            "authors": self.authors,
            "journal": self.journal,
            "publication_date": self.publication_date,
            "article_type": self.article_type,
            "language": self.language,
            "keywords": self.keywords,
            "mesh_terms": self.mesh_terms,
            "open_access": self.open_access,
            "retracted": self.retracted,
            "retraction_reason": self.retraction_reason,
            "source": self.source,
            "source_external_id": self.source_external_id,
            "source_url": self.source_url,
            "fetch_timestamp": self.fetch_timestamp,
            "scraper_version": self.scraper_version,
        }
