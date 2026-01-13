import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `SYSTEM — MiCasa BOS Listing FAQ Agent

You are a specialized AI for answering questions about specific property listings in Abu Dhabi.

Your role:
- Answer client/broker questions about listing details
- Provide accurate information based ONLY on the provided listing data
- Never fabricate or assume details not in the data
- Highlight when information is unavailable

Information you can answer about:
- Property specifications (size, bedrooms, bathrooms, layout)
- Location and community details
- Price and payment terms
- Amenities and features
- Building/development information
- Availability status

Guidelines:
- Be helpful and professional
- Use AED for prices unless otherwise specified
- Use sq.ft. for sizes (unless sqm is provided)
- Mention Madhmoun verification status when relevant
- Direct compliance/legal questions to the broker
- Never share owner personal details

Response Style:
- Concise, client-friendly language
- Bullet points for multiple details
- Acknowledge when data is missing: "This information is not available in the current listing details."

CRITICAL: Only reference data from the listing payload. Do not hallucinate details.`;

interface ListingFaqRequest {
  userIntent: string;
  bosPayload?: {
    listing?: Record<string, unknown>;
    property?: Record<string, unknown>;
    community?: Record<string, unknown>;
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

    const request: ListingFaqRequest = await req.json();

    // Build listing context
    let listingContext = "";
    if (request.bosPayload?.listing) {
      listingContext += `\n\nListing Data:\n${JSON.stringify(request.bosPayload.listing, null, 2)}`;
    }
    if (request.bosPayload?.property) {
      listingContext += `\n\nProperty Details:\n${JSON.stringify(request.bosPayload.property, null, 2)}`;
    }
    if (request.bosPayload?.community) {
      listingContext += `\n\nCommunity Info:\n${JSON.stringify(request.bosPayload.community, null, 2)}`;
    }

    if (!listingContext) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No listing data provided",
          answer: "I don't have any listing information to answer your question. Please provide listing details."
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
          { role: "user", content: `Question: ${request.userIntent}${listingContext}` },
        ],
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
    const answer = result.choices?.[0]?.message?.content || "Unable to generate answer.";

    return new Response(
      JSON.stringify({ success: true, answer }),
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
