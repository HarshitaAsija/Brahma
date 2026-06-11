# src/brahma/application/use_cases/chunk_section.py
from __future__ import annotations

from uuid import UUID
from brahma.domain.entities.paper import Section, Chunk
from brahma.application.services.chunker import Chunker


class ChunkSectionUseCase:
    """Use case that delegates a Section to the Chunker service.
    Returns a list of ``Chunk`` objects for the supplied ``paper_id``.
    """

    def __init__(self, chunker: Chunker) -> None:
        self._chunker = chunker

    def execute(self, paper_id: UUID, section: Section) -> list[Chunk]:
        return self._chunker.chunk_section(paper_id, section)
