"""Multi-turn eligibility agent.

The LLM drives the conversation and chooses which tool to call at each step.
The tools are deterministic Python functions — search_procedures, get_procedure_steps,
get_required_documents, check_eligibility. The agent never computes eligibility itself;
it always delegates to `check_eligibility`, which is a thin bridge to the existing
TypeScript json-rules-engine.

Implementation: raw Anthropic `tool_use` API (no LangChain, no LangGraph). Migrate to
LangGraph only if multi-turn state-tracking gets gnarly.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field

from ai.agents.tools import eligibility_check, procedure_lookup
from ai.agents.tools.rules_engine import check_eligibility as rules_check_eligibility
from ai.config import get_settings

AGENT_SYSTEM_PROMPT = """Tu es un assistant pour les procédures administratives belges.

Ton rôle:
- Aider l'utilisateur à savoir s'il est éligible à un avantage social (AGR, RIS, etc.).
- Identifier la procédure pertinente, recueillir les faits nécessaires, puis appeler
  l'outil `check_eligibility` pour obtenir une décision déterministe.

Règles strictes:
1. Tu ne calcules JAMAIS l'éligibilité toi-même. Tu utilises toujours `check_eligibility`.
2. Si tu ne sais pas quels faits sont nécessaires, appelle `search_procedures` ou consulte
   les schémas de faits intégrés.
3. Pose les questions une par une, dans un français clair. N'invente pas de faits.
4. Cite tes sources (identifiant de procédure ou de règle) dès que tu les utilises.
5. Termine toujours par un rappel : la décision est indicative et doit être confirmée
   par le CPAS ou l'administration compétente.
