# src/brahma/infrastructure/tokenizers/simple_tokenizer.py
"""Very cheap whitespace tokenizer.

Used for development environments where heavy tokenizers cannot be installed.
It only provides ``encode`` (returning dummy integer IDs) and deliberately
raises ``NotImplementedError`` for ``decode`` because a round‑trip is
meaningless for this stub.
"""

from __future__ import annotations

import re
from typing import List

from .base import Tokenizer

_WHITESPACE_RE = re.compile(r"\s+", flags=re.UNICODE)


class SimpleWhitespaceTokenizer(Tokenizer):
    """Tokenizer that splits on Unicode whitespace.

    The returned token IDs are just sequential integers; only the length matters
    for chunk sizing.
    """

    @property
    def name(self) -> str:
        return "simple"

    def encode(self, text: str) -> List[int]:
        """Return a list of dummy token IDs representing the number of words.

        Empty input yields an empty list.
        """
        if not text:
            return []
        parts = _WHITESPACE_RE.split(text)
        return list(range(len(parts)))

    def decode(self, tokens: List[int]) -> str:
        raise NotImplementedError("SimpleWhitespaceTokenizer cannot decode tokens.")
