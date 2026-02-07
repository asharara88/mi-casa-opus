
-- =====================================================
-- FINAL FIX: Remove overly permissive duplicate policies
-- =====================================================

-- 1. Fix portal_inquiries - remove the "USING (true)" SELECT policy
-- Keep only the scoped "Brokers can view linked inquiries" policy
DROP POLICY IF EXISTS "Authenticated users can view portal inquiries" ON portal_inquiries;

-- 2. Fix referral_sources - remove the policy that includes Brokers
-- Keep only the Operators/LegalOwners SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view referral sources" ON referral_sources;
