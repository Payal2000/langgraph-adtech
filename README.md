# LangGraph Ad Bidding Recommendation System

Production-grade AI system using a conversational LangGraph agent to recommend, optimize,
and simulate advertisement bidding strategies — powered by real-time Kafka streaming,
Snowflake/dbt data warehouse, Bedrock (Claude Sonnet) inference, and a full MLOps loop.

## Architecture

```
Ingestion (Kafka/MSK) → Transformation (dbt/Snowflake) → Agent (LangGraph/Bedrock)
  → Evaluation (LangSmith/MLflow) → Observability (Prometheus/Grafana)
  → Infrastructure (EKS/Terraform)
```

## Quick Start (Local)

```bash
# 1. Copy env and fill in values
cp .env.example .env

# 2. Start local stack (Kafka, Redis, FastAPI, Prometheus, Grafana, MLflow)
docker compose up -d

# 3. Install Python deps
pip install poetry && poetry install

# 4. Run the API
poetry run uvicorn api.main:app --reload

# 5. Run evals
poetry run python eval/benchmark_runner.py
```

## Build Order (Sprints)

| Sprint | Focus |
|--------|-------|
| 1 | data/schema.py + generator + Snowflake + dbt staging |
| 2 | Kafka topics + producers + consumers + Glue schema registry |
| 3 | agent/state.py + all tool definitions + unit tests |
| 4 | LangGraph graph + agent nodes + Bedrock integration |
| 5 | FastAPI gateway + Cognito auth + NeMo guardrails |
| 6 | LangSmith tracing + eval framework + 120 benchmark scenarios |
| 7 | MLflow + Airflow DAGs + SageMaker pipeline skeleton |
| 8 | Prometheus + Grafana (docker-compose first) |
| 9 | Kubernetes manifests + Helm charts + Terraform |
| 10 | NeMo fine-tune + SageMaker endpoint + simulation node |
| 11 | React frontend + end-to-end integration |
| 12 | Load testing + benchmark baseline + production readiness |

## Repo Structure

See `docs/architecture.md` for the full component deep-dive.
