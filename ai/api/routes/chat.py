"""Conversational endpoint — synchronous JSON + SSE streaming."""

from __future__ import annotations

import json
from collections.abc import AsyncIterator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from ai.rag.generator import generate
from ai.rag.reranker import get_reranker
from ai.rag.retriever import HybridRetriever

router = APIRouter()


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: str | None = None
    top_k: int | None = Field(default=None, ge=1, le=50)


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]
    confidence: float
    chunks_used: list[str]


def _run_pipeline(query: str, top_k: int | None) -> ChatResponse:
    retriever = HybridRetriever()
    reranker = get_reranker()
    candidates = retriever.search(query, top_k=top_k)
    top = reranker.rerank(query, candidates, top_k=5)
    answer = generate(query, top)
    return ChatResponse(
        answer=answer.answer,
        sources=answer.sources,
        confidence=answer.confidence,
        chunks_used=answer.chunks_used,
    )


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    return _run_pipeline(request.message, request.top_k)


async def _stream_pipeline(request: ChatRequest) -> AsyncIterator[str]:
    """SSE event stream — emit progress events, then the final answer.

    The pipeline is synchronous internally; we wrap it as an async generator
    so FastAPI's StreamingResponse can flush each event to the client.
    """
    yield _sse({"type": "status", "stage": "retrieving"})
    retriever = HybridRetriever()
    candidates = retriever.search(request.message, top_k=request.top_k)
    yield _sse({"type": "status", "stage": "reranking", "candidate_count": len(candidates)})

    reranker = get_reranker()
    top = reranker.rerank(request.message, candidates, top_k=5)
    yield _sse({"type": "sources", "sources": [c.document_id for c in top]})

    yield _sse({"type": "status", "stage": "generating"})
    answer = generate(request.message, top)
    yield _sse(
        {
            "type": "answer",
            "answer": answer.answer,
            "sources": answer.sources,
            "confidence": answer.confidence,
            "chunks_used": answer.chunks_used,
        }
    )
    yield _sse({"type": "done"})


def _sse(payload: dict) -> str:
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


@router.post("/chat/stream")
async def chat_stream(request: ChatRequest) -> StreamingResponse:
    return StreamingResponse(_stream_pipeline(request), media_type="text/event-stream")
