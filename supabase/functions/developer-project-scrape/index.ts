const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_URL = 'https://api.lovable.dev/v1/chat/completions';

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

Return a JSON object with this exact structure:
{
  "projects": [
    {
      "name": "Project Name",
      "community": "Area/Community name",
      "location": "Abu Dhabi or Dubai",
      "projectType": "Villa|Apartment|Townhouse|Penthouse|Mixed",
      "status": "Launching|Under Construction|Ready|Sold Out",
      "totalUnits": number or null,
      "availableUnits": number or null,
      "priceFrom": number in AED or null,
      "priceTo": number in AED or null,
      "expectedHandover": "Q1 2027" format or null,
      "commissionPercent": number or null,
      "paymentPlan": "60/40" or description or null,
      "amenities": ["amenity1", "amenity2"],
      "brochureUrl": "URL or null",
      "floorPlansUrl": "URL or null",
      "description": "Brief project description"
    }
  ],
  "developerInfo": {
    "name": "Developer Name",
    "website": "URL"
  }
}

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
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'AI analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const resultText = aiResponse.choices?.[0]?.message?.content || '{}';

    let result;
    try {
      result = JSON.parse(resultText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse extraction results' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Extracted ${result.projects?.length || 0} projects`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          projects: result.projects || [],
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
