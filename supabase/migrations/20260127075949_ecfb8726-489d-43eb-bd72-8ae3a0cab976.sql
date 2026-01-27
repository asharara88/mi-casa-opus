-- Create function for efficient entity counts and breakdowns
CREATE OR REPLACE FUNCTION public.get_entity_counts()
RETURNS TABLE (
  entity_type text,
  total_count bigint,
  by_state jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prospects with stage breakdown
  RETURN QUERY
  SELECT 'prospects'::text, 
    (SELECT COUNT(*) FROM prospects)::bigint,
    (SELECT COALESCE(jsonb_object_agg(stage, cnt), '{}'::jsonb)
     FROM (SELECT COALESCE(crm_stage, 'Unknown') as stage, COUNT(*)::bigint as cnt FROM prospects GROUP BY crm_stage) s);
  
  -- Leads with state breakdown
  RETURN QUERY  
  SELECT 'leads'::text,
    (SELECT COUNT(*) FROM leads)::bigint,
    (SELECT COALESCE(jsonb_object_agg(state, cnt), '{}'::jsonb)
     FROM (SELECT COALESCE(lead_state::text, 'Unknown') as state, COUNT(*)::bigint as cnt FROM leads GROUP BY lead_state) s);

  -- Deals with state breakdown
  RETURN QUERY
  SELECT 'deals'::text,
    (SELECT COUNT(*) FROM deals)::bigint,
    (SELECT COALESCE(jsonb_object_agg(state, cnt), '{}'::jsonb)
     FROM (SELECT COALESCE(deal_state::text, 'Unknown') as state, COUNT(*)::bigint as cnt FROM deals GROUP BY deal_state) s);

  -- Listings with status breakdown
  RETURN QUERY
  SELECT 'listings'::text,
    (SELECT COUNT(*) FROM listings)::bigint,
    (SELECT COALESCE(jsonb_object_agg(status, cnt), '{}'::jsonb)
     FROM (SELECT COALESCE(status::text, 'Unknown') as status, COUNT(*)::bigint as cnt FROM listings GROUP BY status) s);
END;
$$;