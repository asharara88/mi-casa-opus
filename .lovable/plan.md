

# Developer Project Catalog & Listing Import from URL

## Overview

This plan implements two interconnected features that leverage the existing Firecrawl scraping integration:

1. **Developer Project Catalog** - A dedicated section to scrape developer websites (Aldar, Emaar, Reportage, etc.) and automatically import off-plan projects, floor plans, and pricing into the system
2. **Listing Import from URL** - A tool to scrape any property portal listing page and auto-fill a new listing form with extracted property details

Both features will extend the existing Firecrawl + AI analysis pattern used in Competitor Analysis.

---

## Part 1: Developer Project Catalog

### Database Changes

No new tables required - we'll use the existing `developers` and `developer_projects` tables which already have:
- Project name, location, community
- Price ranges (price_from, price_to)
- Total/available units
- Handover dates
- Brochure/floor plan URLs
- Payment plan details
- Amenities

### New Edge Function: `developer-project-scrape`

This edge function will:
1. Accept scraped content from a developer website
2. Use AI to extract structured project data
3. Return parsed projects ready for import

**AI Extraction Schema:**
```json
{
  "projects": [
    {
      "name": "Saadiyat Lagoons",
      "community": "Saadiyat Island",
      "location": "Abu Dhabi",
      "projectType": "Villa",
      "status": "Launching",
      "totalUnits": 450,
      "priceFrom": 3500000,
      "priceTo": 12000000,
      "expectedHandover": "Q4 2027",
      "commissionPercent": 5,
      "paymentPlan": "60/40",
      "amenities": ["Beach Access", "Golf Course", "Community Pool"],
      "brochureUrl": "https://...",
      "floorPlansUrl": "https://..."
    }
  ],
  "developerInfo": {
    "name": "Aldar Properties",
    "website": "https://aldar.com"
  }
}
```

### New UI Components

**1. DeveloperCatalog.tsx** (Sheet component, similar to CompetitorAnalysis)
- Developer website presets (Aldar, Emaar, Reportage, Bloom, Q Properties)
- Custom URL input field
- Scrape + Analyze button
- Results display with project cards
- "Import to Database" button for each project

**2. DeveloperProjectCard.tsx**
- Display scraped project details
- Price range, unit count, handover date
- Import checkbox for batch import
- Links to brochure/floor plans if available

**3. Integration Points:**
- Add "Developer Catalog" button to ListingsSection header
- Add sidebar entry under a new "Research" group or within Listings

### Developer Website Presets

```typescript
const DEVELOPER_PRESETS = [
  { name: 'Aldar', url: 'https://www.aldar.com/en/explore-aldar/businesses/development/residential' },
  { name: 'Emaar', url: 'https://www.emaar.com/en/our-communities/abu-dhabi' },
  { name: 'Reportage', url: 'https://reportageproperties.com/abu-dhabi/' },
  { name: 'Bloom', url: 'https://bloomholding.com/properties/' },
  { name: 'Q Properties', url: 'https://www.qproperties.ae/projects' },
  { name: 'Imkan', url: 'https://www.imkan.ae/en/projects' },
];
```

### Firecrawl API Extension

Add new method to `src/lib/api/firecrawl.ts`:

```typescript
async scrapeDeveloperProjects(
  scrapedContent: string,
  sourceUrl: string,
  developerName?: string
): Promise<FirecrawlResponse<DeveloperScrapeResult>> {
  const { data, error } = await supabase.functions.invoke('developer-project-scrape', {
    body: { content: scrapedContent, sourceUrl, developerName },
  });
  // ...
}
```

---

## Part 2: Listing Import from URL

### New Edge Function: `listing-extract`

This edge function will:
1. Accept scraped content from any property portal listing page
2. Use AI to extract a single listing's details
3. Return structured data matching the `listings` table schema

