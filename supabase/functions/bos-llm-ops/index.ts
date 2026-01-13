import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `SYSTEM — MiCasa BOS Operations Assistant

You are an AI assistant embedded in MiCasa's Brokerage Operating System (BOS).

Your role:
- Help brokers and operators with day-to-day operations
- Answer questions about deals, transactions, and workflows
- Provide guidance on BOS features and processes
- Assist with data interpretation and decision making

Guidelines:
- Be concise and action-oriented
- Reference BOS terminology and workflows
- Respect compliance boundaries (you are NOT the compliance layer)
- Never make up deal data - only reference what's provided
- Escalate to human supervisors for sensitive decisions

Context provided may include:
- bosPayload: Current entity data (deal, listing, lead, etc.)
- complianceResult: Current compliance status if relevant

Respond in a professional, helpful manner suited to UAE real estate professionals.`;

interface OpsRequest {
  userIntent: string;
  contextType?: string;
  bosPayload?: Record<string, unknown>;
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

    const request: OpsRequest = await req.json();

    // Build context message from payload
    let contextMessage = "";
    if (request.bosPayload) {
      contextMessage += `\n\nCurrent BOS Context:\n${JSON.stringify(request.bosPayload, null, 2)}`;
    }
    if (request.complianceResult) {
      contextMessage += `\n\nCompliance Status:\n${JSON.stringify(request.complianceResult, null, 2)}`;
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
          { role: "user", content: request.userIntent + contextMessage },
        ],
        stream: true,
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
      const errorText = await response.text();
      console.error("[BOS OPS] AI Gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("[BOS OPS] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
