import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Parse CSV content
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const rows: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx]?.trim() || '';
    });
    rows.push(row);
  }
  
  return rows;
}

// Clean field value
function cleanField(value: string | null | undefined): string | null {
  if (!value) return null;
  // Trim and replace NBSP with regular space
  let cleaned = value.trim().replace(/\u00A0/g, ' ');
  // Convert "nan", "NaN", empty to null
  if (cleaned === '' || cleaned.toLowerCase() === 'nan' || cleaned === 'undefined' || cleaned === 'null') {
    return null;
  }
  return cleaned;
}

// Parse date safely
function parseDate(value: string | null): string | null {
  if (!value) return null;
  const cleaned = cleanField(value);
  if (!cleaned) return null;
  try {
    const date = new Date(cleaned);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    
    // SECURITY: Validate authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[import-prospects-csv] Auth validation failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[import-prospects-csv] Authenticated user: ${user.id}`);
    
    const { csvContent, batchSize = 500 } = await req.json();
    
    if (!csvContent) {
      return new Response(
        JSON.stringify({ error: "CSV content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Parsing CSV...");
    const rows = parseCSV(csvContent);
    console.log(`Parsed ${rows.length} rows`);
    
    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ error: "No data found in CSV" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Transform rows to match prospects table schema
    // Include created_by to track who imported the records
    const prospects = rows.map(row => ({
      first_name: cleanField(row.first_name),
      last_name: cleanField(row.last_name),
      full_name: cleanField(row.full_name) || 'Unknown',
      phone: cleanField(row.phone),
      email: cleanField(row.email),
      source: cleanField(row.source),
      city: cleanField(row.city),
      crm_customer_id: cleanField(row.crm_customer_id),
      crm_created_date: parseDate(row.crm_created_date),
      crm_stage: cleanField(row.crm_stage) || 'Prospect',
      crm_confidence_level: cleanField(row.crm_confidence_level),
      outreach_status: 'not_contacted',
      contact_attempts: 0,
      created_by: user.id, // Track who imported this prospect
    }));
    
    console.log(`Transformed ${prospects.length} prospects`);
    
    // Insert in batches using upsert on crm_customer_id
    let inserted = 0;
    let errors = 0;
    const totalBatches = Math.ceil(prospects.length / batchSize);
    
    for (let i = 0; i < prospects.length; i += batchSize) {
      const batch = prospects.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      
      console.log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} records)`);
      
      const { data, error } = await supabase
        .from('prospects')
        .upsert(batch, { 
          onConflict: 'crm_customer_id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error(`Batch ${batchNum} error:`, error.message);
        errors += batch.length;
      } else {
        inserted += batch.length;
      }
    }
    
    console.log(`Import complete: ${inserted} inserted, ${errors} errors`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        total: rows.length,
        inserted,
        errors,
        message: `Imported ${inserted} prospects (${errors} errors)`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error: unknown) {
    console.error("Import error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
