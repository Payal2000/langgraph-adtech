# langgraph-adtech

Production-grade ad bidding intelligence platform — a LangGraph multi-agent system that recommends, optimizes, and simulates programmatic auction strategies in real time.

## What it does

A media buyer interacts with a Next.js dashboard. Behind it, a LangGraph supervisor routes tasks across four specialized agents — Auction, Budget, Strategy, and Simulation — each backed by Claude Sonnet 4.6. Data flows from Kafka (live auction signals) through Snowflake/dbt (warehouse) into the agent layer, with full observability via LangSmith, MLflow, and Grafana.

## Architecture

```
Kafka / MSK          →  Real-time auction + bid event streaming
Snowflake + dbt      →  Data warehouse, feature store, audience segments
LangGraph Agent      →  Supervisor + 4 specialized nodes + 7 tools
FastAPI              →  REST gateway with Cognito auth + NeMo guardrails
Next.js 14           →  Dashboard: Live Auction, Budget Optimizer,
                         Strategy Dashboard, Marketplace Sim, AI Chat Agent
LangSmith + MLflow   →  Eval framework, trajectory scoring, experiment tracking
Airflow              →  DAGs for dbt refresh, benchmarks, SageMaker fine-tune
Prometheus + Grafana →  Latency, win rate, cost-per-win, tool call metrics
Terraform + EKS      →  Infrastructure as code, Kubernetes deployment
```

## Agent nodes

| Node | Responsibility |
|------|---------------|
| `supervisor` | Routes incoming tasks, manages agent handoffs |
| `auction_agent` | Evaluates live slots, outputs BID / HOLD / SKIP with reasoning |
| `budget_agent` | Allocates spend across channels, enforces pacing guardrails |
| `strategy_agent` | Applies bidding rules, monitors competitor pressure signals |
| `simulation_agent` | Runs Monte Carlo auction scenarios, compares strategies |

## Tools

`bid_calculator` · `budget_allocator` · `competitor_analyzer` · `pattern_scanner` · `roi_estimator` · `simulation_runner` · `slot_ranker`

## Frontend

Next.js 14 App Router, Tailwind CSS, Recharts, Lucide icons, Geist font. Four pages + global AI chat agent:

- **Live Auction** — real-time slot queue with BID/HOLD/SKIP chips, agent reasoning panel, ask-the-agent chat
- **Budget Optimizer** — animated channel allocation bars, 7-day performance chart, AI scenario comparison
- **Strategy Dashboard** — active rules with left-border status accents, competitor Auction Insights table, agent activity log
- **Marketplace Sim** — horizontal win-rate bar chart, parameter sliders, slot-level outcome table
- **AI Chat Agent** — floating widget on every page, streaming responses, context-aware answers

## Quick start

```bash
# 1. Copy env template
cp .env.example .env

# 2. Start local stack (Kafka, Redis, FastAPI, Prometheus, Grafana, MLflow)
docker compose up -d

# 3. Install Python dependencies
pip install poetry && poetry install

# 4. Run the API
poetry run uvicorn api.main:app --reload

# 5. Run evals
poetry run python eval/benchmark_runner.py

# 6. Start the frontend
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

## Repo structure

```
agent/          LangGraph graph, nodes, tools, state schema
api/            FastAPI gateway, auth middleware, Prometheus metrics
data/           Schema definitions, synthetic data generator, platform connectors
eval/           Benchmark runner, evaluators (outcome, trajectory, tool-call accuracy)
airflow/        DAGs: dbt refresh, LangSmith export, SageMaker fine-tune, benchmarks
frontend/       Next.js 14 dashboard
  app/          Pages (auction, budget, strategy, simulation)
  components/   UI component library + Shell layout
  lib/          Mock data, formatters, hooks
```

## Eval framework

120 benchmark scenarios (`eval/scenarios/`) covering low-budget / high-competition, retargeting, and time-sensitive auctions. Three evaluator types:

- **Outcome** — was the bid decision correct given ground-truth data?
- **Trajectory** — did the agent call the right tools in the right order?
- **Tool-call accuracy** — were tool arguments within acceptable bounds?

## Tech stack

| Layer | Technology |
|-------|-----------|
| LLM | Claude Sonnet 4.6 (Anthropic / Bedrock) |
| Agent | LangGraph 0.2, LangSmith tracing |
| API | FastAPI, Pydantic v2, Uvicorn |
| Streaming | Apache Kafka (MSK), aiokafka |
| Warehouse | Snowflake, dbt Core |
| Experiment tracking | MLflow |
| Orchestration | Apache Airflow 2.x |
| Frontend | Next.js 14, Tailwind CSS, Recharts |
| Infra | AWS EKS, Terraform, Helm |
| Observability | Prometheus, Grafana |
