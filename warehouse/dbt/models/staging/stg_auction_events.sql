-- stg_auction_events: clean and type-cast raw auction events from Kafka sink
{{
  config(
    materialized = 'view',
    schema = 'STAGING'
  )
}}

with source as (
    select * from {{ source('raw', 'auction_events') }}
),

cleaned as (
    select
        event_id::varchar(36)                         as event_id,
        occurred_at::timestamp_tz                     as occurred_at,
        slot_id::varchar                              as slot_id,
        lower(trim(platform))::varchar                as platform,
        lower(trim(placement))::varchar               as placement,
        lower(trim(auction_type))::varchar            as auction_type,
        clearing_price_cpm::float                     as clearing_price_cpm,
        winner_bid_cpm::float                         as winner_bid_cpm,
        floor_price_cpm::float                        as floor_price_cpm,
        num_bidders::integer                          as num_bidders,
        impression_count::integer                     as impression_count,
        coalesce(click_count::integer, 0)             as click_count,
        coalesce(conversion_count::integer, 0)        as conversion_count,
        campaign_id::varchar                          as campaign_id,
        -- derived
        datediff('minute', occurred_at, current_timestamp()) as age_minutes
    from source
    where clearing_price_cpm > 0
      and impression_count > 0
      and occurred_at >= dateadd('day', -{{ var('mart_lookback_days') }}, current_date())
)

select * from cleaned
