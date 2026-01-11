
-- Fix the overly permissive event_log_entries INSERT policy
-- Replace WITH CHECK (true) with proper validation

DROP POLICY IF EXISTS "System can insert events" ON public.event_log_entries;

-- More restrictive policy: authenticated users can insert events for entities they have access to
CREATE POLICY "Authenticated users can insert events"
ON public.event_log_entries FOR INSERT
TO authenticated
WITH CHECK (
    actor_user_id = auth.uid() OR
    public.has_role(auth.uid(), 'Operator')
);
