variable "aws_region" {
  default = "us-east-1"
}

variable "project" {
  default = "ad-bidding"
}

variable "environment" {
  default = "prod"
}

variable "snowflake_account" {}
variable "snowflake_admin_user" {}
variable "snowflake_admin_password" {
  sensitive = true
}

variable "cognito_callback_urls" {
  type    = list(string)
  default = ["https://app.ad-bidding.example.com/callback"]
}
