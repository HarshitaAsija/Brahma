from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, UniqueConstraint, func
from pgvector.sqlalchemy import Vector
from app.db.base import Base

# Entity types used in the MVP
ENTITY_TYPES = ("Drug", "Disease", "Gene", "Protein")
entity_type_enum = Enum(*ENTITY_TYPES, name="entity_type")

class Entity(Base):
    __tablename__ = "entities"

    id = Column(Integer, primary_key=True, index=True)
    canonical_name = Column(String(255), nullable=False)
    entity_type = Column(entity_type_enum, nullable=False)  # Fixed enum
    description = Column(Text)
    embedding = Column(Vector(1536))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("canonical_name", "entity_type", name="uq_entities_canonical_type"),
    )
