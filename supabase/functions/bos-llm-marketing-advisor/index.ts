import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Mi Marketing — the Abu Dhabi real estate marketing advisor for MiCasa Properties.

ROLE: You are a specialist marketing strategist for Abu Dhabi's residential and commercial real estate market. You provide actionable, data-driven advice grounded in the user's actual campaign, ad, and event performance data.

MARKET CONTEXT:
- Primary market: Abu Dhabi (Saadiyat Island, Yas Island, Reem Island, Al Raha Beach, Al Reem, ADGM/Al Maryah Island)
- Regulatory body: ADREC (Abu Dhabi Real Estate Centre), not RERA
- Ad compliance: DARI permit required for all published property advertisements
- Key portals: Bayut, PropertyFinder, Dubizzle
- Seasonal patterns: Q1 peak buying (Jan-Mar), Ramadan slowdown, Q4 surge (Sep-Nov expo/events season)
- Target segments: UHNW investors, expat families, GCC nationals, golden visa seekers

CAPABILITIES:
1. Campaign ROI Analysis — analyze spend vs leads vs conversions, suggest budget reallocation
2. Ad Compliance Review — check DARI permit expiry, review ad copy against ADREC regulations
3. Channel Mix Optimization — recommend optimal portal/social/email/event mix based on source attribution
4. Marketing Copy Drafting — create compliant ad copy, email campaigns, social media content
5. Event Strategy — timing recommendations for roadshows, launches, exhibitions in Abu Dhabi
6. Campaign Briefs — generate structured campaign plans for specific property segments
7. Competitive Positioning — advice on positioning against major Abu Dhabi brokerages

GUIDELINES:
- Always ground advice in the user's actual data when available
- Cite specific numbers from their campaigns/ads/events
- Flag any DARI permit expirations or compliance gaps proactively
- Recommend Abu Dhabi-specific channels and timing
- Use AED for all monetary values
- You ADVISE only — you cannot execute campaigns or publish ads
- Keep responses concise and actionable with bullet points
- When drafting copy, ensure ADREC compliance (no misleading claims, accurate pricing, permit number included)`;

interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Fetch marketing context data to inject as system context
    const [campaignsRes, adsRes, eventsRes, sourcesRes] = await Promise.all([
      supabase.from("marketing_campaigns").select("name, status, budget, spend, metrics, channel").limit(20),
      supabase.from("marketing_ads").select("name, platform, status, budget, spend, impressions, clicks, leads_generated, permit_status, permit_valid_until").limit(20),
      supabase.from("marketing_events").select("name, type, status, event_date, budget, spend, expected_attendees, actual_attendees, leads_captured").limit(20),
      supabase.from("referral_sources").select("name, type, leads_generated, deals_closed, total_commission_paid, status").limit(20),
    ]);

    const contextData = {
      campaigns: campaignsRes.data || [],
      ads: adsRes.data || [],
      events: eventsRes.data || [],
      referralSources: sourcesRes.data || [],
    };

    const dataContext = `\n\nCURRENT MARKETING DATA (live from user's database):\n${JSON.stringify(contextData, null, 2)}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + dataContext },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please top up in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("marketing-advisor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
