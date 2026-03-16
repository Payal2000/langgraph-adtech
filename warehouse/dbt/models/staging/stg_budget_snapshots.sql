-- stg_budget_snapshots: clean budget update events
{{
  config(
    materialized = 'view',
    schema = 'STAGING'
  )
}}

with source as (
    select * from {{ source('raw', 'budget_snapshots') }}
),

cleaned as (
    select
        event_id::varchar(36)            as event_id,
        occurred_at::timestamp_tz        as occurred_at,
        campaign_id::varchar             as campaign_id,
        account_id::varchar              as account_id,
        daily_budget_usd::float          as daily_budget_usd,
        spent_today_usd::float           as spent_today_usd,
        remaining_usd::float             as remaining_usd,
        lower(trim(objective))::varchar  as objective,
        -- pacing
        iff(daily_budget_usd > 0,
            spent_today_usd / daily_budget_usd, null)   as pacing_ratio,
        -- time-of-day normalised pacing (assumes linear spend)
        hour(occurred_at) / 24.0                        as day_fraction
    from source
    where daily_budget_usd > 0
)

select * from cleaned
