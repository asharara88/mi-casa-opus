

# Update BOS Edge Functions to Match Natoor's Actual API

## Problem
The BOS-side `natoor-deal-sync` edge function currently calls a non-existent `bos-deal-receive` endpoint on Natoor. The Natoor project actually exposes `integration-sync` with an action-based API (`sync_lead`, `sync_deal`, `close_deal`) and `integration-webhook` for pulling vacancy/expiry data.

## Changes

### 1. Rewrite `natoor-deal-sync` edge function
Update to call Natoor's actual API: `POST ${NATOOR_SUPABASE_URL}/functions/v1/integration-sync`

- Use `action: "close_deal"` for closed lease deals (auto-provisions tenant, lease, cheques in Natoor)
- Use `action: "sync_deal"` for deal pipeline updates (non-close stages)
- Map BOS deal data to Natoor's expected payload format:
  ```json
  {
    "action": "close_deal",
    "external_id": "D-xxx",
    "tenant": { "name": "...", "email": "...", "phone": "..." },
    "lease": { "unit_id": "...", "start_date": "...", "end_date": "...", "annual_rent": 85000, "cheque_count": 4 }
  }
  ```
- Auth: `Authorization: Bearer <INTEGRATION_SECRET>` (not service role key — Natoor validates integration secret via Bearer token)

### 2. Rewrite `natoor-vacancy-receive` to pull from Natoor
Instead of waiting for Natoor to push, BOS can now **pull** vacancy and lease expiry data from Natoor's `integration-webhook` endpoint:
- `GET ${NATOOR_SUPABASE_URL}/functions/v1/integration-webhook?type=vacancies` — all vacant units
- `GET ${NATOOR_SUPABASE_URL}/functions/v1/integration-webhook?type=expiring_leases` — leases expiring within 90 days

Rename or repurpose `natoor-vacancy-receive` to a **poll-based sync** that BOS can invoke on demand (from sidebar button or scheduled). It will:
- Fetch vacancies from Natoor
- Create draft listings for any new vacancies not already imported
- Deduplicate by checking existing listings with `source: 'natoor_vacancy'`
- Notify managers of new vacancies

### 3. Add "Sync Vacancies" button in UI
Add a button near the Natoor sidebar link (or in Listings section) that triggers the vacancy pull, so managers can manually refresh vacancy data from Natoor.

### 4. Update `DealCloseConfirmation.tsx`
No structural changes needed — it already calls `natoor-deal-sync`. The edge function itself handles the API mapping.

## Files Modified
1. `supabase/functions/natoor-deal-sync/index.ts` — rewrite to use `integration-sync` API with `close_deal` action
2. `supabase/functions/natoor-vacancy-receive/index.ts` — rewrite to pull from `integration-webhook?type=vacancies`
3. Minor UI addition for vacancy sync trigger

