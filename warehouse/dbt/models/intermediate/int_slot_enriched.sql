-- int_slot_enriched: join auction events with competitor bids per slot
{{
  config(
    materialized = 'ephemeral'
  )
}}

with auction as (
    select
        slot_id,
        platform,
        placement,
        avg(clearing_price_cpm)                   as avg_clearing_cpm,
        avg(winner_bid_cpm)                        as avg_winner_bid_cpm,
        avg(floor_price_cpm)                       as avg_floor_cpm,
        sum(impression_count)                      as total_impressions,
        sum(click_count)                           as total_clicks,
        sum(conversion_count)                      as total_conversions,
        count(*)                                   as auction_count,
        -- CTR / CVR
        iff(sum(impression_count) > 0,
            sum(click_count) / sum(impression_count), 0)    as ctr,
        iff(sum(click_count) > 0,
            sum(conversion_count) / sum(click_count), 0)    as cvr
    from {{ ref('stg_auction_events') }}
    group by 1, 2, 3
),

competitor as (
    select
        slot_id,
        percentile_cont(0.25) within group (order by bid_cpm) as p25_bid,
        percentile_cont(0.50) within group (order by bid_cpm) as p50_bid,
        percentile_cont(0.75) within group (order by bid_cpm) as p75_bid,
        count(distinct competitor_id)                          as num_competitors
    from {{ ref('stg_competitor_bids') }}
    group by 1
)

select
    a.*,
    c.p25_bid,
    c.p50_bid,
    c.p75_bid,
    c.num_competitors
from auction a
left join competitor c using (slot_id)
