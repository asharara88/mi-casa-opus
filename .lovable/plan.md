

# Mi Casa BOS ↔ Natoor Rent Protect Integration

## What This Does

Connects Mi Casa BOS (brokerage/sales) with Natoor Rent Protect (property/rental management) so that:
- **BOS → Natoor**: When a lease deal closes in BOS, the property, unit, and tenant details are pushed to Natoor for ongoing rent collection and maintenance tracking.
- **Natoor → BOS**: When a unit becomes vacant in Natoor (lease terminated / notice period), a new listing or lead is automatically created in BOS for the broker team to re-market.

Both systems remain separate apps with separate backends. Integration happens via **cross-project edge functions** that call each other's APIs.

## Architecture

```text
┌─────────────────────┐          ┌──────────────────────┐
│   Mi Casa BOS       │          │  Natoor Rent Protect  │
│  (zwdqpssjhpvv...)  │          │  (rfatfvhggxxh...)   │
│                     │          │                       │
│  Deal closes ──────────────────▶ Create building/unit  │
│  (ClosedWon + Lease)│  HTTP    │ + tenant + lease      │
│                     │          │                       │
│  New listing ◀──────────────────── Vacancy signal      │
│  or lead created    │  HTTP    │ (unit status=notice   │
│                     │          │  or vacant)           │
└─────────────────────┘          └──────────────────────┘
```

## Implementation Steps

### 1. Store Natoor connection config in BOS
- Add a secret `NATOOR_SUPABASE_URL` and `NATOOR_SERVICE_ROLE_KEY` to the BOS project so edge functions can write to Natoor's database.
- Similarly, add `BOS_SUPABASE_URL` and `BOS_SERVICE_ROLE_KEY` as secrets in the Natoor project.

### 2. Edge function: `natoor-deal-sync` (in BOS)
Triggered when a deal transitions to `ClosedWon` with `deal_type = Lease`:
- Reads deal parties, listing data, and broker info from BOS.
- POSTs to Natoor's new `bos-deal-receive` edge function with building/unit/tenant payload.
- Logs the sync result in BOS `event_log`.

### 3. Edge function: `bos-deal-receive` (in Natoor)
Receives the payload from BOS and:
- Creates or updates a building record (from listing address/community).
- Creates a unit (from listing bedrooms, floor, unit number).
- Creates a tenant (from deal party buyer/tenant info).
- Creates a lease (from deal economics — rent amount, start/end dates, cheque count).

### 4. Edge function: `bos-vacancy-notify` (in Natoor)
Triggered when a unit status changes to `vacant` or `notice`:
- POSTs to BOS's new `natoor-vacancy-receive` edge function with unit/building details.

### 5. Edge function: `natoor-vacancy-receive` (in BOS)
Receives vacancy notification and:
- Creates a new listing in BOS (status: Draft) with the property details pre-filled.
- Optionally creates a lead tagged with source `Natoor_Vacancy`.
- Sends a notification to the assigned broker or manager.

### 6. UI: "Natoor Rent" link in BOS sidebar
- Add a navigation item under the Owner role that deep-links to the Natoor Rent Protect app URL.
- Show a small badge/indicator when there are recent vacancy signals from Natoor.

### 7. UI: Deal close confirmation enhancement
- When closing a lease deal, show a checkbox: "Push to Natoor Rent Protect for rental management".
- If checked, triggers the `natoor-deal-sync` edge function after the deal closes.

## Security
- Cross-project calls use service role keys transmitted via `Authorization: Bearer` headers.
- Both edge functions validate a shared `x-integration-secret` header for mutual authentication.
- All synced data is logged in the event log for audit trail.

## What Changes in BOS Codebase
1. New edge function: `supabase/functions/natoor-deal-sync/index.ts`
2. New edge function: `supabase/functions/natoor-vacancy-receive/index.ts`
3. Update `DealCloseConfirmation.tsx` — add "Push to Natoor" checkbox
4. Update `Sidebar.tsx` — add Natoor deep-link for Owner role
5. New secrets: `NATOOR_SUPABASE_URL`, `NATOOR_SERVICE_ROLE_KEY`, `INTEGRATION_SECRET`
6. Config update: `supabase/config.toml` — register new functions

## What Changes in Natoor Codebase (separate project)
1. New edge function: `bos-deal-receive`
2. New edge function: `bos-vacancy-notify`
3. New secrets: `BOS_SUPABASE_URL`, `BOS_SERVICE_ROLE_KEY`, `INTEGRATION_SECRET`

