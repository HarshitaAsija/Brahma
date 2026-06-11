# src/brahma/infrastructure/persistence/base.py
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Iterable, List
from uuid import UUID

from brahma.domain.entities.paper import Chunk


class ChunkRepository(ABC):
    """Port interface for persisting ``Chunk`` aggregates."""

    @abstractmethod
    def bulk_save(self, chunks: Iterable[Chunk]) -> None:
        """Persist a collection of ``Chunk`` objects atomically."""
        ...

    @abstractmethod
    def get_by_paper(self, paper_id: UUID) -> List[Chunk]:
        """Retrieve all chunks belonging to ``paper_id`` (used downstream)."""
        ...
