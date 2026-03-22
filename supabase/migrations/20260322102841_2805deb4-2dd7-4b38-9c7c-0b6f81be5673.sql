-- 1. Fix portal_inquiries broker policy: join through broker_profiles
DROP POLICY IF EXISTS "Brokers can view linked inquiries" ON public.portal_inquiries;
CREATE POLICY "Brokers can view linked inquiries" ON public.portal_inquiries
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'Manager'::app_role)
    OR lead_id IN (
      SELECT l.id FROM leads l
      JOIN broker_profiles bp ON l.assigned_broker_id = bp.id
      WHERE bp.user_id = auth.uid()
    )
  );

-- 2. Remove overly permissive smart_contracts ALL policy (public role)
DROP POLICY IF EXISTS "Authenticated users can manage contracts" ON public.smart_contracts;

-- 3. Fix contract_events: restrict public read to authenticated participants
DROP POLICY IF EXISTS "Users can view contract events" ON public.contract_events;
CREATE POLICY "Participants can view contract events" ON public.contract_events
  FOR SELECT TO authenticated
  USING (
    is_contract_participant(contract_id, auth.uid())
    OR has_role(auth.uid(), 'Manager'::app_role)
    OR has_role(auth.uid(), 'Owner'::app_role)
  );

-- 4. Remove duplicate public INSERT policy on contract_events
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.contract_events;