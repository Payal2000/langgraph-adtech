"""
Prometheus metrics definitions and FastAPI instrumentation.
Scraped by Prometheus at /metrics (exposed via prometheus-fastapi-instrumentator).
"""

from __future__ import annotations

from fastapi import FastAPI
from prometheus_client import Counter, Histogram
from prometheus_fastapi_instrumentator import Instrumentator

# ── Custom metrics ─────────────────────────────────────────────────────────────

REQUEST_LATENCY = Histogram(
    "agent_request_latency_seconds",
    "End-to-end latency for agent requests",
    labelnames=["endpoint"],
    buckets=[0.1, 0.25, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0],
)

AGENT_REQUESTS_TOTAL = Counter(
    "agent_requests_total",
    "Total agent requests by intent",
    labelnames=["intent"],
)

TOOL_CALLS_TOTAL = Counter(
    "tool_calls_total",
    "Total tool invocations by tool name",
    labelnames=["tool_name", "status"],
)

GUARDRAIL_FLAGS_TOTAL = Counter(
    "guardrail_flags_total",
    "Total NeMo guardrail flags raised by rule",
    labelnames=["rule"],
)

SNOWFLAKE_QUERY_LATENCY = Histogram(
    "snowflake_query_latency_seconds",
    "Snowflake mart query latency",
    labelnames=["mart"],
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0],
)

BENCHMARK_SCORE = Histogram(
    "benchmark_trajectory_score",
    "LangSmith trajectory evaluation score per scenario category",
    labelnames=["category"],
    buckets=[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
)


def instrument_app(app: FastAPI) -> None:
    """Attach the Prometheus instrumentator to the FastAPI app."""
    Instrumentator(
        should_group_status_codes=True,
        excluded_handlers=["/health"],
    ).instrument(app).expose(app, endpoint="/metrics")
