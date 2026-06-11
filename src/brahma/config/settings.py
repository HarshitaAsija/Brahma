# src/brahma/config/settings.py
from __future__ import annotations

from functools import lru_cache
from pydantic import BaseSettings, Field, PostgresDsn, model_validator


class Settings(BaseSettings):
    """Application‑wide configuration loaded from environment variables.
    All tunables (chunk size/overlap, tokenizer choice, DB URL) live here.
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
        # Allows true/false strings for boolean‑like fields if we add any later.
        for k, v in list(values.items()):
            if isinstance(v, str) and v.lower() in {"true", "false"}:
                values[k] = v.lower() == "true"
        return values


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Singleton accessor used throughout the code‑base."""
    return Settings()
