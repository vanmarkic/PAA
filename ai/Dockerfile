FROM python:3.12-slim

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

COPY pyproject.toml ./
COPY uv.lock* ./

RUN uv sync --no-dev || uv sync

COPY . .

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "ai.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
