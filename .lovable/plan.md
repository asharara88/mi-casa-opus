

# Off-Plan vs Secondary Market Sales/Marketing Setup

## Overview

This plan establishes a clear separation between **Off-Plan** (developer projects) and **Secondary Market** (resale/rental) sales and marketing workflows, with corrected Abu Dhabi developer URLs for the Developer Catalog.

---

## Part 1: Developer Catalog - Abu Dhabi Developer Presets

### Current Issues
- Includes Emaar (Dubai-focused developer)
- Missing key Abu Dhabi developers: Modon, Emirates Development, One Development, Ohana Development, SAAS Properties
- Some URLs may be outdated or incorrect

### Updated Developer List (Abu Dhabi Only)

| Developer | Official Projects Page URL |
|-----------|---------------------------|
| **Aldar** | `https://www.aldar.com/en/explore-aldar/businesses/development/residential` |
| **Reportage** | `https://reportageuae.com/en/projects?emirate=abu-dhabi` |
| **Bloom Holding** | `https://bloomholding.com/properties/` |
| **Q Properties** | `https://www.qproperties.ae/projects` |
| **Imkan** | `https://www.imkan.ae/projects` |
| **Modon** | `https://www.modon.ae/real-estate` |
| **Emirates Dev** | `https://www.emiratesdevelopment.ae/projects/` |
| **One Development** | `https://onedevelopment.ae/projects/` |
| **Ohana Development** | `https://ohanadevelopment.com/projects/` |
| **SAAS Properties** | `https://saasproperties.com/projects/` |

### Changes to `DeveloperCatalog.tsx`

**Remove:**
- Emaar (Dubai focus - Phase 2 expansion)

**Add:**
- Modon Properties (Hudayriyat Island, major master developer)
- Emirates Development (local Abu Dhabi developer)
- One Development (luxury boutique developer)
- Ohana Development (Jacob & Co partnership)
- SAAS Properties (One Reem Island developer)

**Update:**
- Reportage URL: Change to `reportageuae.com` with Abu Dhabi filter
- Imkan URL: Simplify to `/projects` (cleaner path)

---

## Part 2: Understanding Off-Plan vs Secondary Market

### Current Architecture (Already Implemented)

The system already has distinct pipelines defined in `src/types/pipeline.ts`:

```
Off-Plan Pipeline:
LeadQualified → EOISubmitted → EOIPaid → SPASigned → PaymentPlan → Construction → Handover → ClosedWon

Secondary Pipeline:
RequirementsCaptured → ViewingScheduled → ViewingCompleted → OfferSubmitted → OfferAccepted → MOUSigned → NOCObtained → TransferBooked → TransferComplete → ClosedWon
```

### Tool Mapping

| Tool | Market Segment | Purpose |
|------|---------------|---------|
| **Developer Catalog** | Off-Plan | Scrape developer websites for new projects |
| **Competitor Analysis** | Secondary | Analyze property portal listings (Bayut, PF, Dubizzle) |
| **Listings Section** | Both | Inventory with `listing_type`: Sale, Rent, OffPlan |

---

## Part 3: Demo Data Updates

Update `DEMO_PROJECTS` in `DeveloperCatalog.tsx` to reflect actual Abu Dhabi off-plan projects:

### Sample Projects
1. **Saadiyat Lagoons** - Aldar - Villas - Q4 2027
2. **Yas Bay Residences** - Aldar - Apartments - Q2 2026
3. **The Dunes** - Reportage - Townhouses - Ready
4. **Hudayriyat Views** - Modon - Villas - Q1 2028
5. **One Reem Island** - SAAS - Apartments - Q3 2026

---

## Implementation Summary

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/listings/DeveloperCatalog.tsx` | Update `DEVELOPER_PRESETS` array with 10 Abu Dhabi developers and correct URLs |

### Code Changes

```typescript
// BEFORE (6 presets including Dubai)
const DEVELOPER_PRESETS = [
  { name: 'Aldar', url: 'https://www.aldar.com/en/explore-aldar/businesses/development/residential' },
  { name: 'Emaar', url: 'https://www.emaar.com/en/our-communities/abu-dhabi' },  // REMOVE
  { name: 'Reportage', url: 'https://reportageproperties.com/abu-dhabi/' },
  { name: 'Bloom', url: 'https://bloomholding.com/properties/' },
  { name: 'Q Properties', url: 'https://www.qproperties.ae/projects' },
  { name: 'Imkan', url: 'https://www.imkan.ae/en/projects' },
];

// AFTER (10 Abu Dhabi developers only)
const DEVELOPER_PRESETS = [
  { name: 'Aldar', url: 'https://www.aldar.com/en/explore-aldar/businesses/development/residential' },
  { name: 'Reportage', url: 'https://reportageuae.com/en/projects?emirate=abu-dhabi' },
  { name: 'Bloom', url: 'https://bloomholding.com/properties/' },
  { name: 'Q Properties', url: 'https://www.qproperties.ae/projects' },
  { name: 'Imkan', url: 'https://www.imkan.ae/projects' },
  { name: 'Modon', url: 'https://www.modon.ae/real-estate' },
  { name: 'Emirates Dev', url: 'https://www.emiratesdevelopment.ae/projects/' },
  { name: 'One Dev', url: 'https://onedevelopment.ae/projects/' },
  { name: 'Ohana', url: 'https://ohanadevelopment.com/projects/' },
  { name: 'SAAS', url: 'https://saasproperties.com/projects/' },
];
```

### Update Section Header

```typescript
// Change the label from "UAE Developers" to "Abu Dhabi Developers"
<h3 className="text-sm font-medium mb-3">Quick Access - Abu Dhabi Developers</h3>
```

---

## Summary

This update:
1. Removes Dubai developer (Emaar) from the catalog - future Phase 2
2. Adds 4 new Abu Dhabi developers (Modon, Emirates Dev, One Dev, Ohana, SAAS)
3. Corrects URLs for better scraping accuracy
4. Maintains clear separation between Off-Plan (Developer Catalog) and Secondary Market (Competitor Analysis) tools
5. Updates the section label to accurately reflect "Abu Dhabi Developers"

The existing pipeline architecture (`OffPlan` vs `Secondary` deal states) already provides proper separation for sales tracking.

