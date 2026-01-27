

# Fix Edge Functions for Scraping Tools

## Problem Summary

The scraping edge functions have inconsistent configurations that cause failures:

| Function | Issue |
|----------|-------|
| `listing-extract` | **Wrong API URL** (`api.lovable.dev` vs `ai.gateway.lovable.dev`), unsupported `temperature` and `response_format` params |
| `competitor-analyze` | Uses `temperature: 0.3` which may fail with certain models |
| `developer-project-scrape` | Already fixed and working |

---

## Solution

Standardize all three edge functions to use:
- Correct gateway URL: `https://ai.gateway.lovable.dev/v1/chat/completions`
- No `temperature` parameter (use default)
- No `response_format` parameter (unsupported)
- Consistent JSON extraction from response content
- Import shared AI_MODELS for model selection

---

## Changes Required

### 1. Fix `listing-extract/index.ts`

| Change | Before | After |
|--------|--------|-------|
| API URL | `https://api.lovable.dev/...` | `https://ai.gateway.lovable.dev/...` |
| Model | Hardcoded `google/gemini-2.5-flash` | Use `AI_MODELS.CLASSIFICATION` |
| Temperature | `0.1` | Remove parameter |
| Response Format | `{ type: 'json_object' }` | Remove parameter |
| Parsing | Direct JSON parse | Handle markdown code blocks like competitor-analyze |

### 2. Fix `competitor-analyze/index.ts`

| Change | Before | After |
|--------|--------|-------|
| Model | Hardcoded `google/gemini-3-flash-preview` | Use `AI_MODELS.REASONING` from shared models |
| Temperature | `0.3` | Remove parameter |

---

## Updated File Structure

```text
supabase/functions/
  _shared/
    models.ts           # Already exists - shared model constants
  competitor-analyze/
    index.ts            # Update: import shared models, remove temperature
  developer-project-scrape/
    index.ts            # Already fixed - no changes needed
  listing-extract/
    index.ts            # Update: fix URL, import models, remove unsupported params
  firecrawl-scrape/
    index.ts            # No changes needed - works correctly
```

---

## Technical Details

### listing-extract Changes

```typescript
// Add import
import { AI_MODELS } from "../_shared/models.ts";

// Fix URL constant
const LOVABLE_API_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

// Update API call - remove unsupported params
body: JSON.stringify({
  model: AI_MODELS.CLASSIFICATION,  // Use shared constant
  messages: [...],
  // NO temperature
  // NO response_format
}),

// Update response parsing to handle markdown code blocks
const jsonMatch = aiContent.match(/```json\n?([\s\S]*?)\n?```/) || 
                  aiContent.match(/```\n?([\s\S]*?)\n?```/) ||
                  [null, aiContent];
const jsonStr = jsonMatch[1] || aiContent;
result = JSON.parse(jsonStr.trim());
```

### competitor-analyze Changes

```typescript
// Add import
import { AI_MODELS } from "../_shared/models.ts";

// Update model and remove temperature
body: JSON.stringify({
  model: AI_MODELS.REASONING,  // Use shared constant
  messages: [...],
  // NO temperature - remove this line
}),
```

---

## Testing

After deploying the fixes:

1. **Off Plan Development** - Scrape an Aldar project
2. **Secondary Market Listings** - Analyze a Bayut search results page
3. **Listing Import** (if used) - Extract a single property listing

All three should complete without 500 errors.

