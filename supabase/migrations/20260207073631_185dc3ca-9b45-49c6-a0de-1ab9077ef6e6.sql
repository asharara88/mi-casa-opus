
-- =====================================================
-- SECURE: pipeline_kpis view with security_invoker
-- =====================================================

-- Recreate view with security_invoker to enforce RLS
DROP VIEW IF EXISTS pipeline_kpis;

CREATE VIEW pipeline_kpis 
WITH (security_invoker=on) AS
SELECT 
    pipeline,
    count(*) AS total_deals,
    count(*) FILTER (WHERE deal_state NOT IN ('ClosedWon', 'ClosedLost')) AS active_deals,
    count(*) FILTER (WHERE deal_state = 'ClosedWon') AS won_deals,
    count(*) FILTER (WHERE deal_state = 'ClosedLost') AS lost_deals,
    round((count(*) FILTER (WHERE deal_state = 'ClosedWon')::numeric / 
           NULLIF(count(*) FILTER (WHERE deal_state IN ('ClosedWon', 'ClosedLost')), 0)::numeric * 100), 2) AS win_rate,
    avg(EXTRACT(epoch FROM (updated_at - created_at)) / 86400) 
        FILTER (WHERE deal_state = 'ClosedWon') AS avg_days_to_close
FROM deals
WHERE pipeline IS NOT NULL
GROUP BY pipeline;

-- Grant access to authenticated users (RLS will filter via security_invoker)
GRANT SELECT ON pipeline_kpis TO authenticated;
