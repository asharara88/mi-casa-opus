import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AI_MODELS } from "../_shared/models.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Optimized prompt for SLM - constrained, explicit rules
const SYSTEM_PROMPT = `You are a lead classifier. Given lead data, return ONLY structured JSON via the qualify_lead tool.

CLASSIFICATION RULES (strict):
- HOT: Budget provided + Timeline ≤60 days + (Specific location OR Financing confirmed)
- WARM: 2 of the above criteria met
- COLD: 1 or 0 criteria met

CONFIDENCE:
- HIGH: All key fields present (budget, timeline, location)
- MEDIUM: 2 key fields present
- LOW: 1 or fewer key fields present

OUTPUT: Use the qualify_lead tool. No explanatory text outside the tool call.`;

interface LeadQualifyRequest {
  userIntent: string;
  bosPayload?: {
    leadPayload?: {
      source?: string;
      name?: string | null;
      budget?: number | null;
      locationPreference?: string | null;
      propertyType?: string | null;
      intentTimeline?: string | null;
      financingStatus?: string | null;
      message?: string | null;
    };
  };
}

serve(async (req) => {
  const startTime = Date.now();
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const request: LeadQualifyRequest = await req.json();

    // Build lead context from the leadPayload
    let leadContext = "";
    if (request.bosPayload?.leadPayload) {
      leadContext = `\n\nLead Data:\n${JSON.stringify(request.bosPayload.leadPayload, null, 2)}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODELS.CLASSIFICATION,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: request.userIntent + leadContext },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "qualify_lead",
              description: "Return structured lead qualification result",
              parameters: {
                type: "object",
                properties: {
                  leadScore: { 
                    type: "string", 
                    enum: ["HOT", "WARM", "COLD"],
                    description: "Lead quality score"
                  },
                  confidenceLevel: { 
                    type: "string", 
                    enum: ["HIGH", "MEDIUM", "LOW"],
                    description: "Confidence in the assessment"
                  },
                  missingInformation: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "List of missing information needed for better qualification"
                  },
                  recommendedNextAction: { 
                    type: "string", 
                    description: "Recommended next action for the broker"
                  },
                  suggestedQuestions: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Client-friendly questions to gather missing information"
                  }
                },
                required: ["leadScore", "confidenceLevel", "missingInformation", "recommendedNextAction", "suggestedQuestions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "qualify_lead" } },
      }),
    });

    const latency = Date.now() - startTime;
    console.log(`[BOS Lead Qualify] Model: ${AI_MODELS.CLASSIFICATION}, Latency: ${latency}ms`);

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
      const qualification = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify({ success: true, qualification, latencyMs: latency }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback to content if no tool call
    return new Response(
      JSON.stringify({ success: true, content: result.choices?.[0]?.message?.content, latencyMs: latency }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[BOS Lead Qualify] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
