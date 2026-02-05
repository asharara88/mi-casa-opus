-- =====================================================
-- FINAL SECURITY HARDENING: Fix remaining SELECT policies
-- =====================================================

-- 1. Fix payment_escrow SELECT - restrict to deal participants/operators
DROP POLICY IF EXISTS "Users can view escrow records" ON payment_escrow;
CREATE POLICY "Deal participants and operators can view escrow"
ON payment_escrow FOR SELECT
USING (
  is_escrow_participant(id, auth.uid()) 
  OR has_role(auth.uid(), 'Operator'::app_role) 
  OR has_role(auth.uid(), 'LegalOwner'::app_role)
);

-- 2. Fix token_ownership SELECT - restrict to owner/creator/operators
DROP POLICY IF EXISTS "Users can view token ownership" ON token_ownership;
CREATE POLICY "Owners and operators can view token ownership"
ON token_ownership FOR SELECT
USING (
  created_by = auth.uid() 
  OR has_role(auth.uid(), 'Operator'::app_role) 
  OR has_role(auth.uid(), 'LegalOwner'::app_role)
);

-- 3. Fix smart_contracts SELECT - restrict to deal participants/operators
DROP POLICY IF EXISTS "Users can view smart contracts" ON smart_contracts;
CREATE POLICY "Deal participants and operators can view smart contracts"
ON smart_contracts FOR SELECT
USING (
  is_contract_participant(id, auth.uid()) 
  OR has_role(auth.uid(), 'Operator'::app_role) 
  OR has_role(auth.uid(), 'LegalOwner'::app_role)
);

-- 4. Fix bos_manifest_prompts SELECT - restrict to Operators only
DROP POLICY IF EXISTS "Authenticated users can view manifest prompts" ON bos_manifest_prompts;
CREATE POLICY "Operators can view manifest prompts"
ON bos_manifest_prompts FOR SELECT
USING (has_role(auth.uid(), 'Operator'::app_role));

-- 5. Fix developers SELECT - restrict to Operators and Brokers (business need)
DROP POLICY IF EXISTS "Authenticated users can view developers" ON developers;
CREATE POLICY "Staff can view developers"
ON developers FOR SELECT
USING (
  has_role(auth.uid(), 'Operator'::app_role) 
  OR has_role(auth.uid(), 'Broker'::app_role) 
  OR has_role(auth.uid(), 'LegalOwner'::app_role)
);

-- 6. Fix referral_sources SELECT - restrict to Operators only
DROP POLICY IF EXISTS "Authenticated users can view sources" ON referral_sources;
CREATE POLICY "Operators can view referral sources"
ON referral_sources FOR SELECT
USING (
  has_role(auth.uid(), 'Operator'::app_role) 
  OR has_role(auth.uid(), 'LegalOwner'::app_role)
);

-- 7. Fix marketing_events SELECT - restrict to Operators only
DROP POLICY IF EXISTS "Authenticated users can view events" ON marketing_events;
CREATE POLICY "Operators can view marketing events"
ON marketing_events FOR SELECT
USING (
  has_role(auth.uid(), 'Operator'::app_role) 
  OR has_role(auth.uid(), 'LegalOwner'::app_role)
);

-- 8. Fix viewing_bookings SELECT - restrict to assigned broker/operators
DROP POLICY IF EXISTS "Brokers can view viewing bookings" ON viewing_bookings;
CREATE POLICY "Assigned brokers and operators can view bookings"
ON viewing_bookings FOR SELECT
USING (
  created_by = auth.uid() 
  OR has_role(auth.uid(), 'Operator'::app_role) 
  OR has_role(auth.uid(), 'LegalOwner'::app_role)
);

-- 9. Fix event_log_entries SELECT - restrict to Operators/LegalOwners
DROP POLICY IF EXISTS "Authenticated users can view event log" ON event_log_entries;
CREATE POLICY "Operators and legal owners can view audit log"
ON event_log_entries FOR SELECT
USING (
  has_role(auth.uid(), 'Operator'::app_role) 
  OR has_role(auth.uid(), 'LegalOwner'::app_role)
);

-- 10. Add index for notification queries (performance)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_id, created_at DESC) 
WHERE read_at IS NULL;