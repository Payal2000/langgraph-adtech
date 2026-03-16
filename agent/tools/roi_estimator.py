"""
Tool: roi_estimator
Estimates expected ROI for a bid strategy before submission.
"""

from __future__ import annotations

from langchain_core.tools import tool
from pydantic import BaseModel, Field


class ROIEstimatorInput(BaseModel):
    slot_id: str = Field(description="Ad slot ID")
    bid_cpm: float = Field(description="Proposed bid in CPM (USD)")
    audience_size: int = Field(description="Estimated audience reach")
    historical_ctr: float = Field(description="Historical click-through rate (0-1)")
    historical_cvr: float = Field(description="Historical conversion rate (0-1)")
    revenue_per_conversion: float = Field(description="Average revenue per conversion in USD")


@tool(args_schema=ROIEstimatorInput)
def roi_estimator(
    slot_id: str,
    bid_cpm: float,
    audience_size: int,
    historical_ctr: float,
    historical_cvr: float,
    revenue_per_conversion: float,
) -> dict:
    """
    Estimate ROI for a given bid on a specific slot.

    Returns expected impressions, clicks, conversions, cost, revenue, and ROAS.
    """
    impressions = audience_size
    cost = (bid_cpm / 1000) * impressions
    clicks = impressions * historical_ctr
    conversions = clicks * historical_cvr
    revenue = conversions * revenue_per_conversion
    roas = revenue / cost if cost > 0 else 0.0

    return {
        "slot_id": slot_id,
        "expected_impressions": int(impressions),
        "expected_clicks": int(clicks),
        "expected_conversions": round(conversions, 2),
        "estimated_cost_usd": round(cost, 2),
        "estimated_revenue_usd": round(revenue, 2),
        "estimated_roas": round(roas, 4),
    }
