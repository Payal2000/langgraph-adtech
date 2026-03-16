"""
LangGraph Agent Graph — wires supervisor + specialist nodes into a stateful graph.

Graph topology:
    START → supervisor → [auction | budget | strategy | simulation] → END

Each specialist node may call tools (ToolNode handles execution).
"""

from __future__ import annotations

from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode

from agent.nodes import (
    auction_agent_node,
    budget_agent_node,
    route_by_intent,
    simulation_agent_node,
    strategy_agent_node,
    supervisor_node,
)
from agent.state import BiddingAgentState
from agent.tools import (
    bid_calculator,
    budget_allocator,
    competitor_analyzer,
    pattern_scanner,
    roi_estimator,
    simulation_runner,
    slot_ranker,
)

# ── Tool nodes ─────────────────────────────────────────────────────────────────
auction_tools = ToolNode([bid_calculator, competitor_analyzer, slot_ranker])
budget_tools = ToolNode([budget_allocator, slot_ranker, roi_estimator])
strategy_tools = ToolNode([slot_ranker, competitor_analyzer, roi_estimator, pattern_scanner])
simulation_tools = ToolNode([simulation_runner, bid_calculator, competitor_analyzer])


def _should_continue_after_agent(state: BiddingAgentState) -> str:
    """If the last message contains tool calls, route to tool execution; else END."""
    last = state["messages"][-1]
    if hasattr(last, "tool_calls") and last.tool_calls:
        return "tools"
    return END


def build_graph() -> StateGraph:
    graph = StateGraph(BiddingAgentState)

    # ── Nodes ──────────────────────────────────────────────────────────────────
    graph.add_node("supervisor", supervisor_node)
    graph.add_node("auction", auction_agent_node)
    graph.add_node("auction_tools", auction_tools)
    graph.add_node("budget", budget_agent_node)
    graph.add_node("budget_tools", budget_tools)
    graph.add_node("strategy", strategy_agent_node)
    graph.add_node("strategy_tools", strategy_tools)
    graph.add_node("simulation", simulation_agent_node)
    graph.add_node("simulation_tools", simulation_tools)

    # ── Edges ──────────────────────────────────────────────────────────────────
    graph.add_edge(START, "supervisor")

    graph.add_conditional_edges(
        "supervisor",
        route_by_intent,
        {"auction": "auction", "budget": "budget", "strategy": "strategy", "simulation": "simulation"},
    )

    for node, tool_node in [
        ("auction", "auction_tools"),
        ("budget", "budget_tools"),
        ("strategy", "strategy_tools"),
        ("simulation", "simulation_tools"),
    ]:
        graph.add_conditional_edges(
            node,
            _should_continue_after_agent,
            {"tools": tool_node, END: END},
        )
        graph.add_edge(tool_node, node)  # loop back after tool execution

    return graph


# Compiled graph — import this in the API layer
compiled_graph = build_graph().compile()
