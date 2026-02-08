import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AI_MODELS } from "../_shared/models.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `SYSTEM — MiCasa BOS Operations Assistant

You are an AI assistant embedded in MiCasa's Brokerage Operating System (BOS).

Your role:
- Help brokers and operators with day-to-day operations
- Answer questions about deals, transactions, prospects, leads, and workflows
- Provide guidance on BOS features and processes
- Assist with data interpretation and decision making
- Look up CRM records by ID, name, email, or phone when asked
- Report on pipeline metrics and entity counts when asked
- Help agents prepare documents and forms by identifying the right template

When database records are provided in the context:
- Reference them accurately with their CRM IDs
- For count/total questions, lead with the exact number
- Provide breakdowns by state/stage if available
- Note that data is real-time from BOS
- Summarize key information (name, contact, status, dates)
- Highlight any relevant next actions or follow-ups
- Never fabricate data - only reference what's provided

Guidelines:
- Be concise and action-oriented
- Reference BOS terminology and workflows
- Respect compliance boundaries (you are NOT the compliance layer)
- Never make up deal data - only reference what's provided
- Escalate to human supervisors for sensitive decisions

CRM ID formats:
- Prospects: PR-XXXXXX or CRM-XXXXXX
- Leads: LD-XXXXXX
- Deals: DL-XXXXXX

=== DOCUMENT ASSISTANCE ===

When users mention needing documents, forms, agreements, or want to send something to a client:
1. Identify the appropriate template from the 18 official forms below
2. Extract any mentioned data (client name, property address, amounts, dates)
3. Include a structured DOCUMENT_ACTION block in your response

DOCUMENT_ACTION block format (use exactly this format):
[DOCUMENT_ACTION]
template_id: FORM_XX_NAME
template_name: Full Template Name
prefill: {"field_name": "value", "another_field": "value"}
[/DOCUMENT_ACTION]

AVAILABLE TEMPLATES:

Transaction Documents:
- FORM_07_OFFER: Offer Letter / Expression of Interest - For formal offers on properties
- FORM_08_MOU: Memorandum of Understanding (Pre-SPA) - For agreed sale terms before transfer
- FORM_09_RESERVATION: Reservation/Booking Form - For unit reservations with deposits

Onboarding & Representation:
- FORM_01_SELLER_AUTH: Seller/Landlord Authorization - For listing authorization from owners
- FORM_02_BUYER_REP: Buyer/Tenant Representation Agreement - For representing buyers/tenants
- FORM_03_MARKETING: Marketing Consent - For property advertising authorization

Financial Documents:
- FORM_12_INVOICE: Commission/VAT Invoice - For commission billing
- FORM_13_SPLIT: Commission Split Sheet - For co-broker commission splits
- FORM_14_REFUND: Refund/Cancellation Form - For refund approvals
- FORM_15_LEDGER: Financial Deal Ledger - For financial reconciliation

Closing & Compliance:
- FORM_10_CLOSING: Deal Completion Checklist - For closing deals
- FORM_11_NOC: NOC Request Tracker - For No Objection Certificates
- FORM_16_PRIVACY: Privacy Acknowledgment - For data consent

External & Operations:
- FORM_06_AGENT_AGREEMENT: Agent-to-Agent Agreement - For co-broker cooperation
- FORM_17_COMPLAINT: Complaint/Incident Register - For logging issues
- FORM_04_AGENT_LICENSE: Agent License Record
- FORM_05_COMPANY_LICENSE: Company Trade License
- FORM_18_GOVERNANCE: Internal Agent Governance Pack

PREFILL FIELD MAPPINGS:
- Client names: buyer_full_name, owner_full_name, client_full_name, client_name
- Contact: client_email, client_phone, buyer_email, buyer_phone
- Property: property_address, property_location, property_type
- Financial: purchase_price, agreed_price, total_price, commission_amount
- CRM Links: deal_crm_id, linked_lead_id

Example response when user says "I need to send an MOU to Ahmed for the Marina villa":
"I'll help you prepare an MOU for Ahmed regarding the Marina property.

[DOCUMENT_ACTION]
template_id: FORM_08_MOU
template_name: Memorandum of Understanding (Pre-SPA)
prefill: {"buyer_full_name": "Ahmed", "property_address": "Dubai Marina"}
[/DOCUMENT_ACTION]

Click 'Open Template' above to start filling in the details. Would you like help with anything else?"

=== FOLLOW-UP MESSAGE ASSISTANCE ===

When users want to follow up with a client, re-engage a lead, send a check-in, or remind someone:
1. Identify the entity from the database context (prospect, lead, or deal)
2. Compose a personalized follow-up message appropriate for WhatsApp/SMS/Email
3. Include a structured FOLLOWUP_ACTION block in your response

