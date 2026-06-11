# src/brahma/infrastructure/persistence/sqlalchemy_repo.py
"""SQLAlchemy implementation of the ``ChunkRepository`` port.

Creates a ``paper_chunks`` table (if it does not exist) and provides methods
for bulk inserting chunks and retrieving them by ``paper_id``.
"""

from __future__ import annotations

from typing import Iterable, List
from uuid import UUID

from sqlalchemy import Column, String, Text, create_engine, insert, select
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Session, declarative_base

from brahma.domain.entities.paper import Chunk
from .base import ChunkRepository
from brahma.config.settings import get_settings

Base = declarative_base()


class PaperChunkModel(Base):
    """SQLAlchemy model mapping to the ``paper_chunks`` table."""

    __tablename__ = "paper_chunks"

    chunk_id = Column(PG_UUID(as_uuid=True), primary_key=True)
    paper_id = Column(PG_UUID(as_uuid=True), nullable=False, index=True)
    section_name = Column(String, nullable=True)
    chunk_text = Column(Text, nullable=False)


class SQLAlchemyChunkRepository(ChunkRepository):
    """Concrete repository using SQLAlchemy.

    A new ``Session`` is created for each operation, making the class safe for
    concurrent use.
    """

    def __init__(self) -> None:
        cfg = get_settings()
        self._engine = create_engine(str(cfg.database_url), future=True, echo=False)
        # Ensure the table exists – in production migrations will handle this.
        Base.metadata.create_all(self._engine)

    def bulk_save(self, chunks: Iterable[Chunk]) -> None:
        """Insert a collection of ``Chunk`` objects efficiently.

        Args:
            chunks: Iterable of :class:`Chunk` to persist.
        """
        stmt = insert(PaperChunkModel).values(
            [
                {
                    "chunk_id": c.chunk_id,
                    "paper_id": c.paper_id,
                    "section_name": c.section_name,
                    "chunk_text": c.chunk_text,
                }
                for c in chunks
            ]
        )
        with Session(self._engine) as sess:
            sess.execute(stmt)
            sess.commit()

    def get_by_paper(self, paper_id: UUID) -> List[Chunk]:
        """Retrieve all chunks belonging to ``paper_id``.

        Returns:
            List[Chunk]: List of persisted chunks (empty if none).
        """
        stmt = select(PaperChunkModel).where(PaperChunkModel.paper_id == paper_id)
        with Session(self._engine) as sess:
            rows = sess.execute(stmt).scalars().all()
        return [
            Chunk(
                chunk_id=row.chunk_id,
                paper_id=row.paper_id,
                section_name=row.section_name or "",
                chunk_text=row.chunk_text,
            )
            for row in rows
        ]
