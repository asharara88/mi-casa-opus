

# Developer Catalog URL Updates

## Overview

Update the Developer Catalog with the correct SAAS Properties URL and add a new Abu Dhabi off-plan aggregator site.

---

## Changes

### 1. Fix SAAS Properties URL

| Before | After |
|--------|-------|
| `https://saasproperties.com/projects/` | `https://saasproperties.com/en/properties/abu-dhabi/` |

The new URL correctly points to their Abu Dhabi properties section.

### 2. Add Abu Dhabi Off-Plan Aggregator

Add a new preset for the aggregator site that consolidates all Abu Dhabi developments:

| Developer | URL |
|-----------|-----|
| **AD Off-Plan** | `https://abudhabioffplan.ae/` |

This aggregator is useful because it consolidates multiple developers in one place, providing a single scrape source for discovering new projects across all Abu Dhabi developers.

---

## Updated Developer Presets

```typescript
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
  { name: 'SAAS', url: 'https://saasproperties.com/en/properties/abu-dhabi/' },  // UPDATED
  { name: 'AD Off-Plan', url: 'https://abudhabioffplan.ae/' },  // NEW - Aggregator
];
```

---

## File to Modify

| File | Changes |
|------|---------|
| `src/components/listings/DeveloperCatalog.tsx` | Update SAAS URL, add AD Off-Plan aggregator |

---

## Summary

- Fix SAAS Properties URL to point to Abu Dhabi properties page
- Add Abu Dhabi Off-Plan aggregator site for consolidated developer discovery
- Total presets: 11 (10 individual developers + 1 aggregator)

