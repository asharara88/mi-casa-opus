import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Validate Twilio request signature.
 * See: https://www.twilio.com/docs/usage/security#validating-requests
 */
async function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>,
  authToken: string
): Promise<boolean> {
  // Build the data string: URL + sorted params concatenated
  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const key of sortedKeys) {
    data += key + params[key];
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(authToken),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const computedSignature = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return computedSignature === signature;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');

    // Validate Twilio signature
    const twilioSignature = req.headers.get('X-Twilio-Signature');
    if (!twilioSignature || !TWILIO_AUTH_TOKEN) {
      console.error('Missing Twilio signature or auth token');
      return new Response('', { status: 403, headers: corsHeaders });
    }

    // Parse form data
    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value as string;
    });

    // Use the request URL for signature validation
    const requestUrl = req.url;
    const isValid = await validateTwilioSignature(twilioSignature, requestUrl, params, TWILIO_AUTH_TOKEN);
    if (!isValid) {
      console.error('Invalid Twilio signature');
      return new Response('', { status: 403, headers: corsHeaders });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const messageSid = params['MessageSid'];
    const messageStatus = params['MessageStatus'];
    const errorCode = params['ErrorCode'];
    const errorMessage = params['ErrorMessage'];

    console.log('Twilio webhook verified:', messageSid, messageStatus);

    if (!messageSid) {
      return new Response('', { status: 200, headers: corsHeaders });
    }

    const statusMap: Record<string, string> = {
      'queued': 'pending',
      'sending': 'pending',
      'sent': 'sent',
      'delivered': 'delivered',
      'read': 'read',
      'failed': 'failed',
      'undelivered': 'failed',
    };

    const newStatus = statusMap[messageStatus] || 'sent';

    const updateData: Record<string, any> = { status: newStatus };

    if (messageStatus === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }
    if (messageStatus === 'read') {
      updateData.read_at = new Date().toISOString();
    }
    if (messageStatus === 'failed' || messageStatus === 'undelivered') {
      updateData.error_message = errorMessage || `Error code: ${errorCode}`;
    }

    const { error: updateError } = await supabase
      .from('communication_logs')
      .update(updateData)
      .eq('external_id', messageSid);

    if (updateError) {
      console.error('Error updating communication log:', updateError);
    }

    return new Response('', { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Error in twilio-webhook:', error);
    return new Response('', { status: 200, headers: corsHeaders });
  }
});
