const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, sourceUrl, ownListings } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ success: false, error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'LOVABLE_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Detect source platform from URL
    let sourcePlatform = 'Unknown';
    if (sourceUrl.includes('bayut')) sourcePlatform = 'Bayut';
    else if (sourceUrl.includes('propertyfinder')) sourcePlatform = 'Property Finder';
    else if (sourceUrl.includes('dubizzle')) sourcePlatform = 'Dubizzle';

    const systemPrompt = `You are a real estate market analyst specializing in UAE property markets. 
Analyze the scraped property listing data and extract structured information.

Your task:
1. Extract individual property listings with their details
2. Calculate market statistics and trends
3. Compare with the user's own listings if provided
4. Generate actionable recommendations

Always respond with valid JSON matching the expected schema.`;

    const userPrompt = `Analyze these property listings scraped from ${sourcePlatform}:

${content.substring(0, 15000)}

${ownListings ? `
Compare with these own listings:
${JSON.stringify(ownListings)}
` : ''}

Extract and return a JSON object with this structure:
{
  "listings": [
    {
      "id": "unique-id",
      "title": "Property title",
      "price": 2500000,
      "currency": "AED",
      "bedrooms": 3,
      "bathrooms": 2,
      "sqft": 1800,
      "location": "Full address",
      "community": "Community name",
      "propertyType": "Apartment/Villa/Townhouse",
      "listingType": "Sale",
      "sourceUrl": "${sourceUrl}",
      "sourcePlatform": "${sourcePlatform}"
    }
  ],
  "insights": {
    "averagePrice": 2800000,
    "priceRange": { "min": 1500000, "max": 5000000 },
    "priceTrend": "up",
    "demandLevel": "high",
    "recommendations": [
      "Your Al Reem listings are 8% below market - consider increasing",
      "High demand for 3BR units - prioritize these"
    ],
    "competitorCount": 12,
    "communityBreakdown": [
      { "community": "Al Reem Island", "avgPrice": 2300000, "count": 5 }
    ]
  },
  "summary": "Brief market summary paragraph"
}

If you cannot extract specific data, use reasonable estimates based on the content.
Only extract listings that have clear price and location information.`;

    console.log('Calling AI Gateway for analysis...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'API credits exhausted. Please add funds.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'AI analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.choices?.[0]?.message?.content;

    if (!aiContent) {
      return new Response(
        JSON.stringify({ success: false, error: 'No response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON from AI response
    let analysisResult;
    try {
      // Try to extract JSON from the response (may be wrapped in markdown code blocks)
      const jsonMatch = aiContent.match(/```json\n?([\s\S]*?)\n?```/) || 
                        aiContent.match(/```\n?([\s\S]*?)\n?```/) ||
                        [null, aiContent];
      const jsonStr = jsonMatch[1] || aiContent;
      analysisResult = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return a fallback structure
      analysisResult = {
        listings: [],
        insights: {
          averagePrice: 0,
          priceRange: { min: 0, max: 0 },
          priceTrend: 'stable',
          demandLevel: 'medium',
          recommendations: ['Unable to fully analyze the page content. Try a different URL.'],
          competitorCount: 0,
          communityBreakdown: [],
        },
        summary: 'Analysis could not be completed. The page may not contain structured listing data.',
      };
    }

    // Add timestamp
    analysisResult.analyzedAt = new Date().toISOString();

    console.log('Analysis complete:', analysisResult.listings?.length || 0, 'listings found');

    return new Response(
      JSON.stringify({ success: true, data: analysisResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing:', error);
    const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
