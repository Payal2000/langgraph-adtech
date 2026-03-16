-- Test: CTR and CVR must be non-negative
select *
from {{ ref('bid_performance') }}
where ctr < 0 or cvr < 0
