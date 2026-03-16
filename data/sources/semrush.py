"""
SEMrush API adapter — fetches competitor keyword and bid data.
Sprint 2: implement with SEMrush REST API.
"""

from __future__ import annotations

import os
from typing import Iterator

from data.schema import CompetitorBidEvent


class SemrushAdapter:
    def __init__(self):
        self.api_key = os.getenv("SEMRUSH_API_KEY", "")

    def fetch_competitor_bids(self, keywords: list[str], domain: str) -> Iterator[CompetitorBidEvent]:
        raise NotImplementedError("Implement in Sprint 2")
