

# Mi Casa Real Estate CRM — External Database Integration

## Important Note

This project runs on **Lovable Cloud**, which provides its own backend. The Supabase client at `src/integrations/supabase/client.ts` is auto-generated and cannot be edited — it points to the Lovable Cloud project (`zwdqpssjhpvvsvvwmgqf`).

Your external Supabase project (`dhwppkevuquwtavvqaan`) has the real estate data. The solution is to create a **secondary Supabase client** specifically for your external project, and build the CRM screens using that client.

## Plan

### 1. Create external Supabase client

New file: `src/lib/external-supabase.ts`

A standalone `createClient` instance pointing to `https://dhwppkevuquwtavvqaan.supabase.co` with the provided anon key. The key is publishable (anon), so it can be stored in code.

### 2. Create data hooks for external tables

New file: `src/hooks/useMiCasaCRM.ts`

Hooks using the external client:
- `useExternalListings(type: 'rent' | 'sale')` — fetches listings filtered by `listing_type`, joins first media item (display_order=0) for thumbnail
- `useExternalListing(id)` — single listing with all media and documents
- `useUpdateListingStatus(id, status)` — update status
- `useUploadListingMedia(listingId)` — upload to `listing-media` bucket on external project, insert into `listing_media`
- `useExternalClients()` / `useExternalClient(id)` — client data with portfolio stats
- `useActivityLog()` — all entries joined with listing name
- `useCreateActivity()` — insert new activity log entry

### 3. Build CRM pages

**New file: `src/pages/CRM.tsx`**
Tab-based layout with 4 sections: Listings, Listing Detail, Client, Activity Log.

**New file: `src/components/crm/CRMListingsTab.tsx`**
- Sub-tabs: "For Rent" / "For Sale"
- Card grid showing thumbnail, name, unit, formatted price (AED X.XXM or AED XXXK/yr), location, colour-coded status badge
- Tap card → opens detail view

**New file: `src/components/crm/CRMListingDetail.tsx`**
- All listing fields displayed
- Photo/video gallery from `listing_media`
- Documents list from `listing_documents`
- Internal notes section
- Status picker dropdown to update status
- Photo upload button (uploads to external Supabase storage, inserts row)

**New file: `src/components/crm/CRMClientView.tsx`**
- Shows Makarem LLC info
- Portfolio stats: total listings, available count, total rental value, total sale value
- Notes section

**New file: `src/components/crm/CRMActivityLog.tsx`**
- Chronological list of activity_log entries with listing name
- "Add Entry" form: type selector (note/call/viewing/offer/update/document), optional listing picker, body text, save button

### 4. Add route

Add `/crm` route to `App.tsx` (protected) and a nav link in the sidebar.

### 5. Price formatting

Utility function:
- Sale: `AED 1.2M`, `AED 850K`
- Rent: `AED 120K/yr`, `AED 85K/yr`

### 6. Status badge colours

| Status | Colour |
|--------|--------|
| available | Green |
| booked | Grey |
| sold | Red |
| june2026 | Amber |
| off_market | Dark/Slate |

## Files Created/Modified

| File | Action |
|------|--------|
| `src/lib/external-supabase.ts` | New — secondary Supabase client |
| `src/hooks/useMiCasaCRM.ts` | New — all data hooks |
| `src/pages/CRM.tsx` | New — CRM page |
| `src/components/crm/CRMListingsTab.tsx` | New — listings grid |
| `src/components/crm/CRMListingDetail.tsx` | New — listing detail view |
| `src/components/crm/CRMClientView.tsx` | New — client portfolio |
| `src/components/crm/CRMActivityLog.tsx` | New — activity log |
| `src/App.tsx` | Modified — add `/crm` route |
| `src/components/layout/Sidebar.tsx` | Modified — add CRM nav link |

