import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

When database records are provided in the context:
- Reference them accurately with their CRM IDs
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

// Query database for relevant records
async function fetchDatabaseContext(supabase: any, userIntent: string) {
  const results: Record<string, unknown> = {};
  const entities = extractEntities(userIntent);
  const lowerIntent = userIntent.toLowerCase();
  
  // Query by specific identifiers
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
  
  // Search by name patterns
  const nameKeywords = userIntent.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
  if (nameKeywords?.length && !results.prospects && !results.leads) {
    for (const name of nameKeywords.slice(0, 2)) {
      if (name.length > 2 && !['Pipeline', 'Status', 'Show', 'Find', 'Get', 'What', 'Who', 'How', 'Tell', 'About'].includes(name)) {
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
  
  // Pipeline/summary queries
  if (lowerIntent.includes('pipeline') || lowerIntent.includes('overview') || lowerIntent.includes('summary') || lowerIntent.includes('status')) {
    const { data: kpis } = await supabase.from('pipeline_kpis').select('*');
    if (kpis?.length) results.pipelineKpis = kpis;
    
    const { count: prospectCount } = await supabase
      .from('prospects')
      .select('*', { count: 'exact', head: true });
    results.totalProspects = prospectCount;
    
    const { count: leadCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });
    results.totalLeads = leadCount;
  }
  
  // Today's priorities
  if (lowerIntent.includes('today') || lowerIntent.includes('priorities') || lowerIntent.includes('urgent') || lowerIntent.includes('due')) {
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const request: OpsRequest = await req.json();
    
    // Fetch database context based on user intent
    let databaseContext: Record<string, unknown> = {};
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      databaseContext = await fetchDatabaseContext(supabase, request.userIntent);
    }

    // Build context message from payload
    let contextMessage = "";
    
    // Add database context first (most relevant)
    if (Object.keys(databaseContext).length > 0) {
      contextMessage += `\n\n=== DATABASE RECORDS ===\n${JSON.stringify(databaseContext, null, 2)}`;
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
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: request.userIntent + contextMessage },
        ],
        stream: true,
      }),
    });

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
