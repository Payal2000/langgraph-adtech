# Snowflake — database, schemas, warehouses, roles

resource "snowflake_database" "ad_bidding" {
  name    = "AD_BIDDING"
  comment = "Ad bidding agent data warehouse"
}

resource "snowflake_schema" "raw" {
  database = snowflake_database.ad_bidding.name
  name     = "RAW"
}

resource "snowflake_schema" "staging" {
  database = snowflake_database.ad_bidding.name
  name     = "STAGING"
}

resource "snowflake_schema" "intermediate" {
  database = snowflake_database.ad_bidding.name
  name     = "INTERMEDIATE"
}

resource "snowflake_schema" "marts" {
  database = snowflake_database.ad_bidding.name
  name     = "MARTS"
}

resource "snowflake_warehouse" "compute" {
  name           = "COMPUTE_WH"
  warehouse_size = "SMALL"
  auto_suspend   = 60
  auto_resume    = true
}

resource "snowflake_warehouse" "transform" {
  name           = "TRANSFORM_WH"
  warehouse_size = "MEDIUM"
  auto_suspend   = 120
  auto_resume    = true
}

resource "snowflake_role" "agent_role" {
  name = "AGENT_ROLE"
}

# Grant SELECT on marts to agent role
resource "snowflake_schema_grant" "agent_marts" {
  database_name = snowflake_database.ad_bidding.name
  schema_name   = snowflake_schema.marts.name
  privilege     = "USAGE"
  roles         = [snowflake_role.agent_role.name]
}
