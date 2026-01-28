import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AI_MODELS } from "../_shared/models.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `SYSTEM — MiCasa BOS Property Matching Assistant

You are the Property Matching Assistant inside MiCasa BOS.
You help brokers find the best property matches for their leads.

You do NOT contact clients.
You do NOT update BOS records.
You do NOT promise availability or pricing.

────────────────────────────
SCORING CRITERIA
────────────────────────────

Budget fit:
- Within range = EXCELLENT (score 90-100)
- Up to 10% over = GOOD (score 70-89)
- 10-20% over = PARTIAL (score 50-69)
- 20%+ over = STRETCH (score 30-49)

Location match:
- Exact location = +25 points
- Adjacent/similar area = +15 points
- Different city area = +5 points

Property type match:
- Exact type = +15 points
- Similar type = +8 points

Bedroom match:
- Meets or exceeds = +10 points
- 1 bedroom less = +5 points

────────────────────────────
RULES
────────────────────────────

- Only use data provided
- Sort by match_score (highest first)
- Maximum 5 matches
- Keep explanations brief (2-3 bullet points max)

OUTPUT: Use the match_properties tool.`;

interface PropertyMatchRequest {
  leadRequirements: {
    budget_min?: number;
    budget_max?: number;
    property_types?: string[];
    locations?: string[];
    bedrooms_min?: number;
  };
  availableListings: Array<{
    id: string;
    listing_id: string;
    listing_type: string;
    status: string;
    listing_attributes?: {
      title?: string;
      community?: string;
      bedrooms?: number;
      bathrooms?: number;
      size_sqft?: number;
      property_type?: string;
    };
    asking_terms?: {
      price?: number;
    };
  }>;
}

serve(async (req) => {
  const startTime = Date.now();

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    // SECURITY: Validate authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[bos-llm-property-match] Auth validation failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[bos-llm-property-match] Authenticated user: ${user.id}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const request: PropertyMatchRequest = await req.json();
    const { leadRequirements, availableListings } = request;

    // Filter to only active listings
    const activeListings = availableListings.filter(l => l.status === 'Active');

    if (activeListings.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          result: {
            matches: [],
            summary: "No active listings available for matching.",
            recommendation: "Wait for new listings to be added or broaden search criteria.",
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context for AI
    const requirementsContext = `
Lead Requirements:
- Budget: AED ${leadRequirements.budget_min?.toLocaleString() || 0} - ${leadRequirements.budget_max?.toLocaleString() || 'No max'}
- Bedrooms: ${leadRequirements.bedrooms_min || 'Any'} minimum
- Property Types: ${leadRequirements.property_types?.join(', ') || 'Any'}
- Locations: ${leadRequirements.locations?.join(', ') || 'Any'}
`;

    const listingsContext = activeListings.map((l, i) => `
Listing ${i + 1}:
- ID: ${l.listing_id}
- Title: ${l.listing_attributes?.title || 'Untitled'}
- Type: ${l.listing_attributes?.property_type || l.listing_type}
- Location: ${l.listing_attributes?.community || 'Unknown'}
- Price: AED ${l.asking_terms?.price?.toLocaleString() || 'Not specified'}
- Bedrooms: ${l.listing_attributes?.bedrooms || 'N/A'}
- Size: ${l.listing_attributes?.size_sqft?.toLocaleString() || 'N/A'} sqft
`).join('\n');

    const userPrompt = `Match listings to lead requirements. Return top 5.

${requirementsContext}

Available Listings:
${listingsContext}`;

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
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "match_properties",
              description: "Return ranked property matches for a lead",
              parameters: {
                type: "object",
                properties: {
                  matches: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        listing_id: { 
                          type: "string",
                          description: "The listing_id from the provided listings"
                        },
                        match_score: { 
                          type: "number", 
                          minimum: 0, 
                          maximum: 100,
                          description: "Overall match score 0-100"
                        },
                        match_tier: { 
                          type: "string", 
                          enum: ["EXCELLENT", "GOOD", "PARTIAL", "STRETCH"],
                          description: "Match quality tier"
                        },
                        match_reasons: { 
                          type: "array", 
                          items: { type: "string" },
                          description: "Why this property matches (2-3 points max)"
                        },
                        concerns: { 
                          type: "array", 
                          items: { type: "string" },
                          description: "Potential concerns (1-2 points max)"
                        },
                        negotiation_angle: { 
                          type: "string",
                          description: "Brief negotiation tip"
                        },
                        broker_talking_points: { 
                          type: "array", 
                          items: { type: "string" },
                          description: "Key points for broker (2-3 max)"
                        }
                      },
                      required: ["listing_id", "match_score", "match_tier", "match_reasons", "concerns"],
                      additionalProperties: false
                    }
                  },
                  summary: { 
                    type: "string",
                    description: "One sentence summary"
                  },
                  recommendation: { 
                    type: "string",
                    description: "Next action for broker"
                  }
                },
                required: ["matches", "summary", "recommendation"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "match_properties" } },
      }),
    });

    const latency = Date.now() - startTime;
    console.log(`[BOS Property Match] Model: ${AI_MODELS.REASONING}, Latency: ${latency}ms`);

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
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    
    // Extract tool call result
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const matchResult = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify({ success: true, result: matchResult, latencyMs: latency }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback if no tool call
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "No matching result returned",
        content: result.choices?.[0]?.message?.content,
        latencyMs: latency
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[BOS Property Match] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
