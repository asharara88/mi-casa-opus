import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `SYSTEM — MiCasa BOS Marketing Copy Assistant

You generate compliant marketing copy drafts using verified BOS data.

You do NOT publish.
You do NOT approve compliance.
You refuse if required data is missing.

HARD RULES:
- If complianceStatus ≠ APPROVED → REFUSE
- Use exact pricing only (no "from" / "starting")
- Include required identifiers:
  - Brokerage license number
  - Broker name
  - Broker license number
  - Madhmoun ID
- Use only verified fields

TONE RULES:
- No hype
- No urgency manipulation
- No unverifiable claims

Channel Formatting:
- portal: Formal, structured with all identifiers visible
- whatsapp: Conversational but professional, emoji-light
- brochure: Premium, descriptive, feature-focused
- sms: Ultra-concise, key details only (160 chars max)

Tone Variations:
- professional: Business-focused, factual
- premium: Aspirational, lifestyle-oriented
- concise: Minimal, direct, no fluff

CRITICAL: If any required identifier is missing from payload, you MUST set status to REFUSED.`;

interface MarketingCopyRequest {
  listingPayload?: Record<string, unknown>;
  complianceStatus?: "APPROVED" | "BLOCKED" | "ESCALATED";
  channel?: "portal" | "whatsapp" | "brochure" | "sms";
  tone?: "professional" | "premium" | "concise";
  broker?: {
    name?: string;
    license_number?: string;
  };
  brokerage?: {
    license_number?: string;
    name?: string;
  };
  madhmoun_id?: string;
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
    const complianceStatus = request.complianceStatus || "BLOCKED";
    const channel = request.channel || "portal";
    const tone = request.tone || "professional";

    // Hard rule: Refuse if compliance is not APPROVED
    if (complianceStatus !== "APPROVED") {
      return new Response(
        JSON.stringify({
          status: "REFUSED",
          reason: `Cannot generate marketing copy: Listing compliance status is ${complianceStatus}. Only APPROVED listings can have marketing copy generated.`,
          copy: null,
          includedIdentifiers: []
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for required identifiers
    const missingIdentifiers: string[] = [];
    const includedIdentifiers: string[] = [];

    if (!request.brokerage?.license_number) {
      missingIdentifiers.push("Brokerage License Number");
    } else {
      includedIdentifiers.push(`Brokerage License: ${request.brokerage.license_number}`);
    }

    if (!request.broker?.name) {
      missingIdentifiers.push("Broker Name");
    } else {
      includedIdentifiers.push(`Broker: ${request.broker.name}`);
    }

    if (!request.broker?.license_number) {
      missingIdentifiers.push("Broker License Number");
    } else {
      includedIdentifiers.push(`Broker License: ${request.broker.license_number}`);
    }

    if (!request.madhmoun_id) {
      missingIdentifiers.push("Madhmoun ID");
    } else {
      includedIdentifiers.push(`Madhmoun: ${request.madhmoun_id}`);
    }

    // Refuse if required identifiers are missing
    if (missingIdentifiers.length > 0) {
      return new Response(
        JSON.stringify({
          status: "REFUSED",
          reason: `Missing required identifiers: ${missingIdentifiers.join(", ")}`,
          copy: null,
          includedIdentifiers: []
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for listing payload
    if (!request.listingPayload) {
      return new Response(
        JSON.stringify({
          status: "REFUSED",
          reason: "No listing data provided",
          copy: null,
          includedIdentifiers: []
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context for AI
    const userMessage = `Generate marketing copy for the following listing:

Channel: ${channel}
Tone: ${tone}
Compliance Status: ${complianceStatus}

Listing Data:
${JSON.stringify(request.listingPayload, null, 2)}

Required Identifiers to Include:
- Brokerage License: ${request.brokerage?.license_number}
- Broker Name: ${request.broker?.name}
- Broker License: ${request.broker?.license_number}
- Madhmoun ID: ${request.madhmoun_id}`;

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
          { role: "user", content: userMessage },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_marketing_copy",
              description: "Return structured marketing copy result",
              parameters: {
                type: "object",
                properties: {
                  status: { 
                    type: "string", 
                    enum: ["READY", "REFUSED"],
                    description: "READY if copy was generated, REFUSED if unable to generate"
                  },
                  reason: { 
                    type: "string",
                    nullable: true,
                    description: "Reason for refusal if status is REFUSED, null otherwise"
                  },
                  copy: { 
                    type: "string",
                    nullable: true,
                    description: "The generated marketing copy with all required identifiers appended"
                  },
                  includedIdentifiers: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of identifiers included in the copy"
                  }
                },
                required: ["status", "reason", "copy", "includedIdentifiers"],
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
          JSON.stringify({ 
            status: "REFUSED",
            reason: "Rate limit exceeded. Please try again later.",
            copy: null,
            includedIdentifiers: []
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            status: "REFUSED",
            reason: "AI credits depleted. Please add funds.",
            copy: null,
            includedIdentifiers: []
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    
    // Extract tool call result
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const copyResult = JSON.parse(toolCall.function.arguments);
        // Ensure includedIdentifiers reflects what we actually have
        if (copyResult.status === "READY") {
          copyResult.includedIdentifiers = includedIdentifiers;
        }
        return new Response(
          JSON.stringify(copyResult),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch {
        // JSON parse failed
      }
    }

    // Fallback to content
    const content = result.choices?.[0]?.message?.content || "";
    return new Response(
      JSON.stringify({
        status: "READY",
        reason: null,
        copy: content,
        includedIdentifiers
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[BOS Marketing Copy] Error:", error);
    return new Response(
      JSON.stringify({ 
        status: "REFUSED",
        reason: error instanceof Error ? error.message : "Unknown error",
        copy: null,
        includedIdentifiers: []
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
