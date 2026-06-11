# src/brahma/infrastructure/tokenizers/base.py
"""Abstract tokenizer interface.

All concrete tokenizers must implement ``encode`` (text → list[int]) and
``decode`` (list[int] → text).  ``name`` provides a human readable identifier.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List


class Tokenizer(ABC):
    """Port interface – any concrete tokenizer must implement this."""

    @abstractmethod
    def encode(self, text: str) -> List[int]:
        """Return a list of token IDs for ``text``.  Length of the list is the token count."""
        ...

    @abstractmethod
    def decode(self, tokens: List[int]) -> str:
        """Inverse of ``encode`` – for debugging / round‑trip tests."""
        ...

    @property
    @abstractmethod
    def name(self) -> str:
        """Human readable identifier (e.g. 'openai', 'hf')."""
        ...
