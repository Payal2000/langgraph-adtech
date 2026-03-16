-- mart: budget_utilization — spend vs allocation over time per campaign
{{
  config(
    materialized = 'table',
    schema = 'MARTS',
    cluster_by = ['campaign_id']
  )
}}

with latest_snapshots as (
    select
        campaign_id,
        account_id,
        objective,
        daily_budget_usd,
        spent_today_usd,
        remaining_usd,
        pacing_ratio,
        day_fraction,
        occurred_at,
        -- keep only the most recent snapshot per campaign per day
        row_number() over (
            partition by campaign_id, date(occurred_at)
            order by occurred_at desc
        ) as rn
    from {{ ref('stg_budget_snapshots') }}
)

select
    campaign_id,
    account_id,
    objective,
    daily_budget_usd,
    spent_today_usd,
    remaining_usd,
    pacing_ratio,
    -- pacing status
    case
        when pacing_ratio < day_fraction * 0.8 then 'under_pacing'
        when pacing_ratio > day_fraction * 1.2 then 'over_pacing'
        else 'on_track'
    end as pacing_status,
    occurred_at as snapshot_at,
    current_timestamp() as mart_refreshed_at
from latest_snapshots
where rn = 1
