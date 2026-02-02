import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MessageRequest {
  channel: 'whatsapp' | 'sms';
  to: string;
  template?: string;
  content?: string;
  variables?: Record<string, string>;
  entityType: 'prospect' | 'lead' | 'deal';
  entityId: string;
  subject?: string;
}

// Predefined message templates
const messageTemplates: Record<string, { whatsapp: string; sms: string }> = {
  new_listing_alert: {
    whatsapp: "Hi {{name}}! 🏠 We have a new property that matches your preferences: *{{property}}*. Would you like to schedule a viewing? Reply YES to learn more.",
    sms: "Hi {{name}}! New property match: {{property}}. Interested? Reply YES for details.",
  },
  viewing_reminder: {
    whatsapp: "Hi {{name}}! 📅 Reminder: Your property viewing for *{{property}}* is scheduled for {{datetime}}. Location: {{location}}. See you there!",
    sms: "Reminder: Viewing for {{property}} on {{datetime}} at {{location}}.",
  },
  viewing_reminder_24h: {
    whatsapp: "Hi {{name}}! 📅 Reminder: Your property viewing is tomorrow at {{time}}. Location: {{location}}. Reply YES to confirm or call us to reschedule.",
    sms: "Reminder: Property viewing tomorrow at {{time}}. Location: {{location}}. Reply YES to confirm.",
  },
  viewing_confirmation: {
    whatsapp: "✅ Your viewing is confirmed for *{{date}}* at *{{time}}*. Your agent {{agent_name}} will meet you at {{location}}. See you there! 🏠",
    sms: "Viewing confirmed: {{date}} at {{time}} at {{location}}.",
  },
  viewing_scheduled: {
    whatsapp: "Hi {{name}}! 🗓️ Great news! Your viewing for *{{property}}* has been scheduled for *{{date}}* at *{{time}}*. Location: {{location}}. We'll send you a reminder 24 hours before.",
    sms: "Viewing scheduled: {{property}} on {{date}} at {{time}}. Location: {{location}}.",
  },
  viewing_rescheduled: {
    whatsapp: "Hi {{name}}! 📅 Your viewing for *{{property}}* has been rescheduled to *{{date}}* at *{{time}}*. Location: {{location}}. Reply YES to confirm.",
    sms: "Viewing rescheduled: {{property}} now on {{date}} at {{time}} at {{location}}.",
  },
  viewing_cancelled: {
    whatsapp: "Hi {{name}}, your viewing for *{{property}}* on {{date}} has been cancelled. {{reason}} Would you like to reschedule? Reply YES.",
    sms: "Viewing cancelled: {{property}} on {{date}}. Reply YES to reschedule.",
  },
  viewing_feedback: {
    whatsapp: "Hi {{name}}! 🏠 Thank you for viewing *{{property}}* today! On a scale of 1-5, how interested are you in this property? (1=Not interested, 5=Very interested). Your feedback helps us find you the perfect home!",
    sms: "Thanks for viewing {{property}}! Rate your interest 1-5. Reply with your score.",
  },
  viewing_feedback_followup: {
    whatsapp: "Hi {{name}}! 👋 Following up on your viewing of *{{property}}*. You rated your interest as {{score}}/5. {{followup_message}} Let me know how I can help!",
    sms: "Following up on {{property}} viewing ({{score}}/5). {{followup_message}}",
  },
  viewing_no_show: {
    whatsapp: "Hi {{name}}, we noticed you weren't able to make it to your viewing for *{{property}}* today. No worries! Would you like to reschedule? Reply YES or let us know if you're no longer interested.",
    sms: "Missed your viewing for {{property}}? Reply YES to reschedule.",
  },
  follow_up: {
    whatsapp: "Hi {{name}}! 👋 Following up on our conversation about *{{property}}*. Do you have any questions? I'm happy to help!",
    sms: "Hi {{name}}, following up on {{property}}. Any questions? Let me know!",
  },
  document_request: {
    whatsapp: "Hi {{name}}! 📄 To proceed with your booking, we need the following documents: {{documents}}. Please share at your earliest convenience.",
    sms: "Hi {{name}}, please share required documents: {{documents}}. Thanks!",
  },
  booking_confirmation: {
    whatsapp: "🎉 Congratulations {{name}}! Your booking for *{{property}}* is confirmed. Our team will be in touch with next steps.",
    sms: "Congrats {{name}}! Booking confirmed for {{property}}. We'll be in touch soon.",
  },
  eoi_payment_reminder: {
    whatsapp: "Hi {{name}}! 💰 Friendly reminder: The EOI payment for *{{property}}* is due by {{date}}. Amount: AED {{amount}}. Please complete the payment to secure your booking.",
    sms: "EOI payment reminder for {{property}}: AED {{amount}} due {{date}}.",
  },
  eoi_payment_received: {
    whatsapp: "Hi {{name}}! ✅ We've received your EOI payment of AED {{amount}} for *{{property}}*. Reference: {{reference}}. Our team will be in touch with next steps.",
    sms: "EOI payment received: AED {{amount}} for {{property}}. Ref: {{reference}}.",
  },
  noc_status_update: {
    whatsapp: "Hi {{name}}! 📋 Update on your NOC for *{{property}}*: Status is now *{{status}}*. {{details}} We'll keep you posted on any progress.",
    sms: "NOC update for {{property}}: {{status}}. {{details}}",
  },
  deal_milestone: {
    whatsapp: "Hi {{name}}! 🎯 Great progress on *{{property}}*! You've reached the *{{milestone}}* stage. {{next_steps}}",
    sms: "Deal update for {{property}}: {{milestone}} stage reached. {{next_steps}}",
  },
};

function applyTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

function formatPhoneNumber(phone: string, channel: 'whatsapp' | 'sms'): string {
  // Remove any non-digit characters except +
  let formatted = phone.replace(/[^\d+]/g, '');
  
  // Ensure it starts with +
  if (!formatted.startsWith('+')) {
    formatted = '+' + formatted;
  }
  
  // For WhatsApp, prefix with whatsapp:
  if (channel === 'whatsapp') {
    return `whatsapp:${formatted}`;
  }
  
  return formatted;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio credentials not configured');
    }

    // SECURITY: Validate authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[twilio-messaging] Auth validation failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[twilio-messaging] Authenticated user: ${user.id}`);

    const body: MessageRequest = await req.json();
    const { channel, to, template, content, variables = {}, entityType, entityId, subject } = body;

    // Determine message content
    let messageContent: string;
    if (template && messageTemplates[template]) {
      messageContent = applyTemplate(messageTemplates[template][channel], variables);
    } else if (content) {
      messageContent = applyTemplate(content, variables);
    } else {
      throw new Error('Either template or content must be provided');
    }

    // Format phone number
    const formattedTo = formatPhoneNumber(to, channel);
    const formattedFrom = channel === 'whatsapp' 
      ? `whatsapp:${TWILIO_PHONE_NUMBER}` 
      : TWILIO_PHONE_NUMBER;

    // Send message via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('To', formattedTo);
    formData.append('From', formattedFrom);
    formData.append('Body', messageContent);

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const twilioResult = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Twilio error:', twilioResult);
      
      // Log failed message
      await supabase.from('communication_logs').insert({
        entity_type: entityType,
        entity_id: entityId,
        channel: channel,
        direction: 'outbound',
        template_used: template || null,
        subject: subject || null,
        content: messageContent,
        status: 'failed',
        error_message: twilioResult.message || 'Unknown error',
        metadata: { twilio_error: twilioResult },
        created_by: user.id,
      });

      throw new Error(twilioResult.message || 'Failed to send message');
    }

    // Log successful message
    const { data: logData, error: logError } = await supabase
      .from('communication_logs')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        channel: channel,
        direction: 'outbound',
        template_used: template || null,
        subject: subject || null,
        content: messageContent,
        status: 'sent',
        external_id: twilioResult.sid,
        sent_at: new Date().toISOString(),
        metadata: { 
          twilio_sid: twilioResult.sid,
          to: to,
        },
        created_by: user.id,
      })
      .select()
      .single();

    if (logError) {
      console.error('Error logging message:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageSid: twilioResult.sid,
        status: twilioResult.status,
        logId: logData?.id,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in twilio-messaging:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send message', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
