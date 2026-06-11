from sqlalchemy import Column, Integer, String, Text, Date, DateTime, JSON, func
from app.db.base import Base

class RawPaper(Base):
    __tablename__ = "raw_papers"

    id = Column(Integer, primary_key=True, index=True)
    ingestion_hash = Column(String(255), unique=True, nullable=False)
    raw_title = Column(Text, nullable=False)
    abstract = Column(Text)
    full_text = Column(Text)
    source = Column(String(100), default="pubmed")
    source_external_id = Column(String(255), nullable=False)  # PMID
    source_url = Column(Text, nullable=False)
    doi = Column(String(255))
    pmid = Column(String(255), unique=True)
    authors = Column(JSON, nullable=False)
    journal = Column(String(255), nullable=False)
    publication_date = Column(Date, nullable=False)
    fetch_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
