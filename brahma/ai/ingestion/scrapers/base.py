from dataclasses import dataclass, field
from typing import Optional

@dataclass
class RawArticle:
    source: str
    url: str
    title: Optional[str] = None
    abstract: Optional[str] = None
    authors: Optional[list] = field(default_factory=list)
    pub_date: Optional[str] = None
    doi: Optional[str] = None
    pmid: Optional[str] = None
    pmc_id: Optional[str] = None
    full_text: Optional[str] = None
    keywords: Optional[list] = field(default_factory=list)
    raw_html: Optional[str] = None

    def to_dict(self):
        return {
            "source": self.source,
            "url": self.url,
            "title": self.title,
            "abstract": self.abstract,
            "authors": self.authors,
            "pub_date": self.pub_date,
            "doi": self.doi,
            "pmid": self.pmid,
            "pmc_id": self.pmc_id,
            "full_text": self.full_text,
            "keywords": self.keywords,
        }
