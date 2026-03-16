# AWS Cognito — User Pool for human users + machine clients

resource "aws_cognito_user_pool" "ad_bidding" {
  name = "${var.project}-users"

  password_policy {
    minimum_length    = 12
    require_uppercase = true
    require_numbers   = true
    require_symbols   = true
  }

  mfa_configuration = "OPTIONAL"

  software_token_mfa_configuration {
    enabled = true
  }

  tags = { Project = var.project }
}

resource "aws_cognito_user_pool_client" "frontend" {
  name                         = "frontend-client"
  user_pool_id                 = aws_cognito_user_pool.ad_bidding.id
  generate_secret              = false
  allowed_oauth_flows          = ["code"]
  allowed_oauth_scopes         = ["openid", "email", "profile"]
  callback_urls                = var.cognito_callback_urls
  supported_identity_providers = ["COGNITO"]
}

resource "aws_cognito_user_pool_client" "service" {
  name                  = "service-client"
  user_pool_id          = aws_cognito_user_pool.ad_bidding.id
  generate_secret       = true
  explicit_auth_flows   = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
}
