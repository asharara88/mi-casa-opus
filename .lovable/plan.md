

## Plan: Dynamic Suggestion Chips for Marketing Advisor

### Approach
Replace the static `SUGGESTIONS` array with a `useMemo` that builds suggestions from live `stats` data. The hook `useMarketingStats` needs additional fields (DARI expiring ads count, zero-lead campaigns count, paused campaigns count) to drive richer suggestions.

### Implementation Steps

**1. Extend `useMarketingStats` hook** — add 3 new computed fields:
- `expiringPermits`: count of ads where `permit_valid_until` is within 14 days (requires fetching `permit_valid_until, permit_status` in the ads query)
- `pausedCampaigns`: count of campaigns with status `'Paused'`
- `zeroLeadCampaigns`: count of active campaigns where `metrics.leads === 0`

**2. Extend `MarketingStats` type** — add `expiringPermits`, `pausedCampaigns`, `zeroLeadCampaigns` to the interface.

**3. Rewrite suggestion logic in `MarketingAdvisorChat.tsx`** — replace static `SUGGESTIONS` with a `useMemo` that conditionally builds suggestions based on thresholds:

| Condition | Suggestion |
|---|---|
| `budgetUtil > 80%` | "Review overspending campaigns" |
| `expiringPermits > 0` | "Review {N} DARI permits expiring soon" |
| `activeCampaigns === 0` | "Help me plan my first campaign" |
| `zeroLeadCampaigns > 0` | "Why are {N} campaigns generating zero leads?" |
| `upcomingEvents > 0` | "Maximize ROI for my {N} upcoming events" |
| `pausedCampaigns > 0` | "Should I reactivate {N} paused campaigns?" |
| `totalLeadsGenerated > 0` | "Analyze my lead source attribution" |
| Always (fallback pool) | "Draft ad copy for a luxury listing", "Suggest next month's strategy", "Which channels are underperforming?" |

Logic: build conditional suggestions first (max ~3), then fill remaining slots from the fallback pool up to 6 total. After first message, show only 3.

### Files Modified
- `src/types/marketing.ts` — add 3 fields to `MarketingStats`
- `src/hooks/useMarketingStats.ts` — compute new fields from existing queries (expand ads select to include `permit_valid_until, permit_status`; expand campaigns select to include `status`)
- `src/components/marketing/MarketingAdvisorChat.tsx` — replace static array with `useMemo`-driven dynamic suggestions

