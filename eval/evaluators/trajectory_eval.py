"""
Trajectory Evaluator
Uses LangSmith to score whether the sequence of tool calls was optimal.
Sprint 6: wire LangSmith evaluator API.
"""

from __future__ import annotations

import os


def evaluate_trajectory(run_result: dict) -> float:
    """
    Score the full tool-call sequence (trajectory) for optimality.

    Sprint 6: call LangSmith evaluator:
      from langsmith import Client
      client = Client()
      result = client.evaluate(...)

    Returns float 0.0–1.0
    """
    # Stub: return 0 until LangSmith is wired in Sprint 6
    return 0.0
