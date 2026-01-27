

# Add PF New Projects Preset + Market Insights Blog Scraper

## Overview

This plan covers two enhancements:
1. **Add Property Finder New Projects preset** to the Developer Catalog quick-access buttons
2. **Create a Market Insights feature** that scrapes real estate blogs (starting with OIA Properties) to extract market trends, investment insights, and industry news

---

## Part 1: Add PF New Projects Preset

### File: `src/components/listings/DeveloperCatalog.tsx`

Add the new Property Finder New Projects URL to the presets array:

```typescript
const DEVELOPER_PRESETS = [
  // ... existing presets
  { name: 'PF New Projects', url: 'https://www.propertyfinder.ae/en/new-projects' },
];
```

---

## Part 2: Market Insights Blog Scraper

### Architecture

Create a new insights scraping feature following the same pattern as Developer Catalog and Competitor Analysis:

```text
+-----------------+     +-------------------+     +-------------------+
|  Firecrawl      | --> | blog-insights     | --> | InsightsPanel     |
|  (markdown)     |     | Edge Function     |     | Component         |
+-----------------+     +-------------------+     +-------------------+
```

### Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/blog-insights-extract/index.ts` | AI extraction of blog articles |
| `src/components/listings/MarketBlogInsights.tsx` | Sheet component for blog insights |
| `src/components/listings/BlogArticleCard.tsx` | Individual article card |

### Files to Modify

| File | Changes |
|------|---------|
| `src/lib/api/firecrawl.ts` | Add types and API method for blog insights |
| `src/components/listings/ListingsSection.tsx` | Add button to open insights panel |

---

## Detailed Changes

### 1. Update Firecrawl API Types (`src/lib/api/firecrawl.ts`)

Add new types for blog insight extraction:

```typescript
// Blog/Insights Types
export type ScrapedArticle = {
  title: string;
  summary: string;
  category: 'Market Trend' | 'Investment' | 'Development' | 'Regulatory' | 'Community' | 'General';
  keyInsights: string[];
  relevantCommunities: string[];
  sentiment: 'bullish' | 'bearish' | 'neutral';
  publishDate: string | null;
  author: string | null;
  imageUrl: string | null;
  sourceUrl: string | null;
};

export type BlogInsightsResult = {
  articles: ScrapedArticle[];
  marketSummary: string;
  topTrends: string[];
  sourceName: string;
  scrapedAt: string;
  sourceUrl: string;
};

// Add API method
async scrapeBlogInsights(
  scrapedContent: string,
  sourceUrl: string,
  sourceName?: string,
  imageLinks?: string[]
): Promise<FirecrawlResponse<BlogInsightsResult>>
```

### 2. Create Edge Function (`supabase/functions/blog-insights-extract/index.ts`)

The edge function will:
- Accept scraped markdown content from blog pages
- Use AI to extract structured article data
- Categorize articles by topic (Market Trend, Investment, Development, etc.)
- Extract key insights and sentiment analysis
- Match hero images from provided links

Schema for AI extraction:

```typescript
{
  articles: [{
    title: string,
    summary: string,
    category: 'Market Trend' | 'Investment' | 'Development' | 'Regulatory' | 'Community' | 'General',
    keyInsights: string[],
    relevantCommunities: string[],
    sentiment: 'bullish' | 'bearish' | 'neutral',
    publishDate: string | null,
    author: string | null,
    imageUrl: string | null
  }],
  marketSummary: string,
  topTrends: string[]
}
```

### 3. Create Blog Insights Component (`src/components/listings/MarketBlogInsights.tsx`)

A Sheet component similar to Developer Catalog with:
- **Preset buttons** for blog sources:
  - OIA Properties: `https://www.oiaproperties.com/en/blogs`
  - Additional sources can be added later
- **Custom URL input** for other blog sources
- **Results tab** showing:
  - Market summary card
  - Top trends list
  - Grid of article cards with insights

### 4. Create Article Card Component (`src/components/listings/BlogArticleCard.tsx`)

Display individual articles with:
- Hero image (with fallback to Newspaper icon)
- Title and summary
- Category badge with color coding
- Key insights as bullet points
- Relevant communities mentioned
- Sentiment indicator (bullish/bearish/neutral)
- Publish date and source link

