"""
Tool: slot_ranker
Ranks ad slots by expected ROI using Snowflake mart data (slot_rankings).
"""

from __future__ import annotations

from langchain_core.tools import tool
from pydantic import BaseModel, Field


class SlotRankerInput(BaseModel):
    slot_ids: list[str] = Field(description="List of slot IDs to rank")
    objective: str = Field(
        description="Optimization objective: cpa | roas | awareness",
        default="cpa",
    )
    audience_segments: list[str] = Field(
        description="Target audience segment IDs",
        default_factory=list,
    )


@tool(args_schema=SlotRankerInput)
def slot_ranker(
    slot_ids: list[str],
    objective: str = "cpa",
    audience_segments: list[str] | None = None,
) -> dict:
    """
    Rank ad slots by expected ROI for the given objective and audience.

    Reads from Snowflake mart: ad_bidding.MARTS.slot_rankings
    Returns ranked list with expected ROI and confidence per slot.
    """
    # TODO Sprint 3: query Snowflake mart slot_rankings
    return {
        "ranked_slots": [{"slot_id": sid, "expected_roi": 0.0, "rank": i + 1} for i, sid in enumerate(slot_ids)],
        "objective": objective,
        "note": "Stub — implement Snowflake query in Sprint 3",
    }
