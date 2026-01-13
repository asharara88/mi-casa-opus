import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `SYSTEM — MiCasa BOS Marketing Copy Generator

You are a specialized AI for generating compliant real estate marketing copy for Abu Dhabi properties.

Your role:
- Generate ad headlines, descriptions, and social media posts
- Ensure all copy is ADREC-compliant
- Avoid prohibited language and claims
- Create compelling, professional content

ADREC Compliance Rules (MANDATORY):
1. NO "from" or "starting" pricing - use exact prices only
2. NO guaranteed returns or ROI promises
3. NO superlatives without evidence ("best", "largest", etc.)
4. MUST include broker/brokerage license numbers (provided in payload)
5. MUST reference Madhmoun Listing ID when provided
6. NO misleading or exaggerated claims

Content Guidelines:
- Professional, aspirational tone
- Highlight actual features from listing data
- Use UAE-appropriate terminology
- Include call-to-action where appropriate
- Adapt tone for platform (formal for portals, casual for social)

Output Formats (based on request):
- HEADLINE: Max 60 characters, attention-grabbing
- DESCRIPTION: 150-300 words, detailed and engaging
- SOCIAL_POST: Platform-specific (Instagram, LinkedIn, etc.)
- EMAIL: Subject line + body
- AD_COPY: Portal-ready with all required identifiers

ALWAYS include these identifiers when generating portal/ad copy:
- Brokerage License: [from payload]
- Broker Name: [from payload]
- Broker License: [from payload]
- Madhmoun ID: [from payload]

If any required identifier is missing from payload, flag it and DO NOT generate final copy.`;

interface MarketingCopyRequest {
  userIntent: string;
  bosPayload?: {
    listing?: Record<string, unknown>;
    broker?: {
      name?: string;
      license_number?: string;
    };
    brokerage?: {
      license_number?: string;
      name?: string;
    };
    madhmoun_id?: string;
    format?: "HEADLINE" | "DESCRIPTION" | "SOCIAL_POST" | "EMAIL" | "AD_COPY";
    platform?: string;
  };
  complianceResult?: Record<string, unknown>;
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

    const request: MarketingCopyRequest = await req.json();

    // Check for required identifiers for AD_COPY format
    const format = request.bosPayload?.format || "DESCRIPTION";
    const missingIdentifiers: string[] = [];
    
    if (format === "AD_COPY") {
      if (!request.bosPayload?.brokerage?.license_number) {
        missingIdentifiers.push("Brokerage License Number");
      }
      if (!request.bosPayload?.broker?.name) {
        missingIdentifiers.push("Broker Name");
      }
      if (!request.bosPayload?.broker?.license_number) {
        missingIdentifiers.push("Broker License Number");
      }
      if (!request.bosPayload?.madhmoun_id) {
        missingIdentifiers.push("Madhmoun Listing ID");
      }

      if (missingIdentifiers.length > 0) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Missing required identifiers for compliant ad copy",
            missingIdentifiers,
            message: "Cannot generate AD_COPY without: " + missingIdentifiers.join(", ")
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Build context
    let context = `\n\nRequested Format: ${format}`;
    if (request.bosPayload?.platform) {
      context += `\nPlatform: ${request.bosPayload.platform}`;
    }
    if (request.bosPayload?.listing) {
      context += `\n\nListing Data:\n${JSON.stringify(request.bosPayload.listing, null, 2)}`;
    }
    if (request.bosPayload?.broker) {
      context += `\n\nBroker Info:\n${JSON.stringify(request.bosPayload.broker, null, 2)}`;
    }
    if (request.bosPayload?.brokerage) {
      context += `\n\nBrokerage Info:\n${JSON.stringify(request.bosPayload.brokerage, null, 2)}`;
    }
    if (request.bosPayload?.madhmoun_id) {
      context += `\n\nMadhmoun ID: ${request.bosPayload.madhmoun_id}`;
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
          { role: "user", content: request.userIntent + context },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_marketing_copy",
              description: "Return structured marketing copy with compliance check",
              parameters: {
                type: "object",
                properties: {
                  headline: { type: "string", description: "Short headline (max 60 chars)" },
                  body: { type: "string", description: "Main marketing copy" },
                  identifiers: { 
                    type: "object",
                    properties: {
                      brokerage_license: { type: "string" },
                      broker_name: { type: "string" },
                      broker_license: { type: "string" },
                      madhmoun_id: { type: "string" }
                    }
                  },
                  compliance_flags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Any compliance concerns detected"
                  },
                  is_compliant: { type: "boolean", description: "Whether copy passes ADREC rules" }
                },
                required: ["headline", "body", "is_compliant"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_marketing_copy" } },
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
      const marketingCopy = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify({ success: true, copy: marketingCopy }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback
    return new Response(
      JSON.stringify({ success: true, content: result.choices?.[0]?.message?.content }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[BOS Marketing Copy] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
