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
EmbeddingProvider = Literal["voyage", "cohere", "openai", "local", "stub", "auto"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # API keys
    anthropic_api_key: str | None = Field(default=None, alias="ANTHROPIC_API_KEY")
    voyage_api_key: str | None = Field(default=None, alias="VOYAGE_API_KEY")
    cohere_api_key: str | None = Field(default=None, alias="COHERE_API_KEY")
    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")

    # LLM (generation)
    llm_provider: LLMProvider = Field(default="anthropic", alias="LLM_PROVIDER")
    llm_model: str = Field(default="claude-sonnet-4-20250514", alias="LLM_MODEL")

    # Embeddings — provider-agnostic. Defaults are chosen so 1024 dims work
    # across Voyage, Cohere, BGE-M3, and multilingual-e5-large without a schema
    # migration. OpenAI's 3-small native dim is 1536 but supports truncation
    # via the `dimensions` API param when EMBEDDING_PROVIDER=openai is selected.
    embedding_provider: EmbeddingProvider = Field(default="auto", alias="EMBEDDING_PROVIDER")
    embedding_model: str | None = Field(default=None, alias="EMBEDDING_MODEL")
    embedding_dim: int = Field(default=1024, alias="EMBEDDING_DIM")
    # Local model settings (sentence-transformers)
    local_embedding_model: str = Field(
        default="BAAI/bge-m3", alias="LOCAL_EMBEDDING_MODEL"
    )

    # Reranker
    reranker_provider: Literal["cohere", "voyage", "passthrough", "auto"] = Field(
        default="auto", alias="RERANKER_PROVIDER"
    )
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
    def has_anthropic(self) -> bool:
        return bool(self.anthropic_api_key)

    @property
    def has_voyage(self) -> bool:
        return bool(self.voyage_api_key)

    @property
    def has_cohere(self) -> bool:
        return bool(self.cohere_api_key)

    @property
    def has_openai(self) -> bool:
        return bool(self.openai_api_key)

    def resolve_embedding_provider(self) -> EmbeddingProvider:
        """Return the concrete provider after resolving 'auto'.

        Priority when auto: voyage → cohere → openai → local (if importable) → stub.
        """
        if self.embedding_provider != "auto":
            return self.embedding_provider
        if self.has_voyage:
            return "voyage"
        if self.has_cohere:
            return "cohere"
        if self.has_openai:
            return "openai"
        # Try local as last non-stub option — only if the lib is actually importable.
        try:
            import sentence_transformers  # noqa: F401, PLC0415

            return "local"
        except ImportError:
            return "stub"

    def resolve_embedding_model(self, provider: EmbeddingProvider) -> str:
        """Pick a default model name when EMBEDDING_MODEL isn't set explicitly."""
        if self.embedding_model:
            return self.embedding_model
        return {
            "voyage": "voyage-3-large",
            "cohere": "embed-multilingual-v3.0",
            "openai": "text-embedding-3-small",
            "local": self.local_embedding_model,
            "stub": "stub",
            "auto": "stub",
        }[provider]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
