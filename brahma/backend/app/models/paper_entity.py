from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint, func
from app.db.base import Base

class PaperEntity(Base):
    __tablename__ = "paper_entities"

    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey("papers.id", ondelete="CASCADE"), nullable=False)
    entity_id = Column(Integer, ForeignKey("entities.id", ondelete="CASCADE"), nullable=False)
    section = Column(String(100), nullable=False)          # e.g. abstract, results
    evidence_text = Column(Text, nullable=False)          # sentence showing the entity
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("paper_id", "entity_id", "section", name="uq_paper_entities_paper_entity_section"),
    )
