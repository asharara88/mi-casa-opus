import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type FollowUpType = 
  | 'viewing_followup' 
  | 'general_checkin' 
  | 'document_reminder' 
  | 'offer_followup' 
  | 'hot_lead_reengagement'
  | 'deal_milestone';

type Channel = 'whatsapp' | 'sms' | 'email';
type EntityType = 'prospect' | 'lead' | 'deal';

interface FollowUpRequest {
  entityType: EntityType;
  entityData: Record<string, unknown>;
  communicationHistory?: Array<{
    channel: string;
    content: string;
    direction: string;
    created_at: string;
  }>;
  channel: Channel;
  followUpType: FollowUpType;
  agentNotes?: string;
}

interface FollowUpResponse {
  subject?: string;
  message: string;
  tone: string;
  urgency: 'low' | 'medium' | 'high';
  suggested_timing: string;
  personalization_elements: string[];
}

const SYSTEM_PROMPT = `You are a professional real estate follow-up message composer for Mi Casa Properties (Abu Dhabi).

Generate personalized, culturally appropriate follow-up messages that:
1. Reference specific details from the client's history (property viewed, budget, requirements)
2. Maintain professional yet warm UAE business tone
3. Include a clear call-to-action
4. Are appropriate length for the channel:
   - WhatsApp: 150-300 characters, 1-2 emojis max
   - SMS: Under 160 characters, extremely concise
   - Email: 2-3 short paragraphs with professional greeting

NEVER:
- Be pushy or aggressive
- Make promises about prices or availability
- Include false urgency
- Use ALL CAPS or excessive emojis
- Use generic greetings like "Dear Valued Customer"

CHANNEL-SPECIFIC GUIDELINES:
- WhatsApp: Use 1-2 relevant emojis, informal but professional, conversational tone
- SMS: Extremely concise, include callback number if space allows
- Email: Professional greeting (Hi [FirstName]), structured paragraphs, close with agent name

FOLLOW-UP TYPES:
- viewing_followup: Reference the property viewed, ask about interest level, offer second viewing
- general_checkin: Warm re-engagement after period of no contact, ask if requirements changed
- document_reminder: Gentle nudge about pending documents, offer to help with any questions
- offer_followup: Follow up on submitted offer, gauge interest in negotiation
- hot_lead_reengagement: Re-engage high-potential lead who went cold, create urgency without pressure
- deal_milestone: Congratulate on progress, explain next steps clearly

You MUST respond with valid JSON matching this exact structure:
{
  "subject": "string (only for email, omit for WhatsApp/SMS)",
  "message": "string (the actual message content)",
  "tone": "string (e.g., professional_friendly, warm_casual, formal_respectful)",
  "urgency": "low | medium | high",
  "suggested_timing": "string (e.g., morning, afternoon, evening)",
  "personalization_elements": ["array", "of", "elements", "used"]
}`;

function buildUserPrompt(request: FollowUpRequest): string {
  const { entityType, entityData, communicationHistory, channel, followUpType, agentNotes } = request;
  
  let prompt = `Generate a ${followUpType.replace('_', ' ')} message for ${channel.toUpperCase()}.

ENTITY TYPE: ${entityType}
ENTITY DATA:
${JSON.stringify(entityData, null, 2)}
`;

  if (communicationHistory && communicationHistory.length > 0) {
    prompt += `
RECENT COMMUNICATION (last ${communicationHistory.length} messages):
${communicationHistory.map(msg => `- [${msg.direction}] via ${msg.channel} (${msg.created_at}): "${msg.content.slice(0, 100)}..."`).join('\n')}
`;
  }

  if (agentNotes) {
    prompt += `
AGENT NOTES: ${agentNotes}
`;
  }

  prompt += `
Generate a personalized ${channel} message appropriate for this ${followUpType.replace('_', ' ')} scenario.
Remember: ${channel === 'sms' ? 'Keep under 160 characters!' : channel === 'whatsapp' ? 'Keep between 150-300 characters with 1-2 emojis.' : 'Use professional email format with greeting and signature.'}`;

  return prompt;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // SECURITY: Validate authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: authHeader } },
    });
    
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      console.error('[BOS LLM FOLLOWUP] Auth validation failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[BOS LLM FOLLOWUP] Authenticated user: ${user.id}`);

    const request: FollowUpRequest = await req.json();
    
    // Validate required fields
    if (!request.entityType || !request.entityData || !request.channel || !request.followUpType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: entityType, entityData, channel, followUpType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userPrompt = buildUserPrompt(request);

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
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("[BOS LLM FOLLOWUP] AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON response from AI
    let followUpResponse: FollowUpResponse;
    try {
      // Handle potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonContent = jsonMatch[1]?.trim() || content.trim();
      followUpResponse = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("[BOS LLM FOLLOWUP] Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    console.log(`[BOS LLM FOLLOWUP] Generated ${request.channel} message for ${request.entityType}`);

    return new Response(
      JSON.stringify(followUpResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[BOS LLM FOLLOWUP] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
