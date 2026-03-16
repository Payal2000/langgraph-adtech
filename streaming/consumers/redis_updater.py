"""
Kafka consumer → Redis hot-state updater.
Maintains real-time bid landscape and budget state in Redis
so the agent tools can read <2ms without hitting Snowflake.
"""

from __future__ import annotations

import json
import os

import redis
from confluent_kafka import Consumer

TOPICS = ["raw.auction.events", "raw.competitor.bids", "raw.budget.updates"]
HOT_STATE_TTL_SEC = 3600  # 1 hour


def _make_consumer() -> Consumer:
    return Consumer({
        "bootstrap.servers": os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092"),
        "group.id": "redis-updater",
        "auto.offset.reset": "latest",   # hot state: only care about recent data
        "enable.auto.commit": True,
    })


def _make_redis() -> redis.Redis:
    return redis.Redis(
        host=os.getenv("REDIS_HOST", "localhost"),
        port=int(os.getenv("REDIS_PORT", "6379")),
        db=int(os.getenv("REDIS_DB", "0")),
        password=os.getenv("REDIS_PASSWORD") or None,
        decode_responses=True,
    )


def _update_hot_state(r: redis.Redis, topic: str, payload: dict) -> None:
    if topic == "raw.auction.events":
        key = f"slot:auction:{payload['slot_id']}"
        r.hset(key, mapping={
            "clearing_cpm": payload.get("clearing_price_cpm", 0),
            "winner_bid_cpm": payload.get("winner_bid_cpm", 0),
            "updated_at": payload.get("occurred_at", ""),
        })
        r.expire(key, HOT_STATE_TTL_SEC)

    elif topic == "raw.competitor.bids":
        key = f"slot:competitor:{payload['slot_id']}"
        r.lpush(key, json.dumps({"bid": payload.get("bid_cpm"), "competitor": payload.get("competitor_id")}))
        r.ltrim(key, 0, 99)   # keep last 100 bids
        r.expire(key, HOT_STATE_TTL_SEC)

    elif topic == "raw.budget.updates":
        key = f"campaign:budget:{payload['campaign_id']}"
        r.hset(key, mapping={
            "remaining_usd": payload.get("remaining_usd", 0),
            "pacing": payload.get("pacing_ratio", 0),
            "updated_at": payload.get("occurred_at", ""),
        })
        r.expire(key, HOT_STATE_TTL_SEC)


def run_updater():
    consumer = _make_consumer()
    consumer.subscribe(TOPICS)
    r = _make_redis()

    try:
        while True:
            msg = consumer.poll(timeout=0.1)
            if msg and not msg.error():
                payload = json.loads(msg.value())
                _update_hot_state(r, msg.topic(), payload)
    except KeyboardInterrupt:
        pass
    finally:
        consumer.close()


if __name__ == "__main__":
    run_updater()
