# src/brahma/infrastructure/factories/tokenizer_factory.py
"""Factory for creating the concrete ``Tokenizer`` implementation.

Selection is based on ``Settings.tokenizer_name``.  Supported values are:
``openai``, ``hf``/``huggingface`` and ``simple``.
"""

from __future__ import annotations

from typing import Any

from ..tokenizers.base import Tokenizer
from ..tokenizers.openai_tokenizer import OpenAITokenizer
from ..tokenizers.huggingface_tokenizer import HuggingFaceTokenizer
from ..tokenizers.simple_tokenizer import SimpleWhitespaceTokenizer
from brahma.config.settings import get_settings


def build_tokenizer() -> Tokenizer:
    """Instantiate the concrete :class:`Tokenizer` based on configuration.

    Returns:
        Tokenizer: Instance of the selected implementation.
    """
    cfg = get_settings()
    name = cfg.tokenizer_name.lower()
    kwargs: dict[str, Any] = cfg.tokenizer_kwargs or {}

    if name == "openai":
        return OpenAITokenizer(**kwargs)  # type: ignore[arg-type]
    if name in {"hf", "huggingface"}:
        return HuggingFaceTokenizer(**kwargs)  # type: ignore[arg-type]
    if name == "simple":
        return SimpleWhitespaceTokenizer()
    raise ValueError(f"Unsupported tokenizer name: {cfg.tokenizer_name!r}")
