# src/brahma/infrastructure/factories/repository_factory.py
from __future__ import annotations

from brahma.infrastructure.persistence.base import ChunkRepository
from brahma.infrastructure.persistence.sqlalchemy_repo import SQLAlchemyChunkRepository


def build_chunk_repository() -> ChunkRepository:
    """Factory that currently returns the SQLAlchemy implementation.
    In the future we could expose an in‑memory stub for unit tests.
    """
    return SQLAlchemyChunkRepository()
