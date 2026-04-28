"""FastAPI entrypoint for the PAA AI service."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ai.api.middleware.guardrails import GuardrailsMiddleware
from ai.api.routes import chat, eligibility, health
from ai.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="PAA AI",
        version="0.1.0",
        description="RAG + agentic eligibility checker over Belgian administrative procedures.",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(GuardrailsMiddleware)

    app.include_router(health.router)
    app.include_router(chat.router)
    app.include_router(eligibility.router)

    @app.get("/")
    def root() -> dict:
        return {
            "service": "paa-ai",
            "version": app.version,
            "llm_provider": settings.llm_provider,
            "endpoints": ["/health", "/chat", "/eligibility", "/docs"],
        }

    return app


app = create_app()
