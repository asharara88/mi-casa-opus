

# Add New Developer Presets: ONE Residence & PF Off Plan

## Overview

Add two new quick-access presets to the Off Plan Development market search tool:

1. **ONE Residence** - Direct link to a specific ONE UAE development
2. **PF Off Plan** - Property Finder off-plan listings for Abu Dhabi

---

## Changes Required

### File: `src/components/listings/DeveloperCatalog.tsx`

Update the `DEVELOPER_PRESETS` array (lines 33-45) to add two new entries:

| Preset Name | URL |
|-------------|-----|
| ONE Residence | `https://oneuae.com/development-detail?title=ONE%20Residence` |
| PF Off Plan | `https://www.propertyfinder.ae/en/search?l=6&c=1&fu=0&cs=off_plan&ob=mr` |

### Updated Array

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
  { name: 'ONE Residence', url: 'https://oneuae.com/development-detail?title=ONE%20Residence' },
  { name: 'Ohana', url: 'https://ohanadevelopment.com/projects/' },
  { name: 'SAAS', url: 'https://saasproperties.com/en/properties/abu-dhabi/' },
  { name: 'AD Off-Plan', url: 'https://abudhabioffplan.ae/' },
  { name: 'PF Off Plan', url: 'https://www.propertyfinder.ae/en/search?l=6&c=1&fu=0&cs=off_plan&ob=mr' },
];
```

---

## Summary

| Change | Description |
|--------|-------------|
| Add ONE Residence | Single development page from ONE UAE |
| Add PF Off Plan | Property Finder Abu Dhabi off-plan search results |

Both presets will appear as quick-access buttons in the Market Search tab, allowing one-click searches for these sources.

