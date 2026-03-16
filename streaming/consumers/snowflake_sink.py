"""
Kafka consumer → Snowflake sink.
Reads from raw.auction.events and raw.competitor.bids,
writes to Snowflake RAW schema via batch INSERT.

Sprint 2: replace with Snowflake Kafka Connector (managed, no-code sink).
This file serves as the fallback Python consumer.
"""

from __future__ import annotations

import json
import os
import time

import snowflake.connector
from confluent_kafka import Consumer, KafkaException

TOPICS = ["raw.auction.events", "raw.competitor.bids", "raw.budget.updates"]
BATCH_SIZE = 500
FLUSH_INTERVAL_SEC = 15


def _make_consumer() -> Consumer:
    return Consumer({
        "bootstrap.servers": os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092"),
        "group.id": "snowflake-sink",
        "auto.offset.reset": "earliest",
        "enable.auto.commit": False,
    })


def _make_snowflake_conn():
    return snowflake.connector.connect(
        account=os.getenv("SNOWFLAKE_ACCOUNT"),
        user=os.getenv("SNOWFLAKE_USER"),
        password=os.getenv("SNOWFLAKE_PASSWORD"),
        database="ad_bidding",
        schema="RAW",
        warehouse=os.getenv("SNOWFLAKE_WAREHOUSE", "COMPUTE_WH"),
        role=os.getenv("SNOWFLAKE_ROLE", "AGENT_ROLE"),
    )


def run_sink():
    consumer = _make_consumer()
    consumer.subscribe(TOPICS)
    sf = _make_snowflake_conn()
    cursor = sf.cursor()

    batch: list[dict] = []
    last_flush = time.time()

    try:
        while True:
            msg = consumer.poll(timeout=1.0)
            if msg and not msg.error():
                batch.append({"topic": msg.topic(), "payload": json.loads(msg.value())})

            should_flush = (
                len(batch) >= BATCH_SIZE
                or (time.time() - last_flush) >= FLUSH_INTERVAL_SEC
            )

            if should_flush and batch:
                # TODO Sprint 2: implement table routing and bulk INSERT
                print(f"Flushing {len(batch)} records to Snowflake (stub)")
                batch.clear()
                last_flush = time.time()
                consumer.commit()

    except KeyboardInterrupt:
        pass
    finally:
        consumer.close()
        sf.close()


if __name__ == "__main__":
    run_sink()
