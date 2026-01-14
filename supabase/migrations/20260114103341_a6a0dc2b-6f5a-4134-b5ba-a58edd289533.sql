-- Add policy to allow authenticated users to view prospects (for demo mode and general access)
-- Prospects are CRM leads for cold outreach, not sensitive auth data

CREATE POLICY "Allow authenticated users to view prospects"
ON public.prospects
FOR SELECT
TO authenticated
USING (true);

-- Also allow anon access for demo mode
CREATE POLICY "Allow anon read for demo mode"
ON public.prospects
FOR SELECT
TO anon
USING (true);