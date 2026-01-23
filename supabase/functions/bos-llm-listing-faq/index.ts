import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AI_MODELS } from "../_shared/models.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Optimized prompt for SLM - extractive, grounded
const SYSTEM_PROMPT = `You answer questions about property listings using ONLY the provided data.

RULES:
1. If the answer is in the listing data, quote it directly
2. If the answer is NOT in the data, say "This information is not available in the listing details"
3. Never invent prices, amenities, or features
4. Keep answers under 50 words
5. If complianceStatus ≠ APPROVED, add disclaimer: "Note: This listing is pending compliance review."

DATA SOURCE: The listing payload provided with each question.

OUTPUT: Use the answer_listing_faq tool. No text outside the tool call.`;

interface ListingFaqRequest {
  clientQuestion: string;
  listingPayload?: Record<string, unknown>;
  complianceStatus?: "APPROVED" | "BLOCKED" | "ESCALATED";
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

    const userMessage = `Question: ${request.clientQuestion}

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
        model: AI_MODELS.CLASSIFICATION,
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
                    description: "Client-ready answer (max 50 words)"
                  },
                  dataSource: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "List of BOS field paths used (e.g., 'listing.price')"
                  },
                  disclaimer: { 
                    type: "string",
                    nullable: true,
                    description: "Disclaimer if compliance status is not APPROVED, else null"
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

    const latency = Date.now() - startTime;
    console.log(`[BOS Listing FAQ] Model: ${AI_MODELS.CLASSIFICATION}, Latency: ${latency}ms`);

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
            ...faqResult,
            latencyMs: latency
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
        disclaimer: null,
        latencyMs: latency
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
