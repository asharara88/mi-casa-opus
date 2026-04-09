import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface Signer {
  email: string;
  name: string;
  role: string;
  order?: number;
}

interface EnvelopeRequest {
  documentInstanceId: string;
  signers: Signer[];
  emailSubject?: string;
  emailMessage?: string;
}

// ── JWT RS256 helpers ──────────────────────────────────────────────

function pemToArrayBuffer(pem: string): ArrayBuffer {
  // Strip header/footer and whitespace
  const b64 = pem
    .replace(/-----BEGIN (RSA )?PRIVATE KEY-----/g, '')
    .replace(/-----END (RSA )?PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');

  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function base64url(input: ArrayBuffer | Uint8Array | string): string {
  let b64: string;
  if (typeof input === 'string') {
    b64 = btoa(input);
  } else {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    b64 = btoa(binary);
  }
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function createDocuSignJWT(
  integrationKey: string,
  userId: string,
  rsaPrivateKeyPem: string,
  isDemo: boolean,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: integrationKey,
    sub: userId,
    aud: isDemo ? 'account-d.docusign.com' : 'account.docusign.com',
    iat: now,
    exp: now + 3600,
    scope: 'signature impersonation',
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  // Import RSA private key
  const keyData = pemToArrayBuffer(rsaPrivateKeyPem);
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  // Sign
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput),
  );

  return `${signingInput}.${base64url(signature)}`;
}

async function getDocuSignAccessToken(isDemo: boolean): Promise<{ accessToken: string; basePath: string }> {
  const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY')!;
  const userId = Deno.env.get('DOCUSIGN_API_ACCOUNT_ID')!;
  const rsaKey = Deno.env.get('DOCUSIGN_RSA_PRIVATE_KEY')!;

  if (!integrationKey || !userId || !rsaKey) {
    throw new Error('DocuSign credentials not configured. Set DOCUSIGN_INTEGRATION_KEY, DOCUSIGN_API_ACCOUNT_ID, and DOCUSIGN_RSA_PRIVATE_KEY.');
  }

  const assertion = await createDocuSignJWT(integrationKey, userId, rsaKey, isDemo);

  const oauthHost = isDemo ? 'account-d.docusign.com' : 'account.docusign.com';
  const tokenRes = await fetch(`https://${oauthHost}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!tokenRes.ok) {
    const errBody = await tokenRes.text();
    console.error('[docusign] OAuth token error:', tokenRes.status, errBody);
    throw new Error(`DocuSign OAuth failed (${tokenRes.status}): ${errBody}`);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  // Get user info to determine base path
  const userInfoRes = await fetch(`https://${oauthHost}/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userInfoRes.ok) {
    throw new Error('Failed to retrieve DocuSign user info');
  }

  const userInfo = await userInfoRes.json();
  const account = userInfo.accounts?.find((a: any) => a.is_default) || userInfo.accounts?.[0];
  if (!account) throw new Error('No DocuSign account found');

  return { accessToken, basePath: account.base_uri };
}

// ── Envelope creation ──────────────────────────────────────────────

async function createEnvelope(
  accessToken: string,
  basePath: string,
  accountId: string,
  documentBase64: string,
  documentName: string,
  signers: Signer[],
  emailSubject: string,
  emailMessage: string,
): Promise<{ envelopeId: string; status: string }> {
  const envelopeDefinition: any = {
    emailSubject,
    emailBlurb: emailMessage,
    documents: [
      {
        documentBase64,
        name: documentName,
        fileExtension: 'pdf',
        documentId: '1',
      },
    ],
    recipients: {
      signers: signers.map((s, i) => ({
        email: s.email,
        name: s.name,
        recipientId: String(i + 1),
        routingOrder: String(s.order || i + 1),
        roleName: s.role,
        tabs: {
          signHereTabs: [
            {
              documentId: '1',
              pageNumber: '1',
              anchorString: `/sig${i + 1}/`,
              anchorUnits: 'pixels',
              anchorXOffset: '0',
              anchorYOffset: '0',
            },
          ],
          dateSignedTabs: [
            {
              documentId: '1',
              pageNumber: '1',
              anchorString: `/date${i + 1}/`,
              anchorUnits: 'pixels',
              anchorXOffset: '0',
              anchorYOffset: '0',
            },
          ],
        },
      })),
    },
    status: 'sent',
  };

  const res = await fetch(
    `${basePath}/restapi/v2.1/accounts/${accountId}/envelopes`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(envelopeDefinition),
    },
  );

  if (!res.ok) {
    const errBody = await res.text();
    console.error('[docusign] Create envelope error:', res.status, errBody);
    throw new Error(`DocuSign API error (${res.status}): ${errBody}`);
  }

  const data = await res.json();
  return { envelopeId: data.envelopeId, status: data.status };
}