FOLLOWUP_ACTION block format (use exactly this format):
[FOLLOWUP_ACTION]
entity_type: lead
entity_id: LD-ABC123
entity_db_id: uuid-here-if-available
recipient_name: Ahmed Al Mansouri
recipient_phone: +971501234567
recipient_email: ahmed@example.com
suggested_message: "Hi Ahmed! Following up on your recent viewing of the Marina apartment. Were you able to discuss with your family? I'm available anytime this week if you have questions."
channel: whatsapp
follow_up_type: viewing_followup
[/FOLLOWUP_ACTION]

FOLLOW-UP TYPES:
- viewing_followup: After property viewing, ask about interest level
- general_checkin: Warm re-engagement after period of no contact
- document_reminder: Gentle nudge about pending documents
- offer_followup: Follow up on submitted offer
- hot_lead_reengagement: Re-engage high-potential lead who went cold
- deal_milestone: Congratulate on progress, explain next steps

FOLLOW-UP TRIGGER PATTERNS:
- "Follow up with [name]"
- "Send a check-in to [name/ID]"
- "Remind [name] about..."
- "Re-engage [name]"
- "Message [name] about the viewing"
- "I need to follow up with..."

Example response when user says "Follow up with Ahmed about the Marina villa viewing":
"I've prepared a personalized follow-up for Ahmed based on his recent viewing:

[FOLLOWUP_ACTION]
entity_type: lead
entity_id: LD-AHMED01
recipient_name: Ahmed Al Mansouri
recipient_phone: +971501234567
suggested_message: "Hi Ahmed! 🏡 I hope you had a chance to reflect on the Marina villa we viewed yesterday. The 3BR with stunning marina views seemed to match your requirements perfectly. Would you like to schedule a second viewing with your family?"
channel: whatsapp
follow_up_type: viewing_followup
[/FOLLOWUP_ACTION]

You can edit the message before sending, or switch to SMS/Email. Would you like me to adjust the tone?"

