"""Health + readiness endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from ai.config import get_settings

router = APIRouter()


@router.get("/health")
def health() -> dict:
    settings = get_settings()
    return {
        "status": "ok",
        "llm_provider": settings.llm_provider,
        "has_anthropic": settings.has_anthropic,
        "has_openai": settings.has_openai,
        "has_cohere": settings.has_cohere,
    }


@router.get("/ready")
def ready() -> dict:
    """Best-effort readiness probe: checks DB connectivity if psycopg is available."""
    db_ok: bool | None = None
    error: str | None = None
    try:
        from ai.db.connection import connect  # noqa: PLC0415

        with connect() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                cur.fetchone()
        db_ok = True
    except Exception as e:  # noqa: BLE001
        db_ok = False
        error = str(e)
    return {"status": "ready" if db_ok else "degraded", "db": db_ok, "error": error}
