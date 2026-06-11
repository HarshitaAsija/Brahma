# src/brahma/application/use_cases/chunk_section.py
"""Use case for chunking a single section of a paper.

Delegates the heavy lifting to :class:`~brahma.application.services.chunker.Chunker`
and returns the resulting list of :class:`~brahma.domain.entities.paper.Chunk`.
"""

from __future__ import annotations

from uuid import UUID
from brahma.domain.entities.paper import Section, Chunk
from brahma.application.services.chunker import Chunker


class ChunkSectionUseCase:
    """Orchestrates chunking of a single ``Section``.

    The use case is deliberately thin: it validates the input and forwards it
    to the ``Chunker`` service.
    """

    def __init__(self, chunker: Chunker) -> None:
        self._chunker = chunker

    def execute(self, paper_id: UUID, section: Section) -> list[Chunk]:
        """Return chunks for *section* belonging to *paper_id*.

        Args:
            paper_id: UUID of the parent :class:`Paper`.
            section: The section to be chunked.
        """
        return self._chunker.chunk_section(paper_id, section)
