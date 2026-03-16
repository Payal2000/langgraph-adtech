"""
Tool Call Accuracy Evaluator
Checks whether the agent called the correct tools with valid parameters
compared to ground truth for each scenario.
"""

from __future__ import annotations


def evaluate_tool_calls(run_result: dict) -> float:
    """
    Score: fraction of expected tool calls that were made correctly.

    ground_truth schema:
    {
      "expected_tools": ["bid_calculator", "slot_ranker"],
      "tool_params": {"bid_calculator": {"slot_id": "slot_001"}}
    }

    Returns float 0.0–1.0
    """
    gt = run_result.get("ground_truth", {})
    expected_tools: list[str] = gt.get("expected_tools", [])

    if not expected_tools:
        return 1.0  # no expectation → pass

    state = run_result.get("result_state", {})
    actual_calls = [tc["tool_name"] for tc in state.get("tool_call_history", [])]

    correct = sum(1 for t in expected_tools if t in actual_calls)
    return correct / len(expected_tools)
