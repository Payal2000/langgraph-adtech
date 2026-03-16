"""
Benchmark Runner — executes all 120 ground-truth scenarios against the agent,
scores results, and logs to MLflow + LangSmith.

Usage:
    python -m eval.benchmark_runner
    python -m eval.benchmark_runner --category low_budget_high_competition --limit 10
"""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

import mlflow
import structlog
from langchain_core.messages import HumanMessage

from agent.graph import compiled_graph
from agent.state import BiddingAgentState
from eval.evaluators.tool_call_accuracy import evaluate_tool_calls
from eval.evaluators.trajectory_eval import evaluate_trajectory
from eval.evaluators.outcome_eval import evaluate_outcome

log = structlog.get_logger()

SCENARIOS_DIR = Path(__file__).parent / "scenarios"
CATEGORIES = [
    "low_budget_high_competition",
    "retargeting",
    "brand_vs_conversion",
    "time_sensitive",
    "multi_channel",
]


def load_scenarios(category: str | None = None) -> list[dict]:
    scenarios = []
    for path in sorted(SCENARIOS_DIR.glob("*.json")):
        data = json.loads(path.read_text())
        if category and data.get("category") != category:
            continue
        scenarios.append(data)
    return scenarios


def run_scenario(scenario: dict) -> dict:
    initial_state: BiddingAgentState = {
        "thread_id": f"bench_{scenario['scenario_id']}",
        "messages": [HumanMessage(content=scenario["user_message"])],
        "current_intent": "",
        "active_slots": scenario.get("active_slots", []),
        "budget_remaining": scenario.get("budget_remaining", 0.0),
        "audience_segments": scenario.get("audience_segments", []),
        "competitor_landscape": [],
        "tool_call_history": [],
        "guardrail_flags": [],
        "session_metadata": {"benchmark": True},
    }

    start = time.perf_counter()
    result = compiled_graph.invoke(initial_state)
    latency_ms = (time.perf_counter() - start) * 1000

    return {
        "scenario_id": scenario["scenario_id"],
        "category": scenario["category"],
        "result_state": result,
        "latency_ms": latency_ms,
        "ground_truth": scenario.get("ground_truth", {}),
    }


def main(category: str | None = None, limit: int | None = None):
    scenarios = load_scenarios(category)
    if limit:
        scenarios = scenarios[:limit]

    mlflow.set_experiment(f"benchmark_{category or 'all'}")

    with mlflow.start_run(run_name=f"benchmark_{int(time.time())}"):
        scores = {"tool_call_accuracy": [], "trajectory": [], "outcome": []}

        for i, scenario in enumerate(scenarios):
            log.info("running_scenario", i=i + 1, total=len(scenarios), id=scenario["scenario_id"])
            try:
                run_result = run_scenario(scenario)

                tc_score = evaluate_tool_calls(run_result)
                traj_score = evaluate_trajectory(run_result)
                out_score = evaluate_outcome(run_result)

                scores["tool_call_accuracy"].append(tc_score)
                scores["trajectory"].append(traj_score)
                scores["outcome"].append(out_score)

                mlflow.log_metrics({
                    f"tool_call_accuracy_{scenario['category']}": tc_score,
                    f"trajectory_{scenario['category']}": traj_score,
                    f"outcome_{scenario['category']}": out_score,
                }, step=i)

            except Exception as exc:
                log.error("scenario_failed", scenario_id=scenario["scenario_id"], error=str(exc))

        # Summary metrics
        for metric, values in scores.items():
            if values:
                mlflow.log_metric(f"avg_{metric}", sum(values) / len(values))

        log.info(
            "benchmark_complete",
            scenarios=len(scenarios),
            avg_tool_accuracy=sum(scores["tool_call_accuracy"]) / max(len(scores["tool_call_accuracy"]), 1),
            avg_trajectory=sum(scores["trajectory"]) / max(len(scores["trajectory"]), 1),
            avg_outcome=sum(scores["outcome"]) / max(len(scores["outcome"]), 1),
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--category", choices=CATEGORIES, default=None)
    parser.add_argument("--limit", type=int, default=None)
    args = parser.parse_args()
    main(category=args.category, limit=args.limit)
