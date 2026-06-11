# src/brahma/infrastructure/tokenizers/openai_tokenizer.py
"""Tokenizer wrapper around OpenAI's ``tiktoken`` library.

The default model is ``gpt-4o-mini`` but any model name accepted by
``tiktoken.encoding_for_model`` can be supplied via ``Settings.tokenizer_kwargs``.
"""

from __future__ import annotations

from typing import List
import tiktoken

from .base import Tokenizer


class OpenAITokenizer(Tokenizer):
    """Wrapper for the OpenAI ``tiktoken`` tokenizer.

    ``model`` determines which tokenisation scheme is used.
    """

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
