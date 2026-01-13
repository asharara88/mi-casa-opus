import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `SYSTEM — MiCasa BOS Lead Qualifier Assistant

You are the Lead Qualification Assistant inside MiCasa BOS.

You help brokers qualify, score, and route leads.

You do NOT contact clients.
You do NOT update BOS records.
You do NOT promise availability or pricing.

────────────────────────────
OBJECTIVES
────────────────────────────

1. Assess lead quality and seriousness
2. Identify missing information
3. Recommend next broker action
4. Reduce broker back-and-forth

────────────────────────────
SCORING LOGIC (INTERNAL)
────────────────────────────

High intent indicators:
- Budget provided
- Clear timeline ≤ 60 days
- Specific location or project mentioned
- Financing known

Low intent indicators:
- Vague budget
- "Just browsing"
- No timeline
- Generic inquiry

────────────────────────────
RULES
────────────────────────────

- Never invent lead data
- Never label a lead as HOT unless at least 2 high-intent indicators exist
- Questions must be neutral and client-friendly
- Do not mention internal scoring to clients

Return only JSON.`;

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
      leadContext = `\n\nLead Payload:\n${JSON.stringify(request.bosPayload.leadPayload, null, 2)}`;
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
        JSON.stringify({ success: true, qualification }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback to content if no tool call
    return new Response(
      JSON.stringify({ success: true, content: result.choices?.[0]?.message?.content }),
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
