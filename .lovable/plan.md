
# Listing Publish to Portals (PF, Bayut, Dubizzle)

## Overview

Build a listing syndication feature that enables publishing properties directly from BOS to Property Finder, Bayut, and Dubizzle using their XML feed standards. Includes portal status tracking and two-way sync for availability updates.

---

## Current State

| Feature | Status |
|---------|--------|
| Listing Import from Portal URL | ✅ Exists |
| Manual Ad Tracking (AdsManager) | ✅ Exists |
| DARI/Madhmoun Compliance Gates | ✅ Exists |
| XML Feed Generation | ❌ Missing |
| Portal API Publishing | ❌ Missing |
| Status Sync (Sold/Rented) | ❌ Missing |

---

## Solution Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                         BOS LISTINGS                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ Draft   │→ │ Active  │→ │Reserved │→ │  Sold   │            │
│  └─────────┘  └────┬────┘  └────┬────┘  └────┬────┘            │
│                    │            │            │                  │
└────────────────────┼────────────┼────────────┼──────────────────┘
                     ▼            ▼            ▼
              ┌──────────────────────────────────────┐
              │       PORTAL SYNDICATION ENGINE       │
              │  ┌────────────────────────────────┐  │
              │  │   generate-portal-xml (Edge)   │  │
              │  │   - PF XML v3 format           │  │
              │  │   - Bayut XML format           │  │
              │  │   - Dubizzle format            │  │
              │  └────────────────────────────────┘  │
              │                                      │
              │  ┌────────────────────────────────┐  │
              │  │   portal_publications (Table)  │  │
              │  │   - Tracks per-portal status   │  │
              │  │   - External ref numbers       │  │
              │  │   - Last sync timestamps       │  │
              │  └────────────────────────────────┘  │
              └──────────────────────────────────────┘
                     │            │            │
                     ▼            ▼            ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │ Property │ │  Bayut   │ │ Dubizzle │
              │  Finder  │ │          │ │          │
              └──────────┘ └──────────┘ └──────────┘
