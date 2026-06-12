from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    CheckConstraint,
    Enum,
    func,
)
from pgvector.sqlalchemy import Vector
from app.db.base import Base

# Relation types used in the MVP
RELATION_TYPES = ("treats", "associates_with", "affects", "prevents")
relation_type_enum = Enum(*RELATION_TYPES, name="relation_type")

class RelationshipInstance(Base):
    __tablename__ = "relationship_instances"

    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey("papers.id", ondelete="CASCADE"), nullable=False)
    entity_1_id = Column(Integer, ForeignKey("entities.id", ondelete="CASCADE"), nullable=False)
    entity_2_id = Column(Integer, ForeignKey("entities.id", ondelete="CASCADE"), nullable=False)
    relation_type = Column(relation_type_enum, nullable=False)
    evidence_sentence = Column(Text, nullable=False)
    section = Column(String(100), nullable=False)
    confidence_score = Column(Float, nullable=False)
    model_version = Column(String(100), default="scispaCy-0.4.0")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("paper_id", "entity_1_id", "entity_2_id", "relation_type",
                         name="uq_relationship_instances_paper_entities_type"),
        CheckConstraint("confidence_score >= 0 AND confidence_score <= 1",
                        name="ck_confidence_score_range"),
    )
