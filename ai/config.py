"""Centralised configuration via Pydantic Settings.

Reads from environment variables (and a local .env if present). Every module
that needs an API key, model name, or DB URL imports `get_settings()` —
nothing else hard-codes those values.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

LLMProvider = Literal["anthropic", "openai", "stub"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # API keys
    anthropic_api_key: str | None = Field(default=None, alias="ANTHROPIC_API_KEY")
    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")
    cohere_api_key: str | None = Field(default=None, alias="COHERE_API_KEY")

    # Models
    llm_provider: LLMProvider = Field(default="anthropic", alias="LLM_PROVIDER")
    llm_model: str = Field(default="claude-sonnet-4-20250514", alias="LLM_MODEL")
    embedding_model: str = Field(default="text-embedding-3-small", alias="EMBEDDING_MODEL")
    embedding_dim: int = Field(default=1536, alias="EMBEDDING_DIM")
    reranker_model: str = Field(default="rerank-v3.5", alias="RERANKER_MODEL")

    # Storage
    database_url: str = Field(
        default="postgresql://paa:paa_dev@localhost:5432/paa", alias="DATABASE_URL"
    )
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")

    # API server
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8000, alias="PORT")
    log_level: str = Field(default="info", alias="LOG_LEVEL")

    # Retrieval tuning
    retriever_top_k: int = Field(default=20, alias="RETRIEVER_TOP_K")
    reranker_top_k: int = Field(default=5, alias="RERANKER_TOP_K")
    rrf_k: int = Field(default=60, alias="RRF_K")

    @property
    def has_openai(self) -> bool:
        return bool(self.openai_api_key)

    @property
    def has_anthropic(self) -> bool:
        return bool(self.anthropic_api_key)

    @property
    def has_cohere(self) -> bool:
        return bool(self.cohere_api_key)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
