-- stg_competitor_bids: clean competitor bid events
{{
  config(
    materialized = 'view',
    schema = 'STAGING'
  )
}}

with source as (
    select * from {{ source('raw', 'competitor_bids') }}
),

cleaned as (
    select
        event_id::varchar(36)            as event_id,
        occurred_at::timestamp_tz        as occurred_at,
        slot_id::varchar                 as slot_id,
        competitor_id::varchar           as competitor_id,
        bid_cpm::float                   as bid_cpm,
        lower(trim(platform))::varchar   as platform
    from source
    where bid_cpm > 0
      and occurred_at >= dateadd('day', -{{ var('mart_lookback_days') }}, current_date())
)

select * from cleaned
