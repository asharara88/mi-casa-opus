import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;

    // Validate authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { content, sourceUrl, bankName } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ success: false, error: 'Scraped content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a UAE mortgage data extraction specialist. Extract structured mortgage rate information from bank website content.

Return data using the extract_mortgage_rates tool. Extract ALL mortgage products/offers you can find.

For each rate option:
- bank_name: Full bank name
- product_name: Product/offer name
- rate_pct: The published interest rate percentage (numeric, e.g. 4.74)
- rate_kind: "FIXED_FULL_TERM" if the rate applies for the full loan term, "FIXED_FOR_X_THEN_VARIABLE" if it's fixed for an initial period then variable
- fixed_period_months: If rate_kind is FIXED_FOR_X_THEN_VARIABLE, the number of months the fixed rate applies (null otherwise)
- max_ltv_pct: Maximum loan-to-value ratio if mentioned (null if not found)
- max_tenor_years: Maximum loan tenor in years if mentioned (null if not found)
- min_salary_aed: Minimum salary requirement if mentioned (null if not found)
- currency: Always "AED" for UAE
- notes: Any important conditions, eligibility criteria, or special terms
- source_url: The URL this was scraped from

If you cannot find any mortgage rate information, return an empty rates array with a note explaining why.`;

    const userPrompt = `Extract mortgage rates from this ${bankName || 'bank'} webpage content.
Source URL: ${sourceUrl || 'unknown'}

--- SCRAPED CONTENT ---
${content.substring(0, 12000)}
--- END ---`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_mortgage_rates',
              description: 'Return structured mortgage rate data extracted from bank webpage content.',
              parameters: {
                type: 'object',
                properties: {
                  rates: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        bank_name: { type: 'string' },
                        product_name: { type: 'string' },
                        rate_pct: { type: 'number' },
                        rate_kind: { type: 'string', enum: ['FIXED_FULL_TERM', 'FIXED_FOR_X_THEN_VARIABLE'] },
                        fixed_period_months: { type: 'number', nullable: true },
                        max_ltv_pct: { type: 'number', nullable: true },
                        max_tenor_years: { type: 'number', nullable: true },
                        min_salary_aed: { type: 'number', nullable: true },
                        currency: { type: 'string' },
                        notes: { type: 'string' },
                        source_url: { type: 'string' },
                      },
                      required: ['bank_name', 'product_name', 'rate_pct', 'rate_kind', 'currency', 'source_url'],
                      additionalProperties: false,
                    },
                  },
                  extraction_notes: { type: 'string', description: 'Any notes about the extraction quality or missing data' },
                },
                required: ['rates', 'extraction_notes'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'extract_mortgage_rates' } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded, please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI credits exhausted. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errText = await response.text();
      console.error('[mortgage-rate-extract] AI error:', response.status, errText);
      return new Response(
        JSON.stringify({ success: false, error: 'AI extraction failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error('[mortgage-rate-extract] No tool call in response');
      return new Response(
        JSON.stringify({ success: false, error: 'AI did not return structured data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let extracted;
    try {
      extracted = JSON.parse(toolCall.function.arguments);
    } catch {
      console.error('[mortgage-rate-extract] Failed to parse tool call arguments');
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[mortgage-rate-extract] Extracted ${extracted.rates?.length || 0} rates from ${bankName || sourceUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          rates: extracted.rates || [],
          extraction_notes: extracted.extraction_notes || '',
          bank_name: bankName || 'Unknown',
          source_url: sourceUrl || '',
          extracted_at: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[mortgage-rate-extract] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