"""


# --- Tool schemas (Anthropic format) ----------------------------------------

TOOLS = [
    {
        "name": "search_procedures",
        "description": (
            "Recherche les procédures administratives belges les plus pertinentes "
            "pour une question. Renvoie jusqu'à 3 procédures avec leur identifiant, "
            "titre, et un extrait."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Question ou mots-clés"},
                "top_k": {"type": "integer", "minimum": 1, "maximum": 10, "default": 3},
            },
            "required": ["query"],
        },
    },
    {
        "name": "get_procedure_steps",
        "description": (
            "Renvoie les étapes ordonnées d'une procédure donnée par son identifiant "
            "(ex. 'procedure:ris')."
        ),
        "input_schema": {
            "type": "object",
            "properties": {"procedure_id": {"type": "string"}},
            "required": ["procedure_id"],
        },
    },
    {
        "name": "get_required_documents",
        "description": (
            "Renvoie les documents et pièces justificatives requis pour une procédure."
        ),
        "input_schema": {
            "type": "object",
            "properties": {"procedure_id": {"type": "string"}},
            "required": ["procedure_id"],
        },
    },
    {
        "name": "check_eligibility",
        "description": (
            "Vérifie de manière déterministe si l'utilisateur est éligible à un avantage. "
            "Renvoie {eligible, amount, reason, rule_ids}. Doit être appelé seulement "
            "après avoir collecté tous les faits requis."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "benefit_type": {
                    "type": "string",
                    "description": "Type d'avantage: 'agr', 'ris', etc.",
                },
                "facts": {
                    "type": "object",
                    "description": "Faits collectés auprès de l'utilisateur",
                },
            },
            "required": ["benefit_type", "facts"],
        },
    },
]


# --- Tool dispatch ----------------------------------------------------------


def _execute_tool(name: str, arguments: dict) -> dict:
    """Execute a tool call and return a JSON-serialisable dict."""
    if name == "search_procedures":
        results = procedure_lookup.search_procedures(
            query=arguments["query"],
            top_k=arguments.get("top_k", 3),
        )
        return {"procedures": [r.model_dump() for r in results]}
    if name == "get_procedure_steps":
        return {"steps": procedure_lookup.get_procedure_steps(arguments["procedure_id"])}
    if name == "get_required_documents":
        return {
            "documents": procedure_lookup.get_required_documents(arguments["procedure_id"])
        }
    if name == "check_eligibility":
        result = rules_check_eligibility(arguments["benefit_type"], arguments.get("facts", {}))
        return result.model_dump()
    raise ValueError(f"Unknown tool: {name}")


# --- Agent loop -------------------------------------------------------------


@dataclass
class AgentTurn:
    role: str
    text: str = ""
    tool_calls: list[dict] = field(default_factory=list)


@dataclass
class AgentResult:
    final_text: str
    turns: list[AgentTurn] = field(default_factory=list)
    tool_invocations: list[dict] = field(default_factory=list)
    stopped: str = "end_turn"


MAX_TURNS = 8


class EligibilityAgent:
    """Wraps a single Anthropic conversation loop."""

    def __init__(self, model: str | None = None) -> None:
        settings = get_settings()
        self._settings = settings
        self._model = model or settings.llm_model

    def run(self, user_message: str) -> AgentResult:
        if not self._settings.has_anthropic:
            return self._run_stub(user_message)
        return self._run_anthropic(user_message)

    # ----------------------------------- Anthropic loop

    def _run_anthropic(self, user_message: str) -> AgentResult:
        from anthropic import Anthropic  # noqa: PLC0415

        client = Anthropic(api_key=self._settings.anthropic_api_key)
        messages: list[dict] = [{"role": "user", "content": user_message}]
        result = AgentResult(final_text="", turns=[AgentTurn(role="user", text=user_message)])

        for _ in range(MAX_TURNS):
            resp = client.messages.create(
                model=self._model,
                max_tokens=1024,
                system=AGENT_SYSTEM_PROMPT,
                tools=TOOLS,
                messages=messages,
            )

            assistant_blocks = []
            tool_uses = []
            text_chunks: list[str] = []
            for block in resp.content:
                kind = getattr(block, "type", "")
                if kind == "text":
                    text_chunks.append(block.text)
                    assistant_blocks.append({"type": "text", "text": block.text})
                elif kind == "tool_use":
                    tool_uses.append(block)
                    assistant_blocks.append(
                        {
                            "type": "tool_use",
                            "id": block.id,
                            "name": block.name,
                            "input": block.input,
                        }
                    )

            messages.append({"role": "assistant", "content": assistant_blocks})
            result.turns.append(
                AgentTurn(
                    role="assistant",
                    text="".join(text_chunks),
                    tool_calls=[{"name": t.name, "input": t.input} for t in tool_uses],
                )
            )

            if resp.stop_reason != "tool_use":
                result.final_text = "".join(text_chunks)
                result.stopped = resp.stop_reason or "end_turn"
                return result

            tool_results = []
            for tu in tool_uses:
                output = _execute_tool(tu.name, dict(tu.input))
                result.tool_invocations.append(
                    {"name": tu.name, "input": dict(tu.input), "output": output}
                )
                tool_results.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": tu.id,
                        "content": json.dumps(output, ensure_ascii=False),
                    }
                )
            messages.append({"role": "user", "content": tool_results})

        result.final_text = (
            "Je n'ai pas pu finaliser le diagnostic dans le nombre de tours imparti. "
            "Veuillez consulter votre CPAS."
        )
        result.stopped = "max_turns"
        return result

    # ----------------------------------- Stub loop (no LLM)

    def _run_stub(self, user_message: str) -> AgentResult:
        """Heuristic flow used when no Anthropic key is configured.

        Detects a benefit keyword in the message, asks for missing facts (one
        round trip simulated by returning the schema), or — if the caller passed
        facts — calls the rules engine directly. Useful for tests and CI.
        """
        result = AgentResult(
            final_text="",
            turns=[AgentTurn(role="user", text=user_message)],
            stopped="stub",
        )

        benefit = _guess_benefit(user_message)
        if not benefit:
            result.final_text = (
                "[Mode stub] Je peux vous aider à vérifier l'éligibilité au RIS ou à l'AGR. "
                "Précisez l'avantage qui vous intéresse. Cette réponse est indicative — "
                "consultez votre CPAS pour une décision officielle."
            )
            return result

        schema = eligibility_check.required_facts(benefit)
        result.final_text = (
            f"[Mode stub] Pour vérifier votre éligibilité au {benefit.upper()}, "
            f"j'ai besoin de connaître: {', '.join(schema)}. "
            "Cette réponse est indicative — consultez votre CPAS pour une décision officielle."
        )
        result.tool_invocations.append(
            {"name": "schema_lookup", "input": {"benefit_type": benefit}, "output": schema}
        )
        return result


_BENEFIT_HINTS = {
    "ris": "ris",
    "intégration sociale": "ris",
    "integration sociale": "ris",
    "agr": "agr",
    "garantie de revenu": "agr",
    "allocation de garantie": "agr",
}


def _guess_benefit(text: str) -> str | None:
    lc = text.lower()
    for needle, code in _BENEFIT_HINTS.items():
        if needle in lc:
            return code
    return None
