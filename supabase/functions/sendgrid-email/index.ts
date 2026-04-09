import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  type: 'campaign' | 'transactional';
  to: string[];
  template: string;
  variables?: Record<string, string>;
  subject?: string;
  entityType?: 'prospect' | 'lead' | 'deal';
  entityId?: string;
  fromName?: string;
  fromEmail?: string;
}

// Email templates with HTML content
const emailTemplates: Record<string, { subject: string; html: string; text: string }> = {
  new_listing_alert: {
    subject: "New Property Match: {{property}}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Hi {{name}},</h2>
        <p>Great news! We found a property that matches your preferences:</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">{{property}}</h3>
          <p style="margin: 5px 0; color: #666;">📍 {{location}}</p>
          <p style="margin: 5px 0; color: #666;">💰 {{price}}</p>
          <p style="margin: 5px 0; color: #666;">🛏️ {{bedrooms}} bedrooms</p>
        </div>
        <a href="{{link}}" style="display: inline-block; background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Property</a>
        <p style="margin-top: 30px; color: #666;">Best regards,<br>{{agent_name}}</p>
      </div>
    `,
    text: "Hi {{name}}, We found a property match: {{property}} at {{location}} for {{price}}. Contact us to schedule a viewing!",
  },
  viewing_confirmation: {
    subject: "Viewing Confirmed: {{property}}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Viewing Confirmed! 📅</h2>
        <p>Hi {{name}},</p>
        <p>Your property viewing has been confirmed:</p>
        <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
          <h3 style="margin: 0 0 10px 0;">{{property}}</h3>
          <p style="margin: 5px 0;"><strong>Date:</strong> {{date}}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> {{time}}</p>
          <p style="margin: 5px 0;"><strong>Location:</strong> {{location}}</p>
          <p style="margin: 5px 0;"><strong>Agent:</strong> {{agent_name}}</p>
        </div>
        <p>Need to reschedule? Reply to this email or call us at {{phone}}.</p>
      </div>
    `,
    text: "Viewing Confirmed! Property: {{property}} on {{date}} at {{time}}. Location: {{location}}. Agent: {{agent_name}}.",
  },
  viewing_reminder: {
    subject: "Reminder: Viewing Tomorrow - {{property}}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Viewing Reminder ⏰</h2>
        <p>Hi {{name}},</p>
        <p>This is a friendly reminder about your property viewing tomorrow:</p>
        <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
          <h3 style="margin: 0 0 10px 0;">{{property}}</h3>
          <p style="margin: 5px 0;"><strong>Date:</strong> {{date}}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> {{time}}</p>
          <p style="margin: 5px 0;"><strong>Location:</strong> {{location}}</p>
        </div>
        <p>Looking forward to seeing you!</p>
      </div>
    `,
    text: "Reminder: Viewing tomorrow for {{property}} at {{time}}. Location: {{location}}.",
  },
  document_request: {
    subject: "Documents Required for {{property}}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Documents Required 📄</h2>
        <p>Hi {{name}},</p>
        <p>To proceed with your property transaction, please provide the following documents:</p>
        <ul style="background: #f5f5f5; padding: 20px 20px 20px 40px; border-radius: 8px;">
          {{documents_list}}
        </ul>
        <p>You can reply to this email with attachments or upload them through our secure portal.</p>
        <a href="{{upload_link}}" style="display: inline-block; background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Upload Documents</a>
      </div>
    `,
    text: "Hi {{name}}, please provide the following documents: {{documents}}. Reply to this email or use our upload portal.",
  },
  deal_milestone: {
    subject: "Update: {{milestone}} - {{property}}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Deal Update 🎯</h2>
        <p>Hi {{name}},</p>
        <p>Great progress on your property transaction!</p>
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
          <h3 style="margin: 0 0 10px 0;">{{property}}</h3>
          <p style="margin: 5px 0;"><strong>Milestone:</strong> {{milestone}}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> {{status}}</p>
          <p style="margin: 10px 0 0 0;">{{details}}</p>
        </div>
        <p>Questions? Don't hesitate to reach out.</p>
      </div>
    `,
    text: "Deal Update: {{milestone}} for {{property}}. Status: {{status}}. {{details}}",
  },
};

function applyTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
  }
  return result;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;

    if (!SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not configured');
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
      console.error('[sendgrid-email] Auth validation failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[sendgrid-email] Authenticated user: ${user.id}`);

    const body: EmailRequest = await req.json();
    const { 
      type, 
      to, 
      template, 
      variables = {}, 
      subject: customSubject,
      entityType, 
      entityId,
      fromName = 'Mi Casa Real Estate',
      fromEmail = 'noreply@micasa.ae',
    } = body;

    // Get template content
    const templateData = emailTemplates[template];
    if (!templateData) {
      throw new Error(`Unknown template: ${template}`);
    }

    // Apply variables to template
    const subject = applyTemplate(customSubject || templateData.subject, variables);
    const htmlContent = applyTemplate(templateData.html, variables);
    const textContent = applyTemplate(templateData.text, variables);

    // Build SendGrid request
    const personalizations = to.map(email => ({
      to: [{ email }],
    }));

    const sendGridPayload = {
      personalizations,
      from: {
        email: fromEmail,
        name: fromName,
      },
      subject,
      content: [
        { type: 'text/plain', value: textContent },
        { type: 'text/html', value: htmlContent },
      ],
    };

    // Send via SendGrid
    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendGridPayload),
    });

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      console.error('SendGrid error:', errorText);
      
      // Log failed emails
      if (entityType && entityId) {
        for (const email of to) {
          await supabase.from('communication_logs').insert({
            entity_type: entityType,
            entity_id: entityId,
            channel: 'email',
            direction: 'outbound',
            template_used: template,
            subject: subject,
            content: textContent,
            status: 'failed',
            error_message: errorText,
            metadata: { to: email, type },
            created_by: user.id,
          });
        }
      }

      throw new Error(`SendGrid error: ${errorText}`);
    }

    // Log successful emails
    const logPromises = [];
    if (entityType && entityId) {
      for (const email of to) {
        logPromises.push(
          supabase.from('communication_logs').insert({
            entity_type: entityType,
            entity_id: entityId,
            channel: 'email',
            direction: 'outbound',
            template_used: template,
            subject: subject,
            content: textContent,
            status: 'sent',
            sent_at: new Date().toISOString(),
            metadata: { to: email, type },
            created_by: user.id,
          })
        );
      }
      await Promise.all(logPromises);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: to.length,
        template,
        subject,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in sendgrid-email:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
