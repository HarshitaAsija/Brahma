from datetime import date, datetime
from typing import Any, Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)


# -----------------------------------------------------------------
# PaperRead
# -----------------------------------------------------------------
class PaperRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    abstract: str
    full_text: Optional[str] = None
    authors: Any
    journal: str
    publication_date: date
    doi: Optional[str] = None
    pmid: Optional[str] = None
    url: str
    source: Optional[str] = "pubmed"
    open_access: Optional[str] = "false"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# -----------------------------------------------------------------
# PaperListResponse
# -----------------------------------------------------------------
class PaperListResponse(BaseModel):
    total: int = Field(..., description="Total number of papers in the database")
    page: int = Field(..., description="Current page number (starts at 1)")
    page_size: int = Field(..., description="Number of papers per page")
    results: list[PaperRead]


# -----------------------------------------------------------------
# PaperImportRequest
# -----------------------------------------------------------------
class PaperImportRequest(BaseModel):
    title: str
    abstract: str
    full_text: Optional[str] = None
    authors: Any
    journal: str
    publication_date: date
    doi: Optional[str] = None
    pmid: Optional[str] = None

    # url is optional in scraper JSON
    url: Optional[str] = None
    source_url: Optional[str] = None

    source: Optional[str] = "pubmed"

    # scraper may send bool
    open_access: Optional[Any] = "false"

    # scraper metadata
    source_external_id: Optional[str] = None
    fetch_timestamp: Optional[datetime] = None
    scraper_version: Optional[str] = None

    # accepted but not stored
    sections: Optional[Any] = None
    article_type: Optional[str] = None
    language: Optional[str] = None
    keywords: Optional[list] = None
    mesh_terms: Optional[list] = None
    retracted: Optional[bool] = None
    retraction_reason: Optional[str] = None

    @field_validator("publication_date", mode="before")
    @classmethod
    def normalize_publication_date(cls, v):
        if not v:
            return None

        if isinstance(v, (date, datetime)):
            return v

        if isinstance(v, str):
            v = v.strip()

            # YYYY
            if len(v) == 4 and v.isdigit():
                return f"{v}-01-01"

            parts = v.split("-")

            # YYYY-M or YYYY-MM
            if len(parts) == 2:
                year = parts[0]
                month = parts[1].zfill(2)
                return f"{year}-{month}-01"

            # YYYY-M-D or YYYY-MM-DD
            if len(parts) == 3:
                year = parts[0]
                month = parts[1].zfill(2)
                day = parts[2].zfill(2)
                return f"{year}-{month}-{day}"

        return v

    @model_validator(mode="after")
    def fix_fields(self):
        # fallback url from source_url
        if not self.url and self.source_url:
            self.url = self.source_url

        # fallback url from DOI
        if not self.url:
            self.url = f"https://doi.org/{self.doi}" if self.doi else ""

        # normalize bool -> string
        if isinstance(self.open_access, bool):
            self.open_access = "true" if self.open_access else "false"

        return self


# -----------------------------------------------------------------
# PaperImportResponse
# -----------------------------------------------------------------
class PaperImportResponse(BaseModel):
    success: bool
    message: str
    paper_id: Optional[int] = None
    raw_paper_id: Optional[int] = None
    duplicate: bool = False