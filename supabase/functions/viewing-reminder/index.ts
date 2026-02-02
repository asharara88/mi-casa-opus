import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ViewingBooking {
  id: string;
  deal_id: string | null;
  prospect_id: string | null;
  listing_id: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  location: string | null;
  notes: string | null;
  reminder_sent: boolean;
  confirmation_sent: boolean;
}

interface ReminderResult {
  viewingId: string;
  status: 'sent' | 'failed' | 'skipped';
  error?: string;
}

// Message templates for viewing reminders
const REMINDER_TEMPLATES = {
  viewing_reminder_24h: {
    whatsapp: "Hi {{client_name}}! 📅 Reminder: Your property viewing is tomorrow at {{time}}. Location: {{location}}. Reply YES to confirm or call us to reschedule.",
    sms: "Reminder: Property viewing tomorrow at {{time}}. Location: {{location}}. Reply YES to confirm.",
  },
  viewing_confirmation: {
    whatsapp: "Your viewing is confirmed for {{date}} at {{time}}. Your agent will meet you at {{location}}. See you there! 🏠",
    sms: "Viewing confirmed: {{date}} at {{time}} at {{location}}.",
  },
  viewing_feedback: {
    whatsapp: "Thank you for the viewing today! 🏠 How would you rate your experience? Reply 1-5 (5 being excellent). Your feedback helps us improve!",
    sms: "Thanks for the viewing! Rate your experience 1-5. Reply with your score.",
  },
};

function formatDateTime(isoString: string): { date: string; time: string } {
  const date = new Date(isoString);
  return {
    date: date.toLocaleDateString('en-AE', { weekday: 'long', month: 'long', day: 'numeric' }),
    time: date.toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' }),
  };
}

async function sendTwilioMessage(
  channel: 'whatsapp' | 'sms',
  to: string,
  message: string,
  accountSid: string,
  authToken: string,
  fromNumber: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const formattedTo = channel === 'whatsapp' ? `whatsapp:${to}` : to;
  const formattedFrom = channel === 'whatsapp' ? `whatsapp:${fromNumber}` : fromNumber;

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  
  const formData = new URLSearchParams();
  formData.append('To', formattedTo);
  formData.append('From', formattedFrom);
  formData.append('Body', message);

  try {
    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || 'Twilio API error' };
    }

    return { success: true, sid: result.sid };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
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
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.warn('[viewing-reminder] Twilio not configured, running in dry-run mode');
    }

    // Use service role for scheduled job access
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Query upcoming viewings in the next 24 hours that haven't had reminders sent
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const { data: upcomingViewings, error: viewingsError } = await supabase
      .from('viewing_bookings')
      .select(`
        *,
        deals (
          id,
          deal_id,
          deal_economics
        ),
        prospects (
          id,
          full_name,
          phone,
          email
        ),
        listings (
          id,
          listing_id,
          listing_attributes
        )
      `)
      .gte('scheduled_at', now.toISOString())
      .lte('scheduled_at', in24Hours.toISOString())
      .eq('reminder_sent', false)
      .in('status', ['scheduled', 'confirmed']);

    if (viewingsError) {
      console.error('[viewing-reminder] Failed to fetch viewings:', viewingsError);
      throw new Error(`Failed to fetch upcoming viewings: ${viewingsError.message}`);
    }

    console.log(`[viewing-reminder] Found ${upcomingViewings?.length || 0} viewings to remind`);

    const results: ReminderResult[] = [];

    for (const viewing of upcomingViewings || []) {
      try {
        // Get contact info from prospect or deal
        const prospect = viewing.prospects as any;
        const deal = viewing.deals as any;
        const listing = viewing.listings as any;

        let clientName = 'Valued Client';
        let clientPhone = '';

        if (prospect) {
          clientName = prospect.full_name || clientName;
          clientPhone = prospect.phone || '';
        } else if (deal?.deal_economics?.client_name) {
          clientName = deal.deal_economics.client_name;
          clientPhone = deal.deal_economics.client_phone || '';
        }

        if (!clientPhone) {
          console.warn(`[viewing-reminder] No phone for viewing ${viewing.id}, skipping`);
          results.push({ viewingId: viewing.id, status: 'skipped', error: 'No phone number' });
          continue;
        }

        // Format the message
        const { date, time } = formatDateTime(viewing.scheduled_at);
        const location = viewing.location || listing?.listing_attributes?.address || 'TBD';
        const propertyName = listing?.listing_attributes?.title || 'Property';

        const message = REMINDER_TEMPLATES.viewing_reminder_24h.whatsapp
          .replace('{{client_name}}', clientName)
          .replace('{{time}}', time)
          .replace('{{location}}', location)
          .replace('{{property}}', propertyName);

        // Send the message
        if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
          const sendResult = await sendTwilioMessage(
            'whatsapp',
            clientPhone,
            message,
            TWILIO_ACCOUNT_SID,
            TWILIO_AUTH_TOKEN,
            TWILIO_PHONE_NUMBER
          );

          if (sendResult.success) {
            // Update viewing as reminder sent
            await supabase
              .from('viewing_bookings')
              .update({ reminder_sent: true })
              .eq('id', viewing.id);

            // Log the communication
            await supabase.from('communication_logs').insert({
              entity_type: viewing.deal_id ? 'deal' : 'prospect',
              entity_id: viewing.deal_id || viewing.prospect_id || viewing.id,
              channel: 'whatsapp',
              direction: 'outbound',
              template_used: 'viewing_reminder_24h',
              content: message,
              status: 'sent',
              external_id: sendResult.sid,
              sent_at: new Date().toISOString(),
              metadata: {
                viewing_id: viewing.id,
                scheduled_at: viewing.scheduled_at,
                twilio_sid: sendResult.sid,
              },
            });

            results.push({ viewingId: viewing.id, status: 'sent' });
            console.log(`[viewing-reminder] Sent reminder for viewing ${viewing.id}`);
          } else {
            results.push({ viewingId: viewing.id, status: 'failed', error: sendResult.error });
            console.error(`[viewing-reminder] Failed to send for ${viewing.id}:`, sendResult.error);
          }
        } else {
          // Dry run mode - just log
          console.log(`[viewing-reminder] DRY RUN - Would send to ${clientPhone}: ${message}`);
          results.push({ viewingId: viewing.id, status: 'skipped', error: 'Twilio not configured' });
        }
      } catch (error) {
        console.error(`[viewing-reminder] Error processing viewing ${viewing.id}:`, error);
        results.push({
          viewingId: viewing.id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const summary = {
      processed: results.length,
      sent: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status === 'failed').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      results,
    };

    console.log(`[viewing-reminder] Completed:`, summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[viewing-reminder] Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process viewing reminders',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