```

---

## Database Schema

### New Table: `portal_publications`

Tracks the syndication status of each listing to each portal.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| listing_id | uuid | FK to listings |
| portal | enum | PropertyFinder, Bayut, Dubizzle |
| status | enum | pending, published, paused, removed |
| external_ref | text | Portal's listing reference number |
| published_at | timestamp | When first published |
| last_synced_at | timestamp | Last XML update sent |
| portal_url | text | Live URL on portal |
| error_message | text | Last error if any |

### New Enum: `portal_name`
```sql
CREATE TYPE portal_name AS ENUM ('PropertyFinder', 'Bayut', 'Dubizzle');
```

### New Enum: `portal_status`
```sql
CREATE TYPE portal_status AS ENUM ('pending', 'published', 'paused', 'removed', 'error');
```

---

## Components

### 1. Portal Publishing Panel (UI)

**File**: `src/components/listings/PortalPublishingPanel.tsx`

A panel added to the ListingDetailModal showing:
- Toggle switches for each portal (PF, Bayut, Dubizzle)
- Status indicators (✅ Published, ⏳ Pending, ⚠️ Error)
- Last sync timestamp
- Direct link to live portal listing
- "Sync Now" button to push updates

```text
┌─────────────────────────────────────────────────────────┐
│ 📤 Portal Syndication                                   │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Property Finder     ✅ Published                    │ │
│ │ ┌─────┐  Last sync: 2h ago  [View] [Sync Now]      │ │
│ │ │ ON  │  Ref: PF-AUH-28391                         │ │
│ │ └─────┘                                            │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Bayut               ⏳ Pending                      │ │
│ │ ┌─────┐  Awaiting approval                         │ │
│ │ │ ON  │                                            │ │
│ │ └─────┘                                            │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Dubizzle            ○ Not Published                │ │
│ │ ┌─────┐  Toggle to enable                          │ │
│ │ │ OFF │                                            │ │
│ │ └─────┘                                            │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ⓘ Compliance: DARI permit verified ✓                   │
│                                                         │
│ [Sync All Portals]                                      │
└─────────────────────────────────────────────────────────┘
```

### 2. Portal XML Generator (Edge Function)

**File**: `supabase/functions/generate-portal-xml/index.ts`

Generates compliant XML feeds for each portal:

- **Property Finder XML v3**: Full schema with images, agent info, features
- **Bayut XML**: Similar structure with platform-specific fields
- **Dubizzle XML**: Simpler format

The function:
1. Queries listings with active portal publications
2. Joins brokerage/broker license data for compliance
3. Generates XML per portal specification
4. Returns XML feed URL for portal configuration

### 3. Portal Status Sync (Edge Function)

**File**: `supabase/functions/portal-status-sync/index.ts`

Handles status synchronization:
- When listing status changes to Sold/Rented → marks portal listings for removal
- Receives webhook callbacks from portals (if supported)
- Updates `portal_publications.status` accordingly

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/listings/PortalPublishingPanel.tsx` | UI for portal toggle/status |
| `src/hooks/usePortalPublications.ts` | CRUD hooks for portal_publications |
| `supabase/functions/generate-portal-xml/index.ts` | XML feed generator |
| `supabase/functions/portal-status-sync/index.ts` | Status sync handler |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/listings/ListingDetailModal.tsx` | Add "Portals" tab with PortalPublishingPanel |
| `supabase/config.toml` | Register new edge functions |

## Database Migration

1. Create `portal_name` enum
2. Create `portal_status` enum  
3. Create `portal_publications` table with RLS
4. Add trigger to auto-sync status when listing status changes

---

## Portal Feed Specifications

### Property Finder XML v3 (Sample Structure)

```xml
<properties>
  <property>
    <reference_number>LST-123456</reference_number>
    <offering_type>sale</offering_type>
    <property_type>AP</property_type>
    <price>2500000</price>
    <city>Abu Dhabi</city>
    <community>Al Reem Island</community>
    <sub_community>Sky Tower</sub_community>
    <bedroom>3</bedroom>
    <bathroom>3</bathroom>
    <size unit="sqft">2100</size>
    <title_en>Stunning 3BR with Sea View</title_en>
    <description_en>...</description_en>
    <permit_number>DARI-2024-78901</permit_number>
    <agent>
      <name>John Smith</name>
      <license_no>BRN-12345</license_no>
      <phone>+971501234567</phone>
    </agent>
    <images>
      <image>https://storage.../image1.jpg</image>
    </images>
  </property>
</properties>
```

---

## Compliance Integration

Before publishing to any portal, the system validates:

1. **Listing Status** = Active (not Draft/Sold)
2. **Madhmoun Status** = VERIFIED
3. **DARI Permit** = Valid and not expired
4. **Broker License** = Active

If any gate fails, the portal toggle is disabled with an explanation.

---

## Implementation Phases

### Phase 1: Database & UI Foundation
- Create migration for `portal_publications` table
- Build `PortalPublishingPanel` component
- Add "Portals" tab to ListingDetailModal
- Create `usePortalPublications` hook

### Phase 2: XML Feed Generation
- Build `generate-portal-xml` edge function
- Support Property Finder XML v3 format
- Add Bayut and Dubizzle formats
- Generate feed URLs

### Phase 3: Status Sync
- Build `portal-status-sync` edge function
- Auto-remove from portals when listing goes Sold/Rented
- Handle portal webhook callbacks (future)

---

## Future Enhancements

- **Portal Analytics Pull**: Fetch impressions/clicks from portal APIs
- **Photo Sync**: Auto-upload images to portal CDNs
- **Listing Boost**: Integrate with portal premium placement APIs
- **Multi-language**: Generate Arabic descriptions for portals
