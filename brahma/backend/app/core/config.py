from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "Brahma"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False

    # Security
    SECRET_KEY: str = "CHANGE_THIS_IN_PRODUCTION"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    ALGORITHM: str = "HS256"

    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "brahma"
    POSTGRES_PORT: str = "5432"

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # Neo4j
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "password"

    # Ollama
    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama2"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "null"]

    model_config = {"case_sensitive": True, "env_file": ".env"}

from pydantic_settings import BaseSettings
from typing import List, Optional

settings = Settings()

from app.core import logging  # noqa: F401
