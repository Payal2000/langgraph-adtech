"""
Simulation Agent Node — Monte Carlo auction simulations via SageMaker.
Tools: simulation_runner, bid_calculator, competitor_analyzer
LLM: SageMaker fine-tuned endpoint (Sprint 10), falls back to Bedrock.
"""

from __future__ import annotations

import os

from langchain_aws import ChatBedrock
from langchain_core.messages import SystemMessage

from agent.state import BiddingAgentState
from agent.tools import bid_calculator, competitor_analyzer, simulation_runner

SIMULATION_SYSTEM_PROMPT = """You are an auction simulation specialist.
When asked to simulate bidding scenarios:
1. Use competitor_analyzer to establish the current landscape
2. Propose bid_scenarios spanning p25–p75 of competitor bids
3. Run simulation_runner to get win rates and clearing price distributions
4. Summarize the optimal bid point that balances win rate and cost

Present results as a clear table: bid CPM | win rate | avg clearing price | recommendation."""

_tools = [simulation_runner, bid_calculator, competitor_analyzer]


def _get_llm():
    # Sprint 10: swap to SageMaker endpoint for the fine-tuned model
    # from langchain_aws import SagemakerEndpoint
    # if os.getenv("SAGEMAKER_ENDPOINT_NAME"):
    #     return SagemakerEndpoint(...).bind_tools(_tools)
    return ChatBedrock(model_id="anthropic.claude-3-sonnet-20240229-v1:0").bind_tools(_tools)


def simulation_agent_node(state: BiddingAgentState) -> dict:
    llm = _get_llm()
    messages = [SystemMessage(content=SIMULATION_SYSTEM_PROMPT)] + state["messages"]
    response = llm.invoke(messages)
    return {"messages": state["messages"] + [response]}
