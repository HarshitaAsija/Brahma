# src/brahma/application/use_cases/chunk_paper.py
from __future__ import annotations

from typing import List

from brahma.domain.entities.paper import Paper, Chunk
from brahma.application.use_cases.chunk_section import ChunkSectionUseCase
from brahma.infrastructure.persistence.base import ChunkRepository


class ChunkPaperUseCase:
    """Orchestrates chunking of a full Paper and persists the chunks.
    Delegates per‑section work to ``ChunkSectionUseCase``.
    """

    def __init__(self, chunk_section_uc: ChunkSectionUseCase, repo: ChunkRepository) -> None:
        self._chunk_section_uc = chunk_section_uc
        self._repo = repo

    def execute(self, paper: Paper) -> List[Chunk]:
        all_chunks: List[Chunk] = []
        for section in paper.sections:
            try:
                chunks = self._chunk_section_uc.execute(paper.paper_id, section)
                all_chunks.extend(chunks)
            except Exception as exc:  # pragma: no cover – defensive logging
                print(f"[WARN] Failed to chunk section {section.heading!r}: {exc}")
        if all_chunks:
            self._repo.bulk_save(all_chunks)
        return all_chunks
