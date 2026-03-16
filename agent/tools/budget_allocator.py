"""
Tool: budget_allocator
Distributes budget across slots/campaigns to maximise the target objective.
"""

from __future__ import annotations

from langchain_core.tools import tool
from pydantic import BaseModel, Field


class BudgetAllocatorInput(BaseModel):
    total_budget: float = Field(description="Total budget to allocate in USD")
    slot_ids: list[str] = Field(description="Candidate slot IDs")
    objective: str = Field(description="cpa | roas | awareness", default="cpa")
    constraints: dict = Field(
        description="Per-slot min/max spend constraints",
        default_factory=dict,
    )


@tool(args_schema=BudgetAllocatorInput)
def budget_allocator(
    total_budget: float,
    slot_ids: list[str],
    objective: str = "cpa",
    constraints: dict | None = None,
) -> dict:
    """
    Allocate budget across slots using a greedy ROI-first strategy.

    Reads from: Snowflake mart bid_performance + budget_utilization
    """
    # TODO Sprint 3: implement allocation algorithm with mart data
    per_slot = total_budget / max(len(slot_ids), 1)
    return {
        "allocations": [{"slot_id": sid, "allocated_usd": round(per_slot, 2)} for sid in slot_ids],
        "total_allocated": round(total_budget, 2),
        "note": "Stub — equal split; implement ROI-weighted in Sprint 3",
    }
