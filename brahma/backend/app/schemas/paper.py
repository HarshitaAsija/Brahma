from datetime import date, datetime
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator


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
# Handles real scraper JSON output
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

    # url is optional in scraper JSON — falls back to source_url
    url: Optional[str] = None
    source_url: Optional[str] = None

    source: Optional[str] = "pubmed"

    # Scraper sends boolean true/false — we convert to string
    open_access: Optional[Any] = "false"

    # Extra scraper fields
    source_external_id: Optional[str] = None
    fetch_timestamp: Optional[datetime] = None
    scraper_version: Optional[str] = None

    # Scraper fields we accept but don't store in papers table
    sections: Optional[Any] = None
    article_type: Optional[str] = None
    language: Optional[str] = None
    keywords: Optional[list] = None
    mesh_terms: Optional[list] = None
    retracted: Optional[bool] = None
    retraction_reason: Optional[str] = None

    @model_validator(mode="after")
    def fix_fields(self) -> "PaperImportRequest":
        # If url is missing, use source_url
        if not self.url and self.source_url:
            self.url = self.source_url

        # If url is still missing, build a fallback
        if not self.url:
            self.url = f"https://doi.org/{self.doi}" if self.doi else ""

        # Convert boolean open_access to string
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