Respond in a professional, helpful manner suited to UAE real estate professionals.`;

interface OpsRequest {
  userIntent: string;
  contextType?: string;
  bosPayload?: Record<string, unknown>;
  complianceResult?: Record<string, unknown>;
  databaseContext?: Record<string, unknown>;
}

// Extract entities from user message for database lookup
function extractEntities(message: string) {
  const entities: Record<string, string[]> = {};
  
  // CRM IDs: PR-XXX, LD-XXX, CRM-XXX, DL-XXX
  const crmPattern = /\b(PR|LD|CRM|DL)-[A-Z0-9]{4,12}\b/gi;
  const crmMatches = message.match(crmPattern);
  if (crmMatches) entities.crmIds = [...new Set(crmMatches.map(m => m.toUpperCase()))];
  
  // Email patterns
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emailMatches = message.match(emailPattern);
  if (emailMatches) entities.emails = [...new Set(emailMatches.map(e => e.toLowerCase()))];
  
  // Phone patterns (UAE format)
  const phonePattern = /\+?971[0-9]{8,9}|05[0-9]{8}/g;
  const phoneMatches = message.match(phonePattern);
  if (phoneMatches) entities.phones = [...new Set(phoneMatches)];
  
  return entities;
}

// Detect intent patterns for smarter data fetching
function detectIntentPatterns(message: string) {
  const lower = message.toLowerCase();
  
  return {
    // Count/aggregate questions
    wantsCount: /\b(how many|total|count|number of|all|give me|show me|list)\b/i.test(lower),
    
    // Entity-specific questions
    wantsLeads: /\b(leads?)\b/i.test(lower),
    wantsProspects: /\b(prospects?|customers?|contacts?)\b/i.test(lower),
    wantsDeals: /\b(deals?|transactions?|sales?)\b/i.test(lower),
    wantsListings: /\b(listings?|properties|inventory|units?)\b/i.test(lower),
    
    // Pipeline/overview questions
    wantsPipeline: /\b(pipeline|overview|summary|status|dashboard|report|metrics|kpis?)\b/i.test(lower),
    
    // Time-based questions
    wantsToday: /\b(today|priorities|urgent|due|overdue|pending)\b/i.test(lower),
    wantsRecent: /\b(recent|latest|new|this week|this month|yesterday)\b/i.test(lower),
    
    // Quality/tier questions
    wantsHot: /\b(hot|warm|cold|qualified|high.?value|priority)\b/i.test(lower),
    
    // Breakdown questions
    wantsBreakdown: /\b(breakdown|by stage|by state|by status|distribution|split)\b/i.test(lower),
  };
}

// Query database for relevant records
async function fetchDatabaseContext(supabase: any, userIntent: string) {
  const results: Record<string, unknown> = {};
  const entities = extractEntities(userIntent);
  const intent = detectIntentPatterns(userIntent);
  
  // Always fetch entity counts for count/aggregate or pipeline questions
  if (intent.wantsCount || intent.wantsPipeline || intent.wantsBreakdown) {
    try {
      const { data: entityCounts } = await supabase.rpc('get_entity_counts');
      if (entityCounts?.length) {
        results.entityCounts = entityCounts;
      }
    } catch (e) {
      console.log("[BOS OPS] get_entity_counts not available, using fallback queries");
    }
  }
  
  // Query by specific identifiers (CRM IDs, emails, phones)
  if (entities.crmIds?.length || entities.emails?.length || entities.phones?.length) {
    // Query prospects
    let prospectConditions: string[] = [];
    
    if (entities.crmIds?.length) {
      entities.crmIds.forEach(id => {
        prospectConditions.push(`crm_customer_id.ilike.%${id}%`);
      });
    }
    if (entities.emails?.length) {
      entities.emails.forEach(email => {
        prospectConditions.push(`email.ilike.%${email}%`);
      });
    }
    if (entities.phones?.length) {
      entities.phones.forEach(phone => {
        const cleanPhone = phone.replace(/\D/g, '');
        prospectConditions.push(`phone.ilike.%${cleanPhone}%`);
      });
    }
    
    if (prospectConditions.length > 0) {
      const { data: prospects } = await supabase
        .from('prospects')
        .select('id, full_name, email, phone, crm_customer_id, crm_stage, crm_confidence_level, outreach_status, city, source, notes, created_at')
        .or(prospectConditions.join(','))
        .limit(10);
      if (prospects?.length) results.prospects = prospects;
    }
    
    // Query leads
    let leadConditions: string[] = [];
    
    if (entities.crmIds?.length) {
      entities.crmIds.forEach(id => {
        leadConditions.push(`lead_id.ilike.%${id}%`);
      });
    }
    if (entities.emails?.length) {
      entities.emails.forEach(email => {
        leadConditions.push(`contact_email.ilike.%${email}%`);
      });
    }
    if (entities.phones?.length) {
      entities.phones.forEach(phone => {
        const cleanPhone = phone.replace(/\D/g, '');
        leadConditions.push(`contact_phone.ilike.%${cleanPhone}%`);
      });
    }
    
    if (leadConditions.length > 0) {
      const { data: leads } = await supabase
        .from('leads')
        .select('id, lead_id, contact_name, contact_email, contact_phone, lead_state, source, next_action, next_action_due, notes, created_at')
        .or(leadConditions.join(','))
        .limit(10);
      if (leads?.length) results.leads = leads;
    }
    
    // Query deals
    if (entities.crmIds?.some(id => id.startsWith('DL-'))) {
      const dealConditions = entities.crmIds
        .filter(id => id.startsWith('DL-'))
        .map(id => `deal_id.ilike.%${id}%`);
      
      if (dealConditions.length > 0) {
        const { data: deals } = await supabase
          .from('deals')
          .select('id, deal_id, deal_type, deal_state, pipeline, side, deal_economics, next_action, next_action_due, created_at')
          .or(dealConditions.join(','))
          .limit(10);
        if (deals?.length) results.deals = deals;
      }
    }
  }
  
  // Fetch specific entity data based on intent
  if (intent.wantsLeads && !results.leads) {
    const { count: leadCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });
    results.totalLeads = leadCount;
    
    // Get sample recent leads
    const { data: recentLeads } = await supabase
      .from('leads')
      .select('id, lead_id, contact_name, lead_state, next_action, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    if (recentLeads?.length) results.recentLeads = recentLeads;
  }
  
  if (intent.wantsProspects && !results.prospects) {
    const { count: prospectCount } = await supabase
      .from('prospects')
      .select('*', { count: 'exact', head: true });
    results.totalProspects = prospectCount;
    
    // Get sample recent prospects
    const { data: recentProspects } = await supabase
      .from('prospects')
      .select('id, full_name, crm_customer_id, crm_stage, outreach_status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    if (recentProspects?.length) results.recentProspects = recentProspects;
  }
  
  if (intent.wantsDeals && !results.deals) {
    const { count: dealCount } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true });
    results.totalDeals = dealCount;
    
    // Get sample recent deals
    const { data: recentDeals } = await supabase
      .from('deals')
      .select('id, deal_id, deal_type, deal_state, pipeline, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    if (recentDeals?.length) results.recentDeals = recentDeals;
  }
  
  if (intent.wantsListings) {
    const { count: listingCount } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true });
    results.totalListings = listingCount;
    
    // Get sample recent listings
    const { data: recentListings } = await supabase
      .from('listings')
      .select('id, listing_id, listing_type, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    if (recentListings?.length) results.recentListings = recentListings;
  }
  
  // Search by name patterns
  const nameKeywords = userIntent.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
  if (nameKeywords?.length && !results.prospects && !results.leads) {
    const excludeWords = ['Pipeline', 'Status', 'Show', 'Find', 'Get', 'What', 'Who', 'How', 'Tell', 'About', 'Many', 'Total', 'Count', 'Give', 'List'];
    for (const name of nameKeywords.slice(0, 2)) {
      if (name.length > 2 && !excludeWords.includes(name)) {
        const { data: prospectsByName } = await supabase
          .from('prospects')
          .select('id, full_name, email, phone, crm_customer_id, crm_stage, crm_confidence_level, outreach_status, city, notes')
          .ilike('full_name', `%${name}%`)
          .limit(5);
        
        if (prospectsByName?.length) {
          results.prospects = [...(results.prospects as any[] || []), ...prospectsByName];
        }
        
        const { data: leadsByName } = await supabase
          .from('leads')
          .select('id, lead_id, contact_name, contact_email, contact_phone, lead_state, source, next_action, notes')
          .ilike('contact_name', `%${name}%`)
          .limit(5);
        
        if (leadsByName?.length) {
          results.leads = [...(results.leads as any[] || []), ...leadsByName];
        }
      }
    }
  }
  
  // Pipeline/summary queries - use entity counts (pipeline_kpis table doesn't exist)
  if (intent.wantsPipeline && !results.entityCounts) {
    try {
      const { data: entityCounts } = await supabase.rpc('get_entity_counts');
      if (entityCounts?.length) results.entityCounts = entityCounts;
    } catch (e) {
      console.log("[BOS OPS] Pipeline query fallback - get_entity_counts not available");
    }
  }
  
  // Today's priorities
  if (intent.wantsToday) {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    const { data: dueLeads } = await supabase
      .from('leads')
      .select('id, lead_id, contact_name, lead_state, next_action, next_action_due')
      .gte('next_action_due', today)
      .lt('next_action_due', tomorrow)
      .order('next_action_due')
      .limit(10);
    if (dueLeads?.length) results.leadsDueToday = dueLeads;
    
    const { data: dueDeals } = await supabase
      .from('deals')
      .select('id, deal_id, deal_state, pipeline, next_action, next_action_due')
      .gte('next_action_due', today)
      .lt('next_action_due', tomorrow)
      .order('next_action_due')
      .limit(10);
    if (dueDeals?.length) results.dealsDueToday = dueDeals;
  }
  
  return results;
}

serve(async (req) => {
  const startTime = Date.now();

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // SECURITY: Validate authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user's token
    const userClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: authHeader } },
    });
    
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      console.error('[BOS OPS] Auth validation failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[BOS OPS] Authenticated user: ${user.id}`);

    const request: OpsRequest = await req.json();
    
    // SECURITY: Use user's client for database queries (respects RLS)
    let databaseContext: Record<string, unknown> = {};
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      // Use user-scoped client that respects RLS policies
      databaseContext = await fetchDatabaseContext(userClient, request.userIntent);
    }

    // Build context message from payload
    let contextMessage = "";
    
    // Add database context first (most relevant)
    if (Object.keys(databaseContext).length > 0) {
      contextMessage += `\n\n=== DATABASE RECORDS (Real-time from BOS) ===\n${JSON.stringify(databaseContext, null, 2)}`;
    }
    
    if (request.bosPayload && Object.keys(request.bosPayload).length > 0) {
      contextMessage += `\n\n=== BOS Context ===\n${JSON.stringify(request.bosPayload, null, 2)}`;
    }
    if (request.complianceResult && Object.keys(request.complianceResult).length > 0) {
      contextMessage += `\n\n=== Compliance Status ===\n${JSON.stringify(request.complianceResult, null, 2)}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODELS.REASONING,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: request.userIntent + contextMessage },
        ],
        stream: true,
      }),
    });

    const latency = Date.now() - startTime;
    console.log(`[BOS OPS] Model: ${AI_MODELS.REASONING}, Latency: ${latency}ms, Context keys: ${Object.keys(databaseContext).join(', ') || 'none'}`);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("[BOS OPS] AI Gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("[BOS OPS] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
