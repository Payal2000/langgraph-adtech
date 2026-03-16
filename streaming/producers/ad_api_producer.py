"""
Kafka producer — publishes auction events from Ad API adapters to MSK topics.
Sprint 2: wire real Ad API adapters here.
"""

from __future__ import annotations

import json
import os
from typing import Any

from confluent_kafka import Producer
from confluent_kafka.schema_registry import SchemaRegistryClient
from confluent_kafka.schema_registry.avro import AvroSerializer

from data.schema import AuctionEvent, CompetitorBidEvent

TOPICS = {
    "auction": "raw.auction.events",
    "competitor": "raw.competitor.bids",
    "budget": "raw.budget.updates",
    "decisions": "agent.decisions",
    "eval": "eval.results",
}


def _make_producer() -> Producer:
    config = {
        "bootstrap.servers": os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092"),
        "security.protocol": os.getenv("KAFKA_SECURITY_PROTOCOL", "PLAINTEXT"),
    }
    sasl = os.getenv("KAFKA_SASL_MECHANISM", "")
    if sasl:
        config["sasl.mechanism"] = sasl
        config["sasl.jaas.config"] = (
            "software.amazon.msk.auth.iam.IAMLoginModule required;"
        )
    return Producer(config)


class AdApiProducer:
    def __init__(self):
        self.producer = _make_producer()

    def publish_auction_event(self, event: AuctionEvent) -> None:
        self.producer.produce(
            topic=TOPICS["auction"],
            key=event.slot_id,
            value=event.model_dump_json(),
        )
        self.producer.poll(0)

    def publish_competitor_bid(self, event: CompetitorBidEvent) -> None:
        self.producer.produce(
            topic=TOPICS["competitor"],
            key=event.slot_id,
            value=event.model_dump_json(),
        )
        self.producer.poll(0)

    def flush(self) -> None:
        self.producer.flush()
