import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QueryRequest {
  userIntent: string;
  extractedEntities?: {
    crmIds?: string[];
    names?: string[];
    emails?: string[];
    phones?: string[];
    dealIds?: string[];
    leadIds?: string[];
  };
}

// Extract potential identifiers from user message
function extractEntities(message: string): QueryRequest['extractedEntities'] {
  const entities: QueryRequest['extractedEntities'] = {};
  
  // CRM IDs: PR-XXX, LD-XXX, CRM-XXX, DL-XXX
  const crmPattern = /\b(PR|LD|CRM|DL)-[A-Z0-9]{4,12}\b/gi;
  const crmMatches = message.match(crmPattern);
  if (crmMatches) entities.crmIds = [...new Set(crmMatches.map(m => m.toUpperCase()))];
  
  // Deal IDs: UUID or DL-XXX format
  const dealPattern = /\b(DL-[A-Z0-9]{6,})\b/gi;
  const dealMatches = message.match(dealPattern);
  if (dealMatches) entities.dealIds = [...new Set(dealMatches.map(m => m.toUpperCase()))];
  
  // Lead IDs: LD-XXX format
  const leadPattern = /\b(LD-[A-Z0-9]{6,})\b/gi;
  const leadMatches = message.match(leadPattern);
  if (leadMatches) entities.leadIds = [...new Set(leadMatches.map(m => m.toUpperCase()))];
  
  // Email patterns
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emailMatches = message.match(emailPattern);
  if (emailMatches) entities.emails = [...new Set(emailMatches.map(e => e.toLowerCase()))];
  
  // Phone patterns (UAE format)
  const phonePattern = /\+?971[0-9]{8,9}|05[0-9]{8}/g;
  const phoneMatches = message.match(phonePattern);
  if (phoneMatches) entities.phones = [...new Set(phoneMatches)];
  
  // Extract quoted names or capitalized sequences
  const quotedNames = message.match(/"([^"]+)"|'([^']+)'/g);
  if (quotedNames) {
    entities.names = quotedNames.map(n => n.replace(/['"]/g, '').trim());
  }
  
  return entities;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { userIntent }: QueryRequest = await req.json();
    
    // Extract entities from user message
    const entities = extractEntities(userIntent);
    
    const results: Record<string, unknown> = {
      queryTime: new Date().toISOString(),
      extractedEntities: entities,
    };
    
    // Query prospects by CRM ID, email, phone, or name patterns
    if (entities?.crmIds?.length || entities?.emails?.length || entities?.phones?.length) {
      let prospectQuery = supabase.from('prospects').select('*');
      
      const orConditions: string[] = [];
      
      if (entities.crmIds?.length) {
        // Search for any CRM ID pattern
        entities.crmIds.forEach(id => {
          orConditions.push(`crm_customer_id.ilike.%${id}%`);
        });
      }
      
      if (entities.emails?.length) {
        entities.emails.forEach(email => {
          orConditions.push(`email.ilike.%${email}%`);
        });
      }
      
      if (entities.phones?.length) {
        entities.phones.forEach(phone => {
          const cleanPhone = phone.replace(/\D/g, '');
          orConditions.push(`phone.ilike.%${cleanPhone}%`);
        });
      }
      
      if (orConditions.length > 0) {
        prospectQuery = prospectQuery.or(orConditions.join(','));
        const { data: prospects, error } = await prospectQuery.limit(10);
        if (!error && prospects?.length) {
          results.prospects = prospects;
        }
      }
    }
    
    // Query leads by lead_id, email, phone, or name
    if (entities?.leadIds?.length || entities?.crmIds?.length || entities?.emails?.length || entities?.phones?.length) {
      let leadQuery = supabase.from('leads').select('*');
      
      const orConditions: string[] = [];
      
      if (entities.leadIds?.length) {
        entities.leadIds.forEach(id => {
          orConditions.push(`lead_id.ilike.%${id}%`);
        });
      }
      
      if (entities.crmIds?.length) {
        entities.crmIds.forEach(id => {
          if (id.startsWith('LD-')) {
            orConditions.push(`lead_id.ilike.%${id}%`);
          }
        });
      }
      
      if (entities.emails?.length) {
        entities.emails.forEach(email => {
          orConditions.push(`contact_email.ilike.%${email}%`);
        });
      }
      
      if (entities.phones?.length) {
        entities.phones.forEach(phone => {
          const cleanPhone = phone.replace(/\D/g, '');
          orConditions.push(`contact_phone.ilike.%${cleanPhone}%`);
        });
      }
      
      if (orConditions.length > 0) {
        leadQuery = leadQuery.or(orConditions.join(','));
        const { data: leads, error } = await leadQuery.limit(10);
        if (!error && leads?.length) {
          results.leads = leads;
        }
      }
    }
    
    // Query deals by deal_id
    if (entities?.dealIds?.length || entities?.crmIds?.length) {
      let dealQuery = supabase.from('deals').select('*');
      
      const orConditions: string[] = [];
      
      if (entities.dealIds?.length) {
        entities.dealIds.forEach(id => {
          orConditions.push(`deal_id.ilike.%${id}%`);
        });
      }
      
      if (entities.crmIds?.length) {
        entities.crmIds.forEach(id => {
          if (id.startsWith('DL-')) {
            orConditions.push(`deal_id.ilike.%${id}%`);
          }
        });
      }
      
      if (orConditions.length > 0) {
        dealQuery = dealQuery.or(orConditions.join(','));
        const { data: deals, error } = await dealQuery.limit(10);
        if (!error && deals?.length) {
          results.deals = deals;
        }
      }
    }
    
    // If user asks about "pipeline" or summary, get aggregate stats
    const lowerIntent = userIntent.toLowerCase();
    if (lowerIntent.includes('pipeline') || lowerIntent.includes('status') || lowerIntent.includes('overview') || lowerIntent.includes('summary')) {
      // Get pipeline KPIs
      const { data: kpis } = await supabase.from('pipeline_kpis').select('*');
      if (kpis?.length) results.pipelineKpis = kpis;
      
      // Get recent leads count by state
      const { data: leadStats } = await supabase
        .from('leads')
        .select('lead_state')
        .limit(500);
      
      if (leadStats) {
        const leadsByState: Record<string, number> = {};
        leadStats.forEach(l => {
          leadsByState[l.lead_state] = (leadsByState[l.lead_state] || 0) + 1;
        });
        results.leadsByState = leadsByState;
      }
      
      // Get prospect stats
      const { count: prospectCount } = await supabase
        .from('prospects')
        .select('*', { count: 'exact', head: true });
      results.totalProspects = prospectCount;
    }
    
    // Search prospects/leads by name keywords
    const nameKeywords = userIntent.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
    if (nameKeywords?.length && !results.prospects && !results.leads) {
      for (const name of nameKeywords.slice(0, 3)) {
        if (name.length > 2 && !['Pipeline', 'Status', 'Show', 'Find', 'Get', 'What', 'Who', 'How'].includes(name)) {
          // Search prospects
          const { data: prospectsByName } = await supabase
            .from('prospects')
            .select('*')
            .ilike('full_name', `%${name}%`)
            .limit(5);
          
          if (prospectsByName?.length) {
            results.prospects = [...(results.prospects as any[] || []), ...prospectsByName];
          }
          
          // Search leads
          const { data: leadsByName } = await supabase
            .from('leads')
            .select('*')
            .ilike('contact_name', `%${name}%`)
            .limit(5);
          
          if (leadsByName?.length) {
            results.leads = [...(results.leads as any[] || []), ...leadsByName];
          }
        }
      }
    }
    
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[BOS Agent Query] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
