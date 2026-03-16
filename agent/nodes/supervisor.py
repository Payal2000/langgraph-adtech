"""
Supervisor Node — routes incoming user intent to the correct specialist agent.
Uses Claude Sonnet via Bedrock for intent classification.
"""

from __future__ import annotations

from langchain_aws import ChatBedrock
from langchain_core.messages import HumanMessage, SystemMessage

from agent.state import BiddingAgentState

INTENT_SYSTEM_PROMPT = """You are the supervisor of an ad bidding AI system.
Classify the user's request into exactly one of these intents:

- auction   : questions about bid prices, auction mechanics, clearance rates
- budget    : questions about budget allocation, spend pacing, ROI targets
- strategy  : questions about multi-slot strategy, competitor positioning, campaign goals
- simulation: requests to simulate auction outcomes or test bid scenarios

Reply with ONLY the intent keyword — nothing else."""


def supervisor_node(state: BiddingAgentState) -> dict:
    """Classify intent and route to the appropriate agent node."""
    llm = ChatBedrock(model_id="anthropic.claude-3-sonnet-20240229-v1:0")

    last_message = state["messages"][-1]
    response = llm.invoke(
        [
            SystemMessage(content=INTENT_SYSTEM_PROMPT),
            HumanMessage(content=str(last_message.content)),
        ]
    )
    intent = response.content.strip().lower()

    if intent not in ("auction", "budget", "strategy", "simulation"):
        intent = "strategy"  # safe default

    return {"current_intent": intent}


def route_by_intent(state: BiddingAgentState) -> str:
    """Conditional edge: return the node name to route to."""
    return state["current_intent"]
