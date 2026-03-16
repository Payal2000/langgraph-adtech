"""
Strategy Agent Node — multi-slot campaign strategy, competitive positioning.
Tools: slot_ranker, competitor_analyzer, roi_estimator, pattern_scanner
LLM: AWS Bedrock (Claude Sonnet)
"""

from __future__ import annotations

from langchain_aws import ChatBedrock
from langchain_core.messages import SystemMessage

from agent.state import BiddingAgentState
from agent.tools import competitor_analyzer, pattern_scanner, roi_estimator, slot_ranker

STRATEGY_SYSTEM_PROMPT = """You are a senior digital advertising strategist.
You develop holistic bidding strategies across multiple slots and channels.

Your approach:
1. Scan for patterns and anomalies with pattern_scanner
2. Map competitor positioning with competitor_analyzer
3. Rank slots by objective-aligned ROI with slot_ranker
4. Validate projections with roi_estimator

Produce a clear strategy document with: recommended slots, bid ranges,
rationale, and risk factors. Always consider the audience segments provided."""

_tools = [slot_ranker, competitor_analyzer, roi_estimator, pattern_scanner]
_llm = ChatBedrock(model_id="anthropic.claude-3-sonnet-20240229-v1:0").bind_tools(_tools)


def strategy_agent_node(state: BiddingAgentState) -> dict:
    messages = [SystemMessage(content=STRATEGY_SYSTEM_PROMPT)] + state["messages"]
    response = _llm.invoke(messages)
    return {"messages": state["messages"] + [response]}
