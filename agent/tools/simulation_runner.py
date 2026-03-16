"""
Tool: simulation_runner
Runs Monte Carlo auction simulations via the SageMaker fine-tuned endpoint.
Used exclusively by the Simulation Agent node.
"""

from __future__ import annotations

import json
import os

import boto3
from langchain_core.tools import tool
from pydantic import BaseModel, Field


class SimulationRunnerInput(BaseModel):
    slot_id: str = Field(description="Ad slot to simulate")
    bid_scenarios: list[float] = Field(description="List of CPM bids to test")
    num_auctions: int = Field(description="Number of auction rounds to simulate", default=1000)
    competitor_aggression: float = Field(
        description="Competitor aggression level 0-1 (1 = very aggressive)",
        default=0.5,
    )


@tool(args_schema=SimulationRunnerInput)
def simulation_runner(
    slot_id: str,
    bid_scenarios: list[float],
    num_auctions: int = 1000,
    competitor_aggression: float = 0.5,
) -> dict:
    """
    Run auction simulations using the SageMaker fine-tuned model endpoint.

    Returns win rates, average clearing prices, and cost distributions
    per bid scenario.
    """
    endpoint_name = os.getenv("SAGEMAKER_ENDPOINT_NAME", "ad-bidding-simulation-v1")

    # TODO Sprint 10: invoke real SageMaker endpoint
    # runtime = boto3.client("sagemaker-runtime", region_name=os.getenv("AWS_REGION"))
    # payload = json.dumps({...})
    # response = runtime.invoke_endpoint(EndpointName=endpoint_name, Body=payload, ContentType="application/json")

    return {
        "slot_id": slot_id,
        "results": [
            {
                "bid_cpm": bid,
                "win_rate": 0.0,
                "avg_clearing_price": 0.0,
                "p95_clearing_price": 0.0,
            }
            for bid in bid_scenarios
        ],
        "num_auctions": num_auctions,
        "note": "Stub — wire SageMaker endpoint in Sprint 10",
    }
