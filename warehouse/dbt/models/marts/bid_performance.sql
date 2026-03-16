-- mart: bid_performance — CTR, CVR, CPM by slot/placement/time
-- Agent tools read this mart via Snowflake connector
{{
  config(
    materialized = 'table',
    schema = 'MARTS',
    cluster_by = ['slot_id', 'platform']
  )
}}

select
    slot_id,
    platform,
    placement,
    avg_clearing_cpm,
    avg_winner_bid_cpm,
    avg_floor_cpm,
    total_impressions,
    total_clicks,
    total_conversions,
    auction_count,
    ctr,
    cvr,
    -- CPM/CPC/CPA estimates
    iff(total_clicks > 0, avg_clearing_cpm * total_impressions / total_clicks / 1000, null) as estimated_cpc,
    iff(total_conversions > 0, avg_clearing_cpm * total_impressions / total_conversions / 1000, null) as estimated_cpa,
    current_timestamp() as mart_refreshed_at
from {{ ref('int_slot_enriched') }}
