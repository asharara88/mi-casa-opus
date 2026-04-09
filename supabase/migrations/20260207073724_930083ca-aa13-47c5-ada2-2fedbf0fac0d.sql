
-- =====================================================
-- FIX: Remove conflicting overly permissive policies
-- =====================================================

-- 1. Fix token_ownership - remove the ALL policy that bypasses scoped SELECT
DROP POLICY IF EXISTS "Authenticated users can manage ownership" ON token_ownership;

-- 2. Fix price_watches - remove the "USING (true)" SELECT policy
-- Keep only user-scoped access via the ALL policy
DROP POLICY IF EXISTS "Authenticated users can view price watches" ON price_watches;

-- 3. Ensure proper SELECT exists for price_watches (user's own + operators)
DROP POLICY IF EXISTS "Users can view own price watches" ON price_watches;
CREATE POLICY "Users can view own price watches"
ON price_watches FOR SELECT
USING (user_id = auth.uid() OR has_role(auth.uid(), 'Operator'::app_role));
