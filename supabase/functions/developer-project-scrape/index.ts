import { AI_MODELS } from "../_shared/models.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, sourceUrl, developerName } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ success: false, error: 'Scraped content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a real estate data extraction specialist for the UAE market. 
Extract off-plan project information from developer website content.
Use the extract_projects tool to return structured data.

Rules:
- Extract ALL projects found on the page
- Convert all prices to AED (1 USD ≈ 3.67 AED)
- Standardize project types to: Villa, Apartment, Townhouse, Penthouse, or Mixed
- Parse handover dates into "Q1/Q2/Q3/Q4 YYYY" format
- Extract amenities as an array of strings
- If information is not available, use null
- Be precise with numbers, don't guess`;

    const userPrompt = `Extract all off-plan real estate projects from this ${developerName || 'developer'} website content.
Source URL: ${sourceUrl}

Website Content:
${content.substring(0, 50000)}`;

    console.log('Calling Lovable AI for developer project extraction...');

    const response = await fetch(LOVABLE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_MODELS.REASONING,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_projects',
              description: 'Extract off-plan real estate projects from developer website content',
              parameters: {
                type: 'object',
                properties: {
                  projects: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', description: 'Project name' },
                        community: { type: 'string', description: 'Area/Community name' },
                        location: { type: 'string', description: 'Abu Dhabi or Dubai' },
                        projectType: { type: 'string', enum: ['Villa', 'Apartment', 'Townhouse', 'Penthouse', 'Mixed'] },
                        status: { type: 'string', enum: ['Launching', 'Under Construction', 'Ready', 'Sold Out'] },
                        totalUnits: { type: 'number', nullable: true },
                        availableUnits: { type: 'number', nullable: true },
                        priceFrom: { type: 'number', nullable: true, description: 'Price in AED' },
                        priceTo: { type: 'number', nullable: true, description: 'Price in AED' },
                        expectedHandover: { type: 'string', nullable: true, description: 'Q1/Q2/Q3/Q4 YYYY format' },
                        commissionPercent: { type: 'number', nullable: true },
                        paymentPlan: { type: 'string', nullable: true, description: 'e.g. 60/40' },
                        amenities: { type: 'array', items: { type: 'string' } },
                        brochureUrl: { type: 'string', nullable: true },
                        floorPlansUrl: { type: 'string', nullable: true },
                        description: { type: 'string', nullable: true }
                      },
                      required: ['name', 'community', 'location', 'projectType', 'status']
                    }
                  },
                  developerInfo: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      website: { type: 'string' }
                    },
                    required: ['name', 'website']
                  }
                },
                required: ['projects', 'developerInfo']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_projects' } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI credits depleted. Please add funds.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: 'AI analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    
    // Extract tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    let result;
    
    if (toolCall?.function?.arguments) {
      try {
        result = JSON.parse(toolCall.function.arguments);
      } catch (parseError) {
        console.error('Failed to parse tool call arguments:', parseError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to parse extraction results' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Fallback to content parsing
      const resultText = aiResponse.choices?.[0]?.message?.content || '{}';
      try {
        result = JSON.parse(resultText);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to parse extraction results' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`Extracted ${result.projects?.length || 0} projects`);

    // Normalize projects to ensure all arrays are not null
    const normalizedProjects = (result.projects || []).map((project: any) => ({
      ...project,
      amenities: Array.isArray(project.amenities) ? project.amenities : [],
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          projects: normalizedProjects,
          developerInfo: result.developerInfo || { name: developerName, website: sourceUrl },
          scrapedAt: new Date().toISOString(),
          sourceUrl,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in developer-project-scrape:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
