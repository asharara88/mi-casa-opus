

## Plan: Marketing Advisor AI — "Mi Marketing" Assistant

### What It Does
A conversational AI marketing advisor embedded in the Marketing Hub that provides Abu Dhabi real estate marketing guidance. It has access to the user's actual campaign, ad, and event data to give contextual, actionable advice.

### Capabilities & Effectiveness

**High-value functions (leveraging existing data):**
- Analyze campaign ROI using live `marketing_campaigns` metrics and suggest budget reallocation
- Review ad compliance (DARI permit expiry warnings, copy review against ADREC rules)
- Suggest optimal channel mix based on `source_attribution` data
- Draft marketing copy for listings using the existing `bos-llm-marketing-copy` edge function
- Recommend event timing based on `marketing_events` history and market seasonality
- Generate campaign briefs and content calendars for Abu Dhabi market segments (Saadiyat, Yas, Reem)

**Medium-value functions (AI reasoning):**
- Competitive positioning advice based on market knowledge
- Target audience segmentation suggestions for off-plan vs secondary
- WhatsApp/SMS campaign timing recommendations
- Price alert strategy (when to notify clients based on market movement patterns)

**Limitations (honest assessment):**
- Cannot execute campaigns or publish ads — advisory only, consistent with BOS "AI Advises" philosophy
- Market data is limited to what's in the database (no live portal scraping in chat)
- Generic marketing advice may not always be Abu Dhabi-specific without strong system prompt grounding

### Technical Approach

**New edge function: `supabase/functions/bos-llm-marketing-advisor/index.ts`**
- System prompt grounding it as Abu Dhabi real estate marketing specialist
- Tool-calling to fetch live campaign/ad/event data via Supabase queries
- Uses `google/gemini-3-flash-preview` via Lovable AI gateway
- Authenticated, rate-limit aware (429/402 handling)

**New component: `src/components/marketing/MarketingAdvisorChat.tsx`**
- Streaming chat panel embedded as a new "Advisor" tab in Marketing Hub
- Shows campaign context chips (active campaigns count, budget utilization, upcoming events)
- Suggestion chips: "Analyze my campaign ROI", "Draft ad copy for my top listing", "Suggest next month's strategy"

**Modified files:**
- `src/components/marketing/MarketingSection.tsx` — add "Advisor" tab with sparkle icon
- `supabase/config.toml` — register new edge function with `verify_jwt = false`

### Implementation Steps
1. Create the `bos-llm-marketing-advisor` edge function with Abu Dhabi marketing system prompt and data-fetching tools
2. Build `MarketingAdvisorChat.tsx` with streaming chat, context display, and suggestion chips
3. Add "Advisor" tab to `MarketingSection.tsx`

