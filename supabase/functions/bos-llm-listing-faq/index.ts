import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `SYSTEM — MiCasa BOS Listing FAQ Assistant

You are the Listing FAQ Assistant inside MiCasa BOS.

You answer questions about a specific listing using ONLY verified BOS data.

Your output is client-ready and can be copy-pasted to WhatsApp or email.

You do NOT:
- Guess missing details
- Discuss internal notes
- Override compliance status
- Confirm availability unless explicitly stated in BOS

RESPONSE RULES:
- If data exists → answer clearly
- If data is missing → say it's not yet confirmed
- If complianceStatus ≠ APPROVED → add a soft disclaimer
- Be concise, professional, and neutral

EXAMPLES of allowed responses:
- "The unit is approximately 145 sqm as per the latest verified records."

NOT allowed:
- "This should be available"
- "Usually these go fast"

CRITICAL: Only reference data from the listing payload. Do not hallucinate details.`;

interface ListingFaqRequest {
  clientQuestion: string;
  listingPayload?: Record<string, unknown>;
  complianceStatus?: "APPROVED" | "BLOCKED" | "ESCALATED";
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

    const request: ListingFaqRequest = await req.json();

    if (!request.listingPayload) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No listing data provided",
          answer: "I don't have any listing information to answer your question. Please provide listing details.",
          dataSource: [],
          disclaimer: null
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const complianceStatus = request.complianceStatus || "APPROVED";
    const listingContext = JSON.stringify(request.listingPayload, null, 2);

    const userMessage = `Client Question: ${request.clientQuestion}

Compliance Status: ${complianceStatus}

Listing Data:
${listingContext}`;

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
              name: "answer_listing_faq",
              description: "Return structured answer to listing FAQ",
              parameters: {
                type: "object",
                properties: {
                  answer: { 
                    type: "string",
                    description: "Client-ready answer that can be copy-pasted to WhatsApp or email"
                  },
                  dataSource: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "List of BOS field paths used to generate the answer (e.g., 'listing.price', 'property.sqft')"
                  },
                  disclaimer: { 
                    type: "string",
                    nullable: true,
                    description: "Soft disclaimer if compliance status is not APPROVED, or null if no disclaimer needed"
                  }
                },
                required: ["answer", "dataSource", "disclaimer"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "answer_listing_faq" } }
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
      try {
        const faqResult = JSON.parse(toolCall.function.arguments);
        return new Response(
          JSON.stringify({ 
            success: true, 
            ...faqResult 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch {
        // Fallback if JSON parsing fails
      }
    }

    // Fallback to content if tool call didn't work
    const content = result.choices?.[0]?.message?.content || "Unable to generate answer.";
    return new Response(
      JSON.stringify({ 
        success: true, 
        answer: content,
        dataSource: [],
        disclaimer: null
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[BOS Listing FAQ] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
