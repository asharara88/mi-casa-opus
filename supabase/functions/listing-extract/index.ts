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
    const { content, sourceUrl } = await req.json();

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

    // Detect platform from URL
    let platform = 'Unknown';
    if (sourceUrl.includes('bayut.com')) platform = 'Bayut';
    else if (sourceUrl.includes('propertyfinder.ae')) platform = 'Property Finder';
    else if (sourceUrl.includes('dubizzle.com')) platform = 'Dubizzle';

    const systemPrompt = `You are a real estate listing data extraction specialist for the UAE market.
Extract property listing details from a ${platform} listing page.

Return a JSON object with this exact structure:
{
  "listing": {
    "title": "Listing title/headline",
    "propertyType": "Apartment|Villa|Townhouse|Penthouse|Studio|Duplex|Land",
    "listingType": "Sale|Rent",
    "price": number in AED,
    "currency": "AED",
    "bedrooms": number (0 for studio),
    "bathrooms": number,
    "sqft": number,
    "community": "Area/Community name",
    "building": "Building name or null",
    "city": "Abu Dhabi|Dubai|Sharjah|etc",
    "description": "Full property description",
    "amenities": ["amenity1", "amenity2"],
    "permitNumber": "DARI permit number or null",
    "agentName": "Agent name or null",
    "agentPhone": "Phone number or null",
    "referenceNumber": "Property reference number or null",
    "imageUrls": ["url1", "url2"] or []
  },
  "confidence": 0.0 to 1.0,
  "extractedFields": ["field1", "field2"],
  "missingFields": ["field1", "field2"]
}

Rules:
- Extract the SINGLE property listing from the page (not multiple listings)
- Price must be a number in AED
- Bedrooms: use 0 for studio apartments
- Standardize property types to: Apartment, Villa, Townhouse, Penthouse, Studio, Duplex, Land
- listingType: "Sale" for buy/sell, "Rent" for lease/rental
- Extract DARI/RERA permit numbers if visible
- Confidence: 0.9+ if most fields extracted, 0.7-0.9 for partial, below 0.7 if unreliable
- List which fields were successfully extracted vs missing`;

    const userPrompt = `Extract the property listing details from this ${platform} page.
Source URL: ${sourceUrl}

Page Content:
${content.substring(0, 40000)}`;

    console.log('Calling Lovable AI for listing extraction...');

    const response = await fetch(LOVABLE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_MODELS.CLASSIFICATION,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
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
        JSON.stringify({ success: false, error: 'AI extraction failed' }),
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

    // Parse JSON from AI response (handle markdown code blocks)
    let result;
    try {
      const jsonMatch = aiContent.match(/```json\n?([\s\S]*?)\n?```/) || 
                        aiContent.match(/```\n?([\s\S]*?)\n?```/) ||
                        [null, aiContent];
      const jsonStr = jsonMatch[1] || aiContent;
      result = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse extraction results' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Listing extracted with confidence: ${result.confidence}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          listing: result.listing || {},
          confidence: result.confidence || 0.5,
          extractedFields: result.extractedFields || [],
          missingFields: result.missingFields || [],
          sourcePlatform: platform,
          sourceUrl,
          extractedAt: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in listing-extract:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
