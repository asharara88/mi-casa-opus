
# Edge Function Authentication Hardening Plan

## Overview

This plan addresses the security finding that while `bos-llm-ops` properly validates authentication, 14 other edge functions lack authentication entirely. This allows anyone with the function URLs to invoke them, potentially consuming API credits (ElevenLabs, Firecrawl, Twilio, SendGrid) or manipulating data.

---

## Risk Assessment

### HIGH Priority (API Credit Abuse / Data Modification)
- **twilio-messaging** - Can send SMS/WhatsApp at your expense
- **sendgrid-email** - Can send emails at your expense  
- **import-prospects-csv** - Can bulk insert data into prospects table
- **docusign-envelope** - Can create DocuSign envelopes
- **elevenlabs-tts** - Can consume ElevenLabs credits
- **elevenlabs-conversation-token** - Can obtain conversation tokens
- **elevenlabs-scribe-token** - Can obtain scribe tokens

### MEDIUM Priority (AI Credit Consumption)
- **bos-llm-router** - Uses AI credits
- **bos-llm-lead-qualify** - Uses AI credits
- **bos-llm-listing-faq** - Uses AI credits
- **bos-llm-marketing-copy** - Uses AI credits
- **bos-llm-property-match** - Uses AI credits
- **competitor-analyze** - Uses Firecrawl + AI credits
- **firecrawl-scrape** - Uses Firecrawl credits
- **blog-insights-extract** - Uses AI credits

### LOW Priority (Internal Operations)
- **evaluate-compliance** - Already partially protected
- **generate-portal-xml** - Read-only, internal use
- **price-watch-check** - Scheduled job, internal use

### EXCLUDE (Webhooks - Require External Access)
- **portal-lead-sync** - Already has webhook secret validation
- **twilio-webhook** - External webhook
- **cal-webhook** - External webhook  
- **docusign-webhook** - External webhook

---

## Authentication Pattern

We will implement the same proven pattern used in `bos-llm-ops`:

```typescript
// SECURITY: Validate authentication
const authHeader = req.headers.get('authorization');
if (!authHeader?.startsWith('Bearer ')) {
  return new Response(
    JSON.stringify({ error: 'Authentication required' }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { headers: { Authorization: authHeader } },
});

const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) {
  return new Response(
    JSON.stringify({ error: 'Invalid authentication token' }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

---

## Implementation Plan

### Phase 1: HIGH Priority Functions

| Function | Changes |
|----------|---------|
| `twilio-messaging` | Add auth validation, log `user.id` |
| `sendgrid-email` | Add auth validation, log `user.id` |
| `import-prospects-csv` | Add auth validation, inject `created_by` user ID |
| `docusign-envelope` | Add auth validation |
| `elevenlabs-tts` | Add auth validation |
| `elevenlabs-conversation-token` | Add auth validation |
| `elevenlabs-scribe-token` | Add auth validation |

### Phase 2: MEDIUM Priority Functions

| Function | Changes |
|----------|---------|
| `bos-llm-router` | Add auth validation |
| `bos-llm-lead-qualify` | Add auth validation |
| `bos-llm-listing-faq` | Add auth validation |
| `bos-llm-marketing-copy` | Add auth validation |
| `bos-llm-property-match` | Add auth validation |
| `competitor-analyze` | Add auth validation |
| `firecrawl-scrape` | Add auth validation |
| `blog-insights-extract` | Add auth validation |

### Phase 3: LOW Priority Functions

| Function | Changes |
|----------|---------|
| `evaluate-compliance` | Make auth required (not optional) |
| `generate-portal-xml` | Add auth validation |
| `price-watch-check` | Add auth validation OR restrict to cron/service role |

---

## Files to Modify

```text
supabase/functions/twilio-messaging/index.ts
supabase/functions/sendgrid-email/index.ts
supabase/functions/import-prospects-csv/index.ts
supabase/functions/docusign-envelope/index.ts
supabase/functions/elevenlabs-tts/index.ts
supabase/functions/elevenlabs-conversation-token/index.ts
supabase/functions/elevenlabs-scribe-token/index.ts
supabase/functions/bos-llm-router/index.ts
supabase/functions/bos-llm-lead-qualify/index.ts
supabase/functions/bos-llm-listing-faq/index.ts
supabase/functions/bos-llm-marketing-copy/index.ts
supabase/functions/bos-llm-property-match/index.ts
supabase/functions/competitor-analyze/index.ts
supabase/functions/firecrawl-scrape/index.ts
supabase/functions/blog-insights-extract/index.ts
supabase/functions/evaluate-compliance/index.ts
supabase/functions/generate-portal-xml/index.ts
supabase/functions/price-watch-check/index.ts
```

---

## Code Template

Each function will receive this authentication block after CORS handling:

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// After OPTIONS handling:

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

// SECURITY: Validate authentication
const authHeader = req.headers.get('authorization');
if (!authHeader?.startsWith('Bearer ')) {
  return new Response(
    JSON.stringify({ error: 'Authentication required' }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { headers: { Authorization: authHeader } },
});

const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) {
  console.error('[FUNCTION_NAME] Auth validation failed:', authError);
  return new Response(
    JSON.stringify({ error: 'Invalid authentication token' }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

console.log(`[FUNCTION_NAME] Authenticated user: ${user.id}`);
```

---

## Special Considerations

### import-prospects-csv
Will switch from service role to user-scoped client and set `created_by` on all imported prospects.

### price-watch-check  
This function is designed for scheduled execution. Two options:
1. Add auth for manual triggers, allow service role for cron
2. Keep service role but add internal secret validation

### evaluate-compliance
Currently optionally reads user ID. Will make authentication required.

---

## Post-Implementation Verification

1. Test each function call without auth header → expect 401
2. Test each function call with valid auth → expect normal operation
3. Verify frontend hooks include auth headers (they should via Supabase client)
4. Run security scan to confirm findings resolved

---

## Expected Outcome

All edge functions (except webhooks) will require a valid authenticated session before processing requests. This prevents:
- Unauthorized API credit consumption
- Data manipulation by unauthenticated actors
- Exposure of internal AI/communication capabilities
