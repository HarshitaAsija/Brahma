# src/brahma/config/settings.py
"""Application‑wide configuration.

The settings are loaded from environment variables (via a ``.env`` file) and
exposed as a cached singleton through :func:`get_settings`.  All tunable
parameters – chunk size, tokenizer choice, database URL – are defined here.
"""

from __future__ import annotations

from functools import lru_cache

# Pydantic v2 moved ``BaseSettings`` to the ``pydantic-settings`` package.
# Import it if available; otherwise fall back to the older location for older
# environments.
try:
    # New location (pydantic-settings >=2.0)
    from pydantic_settings import BaseSettings  # type: ignore
except ImportError:  # pragma: no cover
    # Legacy location (pydantic <2.0)
    from pydantic import BaseSettings  # type: ignore

from pydantic import Field, PostgresDsn, model_validator


class Settings(BaseSettings):
    """Settings model loaded from environment variables.

    ``BaseSettings`` reads ``.env`` automatically and validates types.
    """

    # Chunking parameters (defaults correspond to the original spec)
    chunk_size: int = Field(512, ge=1, description="Maximum number of tokens per chunk.")
    chunk_overlap: int = Field(50, ge=0, description="Number of overlapping tokens between chunks.")

    # Tokenizer selection – "openai", "hf", or "simple"
    tokenizer_name: str = Field("openai", description="Identifier of the concrete tokenizer implementation.")
    tokenizer_kwargs: dict = Field(default_factory=dict, description="Additional kwargs passed to the tokenizer ctor.")

    # Database connection string – PostgreSQL by default; can be overridden with SQLite for dev.
    database_url: PostgresDsn = Field(
        "postgresql://brahma_user:brahma_pass@localhost:5432/brahma",
        description="SQLAlchemy URL used by the persistence layer.",
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @model_validator(mode="before")
    def _coerce_bool(cls, values: dict) -> dict:
        """Coerce ``"true"``/``"false"`` strings to booleans for future flags."""
        for k, v in list(values.items()):
            if isinstance(v, str) and v.lower() in {"true", "false"}:
                values[k] = v.lower() == "true"
        return values


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached :class:`Settings` instance (singleton)."""
    return Settings()
