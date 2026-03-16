"""
Tool: competitor_analyzer
Queries the competitor_landscape mart for p25/p50/p75 bid distribution
and top competitor signals per slot.
"""

from __future__ import annotations

from langchain_core.tools import tool
from pydantic import BaseModel, Field


class CompetitorAnalyzerInput(BaseModel):
    slot_ids: list[str] = Field(description="Ad slot IDs to analyze")
    lookback_hours: int = Field(description="Hours of history to include", default=24)


@tool(args_schema=CompetitorAnalyzerInput)
def competitor_analyzer(
    slot_ids: list[str],
    lookback_hours: int = 24,
) -> dict:
    """
    Return bid distribution and competitor signals for the given slots.

    Reads from Snowflake mart: ad_bidding.MARTS.competitor_landscape
    """
    # TODO Sprint 3: query Snowflake mart competitor_landscape
    return {
        "landscapes": [
            {
                "slot_id": sid,
                "p25_bid": 0.0,
                "p50_bid": 0.0,
                "p75_bid": 0.0,
                "top_competitor": None,
            }
            for sid in slot_ids
        ],
        "lookback_hours": lookback_hours,
        "note": "Stub — implement Snowflake query in Sprint 3",
    }
