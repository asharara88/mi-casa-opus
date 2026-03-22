import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalWebhookPayload {
  triggerEvent: 'BOOKING_CREATED' | 'BOOKING_RESCHEDULED' | 'BOOKING_CANCELLED';
  createdAt: string;
  payload: {
    uid: string;
    eventTypeId: number;
    eventTypeName: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    location: string;
    status: string;
    attendees: Array<{
      email: string;
      name: string;
      timeZone: string;
    }>;
    organizer: {
      id: number;
      name: string;
      email: string;
      timeZone: string;
    };
    metadata?: {
      dealId?: string;
      prospectId?: string;
      listingId?: string;
    };
    rescheduleUid?: string;
    cancellationReason?: string;
  };
}

/**
 * Verify Cal.com webhook signature using the CAL_API_KEY as shared secret.
 * Cal.com signs webhooks with HMAC-SHA256 in the X-Cal-Signature-256 header.
 */
async function verifyCalSignature(
  body: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const hmac = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const hexDigest = Array.from(new Uint8Array(hmac))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return hexDigest === signature;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const CAL_API_KEY = Deno.env.get('CAL_API_KEY');

    // Read body as text for signature verification
    const bodyText = await req.text();

    if (!CAL_API_KEY) {
      console.error('CAL_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const signature = req.headers.get('X-Cal-Signature-256');
    const isValid = await verifyCalSignature(bodyText, signature, CAL_API_KEY);
    if (!isValid) {
      console.error('Invalid Cal.com webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const webhookPayload: CalWebhookPayload = JSON.parse(bodyText);
    const { triggerEvent, payload } = webhookPayload;

    console.log('Cal.com webhook verified:', triggerEvent, payload.uid);

    switch (triggerEvent) {
      case 'BOOKING_CREATED': {
        const start = new Date(payload.startTime);
        const end = new Date(payload.endTime);
        const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

        const { data: booking, error: bookingError } = await supabase
          .from('viewing_bookings')
          .insert({
            cal_booking_id: payload.uid,
            deal_id: payload.metadata?.dealId || null,
            prospect_id: payload.metadata?.prospectId || null,
            listing_id: payload.metadata?.listingId || null,
            scheduled_at: payload.startTime,
            duration_minutes: durationMinutes,
            status: 'scheduled',
            location: payload.location || null,
            notes: payload.description || null,
          })
          .select()
          .single();

        if (bookingError) {
          console.error('Error creating booking:', bookingError);
          throw bookingError;
        }

        console.log('Created viewing booking:', booking.id);

        if (payload.metadata?.prospectId && payload.attendees.length > 0) {
          const attendee = payload.attendees[0];
          try {
            await fetch(`${SUPABASE_URL}/functions/v1/sendgrid-email`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: 'transactional',
                to: [attendee.email],
                template: 'viewing_confirmation',
                variables: {
                  name: attendee.name,
                  property: payload.title,
                  date: new Date(payload.startTime).toLocaleDateString(),
                  time: new Date(payload.startTime).toLocaleTimeString(),
                  location: payload.location || 'TBD',
                  agent_name: payload.organizer.name,
                  phone: '+971 XX XXX XXXX',
                },
                entityType: 'prospect',
                entityId: payload.metadata.prospectId,
              }),
            });
          } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
          }
        }

        return new Response(
          JSON.stringify({ success: true, action: 'created', bookingId: booking.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'BOOKING_RESCHEDULED': {
        const { error: updateError } = await supabase
          .from('viewing_bookings')
          .update({
            scheduled_at: payload.startTime,
            status: 'rescheduled',
            notes: payload.description || null,
            location: payload.location || null,
            updated_at: new Date().toISOString(),
          })
          .eq('cal_booking_id', payload.rescheduleUid || payload.uid);

        if (updateError) {
          console.error('Error updating booking:', updateError);
          throw updateError;
        }

        return new Response(
          JSON.stringify({ success: true, action: 'rescheduled' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'BOOKING_CANCELLED': {
        const { error: cancelError } = await supabase
          .from('viewing_bookings')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            cancelled_reason: payload.cancellationReason || null,
            updated_at: new Date().toISOString(),
          })
          .eq('cal_booking_id', payload.uid);

        if (cancelError) {
          console.error('Error cancelling booking:', cancelError);
          throw cancelError;
        }

        return new Response(
          JSON.stringify({ success: true, action: 'cancelled' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: true, action: 'ignored', event: triggerEvent }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Error in cal-webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
