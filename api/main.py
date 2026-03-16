"""
FastAPI Gateway — entry point for the ad bidding agent API.

Middleware stack (in order):
  1. Cognito JWT validation
  2. NeMo Guardrails hook
  3. LangGraph agent invocation
  4. Prometheus metrics export
"""

from __future__ import annotations

import os
import uuid

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage
from pydantic import BaseModel

from api.middleware.auth import CognitoAuthMiddleware
from api.middleware.guardrails import guardrails_check
from api.metrics import instrument_app, REQUEST_LATENCY, AGENT_REQUESTS_TOTAL
from agent.graph import compiled_graph
from agent.state import BiddingAgentState

log = structlog.get_logger()

app = FastAPI(
    title="Ad Bidding Agent API",
    version="0.1.0",
    description="LangGraph-powered ad bidding recommendation system",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auth middleware ────────────────────────────────────────────────────────────
app.add_middleware(CognitoAuthMiddleware)

# ── Prometheus instrumentation ─────────────────────────────────────────────────
instrument_app(app)


# ── Request / Response models ──────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    thread_id: str | None = None
    budget_remaining: float = 0.0
    audience_segments: list[str] = []
    active_slot_ids: list[str] = []


class ChatResponse(BaseModel):
    thread_id: str
    response: str
    intent: str
    guardrail_flags: list[str]


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/v1/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, req: Request):
    """Single-turn chat with the bidding agent."""
    thread_id = request.thread_id or str(uuid.uuid4())

    # Guardrails pre-check
    flags = await guardrails_check(request.message)
    if flags:
        log.warning("guardrail_flags", flags=flags, thread_id=thread_id)

    initial_state: BiddingAgentState = {
        "thread_id": thread_id,
        "messages": [HumanMessage(content=request.message)],
        "current_intent": "",
        "active_slots": [],
        "budget_remaining": request.budget_remaining,
        "audience_segments": request.audience_segments,
        "competitor_landscape": [],
        "tool_call_history": [],
        "guardrail_flags": flags,
        "session_metadata": {},
    }

    with REQUEST_LATENCY.labels(endpoint="/v1/chat").time():
        result = await compiled_graph.ainvoke(initial_state)
        AGENT_REQUESTS_TOTAL.labels(intent=result.get("current_intent", "unknown")).inc()

    last_message = result["messages"][-1]
    return ChatResponse(
        thread_id=thread_id,
        response=str(last_message.content),
        intent=result.get("current_intent", ""),
        guardrail_flags=result.get("guardrail_flags", []),
    )


@app.post("/v1/chat/stream")
async def chat_stream(request: ChatRequest):
    """Streaming chat — SSE response."""
    thread_id = request.thread_id or str(uuid.uuid4())

    initial_state: BiddingAgentState = {
        "thread_id": thread_id,
        "messages": [HumanMessage(content=request.message)],
        "current_intent": "",
        "active_slots": [],
        "budget_remaining": request.budget_remaining,
        "audience_segments": request.audience_segments,
        "competitor_landscape": [],
        "tool_call_history": [],
        "guardrail_flags": [],
        "session_metadata": {},
    }

    async def event_generator():
        async for chunk in compiled_graph.astream(initial_state):
            for node_name, node_output in chunk.items():
                if "messages" in node_output:
                    last = node_output["messages"][-1]
                    if hasattr(last, "content") and last.content:
                        yield f"data: {last.content}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
