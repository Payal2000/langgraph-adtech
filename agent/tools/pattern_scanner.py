"""
Tool: pattern_scanner
Detects bidding patterns and anomalies in historical data (time-of-day spikes,
competitor surge patterns, budget pacing issues).
"""

from __future__ import annotations

from langchain_core.tools import tool
from pydantic import BaseModel, Field


class PatternScannerInput(BaseModel):
    slot_ids: list[str] = Field(description="Slots to scan")
    lookback_days: int = Field(description="Days of history to scan", default=7)
    pattern_types: list[str] = Field(
        description="Pattern categories: time_of_day | competitor_surge | budget_pacing | ctr_drop",
        default_factory=lambda: ["time_of_day", "competitor_surge"],
    )


@tool(args_schema=PatternScannerInput)
def pattern_scanner(
    slot_ids: list[str],
    lookback_days: int = 7,
    pattern_types: list[str] | None = None,
) -> dict:
    """
    Scan for bidding patterns and anomalies across the requested slots.

    Reads from Snowflake mart: ad_bidding.MARTS.bid_performance
    """
    # TODO Sprint 3: implement pattern detection queries
    return {
        "patterns_found": [],
        "slots_scanned": slot_ids,
        "lookback_days": lookback_days,
        "note": "Stub — implement anomaly detection in Sprint 3",
    }
