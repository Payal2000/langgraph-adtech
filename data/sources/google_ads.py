"""
Google Ads API adapter — fetches auction insights and campaign data.
Produces AuctionEvent and CompetitorBidEvent records to Kafka.

Sprint 2: implement real Google Ads API client with oauth2.
"""

from __future__ import annotations

import os
from typing import Iterator

from data.schema import AuctionEvent, Platform


class GoogleAdsAdapter:
    """Thin wrapper around the Google Ads API for auction event extraction."""

    def __init__(self, customer_id: str | None = None):
        self.customer_id = customer_id or os.getenv("GOOGLE_ADS_CUSTOMER_ID", "")
        # TODO Sprint 2: initialise google-ads Python client
        # from google.ads.googleads.client import GoogleAdsClient
        # self.client = GoogleAdsClient.load_from_env()

    def fetch_auction_insights(self, campaign_ids: list[str]) -> Iterator[AuctionEvent]:
        """
        Stream auction insights from Google Ads API.
        Yields AuctionEvent objects ready to publish to Kafka.
        """
        # TODO Sprint 2: implement GAQL query for auction insights
        # query = "SELECT ..."
        # for row in self.client.get_service("GoogleAdsService").search(customer_id=self.customer_id, query=query):
        #     yield self._parse_row(row)
        raise NotImplementedError("Implement in Sprint 2")

    def _parse_row(self, row) -> AuctionEvent:
        raise NotImplementedError("Implement in Sprint 2")
