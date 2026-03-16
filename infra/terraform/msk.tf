# AWS MSK (Managed Kafka) — VPC-isolated, IAM auth

resource "aws_msk_cluster" "ad_bidding" {
  cluster_name           = "${var.project}-kafka"
  kafka_version          = "3.6.0"
  number_of_broker_nodes = 3

  broker_node_group_info {
    instance_type   = "kafka.m5.large"
    client_subnets  = module.vpc.private_subnets
    storage_info {
      ebs_storage_info { volume_size = 500 }
    }
    security_groups = [aws_security_group.msk.id]
  }

  client_authentication {
    sasl { iam = true }
  }

  encryption_info {
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
  }

  tags = { Project = var.project }
}

resource "aws_security_group" "msk" {
  name   = "${var.project}-msk-sg"
  vpc_id = module.vpc.vpc_id

  ingress {
    from_port   = 9098   # IAM auth port
    to_port     = 9098
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
}

# Glue Schema Registry
resource "aws_glue_registry" "ad_bidding" {
  registry_name = "${var.project}-schema-registry"
  tags          = { Project = var.project }
}
