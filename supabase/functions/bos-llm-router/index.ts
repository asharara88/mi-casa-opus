import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type OperationalMode = "OPS" | "LEAD_QUALIFY" | "LISTING_FAQ" | "MARKETING_COPY";

interface RouterRequest {
  modeHint?: OperationalMode | null;
  userIntent: string;
  contextType?: "listing" | "lead" | "transaction" | "marketing" | null;
  bosPayload: Record<string, unknown>;
  complianceResult?: Record<string, unknown>;
}

interface RouterResponse {
  selectedMode: OperationalMode;
}

// Infer mode from user intent when no hint is provided
function inferMode(userIntent: string, contextType?: string | null): OperationalMode {
  const intent = userIntent.toLowerCase();
  
  // Lead qualification patterns
  const leadPatterns = [
    "qualify", "score", "routing", "lead", "prospect",
    "buyer intent", "seller intent", "budget", "timeline",
    "ready to buy", "motivation", "pre-qualify"
  ];
  
  // Listing FAQ patterns
  const listingPatterns = [
    "what is", "tell me about", "how many", "bedrooms", "bathrooms",
    "price", "sqft", "square", "amenities", "features", "location",
    "community", "building", "floor", "view", "parking", "unit",
    "property details", "listing", "available"
  ];
  
  // Marketing copy patterns
  const marketingPatterns = [
    "write", "generate", "create", "ad", "advertisement", "copy",
    "headline", "description", "marketing", "promote", "social",
    "post", "caption", "email", "campaign", "tagline", "slogan"
  ];
  
  // Check context type first for strong signals
  if (contextType === "lead") {
    for (const pattern of leadPatterns) {
      if (intent.includes(pattern)) return "LEAD_QUALIFY";
    }
  }
  
  if (contextType === "marketing") {
    for (const pattern of marketingPatterns) {
      if (intent.includes(pattern)) return "MARKETING_COPY";
    }
  }
  
  // Pattern matching
  for (const pattern of leadPatterns) {
    if (intent.includes(pattern)) return "LEAD_QUALIFY";
  }
  
  for (const pattern of marketingPatterns) {
    if (intent.includes(pattern)) return "MARKETING_COPY";
  }
  
  // Listing FAQ needs both listing context and question patterns
  if (contextType === "listing") {
    for (const pattern of listingPatterns) {
      if (intent.includes(pattern)) return "LISTING_FAQ";
    }
  }
  
  // Default to OPS for anything else
  return "OPS";
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: RouterRequest = await req.json();
    
    // Validate required fields
    if (!request.userIntent) {
      return new Response(
        JSON.stringify({ error: "userIntent is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    let selectedMode: OperationalMode;

    // Rule 1: If modeHint is provided, use it directly
    if (request.modeHint) {
      const validModes: OperationalMode[] = ["OPS", "LEAD_QUALIFY", "LISTING_FAQ", "MARKETING_COPY"];
      if (validModes.includes(request.modeHint)) {
        selectedMode = request.modeHint;
      } else {
        selectedMode = "OPS"; // Fallback to OPS for invalid hints
      }
    } else {
      // Rule 2: Infer from userIntent and contextType
      selectedMode = inferMode(request.userIntent, request.contextType);
    }

    // Return the selected mode
    const response: RouterResponse = { selectedMode };

    console.log(`[BOS LLM Router] Intent: "${request.userIntent.substring(0, 50)}..." → Mode: ${selectedMode}`);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("[BOS LLM Router] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        selectedMode: "OPS" // Default fallback
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
