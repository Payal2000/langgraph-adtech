"""
Outcome Evaluator
Measures whether the agent's recommendation would have led to a good bidding
outcome, compared to ground-truth optimal strategy.
"""

from __future__ import annotations


def evaluate_outcome(run_result: dict) -> float:
    """
    Compare the agent's recommended bids to ground-truth optimal bids.

    ground_truth schema:
    {
      "optimal_bids": {"slot_001": 2.50, "slot_002": 1.20},
      "acceptable_deviation_pct": 0.15
    }

    Returns float 0.0–1.0 (fraction of slots within acceptable deviation)
    """
    gt = run_result.get("ground_truth", {})
    optimal_bids: dict[str, float] = gt.get("optimal_bids", {})
    deviation_pct: float = gt.get("acceptable_deviation_pct", 0.15)

    if not optimal_bids:
        return 1.0

    # TODO Sprint 6: extract actual recommended bids from result_state messages
    # For now, return 0.0 (stub)
    return 0.0
