
# Competitor Analysis Tool for MiCasa BOS

## Overview
Build an AI-powered competitor analysis tool that uses Firecrawl to scrape listings from property portals and Lovable AI to summarize and compare them against your inventory. This feature will be integrated into the Listings page.

## What This Tool Will Do
- Scrape competitor listings from major UAE property portals (Bayut, Property Finder, Dubizzle)
- Extract key listing data (price, specs, location, features)
- Use AI to summarize trends and generate actionable insights
- Compare competitor pricing against your listings
- Identify market gaps and opportunities

## Architecture

```text
+-------------------+     +----------------------+     +-------------------+
|   ListingsSection |---->| CompetitorAnalysis   |---->| firecrawl-scrape  |
|   (Add new tab)   |     | Modal/Panel          |     | Edge Function     |
+-------------------+     +----------------------+     +-------------------+
                                    |                          |
                                    v                          v
                          +----------------------+     +-------------------+
                          | competitor-analyze   |<----| Firecrawl API     |
                          | Edge Function        |     | (FIRECRAWL_API_KEY)
                          +----------------------+     +-------------------+
                                    |
                                    v
                          +-------------------+
                          | Lovable AI Gateway|
                          | (Summarization)   |
                          +-------------------+
```

## Implementation Steps

### 1. Create Firecrawl API Wrapper
**File:** `src/lib/api/firecrawl.ts`

A reusable API client for calling Firecrawl through edge functions:
- `scrape(url)` - Scrape a single URL
- `search(query)` - Search and optionally scrape results
- Error handling and response typing

### 2. Create Edge Function for Scraping
**File:** `supabase/functions/firecrawl-scrape/index.ts`

Edge function that:
- Receives URL from frontend
- Calls Firecrawl API with `FIRECRAWL_API_KEY`
- Returns scraped content (markdown + metadata)
- Handles errors gracefully

### 3. Create Edge Function for Analysis
**File:** `supabase/functions/competitor-analyze/index.ts`

Edge function that:
- Receives scraped listing data
- Uses Lovable AI Gateway (google/gemini-3-flash-preview) to analyze
- Extracts structured data: price, beds, baths, sqft, location
- Generates market insights and comparison summary
- Returns structured JSON response

### 4. Create Competitor Analysis Component
**File:** `src/components/listings/CompetitorAnalysis.tsx`

UI component featuring:
- Input field for competitor portal URL
- Pre-configured buttons for major portals (Bayut, Property Finder, Dubizzle)
- Loading state with progress indication
- Results display with:
  - Scraped listing cards
  - Price comparison chart
  - AI-generated market insights
  - Recommendations for pricing adjustments

### 5. Integrate into Listings Section
**File:** `src/components/listings/ListingsSection.tsx`

Add new elements:
- "Competitor Analysis" button in the header
- Modal or sheet to open the analysis tool
- Badge showing last analysis date

## UI Design

### Competitor Analysis Panel
```text
+--------------------------------------------------+
| Competitor Analysis                    [X Close] |
+--------------------------------------------------+
| Analyze listings from competitor portals         |
|                                                  |
| [Bayut] [Property Finder] [Dubizzle] [Custom URL]|
|                                                  |
| URL: [________________________________] [Scrape] |
|                                                  |
| Filter by: [Community ▼] [Property Type ▼]       |
+--------------------------------------------------+
| Results (12 listings found)                      |
+--------------------------------------------------+
| +----------------+ +----------------+            |
| | 3 BR Apartment | | 4 BR Villa     |            |
| | Al Reem Island | | Yas Island     |            |
| | AED 2.1M       | | AED 4.5M       |            |
| | 1,850 sqft     | | 3,200 sqft     |            |
| +----------------+ +----------------+            |
|                                                  |
| AI Insights:                                     |
| - Average price in Al Reem Island: AED 2.3M     |
| - Your listings are 8% below market average     |
| - High demand for 3BR apartments (low supply)   |
| - Recommend: Increase LST-2024-001 by 5-8%      |
+--------------------------------------------------+
```

## Technical Details

### Firecrawl Edge Function
```typescript
// supabase/functions/firecrawl-scrape/index.ts
// Uses FIRECRAWL_API_KEY from environment
// Extracts markdown content for AI processing
// Returns structured listing data
```

### AI Analysis Prompt Strategy
The AI will receive scraped markdown and extract:
1. Structured listing data (price, specs, location)
2. Market trend analysis
3. Competitive positioning insights
4. Actionable recommendations

### Error Handling
- Invalid URLs: Show user-friendly message
- Rate limits: Implement retry with backoff
- Parsing failures: Graceful degradation with partial data
- API errors: Clear error states with retry options

## Demo Mode Support
For demo mode, the tool will:
- Display pre-populated competitor data
- Show simulated AI insights
- Allow users to explore the UI without API calls

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/api/firecrawl.ts` | Create | Firecrawl API wrapper |
| `supabase/functions/firecrawl-scrape/index.ts` | Create | Scraping edge function |
| `supabase/functions/competitor-analyze/index.ts` | Create | AI analysis edge function |
| `src/components/listings/CompetitorAnalysis.tsx` | Create | Main analysis UI |
| `src/components/listings/CompetitorListingCard.tsx` | Create | Competitor listing display |
| `src/components/listings/MarketInsightsPanel.tsx` | Create | AI insights display |
| `src/components/listings/ListingsSection.tsx` | Modify | Add analysis button/modal |
| `supabase/config.toml` | Modify | Add new function configs |
| `src/data/demoData.ts` | Modify | Add demo competitor data |

## Security Considerations
- Firecrawl API key stored securely in Supabase secrets
- Edge functions handle all external API calls
- No sensitive data exposed to frontend
- Rate limiting to prevent abuse
