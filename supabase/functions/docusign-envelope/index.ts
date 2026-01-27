import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Signer {
  email: string;
  name: string;
  role: string; // 'buyer', 'seller', 'broker'
  order?: number;
}

interface EnvelopeRequest {
  documentInstanceId: string;
  signers: Signer[];
  emailSubject?: string;
  emailMessage?: string;
}

async function getDocuSignAccessToken(): Promise<string> {
  const DOCUSIGN_INTEGRATION_KEY = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
  const DOCUSIGN_API_ACCOUNT_ID = Deno.env.get('DOCUSIGN_API_ACCOUNT_ID');
  const DOCUSIGN_RSA_PRIVATE_KEY = Deno.env.get('DOCUSIGN_RSA_PRIVATE_KEY');

  if (!DOCUSIGN_INTEGRATION_KEY || !DOCUSIGN_API_ACCOUNT_ID || !DOCUSIGN_RSA_PRIVATE_KEY) {
    throw new Error('DocuSign credentials not configured');
  }

  // For demo purposes, we'll use a simplified JWT auth flow
  // In production, you'd implement proper JWT assertion
  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    iss: DOCUSIGN_INTEGRATION_KEY,
    sub: DOCUSIGN_API_ACCOUNT_ID,
    aud: 'account-d.docusign.com',
    iat: now,
    exp: now + 3600,
    scope: 'signature impersonation',
  };

  // Note: In production, you'd sign this JWT with the RSA private key
  // For now, we'll throw an error to indicate this needs proper implementation
  throw new Error('DocuSign JWT authentication requires proper RSA signing implementation');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const DOCUSIGN_API_ACCOUNT_ID = Deno.env.get('DOCUSIGN_API_ACCOUNT_ID');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const body: EnvelopeRequest = await req.json();
    const { documentInstanceId, signers, emailSubject, emailMessage } = body;

    // Get document instance
    const { data: docInstance, error: docError } = await supabase
      .from('document_instances')
      .select('*, document_templates(*)')
      .eq('id', documentInstanceId)
      .single();

    if (docError || !docInstance) {
      throw new Error('Document instance not found');
    }

    // Check if there's already an envelope
    const { data: existingEnvelope } = await supabase
      .from('signature_envelopes')
      .select('*')
      .eq('document_instance_id', documentInstanceId)
      .single();

    if (existingEnvelope?.docusign_envelope_id) {
      throw new Error('Envelope already exists for this document');
    }

    // For demo mode, create a mock envelope
    const mockEnvelopeId = `ENV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create or update signature envelope record
    const envelopeData = {
      envelope_id: mockEnvelopeId,
      document_instance_id: documentInstanceId,
      docusign_envelope_id: mockEnvelopeId,
      docusign_status: 'sent',
      signers: signers.map((s, i) => ({
        ...s,
        order: s.order || i + 1,
        status: 'sent',
        signedAt: null,
      })),
      status: 'Pending',
      sent_at: new Date().toISOString(),
    };

    let envelopeRecord;
    if (existingEnvelope) {
      const { data, error } = await supabase
        .from('signature_envelopes')
        .update(envelopeData)
        .eq('id', existingEnvelope.id)
        .select()
        .single();
      
      if (error) throw error;
      envelopeRecord = data;
    } else {
      const { data, error } = await supabase
        .from('signature_envelopes')
        .insert(envelopeData)
        .select()
        .single();
      
      if (error) throw error;
      envelopeRecord = data;
    }

    // Update document instance status
    await supabase
      .from('document_instances')
      .update({ status: 'PendingSignature' })
      .eq('id', documentInstanceId);

    // In production, you would:
    // 1. Get DocuSign access token
    // 2. Create envelope with document and signers
    // 3. Store the real envelope ID
    // 4. Set up webhook for status updates

    return new Response(
      JSON.stringify({
        success: true,
        envelopeId: mockEnvelopeId,
        status: 'sent',
        signers: signers.length,
        message: 'Demo mode: Envelope created (DocuSign integration requires production setup)',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in docusign-envelope:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create envelope', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
