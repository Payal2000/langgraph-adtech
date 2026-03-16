# EKS Cluster + Node Groups
# Namespaces: prod, monitoring, eval, data

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "${var.project}-${var.environment}"
  cluster_version = "1.30"

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true

  eks_managed_node_groups = {
    prod = {
      instance_types = ["m7i.2xlarge"]
      min_size       = 3
      max_size       = 20
      desired_size   = 3
      labels         = { namespace = "prod" }
    }
    monitoring = {
      instance_types = ["m7i.xlarge"]
      min_size       = 2
      max_size       = 4
      desired_size   = 2
      labels         = { namespace = "monitoring" }
    }
    eval = {
      instance_types = ["c7i.4xlarge"]
      min_size       = 1
      max_size       = 10
      desired_size   = 1
      labels         = { namespace = "eval" }
    }
    data = {
      instance_types = ["r7i.2xlarge"]
      min_size       = 2
      max_size       = 6
      desired_size   = 2
      labels         = { namespace = "data" }
    }
  }

  tags = { Project = var.project, Environment = var.environment }
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${var.project}-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = false
}
