# src/brahma/application/services/chunker.py
"""Chunker service.

Transforms a :class:`~brahma.domain.entities.paper.Section` into a list of
:class:`~brahma.domain.entities.paper.Chunk` objects while respecting the
configured token ``chunk_size`` and ``chunk_overlap``.
"""

from __future__ import annotations

from typing import List
from uuid import UUID, uuid4

from brahma.domain.entities.paper import Chunk, Section
from brahma.infrastructure.tokenizers.base import Tokenizer
from brahma.config.settings import get_settings


class Chunker:
    """Stateless service that token‑aware splits a section into chunks.

    It never mixes content from different sections and uses the tokenizer
    implementation selected via ``Settings.tokenizer_name``.
    """

    def __init__(self, tokenizer: Tokenizer) -> None:
        """Create a ``Chunker``.

        Args:
            tokenizer: Concrete ``Tokenizer`` used for encode/decode.
        """
        self._tokenizer = tokenizer
        cfg = get_settings()
        self._max_tokens = cfg.chunk_size
        self._overlap = cfg.chunk_overlap

    def chunk_section(self, paper_id: UUID, section: Section) -> List[Chunk]:
        """Return a list of ``Chunk`` objects for *section*.

        Empty sections yield an empty list.  If the token count fits within a
        single chunk the original text is returned unchanged.  Otherwise the
        text is split into overlapping windows of ``chunk_size`` tokens.
        """
        if section.is_empty():
            return []
        tokens = self._tokenizer.encode(section.content)
        # Single‑chunk fast path
        if len(tokens) <= self._max_tokens:
            return [
                Chunk(
                    chunk_id=uuid4(),
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
            except Exception:
                # Fallback for tokenizers that cannot decode (e.g. Simple)
                words = section.content.split()
                # ``start``/``end`` refer to token indices which align with word
                # indices for the simple whitespace tokenizer.
                chunk_text = " ".join(words[start:end])
            chunks.append(
                Chunk(
                    chunk_id=uuid4(),
                    paper_id=paper_id,
                    section_name=section.heading,
                    chunk_text=chunk_text,
                )
            )
            if end == len(tokens):
                break
            # Move window forward, keeping ``overlap`` tokens from the previous
            # chunk.
            start = end - self._overlap
        return chunks
