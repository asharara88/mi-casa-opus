

## Plan: Listing Pipeline Tab (Leads, Viewings, Sales Status)

### What We're Building
A new **"Pipeline"** tab in the `ListingDetailModal` that shows all activity tied to each listing: linked leads (via deals), viewings, and deal/sales status -- for both Sale and Lease listings.

### Technical Approach

**Data Sources (all already exist in the database):**
- `deals` table -- has `listing_id` FK to listings; contains `deal_state`, `deal_type`, `side`
- `deals.linked_lead_id` -- FK to `leads` table; gives us the lead info per deal
- `viewing_bookings` table -- has `listing_id` FK; gives scheduled/completed viewings
- `portal_inquiries` table -- has `listing_id` FK; gives portal lead inquiries

**Files to modify:**

1. **`src/components/listings/ListingDetailModal.tsx`**
   - Add a 6th tab "Pipeline" (with `Users` icon) to the TabsList
   - Import and render a new `ListingPipelineTab` component
   - Change grid-cols-5 to grid-cols-6

2. **`src/components/listings/ListingPipelineTab.tsx`** (NEW)
   - Accepts `listingId: string` prop
   - Queries:
     - `deals` where `listing_id = listingId`, joined with `leads` via `linked_lead_id`
     - `viewing_bookings` where `listing_id = listingId`
     - `portal_inquiries` where `listing_id = listingId`
   - Renders 3 sections:
     - **Leads** -- cards showing contact name, source, state, score from linked leads + portal inquiries
     - **Viewings** -- list with date, status badge, agent, notes
     - **Sales/Lease Status** -- deal cards with state badge, type (Sale/Rent), parties, agreed price, timeline

### No Database Changes Required
All foreign keys and indexes already exist.

