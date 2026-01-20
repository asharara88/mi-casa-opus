import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
OBJECTIVES
────────────────────────────

1. Analyze lead requirements (budget, bedrooms, location, property type)
2. Score listings against requirements
3. Explain why each property matches or partially matches
4. Highlight trade-offs and negotiation opportunities

────────────────────────────
SCORING CRITERIA
────────────────────────────

Budget fit:
- Within range = EXCELLENT match factor
- Up to 10% over = GOOD match factor
- 10-20% over = PARTIAL match factor
- 20%+ over = STRETCH match factor

Location match:
- Exact location = EXCELLENT match factor
- Adjacent/similar area = GOOD match factor
- Different city area = PARTIAL match factor

Property type match:
- Exact type = EXCELLENT match factor
- Similar type (e.g., Apartment/Penthouse) = GOOD match factor

Bedroom match:
- Meets or exceeds requirement = EXCELLENT match factor
- 1 bedroom less than required = PARTIAL match factor

────────────────────────────
RULES
────────────────────────────

- Never invent listing data - only use data provided
- Never recommend withdrawn/sold listings
- Always explain trade-offs honestly
- Prioritize within-budget options first
- Sort matches by overall score (highest first)
- Provide actionable broker talking points
- Maximum 5 matches to keep results focused

Return structured data via the match_properties tool.`;

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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const userPrompt = `Analyze these listings against the lead's requirements and return the best matches.

${requirementsContext}

Available Listings:
${listingsContext}

Find the best matches, score them, and provide actionable insights for the broker.`;

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
                          description: "Why this property matches the requirements"
                        },
                        concerns: { 
                          type: "array", 
                          items: { type: "string" },
                          description: "Potential concerns or trade-offs"
                        },
                        negotiation_angle: { 
                          type: "string",
                          description: "Suggested negotiation approach"
                        },
                        broker_talking_points: { 
                          type: "array", 
                          items: { type: "string" },
                          description: "Key points for broker to discuss with client"
                        }
                      },
                      required: ["listing_id", "match_score", "match_tier", "match_reasons", "concerns"],
                      additionalProperties: false
                    }
                  },
                  summary: { 
                    type: "string",
                    description: "Brief summary of the matching results"
                  },
                  recommendation: { 
                    type: "string",
                    description: "Recommended next action for the broker"
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
        JSON.stringify({ success: true, result: matchResult }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback if no tool call
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "No matching result returned",
        content: result.choices?.[0]?.message?.content 
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
