from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ARRAY
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from app.db.base import Base

class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(Text, nullable=False)
    abstract = Column(Text)
    authors = Column(ARRAY(String), nullable=False)
    journal = Column(String(255))
    publication_date = Column(Date)
    doi = Column(String(255), unique=True, index=True)
    url = Column(Text)
    # Embedding column for vector similarity search (BioBERT typically 768 dimensions)
    embedding = Column(Vector(768))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Paper(id={self.id}, title='{self.title[:50]}...')>"