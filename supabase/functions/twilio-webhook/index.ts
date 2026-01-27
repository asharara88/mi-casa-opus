import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Parse form data from Twilio webhook
    const formData = await req.formData();
    const messageSid = formData.get('MessageSid') as string;
    const messageStatus = formData.get('MessageStatus') as string;
    const errorCode = formData.get('ErrorCode') as string;
    const errorMessage = formData.get('ErrorMessage') as string;

    console.log('Twilio webhook received:', messageSid, messageStatus);

    if (!messageSid) {
      return new Response(
        JSON.stringify({ success: true, message: 'No message SID provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map Twilio status to our status
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

    // Find and update the communication log
    const updateData: Record<string, any> = {
      status: newStatus,
    };

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

    // Return empty 200 response for Twilio
    return new Response('', { 
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Error in twilio-webhook:', error);
    // Still return 200 to prevent Twilio retries
    return new Response('', { 
      status: 200,
      headers: corsHeaders,
    });
  }
});
