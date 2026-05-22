"""Output guardrails — append a legal disclaimer to all chat answers.

Real "guardrails" (output validation, prompt-injection detection, PII filtering)
is a deeper topic. This middleware enforces ONE simple invariant: every chat
answer carries a disclaimer pointing the user back to the CPAS or competent
administration. The LLM is also instructed to do this in its system prompt;
this middleware is the last line of defence.
"""

from __future__ import annotations

import json
from collections.abc import Awaitable, Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

DISCLAIMER_FR = (
    "\n\n— Information indicative uniquement. Pour une décision officielle, "
    "consultez votre CPAS ou l'administration compétente."
)
DISCLAIMER_MARKER = "consultez votre CPAS"


class GuardrailsMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        response = await call_next(request)
        if request.url.path != "/chat":
            return response
        if response.status_code != 200:
            return response
        content_type = response.headers.get("content-type", "")
        if "application/json" not in content_type:
            return response

        body = b""
        async for chunk in response.body_iterator:
            body += chunk
        try:
            payload = json.loads(body.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            return Response(
                content=body,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=content_type,
            )

        answer = payload.get("answer", "")
        if isinstance(answer, str) and DISCLAIMER_MARKER not in answer:
            payload["answer"] = answer + DISCLAIMER_FR
        new_body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        headers = dict(response.headers)
        headers["content-length"] = str(len(new_body))
        return Response(
            content=new_body,
            status_code=response.status_code,
            headers=headers,
            media_type=content_type,
        )
