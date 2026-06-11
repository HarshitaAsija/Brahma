# src/brahma/infrastructure/factories/repository_factory.py
"""Factory for creating a ``ChunkRepository`` implementation.

Currently it returns the SQLAlchemy repository, but the function abstracts the
choice so tests can inject an in‑memory stub in the future.
"""

from __future__ import annotations

from brahma.infrastructure.persistence.base import ChunkRepository
from brahma.infrastructure.persistence.sqlalchemy_repo import SQLAlchemyChunkRepository


def build_chunk_repository() -> ChunkRepository:
    """Return a concrete ``ChunkRepository``.

    The default implementation uses SQLAlchemy against the DB URL specified in
    :class:`brahma.config.settings.Settings`.
    """
    return SQLAlchemyChunkRepository()
