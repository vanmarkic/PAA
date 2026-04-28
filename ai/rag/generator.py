"""Grounded generation: prompt the LLM with retrieved chunks, return answer + citations.

System prompt enforces: answer from context only, cite sources, never give
definitive legal advice, recommend consulting CPAS/admin. If `LLM_PROVIDER` is
"stub" (or no API key is set) the generator returns a deterministic synthetic
answer that quotes the top chunk — keeps end-to-end smoke tests runnable.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from ai.config import get_settings
from ai.rag.retriever import ChunkResult

SYSTEM_PROMPT_FR = """Tu es un assistant pour les procédures administratives belges.

Règles strictes :
1. Réponds UNIQUEMENT à partir du contexte fourni.
2. Cite tes sources entre crochets en utilisant l'identifiant : [procedure:xxx], [rule:xxx], [gherkin:xxx], ou [doc:xxx].
3. Ne donne JAMAIS de conseil juridique définitif. Recommande toujours de consulter le CPAS ou l'administration compétente.
4. Si le contexte ne contient pas la réponse, dis-le explicitement plutôt que d'inventer.
5. Réponds en français, de manière claire et accessible.
"""


@dataclass
class GeneratedAnswer:
    answer: str
    sources: list[str]
    confidence: float
    chunks_used: list[str] = field(default_factory=list)


def _build_context(chunks: list[ChunkResult]) -> str:
    blocks: list[str] = []
    for i, c in enumerate(chunks, start=1):
        header = f"[{c.document_id}] (chunk {c.id}, source: {c.source_path})"
        blocks.append(f"### Source {i}: {header}\n{c.content}")
    return "\n\n".join(blocks)


def generate(query: str, context_chunks: list[ChunkResult]) -> GeneratedAnswer:
    settings = get_settings()
    context = _build_context(context_chunks)
    sources = sorted({c.document_id for c in context_chunks})
    chunk_ids = [c.id for c in context_chunks]

    if settings.llm_provider == "anthropic" and settings.has_anthropic:
        text = _generate_anthropic(query, context, settings.llm_model, settings.anthropic_api_key)  # type: ignore[arg-type]
    elif settings.llm_provider == "openai" and settings.has_openai:
        text = _generate_openai(query, context, settings.llm_model, settings.openai_api_key)  # type: ignore[arg-type]
    else:
        text = _generate_stub(query, context_chunks)

    return GeneratedAnswer(
        answer=text,
        sources=sources,
        confidence=_confidence_from_chunks(context_chunks),
        chunks_used=chunk_ids,
    )


def _generate_anthropic(query: str, context: str, model: str, api_key: str) -> str:
    from anthropic import Anthropic  # type: ignore

    client = Anthropic(api_key=api_key)
    user_message = (
        "Contexte:\n\n"
        f"{context}\n\n"
        "---\n\n"
        f"Question de l'utilisateur: {query}\n\n"
        "Réponds en t'appuyant uniquement sur le contexte ci-dessus, en citant les sources."
    )
    resp = client.messages.create(
        model=model,
        max_tokens=1024,
        system=SYSTEM_PROMPT_FR,
        messages=[{"role": "user", "content": user_message}],
    )
    return "".join(b.text for b in resp.content if getattr(b, "type", "") == "text")


def _generate_openai(query: str, context: str, model: str, api_key: str) -> str:
    from openai import OpenAI  # type: ignore

    client = OpenAI(api_key=api_key)
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT_FR},
            {
                "role": "user",
                "content": (
                    "Contexte:\n\n"
                    f"{context}\n\n"
                    "---\n\n"
                    f"Question de l'utilisateur: {query}"
                ),
            },
        ],
    )
    return resp.choices[0].message.content or ""


def _generate_stub(query: str, chunks: list[ChunkResult]) -> str:
    if not chunks:
        return (
            "Je ne dispose pas d'information dans le contexte pour répondre. "
            "Veuillez contacter votre CPAS ou l'administration compétente."
        )
    top = chunks[0]
    return (
        f"[Mode stub — aucune clé LLM configurée] D'après {top.document_id} "
        f"({top.source_path}):\n\n{top.content[:300]}\n\n"
        "Pour une réponse définitive, veuillez consulter votre CPAS."
    )


def _confidence_from_chunks(chunks: list[ChunkResult]) -> float:
    """Heuristic — relative score of the top chunk vs. tail.

    Returns a value in [0, 1]. Not a probability, just a UI signal.
    """
    if not chunks:
        return 0.0
    top = chunks[0].score
    if len(chunks) == 1:
        return min(1.0, max(0.0, top))
    tail_avg = sum(c.score for c in chunks[1:]) / max(1, len(chunks) - 1)
    if tail_avg <= 0:
        return min(1.0, max(0.0, top))
    return min(1.0, max(0.0, top / (top + tail_avg)))
