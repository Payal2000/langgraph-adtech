"""
SageMaker Training Pipeline
Triggered by Airflow sagemaker_finetune DAG when eval scores drop below threshold.
Runs NeMo LoRA fine-tune on the simulation agent dataset.

Sprint 10: full implementation.
"""

from __future__ import annotations

import os

import boto3
import sagemaker
from sagemaker.workflow.pipeline import Pipeline
from sagemaker.workflow.steps import TrainingStep
from sagemaker.estimator import Estimator


def build_pipeline(role: str | None = None, region: str | None = None) -> Pipeline:
    region = region or os.getenv("AWS_REGION", "us-east-1")
    role = role or os.getenv("SAGEMAKER_EXECUTION_ROLE_ARN", "")

    session = sagemaker.Session(boto_session=boto3.Session(region_name=region))

    estimator = Estimator(
        image_uri=f"nvcr.io/nvidia/nemo:24.05",    # NeMo training container
        role=role,
        instance_type="ml.p4d.24xlarge",
        instance_count=1,
        output_path=f"s3://{os.getenv('S3_BUCKET', 'ad-bidding-mlops')}/models/",
        sagemaker_session=session,
        hyperparameters={
            "config-path": "training/nemo/finetune_config.yaml",
        },
        environment={
            "NEMO_CONFIG": "ad_bidding_simulation_v1",
        },
    )

    training_step = TrainingStep(
        name="NemoFinetune",
        estimator=estimator,
        inputs={
            "train": sagemaker.TrainingInput(
                s3_data=f"s3://{os.getenv('S3_BUCKET', 'ad-bidding-mlops')}/training/train/",
                content_type="application/jsonlines",
            ),
            "validation": sagemaker.TrainingInput(
                s3_data=f"s3://{os.getenv('S3_BUCKET', 'ad-bidding-mlops')}/training/validation/",
                content_type="application/jsonlines",
            ),
        },
    )

    pipeline = Pipeline(
        name="AdBiddingSimulationFinetune",
        steps=[training_step],
        sagemaker_session=session,
    )

    return pipeline


if __name__ == "__main__":
    p = build_pipeline()
    p.upsert(role_arn=os.getenv("SAGEMAKER_EXECUTION_ROLE_ARN", ""))
    execution = p.start()
    print(f"Pipeline started: {execution.arn}")
