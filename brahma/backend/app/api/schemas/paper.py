from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date

class PaperBase(BaseModel):
    title: str = Field(..., example="Analysis of gene expression in cancer")
    abstract: Optional[str] = None
    authors: Optional[List[str]] = None
    journal: Optional[str] = None
    publication_date: Optional[date] = None
    doi: Optional[str] = None
    url: Optional[str] = None

class PaperCreate(PaperBase):
    pass

class PaperUpdate(BaseModel):
    title: Optional[str] = None
    abstract: Optional[str] = None
    authors: Optional[List[str]] = None
    journal: Optional[str] = None
    publication_date: Optional[date] = None
    doi: Optional[str] = None
    url: Optional[str] = None

class PaperOut(PaperBase):
    id: int

    class Config:
        orm_mode = True