# src/brahma/infrastructure/tokenizers/huggingface_tokenizer.py
"""Generic wrapper for any HuggingFace tokenizer.

The ``model_name`` argument can be any model identifier that provides a
tokenizer (e.g. ``gpt2``).  The ``transformers`` library handles downloading
and caching the model files.
"""

from __future__ import annotations

from typing import List
from transformers import AutoTokenizer

from .base import Tokenizer


class HuggingFaceTokenizer(Tokenizer):
    """Wrapper around a HuggingFace tokenizer.

    ``model_name`` defaults to ``gpt2`` but can be overridden via the
    ``Settings.tokenizer_kwargs`` dictionary.
    """

    def __init__(self, model_name: str = "gpt2") -> None:
        self._model_name = model_name
        self._tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=True)

    @property
    def name(self) -> str:
        return f"hf:{self._model_name}"

    def encode(self, text: str) -> List[int]:
        # ``add_special_tokens=False`` mirrors the OpenAI behaviour.
        return self._tokenizer.encode(text, add_special_tokens=False)

    def decode(self, tokens: List[int]) -> str:
        return self._tokenizer.decode(tokens, skip_special_tokens=True)
