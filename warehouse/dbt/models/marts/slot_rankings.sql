-- mart: slot_rankings — ranked slots by expected ROI per objective
{{
  config(
    materialized = 'table',
    schema = 'MARTS',
    cluster_by = ['platform']
  )
}}

with scored as (
    select
        slot_id,
        platform,
        placement,
        -- ROI score: higher CTR * CVR / CPM = better value
        iff(avg_clearing_cpm > 0, ctr * cvr * 1000 / avg_clearing_cpm, 0) as roi_score,
        -- Volume score: slots with more impressions = more reliable signal
        log(greatest(total_impressions, 1), 10)                             as volume_score,
        -- Composite rank score
        0.7 * iff(avg_clearing_cpm > 0, ctr * cvr * 1000 / avg_clearing_cpm, 0)
        + 0.3 * log(greatest(total_impressions, 1), 10)                     as composite_score,
        ctr,
        cvr,
        avg_clearing_cpm,
        total_impressions
    from {{ ref('bid_performance') }}
)

select
    slot_id,
    platform,
    placement,
    roi_score,
    volume_score,
    composite_score,
    ctr,
    cvr,
    avg_clearing_cpm,
    total_impressions,
    row_number() over (partition by platform order by composite_score desc) as rank_within_platform,
    row_number() over (order by composite_score desc)                       as overall_rank,
    current_timestamp() as mart_refreshed_at
from scored
