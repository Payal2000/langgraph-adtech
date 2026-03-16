"""
DAG: langsmith_export
Schedule: daily at 3am UTC
Exports annotated LangSmith traces → S3 → SageMaker training input.
"""

from __future__ import annotations

from datetime import datetime, timedelta

from airflow import DAG
from airflow.operators.python import PythonOperator

default_args = {"owner": "ml-team", "retries": 1}


def _export_langsmith_traces(**context):
    """
    Pull annotated traces from LangSmith, convert to JSONL, upload to S3.
    Sprint 7: implement with LangSmith SDK.
    """
    # from langsmith import Client
    # client = Client()
    # runs = client.list_runs(project_name="ad-bidding-agent", filter="has_feedback")
    # ... export to S3
    print("LangSmith export stub — implement in Sprint 7")


def _upload_to_s3(**context):
    """Upload exported JSONL to S3 training input path."""
    print("S3 upload stub — implement in Sprint 7")


with DAG(
    dag_id="langsmith_export",
    schedule_interval="0 3 * * *",
    start_date=datetime(2024, 1, 1),
    catchup=False,
    default_args=default_args,
    tags=["langsmith", "training-data"],
) as dag:

    export = PythonOperator(task_id="export_traces", python_callable=_export_langsmith_traces)
    upload = PythonOperator(task_id="upload_to_s3", python_callable=_upload_to_s3)

    export >> upload
