# src/brahma/application/services/chunker.py
from __future__ import annotations

from typing import List
from uuid import UUID

from brahma.domain.entities.paper import Chunk, Section
from brahma.infrastructure.tokenizers.base import Tokenizer
from brahma.config.settings import get_settings


class Chunker:
    """Stateless service that turns a Section into token‑aware chunks.
    It respects ``CHUNK_SIZE`` and ``CHUNK_OVERLAP`` from ``Settings`` and never mixes sections.
    """

    def __init__(self, tokenizer: Tokenizer) -> None:
        self._tokenizer = tokenizer
        cfg = get_settings()
        self._max_tokens = cfg.chunk_size
        self._overlap = cfg.chunk_overlap

    def chunk_section(self, paper_id: UUID, section: Section) -> List[Chunk]:
        if section.is_empty():
            return []
        tokens = self._tokenizer.encode(section.content)
        # If the section fits within a single chunk, return it directly.
        if len(tokens) <= self._max_tokens:
            return [
                Chunk(
                    chunk_id=UUID(int=0),  # placeholder; actual ID will be set by caller/repo
                    paper_id=paper_id,
                    section_name=section.heading,
                    chunk_text=section.content,
                )
            ]
        chunks: List[Chunk] = []
        start = 0
        while start < len(tokens):
            end = min(start + self._max_tokens, len(tokens))
            sub_tokens = tokens[start:end]
            try:
                chunk_text = self._tokenizer.decode(sub_tokens)
            except Exception:  # fallback to raw slice if decode not supported
                words = section.content.split()
                chunk_text = " ".join(words[start:end])
            chunks.append(
                Chunk(
                    chunk_id=UUID(int=0),
                    paper_id=paper_id,
                    section_name=section.heading,
                    chunk_text=chunk_text,
                )
            )
            if end == len(tokens):
                break
            start = end - self._overlap
        return chunks
