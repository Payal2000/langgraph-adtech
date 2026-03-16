"""
Auction Agent Node — handles bid price calculations and auction mechanics.
Tools: bid_calculator, competitor_analyzer, slot_ranker
LLM: AWS Bedrock (Claude Sonnet)
"""

from __future__ import annotations

from langchain_aws import ChatBedrock
from langchain_core.messages import SystemMessage
from langgraph.prebuilt import create_react_agent

from agent.state import BiddingAgentState
from agent.tools import bid_calculator, competitor_analyzer, slot_ranker

AUCTION_SYSTEM_PROMPT = """You are an expert ad auction specialist.
Your job is to recommend optimal bid prices for ad slots by:
1. Analyzing competitor bid distributions via competitor_analyzer
2. Ranking slots by expected ROI via slot_ranker
3. Calculating recommended bids via bid_calculator

Always explain your reasoning. If budget is constrained, prioritise slots with
the highest expected ROI. Never recommend bids above the floor_price limit."""

_tools = [bid_calculator, competitor_analyzer, slot_ranker]
_llm = ChatBedrock(model_id="anthropic.claude-3-sonnet-20240229-v1:0").bind_tools(_tools)


def auction_agent_node(state: BiddingAgentState) -> dict:
    """Run the auction agent for one turn."""
    messages = [SystemMessage(content=AUCTION_SYSTEM_PROMPT)] + state["messages"]
    response = _llm.invoke(messages)
    return {"messages": state["messages"] + [response]}
