"""
SageMaker training entry point script.
Called by the SageMaker Estimator during the fine-tuning job.
Sprint 10: implement full NeMo training loop.
"""

from __future__ import annotations

import os
import subprocess
import sys


def main():
    config_path = os.getenv("SM_HP_CONFIG_PATH", "training/nemo/finetune_config.yaml")
    # TODO Sprint 10: run NeMo training
    # subprocess.run(["python", "-m", "nemo.collections.nlp.parts.nlp_overrides", f"--config-path={config_path}"], check=True)
    print(f"Training stub — implement NeMo fine-tune in Sprint 10. Config: {config_path}")


if __name__ == "__main__":
    main()
