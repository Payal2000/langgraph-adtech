"""
NeMo Guardrails hook — pre-flight compliance check on user input.

Sprint 5: wire in the full NeMo runtime.
Currently returns an empty list (no flags) in stub mode.
"""

from __future__ import annotations

import os

# TODO Sprint 5: import and initialise NeMo Guardrails runtime
# from nemoguardrails import LLMRails, RailsConfig


async def guardrails_check(user_message: str) -> list[str]:
    """
    Run the user message through NeMo Guardrails rules.

    Returns a list of flag strings if any rules were triggered, else [].
    Raised flags are stored in BiddingAgentState.guardrail_flags and
    logged to LangSmith for human review.
    """
    if os.getenv("APP_ENV", "production") == "development":
        return []

    # TODO Sprint 5:
    # config = RailsConfig.from_path("guardrails/")
    # rails = LLMRails(config)
    # result = await rails.generate_async(messages=[{"role": "user", "content": user_message}])
    # return result.get("flags", [])

    return []  # stub