// ── Main handler ───────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    const DOCUSIGN_API_ACCOUNT_ID = Deno.env.get('DOCUSIGN_API_ACCOUNT_ID')!;
    const DOCUSIGN_USE_DEMO = Deno.env.get('DOCUSIGN_USE_DEMO') !== 'false'; // default true

    // Auth
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    console.log(`[docusign-envelope] Authenticated user: ${user.id}`);

    const body: EnvelopeRequest = await req.json();
    const { documentInstanceId, signers, emailSubject, emailMessage } = body;

    // Fetch document instance
    const { data: docInstance, error: docError } = await supabase
      .from('document_instances')
      .select('*, document_templates(*)')
      .eq('id', documentInstanceId)
      .single();

    if (docError || !docInstance) {
      throw new Error('Document instance not found');
    }

    // Check for existing envelope
    const { data: existingEnvelope } = await supabase
      .from('signature_envelopes')
      .select('*')
      .eq('document_instance_id', documentInstanceId)
      .single();

    if (existingEnvelope?.docusign_envelope_id) {
      throw new Error('Envelope already exists for this document');
    }

    // Get DocuSign access token via JWT RS256
    const { accessToken, basePath } = await getDocuSignAccessToken(DOCUSIGN_USE_DEMO);
    console.log('[docusign-envelope] Obtained access token, basePath:', basePath);

    // Build document content (rendered artifact or template content as base64)
    let documentBase64 = '';
    let documentName = docInstance.document_templates?.name || 'Document';

    if (docInstance.rendered_artifact_url) {
      // Fetch the rendered PDF
      const pdfRes = await fetch(docInstance.rendered_artifact_url);
      if (pdfRes.ok) {
        const pdfBuffer = await pdfRes.arrayBuffer();
        const bytes = new Uint8Array(pdfBuffer);
        let binary = '';
        for (const b of bytes) binary += String.fromCharCode(b);
        documentBase64 = btoa(binary);
      }
    }

    if (!documentBase64) {
      // Fallback: create a simple text document from template content or data snapshot
      const content = docInstance.document_templates?.template_content
        || JSON.stringify(docInstance.data_snapshot, null, 2)
        || 'Document content';
      documentBase64 = btoa(unescape(encodeURIComponent(content)));
    }

    // Create real DocuSign envelope
    const subject = emailSubject || `Please sign: ${documentName}`;
    const message = emailMessage || `You have been asked to sign "${documentName}". Please review and sign at your earliest convenience.`;

    const { envelopeId, status } = await createEnvelope(
      accessToken,
      basePath,
      DOCUSIGN_API_ACCOUNT_ID,
      documentBase64,
      documentName,
      signers,
      subject,
      message,
    );

    console.log(`[docusign-envelope] Created envelope: ${envelopeId}, status: ${status}`);

    // Persist envelope record
    const envelopeData = {
      envelope_id: envelopeId,
      document_instance_id: documentInstanceId,
      docusign_envelope_id: envelopeId,
      docusign_status: status,
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

    return new Response(
      JSON.stringify({
        success: true,
        envelopeId,
        status,
        signers: signers.length,
        message: `Envelope created and sent via DocuSign${DOCUSIGN_USE_DEMO ? ' (demo environment)' : ''}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('[docusign-envelope] Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to create envelope',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
