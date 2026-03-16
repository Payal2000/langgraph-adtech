"""
Synthetic data generator — produces realistic auction event streams for
local development and benchmark scenario seeding.

Usage:
    python -m data.generator --events 10000 --output data/seeds/
    python -m data.generator --stream --kafka-topic raw.auction.events
"""

from __future__ import annotations

import argparse
import json
import random
import uuid
from datetime import datetime, timedelta
from pathlib import Path

from data.schema import (
    AuctionEvent,
    AuctionType,
    CampaignObjective,
    CompetitorBidEvent,
    Platform,
    Placement,
)

# ── Synthetic config ───────────────────────────────────────────────────────────

SLOTS = [f"slot_{i:03d}" for i in range(1, 51)]     # 50 simulated slots
COMPETITORS = [f"competitor_{i:02d}" for i in range(1, 11)]

PLATFORM_WEIGHTS = [0.45, 0.35, 0.20]               # google, meta, programmatic
PLACEMENT_WEIGHTS = [0.50, 0.25, 0.15, 0.10]        # search, display, video, social

FLOOR_PRICES = {                                      # CPM floor per placement
    Placement.SEARCH: (0.50, 2.00),
    Placement.DISPLAY: (0.10, 0.80),
    Placement.VIDEO: (2.00, 8.00),
    Placement.SOCIAL: (0.30, 1.50),
}


def generate_auction_event(slot_id: str | None = None) -> AuctionEvent:
    slot = slot_id or random.choice(SLOTS)
    platform = random.choices(list(Platform), weights=PLATFORM_WEIGHTS)[0]
    placement = random.choices(list(Placement), weights=PLACEMENT_WEIGHTS)[0]
    floor_lo, floor_hi = FLOOR_PRICES[placement]
    floor = round(random.uniform(floor_lo, floor_hi), 4)
    clearing = round(floor * random.uniform(1.05, 3.0), 4)
    winner_bid = round(clearing * random.uniform(1.0, 1.15), 4)
    impressions = random.randint(1000, 50000)
    ctr = random.uniform(0.005, 0.08)
    cvr = random.uniform(0.01, 0.12)

    return AuctionEvent(
        slot_id=slot,
        platform=platform,
        placement=placement,
        auction_type=random.choice(list(AuctionType)),
        clearing_price_cpm=clearing,
        winner_bid_cpm=winner_bid,
        floor_price_cpm=floor,
        num_bidders=random.randint(2, 20),
        impression_count=impressions,
        click_count=int(impressions * ctr),
        conversion_count=int(impressions * ctr * cvr),
    )


def generate_competitor_bid(slot_id: str | None = None) -> CompetitorBidEvent:
    slot = slot_id or random.choice(SLOTS)
    return CompetitorBidEvent(
        slot_id=slot,
        competitor_id=random.choice(COMPETITORS),
        bid_cpm=round(random.uniform(0.20, 15.0), 4),
        platform=random.choices(list(Platform), weights=PLATFORM_WEIGHTS)[0],
    )


def generate_batch(n: int) -> list[dict]:
    events = []
    for _ in range(n):
        if random.random() < 0.7:
            events.append(generate_auction_event().model_dump(mode="json"))
        else:
            events.append(generate_competitor_bid().model_dump(mode="json"))
    return events


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate synthetic bid data")
    parser.add_argument("--events", type=int, default=1000)
    parser.add_argument("--output", type=str, default="data/seeds/")
    parser.add_argument("--stream", action="store_true", help="Stream to Kafka instead of file")
    args = parser.parse_args()

    if args.stream:
        # TODO Sprint 2: wire Kafka producer
        print("Streaming mode not yet implemented — use --output instead")
    else:
        out = Path(args.output)
        out.mkdir(parents=True, exist_ok=True)
        batch = generate_batch(args.events)
        outfile = out / f"synthetic_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
        outfile.write_text(json.dumps(batch, indent=2))
        print(f"Generated {len(batch)} events → {outfile}")
