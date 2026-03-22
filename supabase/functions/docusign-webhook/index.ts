import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocuSignWebhookEvent {
  event: string;
  apiVersion: string;
  uri: string;
  retryCount: number;
  configurationId: number;
  generatedDateTime: string;
  data: {
    accountId: string;
    userId: string;
    envelopeId: string;
    envelopeSummary: {
      status: string;
      documentsUri: string;
      recipientsUri: string;
      envelopeUri: string;
      emailSubject: string;
      envelopeId: string;
      signingLocation: string;
      customFieldsUri: string;
      notificationUri: string;
      enableWetSign: string;
      allowMarkup: string;
      allowReassign: string;
      createdDateTime: string;
      lastModifiedDateTime: string;
      deliveredDateTime?: string;
      sentDateTime?: string;
      completedDateTime?: string;
      voidedDateTime?: string;
      voidedReason?: string;
      recipients: {
        signers: Array<{
          email: string;
          name: string;
          recipientId: string;
          recipientIdGuid: string;
          status: string;
          signedDateTime?: string;
          deliveredDateTime?: string;
        }>;
      };
    };
  };
}

const TEMPLATE_STAGE_AUTOMATION: Record<string, {
  secondaryState?: string;
  offplanState?: string;
  nextAction?: string;
}> = {
  '08_memorandum_of_understanding_pre_spa': {
    secondaryState: 'MOUSigned',
    nextAction: 'CollectDocs',
  },
  '07_offer_letter_expression_of_interest': {
    secondaryState: 'Negotiation',
    nextAction: 'PrepareOffer',
  },
  '09_reservation_booking_form': {
    secondaryState: 'Reserved',
    offplanState: 'Reserved',
    nextAction: 'CollectDeposit',
  },
};

/**
 * Verify DocuSign HMAC signature.
 * See: https://developers.docusign.com/platform/webhooks/connect/hmac/
 */
async function verifyDocuSignSignature(
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
  const computedSignature = btoa(String.fromCharCode(...new Uint8Array(hmac)));
  return computedSignature === signature;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const DOCUSIGN_WEBHOOK_SECRET = Deno.env.get('DOCUSIGN_WEBHOOK_SECRET');

    // Read body as text first for signature verification
    const bodyText = await req.text();

    // Verify DocuSign HMAC signature if secret is configured
    if (DOCUSIGN_WEBHOOK_SECRET) {
      const signature = req.headers.get('X-DocuSign-Signature-1');
      const isValid = await verifyDocuSignSignature(bodyText, signature, DOCUSIGN_WEBHOOK_SECRET);
      if (!isValid) {
        console.error('Invalid DocuSign webhook signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.warn('DOCUSIGN_WEBHOOK_SECRET not configured — skipping signature verification');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const webhookEvent: DocuSignWebhookEvent = JSON.parse(bodyText);
    const { event, data } = webhookEvent;
    const { envelopeId, envelopeSummary } = data;

    console.log('DocuSign webhook verified:', event, envelopeId);

    // Find the envelope in our database
    const { data: envelope, error: findError } = await supabase
      .from('signature_envelopes')
      .select('*')
      .eq('docusign_envelope_id', envelopeId)
      .single();

    if (findError || !envelope) {
      console.error('Envelope not found:', envelopeId);
      return new Response(
        JSON.stringify({ success: true, message: 'Envelope not found, ignoring' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const statusMap: Record<string, string> = {
      'sent': 'Pending',
      'delivered': 'Pending',
      'signed': 'Pending',
      'completed': 'Executed',
      'declined': 'Declined',
      'voided': 'Voided',
    };

    const updatedSigners = (envelope.signers as any[]).map(signer => {
      const docuSignSigner = envelopeSummary.recipients?.signers?.find(
        s => s.email.toLowerCase() === signer.email.toLowerCase()
      );
      if (docuSignSigner) {
        return {
          ...signer,
          status: docuSignSigner.status,
          signedAt: docuSignSigner.signedDateTime || signer.signedAt,
          deliveredAt: docuSignSigner.deliveredDateTime || signer.deliveredAt,
        };
      }
      return signer;
    });

    const updateData: Record<string, any> = {
      docusign_status: envelopeSummary.status,
      signers: updatedSigners,
      status: statusMap[envelopeSummary.status] || envelope.status,
    };

    if (envelopeSummary.completedDateTime) {
      updateData.completed_at = envelopeSummary.completedDateTime;
    }
    if (envelopeSummary.voidedDateTime) {
      updateData.voided_at = envelopeSummary.voidedDateTime;
      updateData.void_reason = envelopeSummary.voidedReason;
    }

    const { error: updateError } = await supabase
      .from('signature_envelopes')
      .update(updateData)
      .eq('id', envelope.id);

    if (updateError) {
      console.error('Error updating envelope:', updateError);
      throw updateError;
    }

    // If completed, update document instance and trigger deal stage automation
    if (envelopeSummary.status === 'completed' && envelope.document_instance_id) {
      await supabase
        .from('document_instances')
        .update({
          status: 'Executed',
          executed_at: envelopeSummary.completedDateTime,
        })
        .eq('id', envelope.document_instance_id);

      const { data: docInstance } = await supabase
        .from('document_instances')
        .select('entity_type, entity_id, data_snapshot')
        .eq('id', envelope.document_instance_id)
        .single();

      if (docInstance?.entity_type === 'deal' && docInstance.entity_id) {
        const dataSnapshot = docInstance.data_snapshot as Record<string, any>;
        const templateId = dataSnapshot?.template_id || '';
        const automation = TEMPLATE_STAGE_AUTOMATION[templateId];
        if (automation) {
          console.log(`Triggering stage automation for deal ${docInstance.entity_id}:`, automation);
          const { data: deal } = await supabase
            .from('deals')
            .select('pipeline, deal_type')
            .eq('id', docInstance.entity_id)
            .single();

          if (deal) {
            const dealUpdate: Record<string, any> = {};
            if (deal.pipeline === 'secondary' && automation.secondaryState) {
              dealUpdate.secondary_state = automation.secondaryState;
            } else if (deal.pipeline === 'offplan' && automation.offplanState) {
              dealUpdate.offplan_state = automation.offplanState;
            }
            if (automation.nextAction) {
              dealUpdate.next_action = automation.nextAction;
            }
            if (Object.keys(dealUpdate).length > 0) {
              await supabase.from('deals').update(dealUpdate).eq('id', docInstance.entity_id);
              console.log(`Deal ${docInstance.entity_id} advanced:`, dealUpdate);
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, envelopeId, newStatus: envelopeSummary.status }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in docusign-webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
