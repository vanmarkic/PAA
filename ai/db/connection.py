"""Thin psycopg helpers for the chunks table.

Centralised so retriever, embedder, and tests use one connection helper. The
schema lives next to this file in `schema.sql` and is applied via
`ensure_schema()`.
"""

from __future__ import annotations

from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path

from ai.config import get_settings

SCHEMA_FILE = Path(__file__).with_name("schema.sql")


@contextmanager
def connect() -> Iterator[object]:
    """Yield a psycopg connection. Imports lazily so test envs without psycopg work."""
    import psycopg  # type: ignore

    settings = get_settings()
    conn = psycopg.connect(settings.database_url, autocommit=False)
    try:
        yield conn
    finally:
        conn.close()


def ensure_schema() -> None:
    """Apply schema.sql against the configured database. Idempotent."""
    sql = SCHEMA_FILE.read_text(encoding="utf-8")
    with connect() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
        conn.commit()
