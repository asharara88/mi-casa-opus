-- Fix security definer view by dropping and recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.pipeline_kpis;

CREATE VIEW public.pipeline_kpis 
WITH (security_invoker = true) AS
SELECT 
  pipeline,
  COUNT(*) as total_deals,
  COUNT(*) FILTER (WHERE deal_state NOT IN ('ClosedWon', 'ClosedLost')) as active_deals,
  COUNT(*) FILTER (WHERE deal_state = 'ClosedWon') as won_deals,
  COUNT(*) FILTER (WHERE deal_state = 'ClosedLost') as lost_deals,
  ROUND(
    COUNT(*) FILTER (WHERE deal_state = 'ClosedWon')::numeric / 
    NULLIF(COUNT(*) FILTER (WHERE deal_state IN ('ClosedWon', 'ClosedLost')), 0) * 100, 
    2
  ) as win_rate,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400) FILTER (WHERE deal_state = 'ClosedWon') as avg_days_to_close
FROM public.deals
WHERE pipeline IS NOT NULL
GROUP BY pipeline;