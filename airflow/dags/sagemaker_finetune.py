"""
DAG: sagemaker_finetune
Triggered by: benchmark_suite DAG (score below threshold) or manual trigger
Kicks off NeMo fine-tune on SageMaker, registers model in MLflow on completion.
"""

from __future__ import annotations

from datetime import datetime, timedelta

from airflow import DAG
from airflow.operators.python import PythonOperator

default_args = {"owner": "ml-team", "retries": 0}


def _start_finetune(**context):
    from training.sagemaker.pipeline import build_pipeline
    import os
    pipeline = build_pipeline()
    pipeline.upsert(role_arn=os.getenv("SAGEMAKER_EXECUTION_ROLE_ARN", ""))
    execution = pipeline.start()
    context["task_instance"].xcom_push(key="execution_arn", value=execution.arn)
    print(f"Fine-tune started: {execution.arn}")


def _wait_and_register(**context):
    """Wait for SageMaker execution and register model in MLflow."""
    import time
    execution_arn = context["task_instance"].xcom_pull(key="execution_arn")
    print(f"Waiting for execution: {execution_arn} (stub)")
    # TODO Sprint 10: poll execution status, then mlflow.register_model()


with DAG(
    dag_id="sagemaker_finetune",
    schedule_interval=None,              # triggered externally
    start_date=datetime(2024, 1, 1),
    catchup=False,
    default_args=default_args,
    tags=["sagemaker", "finetune"],
) as dag:

    start = PythonOperator(task_id="start_finetune", python_callable=_start_finetune)
    register = PythonOperator(task_id="wait_and_register", python_callable=_wait_and_register)

    start >> register
