

# Security Hardening Plan for Production Deployment

## Overview

This plan addresses 10 security findings identified in the pre-deployment audit. We will harden RLS policies, implement webhook authentication, and ensure proper access scoping before publishing.

---

## Security Fixes

### 1. Portal Publications RLS (HIGH Priority)

**Issue**: Current policies allow unrestricted INSERT/UPDATE/DELETE with `true` condition.

**Fix**: Restrict write operations to Operators only; allow authenticated reads.

```sql
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON portal_publications;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON portal_publications;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON portal_publications;

-- New policies: Operators can manage, all authenticated can read
CREATE POLICY "Operators can manage portal publications"
  ON portal_publications FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'Operator'))
  WITH CHECK (public.has_role(auth.uid(), 'Operator'));

CREATE POLICY "Authenticated users can view portal publications"
  ON portal_publications FOR SELECT
  TO authenticated
  USING (true);
```

---

### 2. Portal Inquiries RLS (HIGH Priority)

**Issue**: INSERT policy uses `true`, allowing potential spoofing. DELETE/UPDATE too permissive.

**Fix**: 
- INSERT restricted to service role (webhook) or Operators
- SELECT/UPDATE for assigned broker or Operator
- DELETE for Operators only

```sql
-- Drop permissive policies
DROP POLICY IF EXISTS "Allow insert for webhooks" ON portal_inquiries;
DROP POLICY IF EXISTS "Allow select for authenticated" ON portal_inquiries;
DROP POLICY IF EXISTS "Allow update for authenticated" ON portal_inquiries;

-- New scoped policies
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
```

---

### 3. Price Watches RLS (MEDIUM Priority)

**Issue**: Policies use `true` instead of scoping to user who created the watch.

**Fix**: Add `user_id` column and scope access.

```sql
-- Add user_id column
ALTER TABLE price_watches ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Update existing records to current user (migration)
UPDATE price_watches SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;

-- Make non-nullable
ALTER TABLE price_watches ALTER COLUMN user_id SET NOT NULL;

-- Drop permissive policies
DROP POLICY IF EXISTS "Allow all for authenticated" ON price_watches;

-- New user-scoped policies
CREATE POLICY "Users can manage their own price watches"
  ON price_watches FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Operators can view all price watches"
  ON price_watches FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'Operator'));
```

---

### 4. Price Alerts & Snapshots RLS (MEDIUM Priority)

**Issue**: Related tables need similar user scoping via watch ownership.

**Fix**: Scope via join to price_watches.user_id.

```sql
-- Price Alerts: scope via watch ownership
DROP POLICY IF EXISTS "Allow all for authenticated" ON price_alerts;

CREATE POLICY "Users can view their own alerts"
  ON price_alerts FOR SELECT
  TO authenticated
  USING (
    watch_id IN (SELECT id FROM price_watches WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'Operator')
  );

CREATE POLICY "System can insert alerts"
  ON price_alerts FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Edge function uses service role

-- Price Snapshots: same pattern
DROP POLICY IF EXISTS "Allow all for authenticated" ON price_snapshots;

CREATE POLICY "Users can view their own snapshots"
  ON price_snapshots FOR SELECT
  TO authenticated
  USING (
    watch_id IN (SELECT id FROM price_watches WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'Operator')
  );
```

---

### 5. Webhook Secret Validation (MEDIUM Priority)

**Issue**: `portal-lead-sync` accepts requests without authentication, enabling spoofed inquiries.

**Fix**: Validate `x-webhook-secret` header against stored secret.

```typescript
// In portal-lead-sync/index.ts
const webhookSecret = Deno.env.get("PORTAL_WEBHOOK_SECRET");
const providedSecret = req.headers.get("x-webhook-secret");

// For webhook requests (not email parsing), validate secret
if (!providedSecret || providedSecret !== webhookSecret) {
  return new Response(
    JSON.stringify({ error: "Invalid webhook secret" }),
    { status: 401, headers: corsHeaders }
  );
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/migrations/[new]_security_hardening.sql` | All RLS policy updates |
| `supabase/functions/portal-lead-sync/index.ts` | Add webhook secret validation |
| `src/hooks/usePriceAlerts.ts` | Include user_id when creating watches |
| `src/components/marketing/AddPriceWatchModal.tsx` | Pass user_id to mutation |

---

## Database Migration Summary

```sql
-- 1. Portal Publications: Operator-only writes
-- 2. Portal Inquiries: Scoped to assigned broker
-- 3. Price Watches: Add user_id, scope to owner
-- 4. Price Alerts/Snapshots: Scope via watch ownership
-- 5. Add index for performance
CREATE INDEX idx_price_watches_user_id ON price_watches(user_id);
```

---

## Secret Required

Add `PORTAL_WEBHOOK_SECRET` to Supabase secrets for webhook validation. This will be provided to portal integrations.

---

## Post-Fix Verification

After applying fixes:
1. Run security scan to confirm 0 HIGH/MEDIUM findings
2. Test portal toggle as Broker (should fail) and Operator (should succeed)
3. Test price watch creation scopes to current user
4. Test webhook endpoint rejects requests without valid secret

---

## Implementation Order

1. Create database migration with all RLS policy updates
2. Add `user_id` column to `price_watches` with backfill
3. Update `portal-lead-sync` with webhook secret validation
4. Update hooks to pass `user_id` for price watches
5. Add `PORTAL_WEBHOOK_SECRET` secret
6. Re-run security scan
7. Publish to production

