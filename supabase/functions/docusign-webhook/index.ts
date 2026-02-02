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

/**
 * Maps template IDs to deal state changes when documents are executed.
 * This enables automatic funnel stage advancement on signature completion.
 */
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const webhookEvent: DocuSignWebhookEvent = await req.json();
    const { event, data } = webhookEvent;
    const { envelopeId, envelopeSummary } = data;

    console.log('DocuSign webhook received:', event, envelopeId);

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

    // Map DocuSign status to our status
    const statusMap: Record<string, string> = {
      'sent': 'Pending',
      'delivered': 'Pending',
      'signed': 'Pending',
      'completed': 'Executed',
      'declined': 'Declined',
      'voided': 'Voided',
    };

    // Update signer statuses
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

    // Prepare update
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

    // Update envelope
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
      // Update document instance status
      await supabase
        .from('document_instances')
        .update({
          status: 'Executed',
          executed_at: envelopeSummary.completedDateTime,
        })
        .eq('id', envelope.document_instance_id);

      // Get the document instance to find the deal and template
      const { data: docInstance } = await supabase
        .from('document_instances')
        .select('entity_type, entity_id, data_snapshot')
        .eq('id', envelope.document_instance_id)
        .single();

      if (docInstance?.entity_type === 'deal' && docInstance.entity_id) {
        // Check if template triggers stage automation
        const dataSnapshot = docInstance.data_snapshot as Record<string, any>;
        const templateId = dataSnapshot?.template_id || '';
        
        const automation = TEMPLATE_STAGE_AUTOMATION[templateId];
        if (automation) {
          console.log(`Triggering stage automation for deal ${docInstance.entity_id}:`, automation);
          
          // Get current deal to determine pipeline type
          const { data: deal } = await supabase
            .from('deals')
            .select('pipeline, deal_type')
            .eq('id', docInstance.entity_id)
            .single();

          if (deal) {
            const dealUpdate: Record<string, any> = {};
            
            // Apply stage change based on pipeline type
            if (deal.pipeline === 'secondary' && automation.secondaryState) {
              dealUpdate.secondary_state = automation.secondaryState;
            } else if (deal.pipeline === 'offplan' && automation.offplanState) {
              dealUpdate.offplan_state = automation.offplanState;
            }
            
            if (automation.nextAction) {
              dealUpdate.next_action = automation.nextAction;
            }

            if (Object.keys(dealUpdate).length > 0) {
              await supabase
                .from('deals')
                .update(dealUpdate)
                .eq('id', docInstance.entity_id);

              console.log(`Deal ${docInstance.entity_id} advanced:`, dealUpdate);
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        envelopeId, 
        newStatus: envelopeSummary.status 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in docusign-webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed', details: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
