"""
Core Pydantic schemas for all data flowing through the system.
These schemas are the source of truth for Avro schema generation (Kafka)
and Snowflake table definitions (dbt seeds/sources).
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


# ── Enums ──────────────────────────────────────────────────────────────────────

class Platform(str, Enum):
    GOOGLE = "google"
    META = "meta"
    PROGRAMMATIC = "programmatic"


class Placement(str, Enum):
    SEARCH = "search"
    DISPLAY = "display"
    VIDEO = "video"
    SOCIAL = "social"


class AuctionType(str, Enum):
    FIRST_PRICE = "first_price"
    SECOND_PRICE = "second_price"
    VICKREY = "vickrey"


class CampaignObjective(str, Enum):
    CPA = "cpa"
    ROAS = "roas"
    AWARENESS = "awareness"
    CLICKS = "clicks"


# ── Kafka event schemas ────────────────────────────────────────────────────────

class AuctionEvent(BaseModel):
    """Topic: raw.auction.events"""
    event_id: UUID = Field(default_factory=uuid4)
    occurred_at: datetime = Field(default_factory=datetime.utcnow)
    slot_id: str
    platform: Platform
    placement: Placement
    auction_type: AuctionType
    clearing_price_cpm: float
    winner_bid_cpm: float
    floor_price_cpm: float
    num_bidders: int
    impression_count: int
    click_count: int = 0
    conversion_count: int = 0
    campaign_id: Optional[str] = None


class CompetitorBidEvent(BaseModel):
    """Topic: raw.competitor.bids"""
    event_id: UUID = Field(default_factory=uuid4)
    occurred_at: datetime = Field(default_factory=datetime.utcnow)
    slot_id: str
    competitor_id: str           # hashed/anonymized
    bid_cpm: float
    platform: Platform
    estimated_budget: Optional[float] = None


class BudgetUpdateEvent(BaseModel):
    """Topic: raw.budget.updates"""
    event_id: UUID = Field(default_factory=uuid4)
    occurred_at: datetime = Field(default_factory=datetime.utcnow)
    campaign_id: str
    account_id: str
    daily_budget_usd: float
    spent_today_usd: float
    remaining_usd: float
    objective: CampaignObjective


class AgentDecisionEvent(BaseModel):
    """Topic: agent.decisions — published after each agent recommendation."""
    event_id: UUID = Field(default_factory=uuid4)
    occurred_at: datetime = Field(default_factory=datetime.utcnow)
    thread_id: str
    intent: str
    recommended_bids: dict[str, float]   # slot_id → CPM
    reasoning_summary: str
    guardrail_flags: list[str] = Field(default_factory=list)
    latency_ms: float


class EvalResultEvent(BaseModel):
    """Topic: eval.results — published by benchmark runner."""
    event_id: UUID = Field(default_factory=uuid4)
    occurred_at: datetime = Field(default_factory=datetime.utcnow)
    scenario_id: str
    category: str
    tool_call_accuracy: float     # 0-1
    trajectory_score: float       # 0-1
    outcome_score: float          # 0-1
    latency_ms: float
    model_version: str
    prompt_version: str
