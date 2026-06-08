from sqlalchemy import Column, Integer, String, Text, ARRAY
from pgvector.sqlalchemy import Vector
from app.db.base import Base

class Gene(Base):
    __tablename__ = "genes"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    # Embedding column for vector similarity search
    embedding = Column(Vector(768))

    def __repr__(self):
        return f"<Gene(id={self.id}, symbol='{self.symbol}', name='{self.name}')>"