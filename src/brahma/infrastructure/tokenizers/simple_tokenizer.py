# src/brahma/infrastructure/tokenizers/simple_tokenizer.py
from __future__ import annotations

import re
from typing import List

from .base import Tokenizer

_WHITESPACE_RE = re.compile(r"\s+", flags=re.UNICODE)


class SimpleWhitespaceTokenizer(Tokenizer):
    """Very cheap tokenizer that splits on Unicode whitespace.
    It is primarily intended for development or environments where the heavy
    tokenizers cannot be installed.
    """

    @property
    def name(self) -> str:
        return "simple"

    def encode(self, text: str) -> List[int]:
        # Return dummy integer IDs – only the length matters for chunk sizing.
        # Enumerate over the split parts to get a deterministic list.
        if not text:
            return []
        parts = _WHITESPACE_RE.split(text)
        return list(range(len(parts)))

    def decode(self, tokens: List[int]) -> str:
        raise NotImplementedError("SimpleWhitespaceTokenizer cannot decode tokens.")
