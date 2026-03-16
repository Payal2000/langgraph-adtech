-- mart: competitor_landscape — bid distribution per slot for agent tools
{{
  config(
    materialized = 'table',
    schema = 'MARTS',
    cluster_by = ['slot_id']
  )
}}

select
    slot_id,
    p25_bid,
    p50_bid,
    p75_bid,
    num_competitors,
    -- aggressiveness index: spread between p25 and p75
    iff(p25_bid > 0, (p75_bid - p25_bid) / p25_bid, null) as bid_spread_ratio,
    current_timestamp() as mart_refreshed_at
from {{ ref('int_slot_enriched') }}
where p50_bid is not null
