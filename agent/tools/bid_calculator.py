"""
Tool: bid_calculator
Computes recommended bid prices for a set of ad slots given budget constraints
and performance targets.
"""

from __future__ import annotations

from langchain_core.tools import tool
from pydantic import BaseModel, Field


class BidCalcInput(BaseModel):
    slot_id: str = Field(description="Ad slot identifier")
    target_cpa: float = Field(description="Target cost-per-acquisition in USD")
    budget_remaining: float = Field(description="Remaining budget for this session in USD")
    historical_cvr: float = Field(description="Historical conversion rate (0-1)")
    competitor_p50: float = Field(description="Competitor median bid (CPM) for this slot")


@tool(args_schema=BidCalcInput)
def bid_calculator(
    slot_id: str,
    target_cpa: float,
    budget_remaining: float,
    historical_cvr: float,
    competitor_p50: float,
) -> dict:
    """
    Calculate the optimal bid for an ad slot.

    Returns recommended bid (CPM), confidence score, and reasoning.
    """
    # TODO Sprint 3: implement full bid calc logic with Snowflake mart data
    max_bid = target_cpa * historical_cvr * 1000   # CPM ceiling
    recommended = min(max_bid, competitor_p50 * 1.05, budget_remaining / 10)
    return {
        "slot_id": slot_id,
        "recommended_bid_cpm": round(recommended, 2),
        "max_bid_cpm": round(max_bid, 2),
        "confidence": 0.0,  # populated after Snowflake integration
        "reasoning": "Stub — implement in Sprint 3",
    }
