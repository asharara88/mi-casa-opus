import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `SYSTEM — MiCasa BOS Lead Qualification Agent

You are a specialized AI for qualifying and scoring real estate leads in Abu Dhabi.

Your role:
- Analyze lead data to determine qualification status
- Score leads based on intent, budget, timeline, and readiness
- Recommend routing (broker assignment, nurture, disqualify)
- Identify key qualification gaps

Qualification Criteria:
1. Budget Match: Does stated budget align with market/listing prices?
2. Timeline: How urgent is the buyer/tenant? (Immediate, 1-3mo, 3-6mo, 6mo+)
3. Decision Authority: Is this the decision-maker or influencer?
4. Motivation: Investment, end-use, relocation, etc.
5. Pre-approval: Has financing been discussed/confirmed?
6. Document Readiness: Passport, Emirates ID, POA if applicable

Scoring Model (0-100):
- 80-100: Hot - Ready to transact, assign immediately
- 60-79: Warm - Interested but needs nurturing
- 40-59: Cool - Early stage, add to drip campaign
- 0-39: Cold - Disqualify or long-term nurture

Output Format:
Return structured qualification including:
- score: number (0-100)
- tier: "HOT" | "WARM" | "COOL" | "COLD"
- routing: "ASSIGN_SENIOR" | "ASSIGN_AVAILABLE" | "NURTURE" | "DISQUALIFY"
- gaps: string[] (what's missing)
- next_action: string (recommended immediate action)
- rationale: string (brief explanation)

Always be objective and data-driven. Never inflate scores without evidence.`;

interface LeadQualifyRequest {
  userIntent: string;
  bosPayload?: {
    lead?: Record<string, unknown>;
    qualification_data?: Record<string, unknown>;
    contact_info?: Record<string, unknown>;
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

    // Build lead context
    let leadContext = "";
    if (request.bosPayload?.lead) {
      leadContext += `\n\nLead Data:\n${JSON.stringify(request.bosPayload.lead, null, 2)}`;
    }
    if (request.bosPayload?.qualification_data) {
      leadContext += `\n\nQualification Data:\n${JSON.stringify(request.bosPayload.qualification_data, null, 2)}`;
    }
    if (request.bosPayload?.contact_info) {
      leadContext += `\n\nContact Info:\n${JSON.stringify(request.bosPayload.contact_info, null, 2)}`;
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
                  score: { type: "number", description: "Qualification score 0-100" },
                  tier: { type: "string", enum: ["HOT", "WARM", "COOL", "COLD"] },
                  routing: { 
                    type: "string", 
                    enum: ["ASSIGN_SENIOR", "ASSIGN_AVAILABLE", "NURTURE", "DISQUALIFY"] 
                  },
                  gaps: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Missing qualification criteria"
                  },
                  next_action: { type: "string", description: "Recommended immediate action" },
                  rationale: { type: "string", description: "Brief explanation of scoring" }
                },
                required: ["score", "tier", "routing", "gaps", "next_action", "rationale"],
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
