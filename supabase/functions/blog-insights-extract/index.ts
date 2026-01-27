const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, sourceUrl, sourceName, imageLinks } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ success: false, error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Extracting blog insights from:', sourceUrl);

    // Build the extraction prompt
    const systemPrompt = `You are an expert real estate market analyst. Extract blog articles and market insights from the provided content.

For each article found, extract:
- title: The article headline
- summary: 2-3 sentence summary of the article
- category: One of 'Market Trend', 'Investment', 'Development', 'Regulatory', 'Community', 'General'
- keyInsights: Array of 2-4 actionable insights for real estate agents/investors
- relevantCommunities: Array of mentioned neighborhoods/areas (e.g., 'Saadiyat Island', 'Yas Island')
- sentiment: 'bullish' (positive market outlook), 'bearish' (negative outlook), or 'neutral'
- publishDate: Date if mentioned (ISO format or null)
- author: Author name if mentioned (or null)
- sourceUrl: Article link if available (or null)

Also provide:
- marketSummary: 2-3 sentence overall market summary based on all articles
- topTrends: Array of 3-5 key market trends identified across all articles

Respond with ONLY valid JSON in this exact format:
{
  "articles": [...],
  "marketSummary": "...",
  "topTrends": ["...", "..."]
}`;

    const userPrompt = `Extract blog articles and market insights from this real estate blog content.

Available image links that may match articles:
${imageLinks?.slice(0, 30).join('\n') || 'None provided'}

Blog content:
${content.substring(0, 50000)}`;

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI Gateway request failed: ${response.status}`);
    }

    const aiResult = await response.json();
    const messageContent = aiResult.choices?.[0]?.message?.content || '';
    
    console.log('AI response received, parsing...');

    // Parse the JSON response
    let extractedData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = messageContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : messageContent;
      extractedData = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.log('Raw content:', messageContent.substring(0, 500));
      throw new Error('Failed to parse AI response as JSON');
    }

    // Match images to articles if links provided
    if (imageLinks && imageLinks.length > 0 && extractedData.articles) {
      const imagePatterns = imageLinks.filter((link: string) => 
        /\.(jpg|jpeg|png|webp|gif)/i.test(link) || 
        link.includes('/images/') || 
        link.includes('/blog/') ||
        link.includes('/uploads/')
      );

      extractedData.articles = extractedData.articles.map((article: any, index: number) => {
        if (!article.imageUrl && imagePatterns[index]) {
          article.imageUrl = imagePatterns[index];
        }
        return article;
      });
    }

    const result = {
      success: true,
      data: {
        articles: extractedData.articles || [],
        marketSummary: extractedData.marketSummary || 'No market summary available.',
        topTrends: extractedData.topTrends || [],
        sourceName: sourceName || new URL(sourceUrl).hostname,
        scrapedAt: new Date().toISOString(),
        sourceUrl,
      },
    };

    console.log(`Extracted ${result.data.articles.length} articles successfully`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Blog insights extraction error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to extract blog insights';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
