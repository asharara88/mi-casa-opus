
# Update Market Research Portal Presets

## Overview

Update the Competitor Analysis tool with the correct Property Finder URLs for Abu Dhabi market research, covering both buy/sell and rental listings.

---

## Updated URLs (User Confirmed)

| Portal | Type | URL |
|--------|------|-----|
| Property Finder | Sale | `https://www.propertyfinder.ae/en/search?c=1&fu=0&ob=nd&tt[]=70030076155545783,24.459227,54.381018,driving,15,1#` |
| Property Finder | Rent | `https://www.propertyfinder.ae/en/search?c=2&fu=0&rp=y&ob=nd&tt[]=70030076155545783,24.459227,54.381018,driving,45,1` |
| Bayut | Sale | `https://www.bayut.com/for-sale/property/abu-dhabi/` |
| Bayut | Rent | `https://www.bayut.com/to-rent/property/abu-dhabi/` |
| Dubizzle | Sale | `https://www.dubizzle.com/en/abudhabi/properties/properties-for-sale/` |
| Dubizzle | Rent | `https://www.dubizzle.com/en/abudhabi/properties/properties-for-rent/` |

---

## Implementation

### File: `src/components/listings/CompetitorAnalysis.tsx`

**Update lines 119-123** - Replace `PORTAL_PRESETS` array:

```typescript
const PORTAL_PRESETS = [
  // Property Finder - Abu Dhabi
  { name: 'PF Sale', url: 'https://www.propertyfinder.ae/en/search?c=1&fu=0&ob=nd&tt[]=70030076155545783,24.459227,54.381018,driving,15,1#' },
  { name: 'PF Rent', url: 'https://www.propertyfinder.ae/en/search?c=2&fu=0&rp=y&ob=nd&tt[]=70030076155545783,24.459227,54.381018,driving,45,1' },
  // Bayut - Abu Dhabi
  { name: 'Bayut Sale', url: 'https://www.bayut.com/for-sale/property/abu-dhabi/' },
  { name: 'Bayut Rent', url: 'https://www.bayut.com/to-rent/property/abu-dhabi/' },
  // Dubizzle - Abu Dhabi
  { name: 'Dubizzle Sale', url: 'https://www.dubizzle.com/en/abudhabi/properties/properties-for-sale/' },
  { name: 'Dubizzle Rent', url: 'https://www.dubizzle.com/en/abudhabi/properties/properties-for-rent/' },
];
```

---

## Result

The Competitor Analysis tool will display 6 quick-access buttons:
- **PF Sale** / **PF Rent** - Property Finder Abu Dhabi listings
- **Bayut Sale** / **Bayut Rent** - Bayut Abu Dhabi listings  
- **Dubizzle Sale** / **Dubizzle Rent** - Dubizzle Abu Dhabi listings

All URLs are geo-targeted to the Abu Dhabi market for accurate competitive analysis.
