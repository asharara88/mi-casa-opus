-- Remove overly permissive policies that expose all prospect data
DROP POLICY IF EXISTS "Allow anon read for demo mode" ON public.prospects;
DROP POLICY IF EXISTS "Allow authenticated users to view prospects" ON public.prospects;

-- The remaining policies are properly restricted:
-- - "Brokers can view prospects" - requires Broker role
-- - "Operators and LegalOwners can view prospects" - requires Operator or LegalOwner role
-- - "Operators can manage prospects" - requires Operator role for ALL operations
-- - "Brokers can update prospects" - requires Broker role for UPDATE