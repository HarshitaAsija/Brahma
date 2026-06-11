# src/brahma/infrastructure/tokenizers/huggingface_tokenizer.py
from __future__ import annotations

from typing import List
from transformers import AutoTokenizer

from .base import Tokenizer


class HuggingFaceTokenizer(Tokenizer):
    """Generic wrapper around any HuggingFace tokenizer.
    ``model_name`` can be any model identifier that provides a tokenizer (e.g. "gpt2").
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
