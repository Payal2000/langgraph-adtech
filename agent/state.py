"""
LangGraph state schema — flows through every node in the agent graph.
"""

from __future__ import annotations

from typing import Any, Optional
from typing_extensions import TypedDict
from langchain_core.messages import BaseMessage
from pydantic import BaseModel, Field


# ── Domain models ──────────────────────────────────────────────────────────────

class AdSlot(BaseModel):
    slot_id: str
    platform: str                  # google | meta | programmatic
    placement: str                 # search | display | video | social
    expected_impressions: int
    floor_price: float             # CPM floor in USD
    quality_score: Optional[float] = None


class BidLandscape(BaseModel):
    slot_id: str
    p25_bid: float
    p50_bid: float
    p75_bid: float
    top_competitor: Optional[str] = None
    updated_at: Optional[str] = None


class ToolCall(BaseModel):
    tool_name: str
    input_params: dict[str, Any]
    output_summary: str
    called_at: str


# ── Agent state ────────────────────────────────────────────────────────────────

class BiddingAgentState(TypedDict):
    thread_id: str
    messages: list[BaseMessage]

    # Routing
    current_intent: str            # auction | budget | strategy | simulation

    # Domain context
    active_slots: list[AdSlot]
    budget_remaining: float
    audience_segments: list[str]
    competitor_landscape: list[BidLandscape]

    # Observability
    tool_call_history: list[ToolCall]
    guardrail_flags: list[str]
    session_metadata: dict[str, Any]
