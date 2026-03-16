"""
Budget Agent Node — handles budget allocation and spend pacing.
Tools: budget_allocator, slot_ranker, roi_estimator
LLM: AWS Bedrock (Claude Sonnet)
"""

from __future__ import annotations

from langchain_aws import ChatBedrock
from langchain_core.messages import SystemMessage

from agent.state import BiddingAgentState
from agent.tools import budget_allocator, roi_estimator, slot_ranker

BUDGET_SYSTEM_PROMPT = """You are a budget optimization specialist for digital advertising.
Your responsibilities:
1. Allocate budget across slots to maximise the stated objective (CPA / ROAS / awareness)
2. Estimate ROI before committing spend
3. Flag under-pacing or over-pacing risks
4. Recommend reallocation when a slot is underperforming

Be conservative — always leave 10% buffer unless the user explicitly overrides."""

_tools = [budget_allocator, slot_ranker, roi_estimator]
_llm = ChatBedrock(model_id="anthropic.claude-3-sonnet-20240229-v1:0").bind_tools(_tools)


def budget_agent_node(state: BiddingAgentState) -> dict:
    messages = [SystemMessage(content=BUDGET_SYSTEM_PROMPT)] + state["messages"]
    response = _llm.invoke(messages)
    return {"messages": state["messages"] + [response]}
