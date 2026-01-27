

# Make AI Chat Data-Aware with Live BOS Context

## Problem

The AI Agent chat is saying "I don't have live access to your BOS database" when asked "how many total leads we have" - but the infrastructure for database queries already exists in the `bos-llm-ops` edge function. The issue is that the keyword triggers are too narrow and don't match common reporting questions.

## Current State

The `bos-llm-ops` function has a `fetchDatabaseContext` function that:
- Extracts CRM IDs, emails, phone numbers from user messages
- Queries by specific identifiers (PR-XXX, LD-XXX, etc.)
- Has limited keyword triggers: `pipeline`, `overview`, `summary`, `status`, `today`, `priorities`, `urgent`, `due`

What's missing:
- Questions about counts ("how many", "total", "count")
- Questions about specific entity types ("leads", "prospects", "deals", "listings")
- Aggregate reporting queries
- State/status breakdowns

## Solution

Enhance the `bos-llm-ops` edge function to:
1. Detect aggregate/count questions and fetch totals
2. Detect entity-specific questions and fetch relevant data
3. Include state breakdowns for pipeline visibility
4. Add listing counts for inventory queries

---

## Changes Required

### File 1: `supabase/functions/bos-llm-ops/index.ts`

Expand the `fetchDatabaseContext` function with new query patterns:

**Add Count/Total Detection:**
```typescript
// Detect count/aggregate questions
const wantsCount = /\b(how many|total|count|number of|all)\b/i.test(lowerIntent);
const wantsLeads = /\b(leads?)\b/i.test(lowerIntent);
const wantsProspects = /\b(prospects?|customers?)\b/i.test(lowerIntent);
const wantsDeals = /\b(deals?|transactions?)\b/i.test(lowerIntent);
const wantsListings = /\b(listings?|properties|inventory)\b/i.test(lowerIntent);
```

**Add Aggregate Queries:**
```typescript
// Leads count + breakdown
if (wantsCount && wantsLeads || lowerIntent.includes('lead')) {
  const { count } = await supabase.from('leads').select('*', { count: 'exact', head: true });
  results.totalLeads = count;
  
  // State breakdown
  const { data: leadStates } = await supabase
    .from('leads')
    .select('lead_state')
    .then(/* group by state */);
  results.leadsByState = leadStates;
}

// Prospects count + breakdown  
if (wantsCount && wantsProspects || lowerIntent.includes('prospect')) {
  const { count } = await supabase.from('prospects').select('*', { count: 'exact', head: true });
  results.totalProspects = count;
  
  // Stage breakdown
  const { data: stages } = await supabase.rpc('get_prospect_stages');
  results.prospectsByStage = stages;
}
```

**Update System Prompt** to reference data more proactively:
```
When database records include totals or counts:
- Lead with the exact number requested
- Provide breakdown by state/stage if available
- Note the data freshness (real-time from BOS)
```

### File 2: Add Database Function for Aggregates (Migration)

Create a Postgres function for efficient stage/state breakdowns:

```sql
CREATE OR REPLACE FUNCTION get_entity_counts()
RETURNS TABLE (
  entity_type text,
  total_count bigint,
  by_state jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'prospects'::text, 
    (SELECT COUNT(*) FROM prospects),
    (SELECT jsonb_object_agg(COALESCE(crm_stage, 'Unknown'), cnt) 
     FROM (SELECT crm_stage, COUNT(*) as cnt FROM prospects GROUP BY crm_stage) s);
  
  RETURN QUERY  
  SELECT 'leads'::text,
    (SELECT COUNT(*) FROM leads),
    (SELECT jsonb_object_agg(COALESCE(lead_state, 'Unknown'), cnt)
     FROM (SELECT lead_state, COUNT(*) as cnt FROM leads GROUP BY lead_state) s);
     
  -- Similar for deals, listings
END;
$$ LANGUAGE plpgsql;
```

---

## Enhanced Query Detection Matrix

| User Question Pattern | Data Fetched |
|----------------------|--------------|
| "how many leads" | Lead count + state breakdown |
| "total prospects" | Prospect count + stage breakdown |
| "pipeline overview" | All entity counts + KPIs |
| "deals this month" | Deals filtered by date + totals |
| "hot leads" | Leads filtered by qualification tier |
| "show me [Name]" | Search by name across tables |
| "[ID] status" | Lookup by CRM ID |
| "today's priorities" | Due dates filtering |
| "inventory count" | Listings count by status |

---

## Result

After these changes, asking "how many total leads we have" will return:

```
Based on your BOS data:

**Leads:** 0 total
- No leads in the system yet

**Prospects:** 13,538 total  
- These are pre-qualified contacts that can be converted to leads

Would you like me to show a breakdown by stage, or explain how to convert prospects to leads?
```

---

## Files Summary

| File | Changes |
|------|---------|
| `supabase/functions/bos-llm-ops/index.ts` | Expand keyword triggers, add aggregate queries, improve entity detection |
| New Migration | Add `get_entity_counts()` function for efficient aggregates |

---

## Additional Enhancements (Optional)

- Add date-range filtering for "this week", "this month" queries
- Include conversion rates and trends in pipeline queries
- Cache common aggregates in `pipeline_kpis` table
- Add "explain" mode for data interpretation

