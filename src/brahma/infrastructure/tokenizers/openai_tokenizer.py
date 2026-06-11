# src/brahma/infrastructure/tokenizers/openai_tokenizer.py
from __future__ import annotations

from typing import List
import tiktoken

from .base import Tokenizer


class OpenAITokenizer(Tokenizer):
    """Wrapper around ``tiktoken`` (OpenAI's tokenizer)."""

    def __init__(self, model: str = "gpt-4o-mini") -> None:
        self._model = model
        self._encoding = tiktoken.encoding_for_model(model)

    @property
    def name(self) -> str:
        return f"openai:{self._model}"

    def encode(self, text: str) -> List[int]:
        # ``allowed_special="all"`` lets the tokenizer handle any special tokens present.
        return self._encoding.encode(text, allowed_special="all")

    def decode(self, tokens: List[int]) -> str:
        return self._encoding.decode(tokens)
