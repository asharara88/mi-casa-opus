-- Security Hardening Migration v2
-- Addresses HIGH and MEDIUM priority RLS vulnerabilities

-- ============================================
-- 1. Portal Publications: Clean slate + Operator-only writes
-- ============================================
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON portal_publications;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON portal_publications;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON portal_publications;
DROP POLICY IF EXISTS "Allow select for authenticated users" ON portal_publications;
DROP POLICY IF EXISTS "Authenticated users can view portal publications" ON portal_publications;
DROP POLICY IF EXISTS "Operators can manage portal publications" ON portal_publications;

CREATE POLICY "Operators can manage portal publications"
  ON portal_publications FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'Operator'))
  WITH CHECK (public.has_role(auth.uid(), 'Operator'));

CREATE POLICY "Authenticated users can view portal publications"
  ON portal_publications FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- 2. Portal Inquiries: Scoped access
-- ============================================
DROP POLICY IF EXISTS "Allow insert for webhooks" ON portal_inquiries;
DROP POLICY IF EXISTS "Allow select for authenticated" ON portal_inquiries;
DROP POLICY IF EXISTS "Allow update for authenticated" ON portal_inquiries;
DROP POLICY IF EXISTS "Allow delete for authenticated" ON portal_inquiries;
DROP POLICY IF EXISTS "Operators can manage all inquiries" ON portal_inquiries;
DROP POLICY IF EXISTS "Brokers can view linked inquiries" ON portal_inquiries;

CREATE POLICY "Operators can manage all inquiries"
  ON portal_inquiries FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'Operator'))
  WITH CHECK (public.has_role(auth.uid(), 'Operator'));

CREATE POLICY "Brokers can view linked inquiries"
  ON portal_inquiries FOR SELECT
  TO authenticated
  USING (
    lead_id IN (
      SELECT id FROM leads WHERE assigned_broker_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'Operator')
  );

-- ============================================
-- 3. Price Watches: Add user_id, scope to owner
-- ============================================
ALTER TABLE price_watches ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Backfill existing records with first user (if any exist)
UPDATE price_watches 
SET user_id = (SELECT id FROM auth.users LIMIT 1) 
WHERE user_id IS NULL;

-- Make non-nullable after backfill (handle case where no data exists)
DO $$
BEGIN
  -- Only set NOT NULL if column exists and we can safely do so
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'price_watches' 
    AND column_name = 'user_id'
  ) THEN
    -- Check if there are any NULL values (shouldn't be after update, but safety check)
    IF NOT EXISTS (SELECT 1 FROM price_watches WHERE user_id IS NULL) OR 
       NOT EXISTS (SELECT 1 FROM price_watches) THEN
      ALTER TABLE price_watches ALTER COLUMN user_id SET NOT NULL;
    END IF;
  END IF;
END $$;

-- Drop permissive policies
DROP POLICY IF EXISTS "Allow all for authenticated" ON price_watches;
DROP POLICY IF EXISTS "Allow select for authenticated" ON price_watches;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON price_watches;
DROP POLICY IF EXISTS "Allow update for authenticated" ON price_watches;
DROP POLICY IF EXISTS "Allow delete for authenticated" ON price_watches;
DROP POLICY IF EXISTS "Users can manage their own price watches" ON price_watches;
DROP POLICY IF EXISTS "Operators can view all price watches" ON price_watches;

CREATE POLICY "Users can manage their own price watches"
  ON price_watches FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Operators can view all price watches"
  ON price_watches FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'Operator'));

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_price_watches_user_id ON price_watches(user_id);

-- ============================================
-- 4. Price Alerts: Scope via watch ownership
-- ============================================
DROP POLICY IF EXISTS "Allow all for authenticated" ON price_alerts;
DROP POLICY IF EXISTS "Allow select for authenticated" ON price_alerts;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON price_alerts;
DROP POLICY IF EXISTS "Allow update for authenticated" ON price_alerts;
DROP POLICY IF EXISTS "Users can view their own alerts" ON price_alerts;
DROP POLICY IF EXISTS "Users can update their own alerts" ON price_alerts;
DROP POLICY IF EXISTS "Service can insert alerts" ON price_alerts;

CREATE POLICY "Users can view their own alerts"
  ON price_alerts FOR SELECT
  TO authenticated
  USING (
    watch_id IN (SELECT id FROM price_watches WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'Operator')
  );

CREATE POLICY "Users can update their own alerts"
  ON price_alerts FOR UPDATE
  TO authenticated
  USING (
    watch_id IN (SELECT id FROM price_watches WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'Operator')
  );

-- Service role inserts alerts via edge function
CREATE POLICY "Service can insert alerts"
  ON price_alerts FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ============================================
-- 5. Price Snapshots: Scope via watch ownership
-- ============================================
DROP POLICY IF EXISTS "Allow all for authenticated" ON price_snapshots;
DROP POLICY IF EXISTS "Allow select for authenticated" ON price_snapshots;
DROP POLICY IF EXISTS "Users can view their own snapshots" ON price_snapshots;
DROP POLICY IF EXISTS "Service can insert snapshots" ON price_snapshots;

CREATE POLICY "Users can view their own snapshots"
  ON price_snapshots FOR SELECT
  TO authenticated
  USING (
    watch_id IN (SELECT id FROM price_watches WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'Operator')
  );

-- Service role inserts snapshots via edge function
CREATE POLICY "Service can insert snapshots"
  ON price_snapshots FOR INSERT
  TO service_role
  WITH CHECK (true);