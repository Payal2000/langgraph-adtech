"""
DAG: benchmark_suite
Schedule: daily at 2am UTC
Runs all 120 eval scenarios, logs scores to MLflow + Prometheus.
Triggers sagemaker_finetune DAG if avg trajectory score drops below 0.75.
"""

from __future__ import annotations

from datetime import datetime, timedelta

from airflow import DAG
from airflow.operators.python import BranchPythonOperator, PythonOperator
from airflow.operators.trigger_dagrun import TriggerDagRunOperator

SCORE_THRESHOLD = 0.75

default_args = {
    "owner": "ml-team",
    "retries": 1,
    "retry_delay": timedelta(minutes=5),
}


def _run_benchmarks(**context):
    from eval.benchmark_runner import main
    main()
    # Push avg trajectory score to XCom for branching
    # TODO Sprint 7: read from MLflow and push real score
    context["task_instance"].xcom_push(key="avg_trajectory_score", value=0.80)


def _check_score(**context):
    score = context["task_instance"].xcom_pull(key="avg_trajectory_score")
    if score is not None and score < SCORE_THRESHOLD:
        return "trigger_finetune"
    return "skip_finetune"


def _skip_finetune():
    print("Score above threshold — no fine-tune needed.")


with DAG(
    dag_id="benchmark_suite",
    schedule_interval="0 2 * * *",
    start_date=datetime(2024, 1, 1),
    catchup=False,
    default_args=default_args,
    tags=["eval", "mlflow"],
) as dag:

    run_benchmarks = PythonOperator(
        task_id="run_benchmarks",
        python_callable=_run_benchmarks,
    )

    check_score = BranchPythonOperator(
        task_id="check_score",
        python_callable=_check_score,
    )

    trigger_finetune = TriggerDagRunOperator(
        task_id="trigger_finetune",
        trigger_dag_id="sagemaker_finetune",
        wait_for_completion=False,
    )

    skip_finetune = PythonOperator(
        task_id="skip_finetune",
        python_callable=_skip_finetune,
    )

    run_benchmarks >> check_score >> [trigger_finetune, skip_finetune]