**AI Extraction Schema:**
```json
{
  "listing": {
    "title": "Stunning 3BR Apartment in Al Reem Island",
    "propertyType": "Apartment",
    "listingType": "Sale",
    "price": 2500000,
    "currency": "AED",
    "bedrooms": 3,
    "bathrooms": 3,
    "sqft": 2100,
    "community": "Al Reem Island",
    "building": "Sky Tower",
    "city": "Abu Dhabi",
    "description": "...",
    "amenities": ["Pool", "Gym", "Parking"],
    "permitNumber": "DARI-2024-12345",
    "sourceUrl": "https://bayut.com/..."
  },
  "confidence": 0.95
}
```

### New UI Components

**1. AddListingModal.tsx** (New component)
- Tab structure: "Manual Entry" | "Import from URL"
- Import tab:
  - URL input field
  - Portal preset buttons (Bayut, Property Finder, Dubizzle)
  - Scrape button
  - Form pre-filled with extracted data
  - Edit capability before saving
- Manual tab:
  - Standard form fields for property details

**2. ListingImportForm.tsx**
- Form with all listing fields
- Pre-populated from AI extraction
- Editable before submission
- Confidence indicator showing extraction quality
- Warning badges for low-confidence fields

**3. Integration:**
- Replace current "Add Listing" button with one that opens AddListingModal
- The modal allows both manual entry and URL import

### Workflow

```text
User clicks "Add Listing"
    ↓
Modal opens with two tabs
    ↓
"Import from URL" tab selected
    ↓
User pastes Bayut/PF/Dubizzle URL
    ↓
Click "Extract" → Firecrawl scrapes page
    ↓
AI extracts listing details
    ↓
Form auto-fills with extracted data
    ↓
User reviews/edits as needed
    ↓
Click "Create Listing" → Saved to database
```

### Firecrawl API Extension

Add new method to `src/lib/api/firecrawl.ts`:

```typescript
async extractListingFromUrl(
  scrapedContent: string,
  sourceUrl: string
): Promise<FirecrawlResponse<ListingExtractResult>> {
  const { data, error } = await supabase.functions.invoke('listing-extract', {
    body: { content: scrapedContent, sourceUrl },
  });
  // ...
}
```

---

## Implementation Phases

### Phase 1: Core Infrastructure
1. Create `developer-project-scrape` edge function
2. Create `listing-extract` edge function
3. Extend `src/lib/api/firecrawl.ts` with new methods
4. Add types for scraped data structures

### Phase 2: Developer Project Catalog
1. Create `DeveloperCatalog.tsx` sheet component
2. Create `DeveloperProjectCard.tsx` for displaying scraped projects
3. Add import functionality using existing `useCreateDeveloperProject` hook
4. Add button to ListingsSection header

### Phase 3: Listing Import from URL
1. Create `AddListingModal.tsx` with tabs
2. Create `ListingImportForm.tsx` with auto-fill capability
3. Wire up to existing `useCreateListing` hook
4. Replace current "Add Listing" button in ListingsSection

### Phase 4: Demo Mode Support
1. Add demo data for developer catalog
2. Add demo data for listing import
3. Skip API calls in demo mode with realistic mock responses

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/developer-project-scrape/index.ts` | AI extraction for developer projects |
| `supabase/functions/listing-extract/index.ts` | AI extraction for single listing |
| `src/components/listings/DeveloperCatalog.tsx` | Developer scraping sheet |
| `src/components/listings/DeveloperProjectCard.tsx` | Project display card |
| `src/components/listings/AddListingModal.tsx` | New listing modal with import |
| `src/components/listings/ListingImportForm.tsx` | Auto-fill form component |

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/api/firecrawl.ts` | Add `scrapeDeveloperProjects` and `extractListingFromUrl` methods |
| `src/components/listings/ListingsSection.tsx` | Add Developer Catalog button, replace Add Listing button |

---

## Technical Notes

- Both edge functions use the Lovable AI Gateway (no additional API keys needed)
- Firecrawl connector must remain connected for scraping
- Demo mode bypasses API calls with mock data
- All new components follow existing UI patterns (shadcn/ui)
- RLS policies already exist for `listings` and `developer_projects` tables

