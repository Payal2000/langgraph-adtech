"""
Meta Ads API adapter — fetches ad delivery insights and bid data.
Sprint 2: implement with facebook-business SDK.
"""

from __future__ import annotations

import os
from typing import Iterator

from data.schema import AuctionEvent, Platform


class MetaAdsAdapter:
    def __init__(self, ad_account_id: str | None = None):
        self.ad_account_id = ad_account_id or os.getenv("META_AD_ACCOUNT_ID", "")
        # TODO Sprint 2: from facebook_business.api import FacebookAdsApi

    def fetch_delivery_insights(self, campaign_ids: list[str]) -> Iterator[AuctionEvent]:
        raise NotImplementedError("Implement in Sprint 2")