### 5. Update Listings Section (`src/components/listings/ListingsSection.tsx`)

Add a new button in the header actions:

```typescript
<Button 
  variant="outline" 
  onClick={() => setMarketInsightsOpen(true)}
  className="hidden sm:flex"
>
  <Newspaper className="h-4 w-4 mr-2" />
  Market Insights
</Button>
```

---

## UI Design

### Insights Panel Layout

```text
+------------------------------------------+
|  📰 Market Insights                       |
+------------------------------------------+
|  [Insights Search]  [Results (5)]        |
+------------------------------------------+
|  Quick Access - Real Estate Blogs         |
|  [OIA Blog] [Custom URL Input] [Search]  |
+------------------------------------------+
|                                          |
|  ┌─────────────────────────────────────┐ |
|  │ 📊 Market Summary                    │ |
|  │ Overall sentiment: Bullish           │ |
|  │ "Abu Dhabi property market shows..." │ |
|  └─────────────────────────────────────┘ |
|                                          |
|  Top Trends                              |
|  • Off-plan demand increasing 15%       |
|  • Saadiyat Island premium growing      |
|  • Rental yields stable at 6.5%         |
|                                          |
|  Articles Found                          |
|  ┌─────────┐ ┌─────────┐                |
|  │ [Image] │ │ [Image] │                |
|  │ Title   │ │ Title   │                |
|  │ Summary │ │ Summary │                |
|  │ [Tags]  │ │ [Tags]  │                |
|  └─────────┘ └─────────┘                |
+------------------------------------------+
```

### Category Color Coding

| Category | Color |
|----------|-------|
| Market Trend | Blue |
| Investment | Emerald |
| Development | Amber |
| Regulatory | Purple |
| Community | Cyan |
| General | Gray |

### Sentiment Indicators

| Sentiment | Icon | Color |
|-----------|------|-------|
| Bullish | TrendingUp | Emerald |
| Bearish | TrendingDown | Red |
| Neutral | Minus | Gray |

---

## Blog Source Presets

Initial preset sources:

```typescript
const BLOG_PRESETS = [
  { name: 'OIA Blog', url: 'https://www.oiaproperties.com/en/blogs' },
  // Future additions:
  // { name: 'Bayut Guides', url: 'https://www.bayut.com/blog/' },
  // { name: 'PF Trends', url: 'https://www.propertyfinder.ae/blog/' },
];
```

---

## Technical Implementation

### Scraping Flow

1. User clicks preset or enters custom URL
2. Frontend calls `firecrawlApi.scrape(url, { formats: ['markdown', 'links'] })`
3. Scraped content passed to `firecrawlApi.scrapeBlogInsights(content, url, sourceName, links)`
4. Edge function uses AI to extract structured article data
5. Results displayed in UI with market summary and article cards

### Edge Function AI Prompt Strategy

The prompt will instruct the AI to:
- Extract individual blog articles/posts from the content
- Summarize each article in 2-3 sentences
- Categorize by topic relevance to real estate
- Identify key insights actionable for agents/investors
- Determine sentiment (bullish/bearish/neutral on market)
- Match article images from provided links

---

## Files Summary

### Create (4 files)
- `supabase/functions/blog-insights-extract/index.ts` - AI extraction logic
- `src/components/listings/MarketBlogInsights.tsx` - Main sheet component
- `src/components/listings/BlogArticleCard.tsx` - Article display card

### Modify (3 files)
- `src/components/listings/DeveloperCatalog.tsx` - Add PF New Projects preset
- `src/lib/api/firecrawl.ts` - Add types and API method
- `src/components/listings/ListingsSection.tsx` - Add insights button

---

## Summary

| Feature | Description |
|---------|-------------|
| PF New Projects | Quick-access preset for Property Finder new developments page |
| Market Insights | New scraping tool for extracting insights from real estate blogs, with AI-powered categorization, sentiment analysis, and trend identification |

This creates a third market research tool alongside Off-Plan Development and Secondary Market Listings, providing agents with comprehensive market intelligence from developer sites, listing portals, and industry blogs.

