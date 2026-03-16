# IAM roles — least-privilege per service

# LangGraph pods → Bedrock
resource "aws_iam_role" "agent_bedrock" {
  name = "${var.project}-agent-bedrock-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRoleWithWebIdentity"
      Effect    = "Allow"
      Principal = { Federated = module.eks.oidc_provider_arn }
    }]
  })
}

resource "aws_iam_role_policy" "agent_bedrock" {
  role = aws_iam_role.agent_bedrock.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"]
      Resource = "arn:aws:bedrock:${var.aws_region}::foundation-model/anthropic.*"
    }]
  })
}

# Airflow → SageMaker
resource "aws_iam_role" "airflow_sagemaker" {
  name = "${var.project}-airflow-sagemaker-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "airflow.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "airflow_sagemaker" {
  role = aws_iam_role.airflow_sagemaker.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["sagemaker:CreatePipelineExecution", "sagemaker:StartPipelineExecution", "sagemaker:DescribePipelineExecution"]
      Resource = "*"
    }]
  })
}

# SageMaker execution role
resource "aws_iam_role" "sagemaker_execution" {
  name = "${var.project}-sagemaker-execution"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "sagemaker.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "sagemaker_full" {
  role       = aws_iam_role.sagemaker_execution.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSageMakerFullAccess"
}
