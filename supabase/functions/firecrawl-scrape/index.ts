const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extract image URLs from markdown content
function extractImageUrls(markdown: string, baseUrl: string): string[] {
  const imageUrls: Set<string> = new Set();
  
  // Match markdown image syntax: ![alt](url)
  const markdownImageRegex = /!\[.*?\]\((https?:\/\/[^)\s]+)\)/gi;
  let match;
  while ((match = markdownImageRegex.exec(markdown)) !== null) {
    imageUrls.add(match[1]);
  }
  
  // Match HTML img tags: <img src="url">
  const htmlImgRegex = /<img[^>]+src=["'](https?:\/\/[^"']+)["']/gi;
  while ((match = htmlImgRegex.exec(markdown)) !== null) {
    imageUrls.add(match[1]);
  }
  
  // Match standalone URLs that look like images
  const urlRegex = /https?:\/\/[^\s)"'<>]+\.(?:jpg|jpeg|png|webp|gif|avif)(?:\?[^\s)"'<>]*)?/gi;
  while ((match = urlRegex.exec(markdown)) !== null) {
    imageUrls.add(match[0]);
  }
  
  // Filter to only actual image URLs and deduplicate
  const filteredUrls = Array.from(imageUrls).filter(url => {
    // Must be a valid image URL
    return /\.(jpg|jpeg|png|webp|gif|avif)(\?|$)/i.test(url) &&
      !url.includes('placeholder') &&
      !url.includes('loading') &&
      !url.includes('icon') &&
      !url.includes('logo') &&
      !url.includes('avatar') &&
      url.length < 500; // Avoid malformed URLs
  });
  
  return filteredUrls;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, options } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping URL:', formattedUrl);

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: options?.formats || ['markdown'],
        onlyMainContent: options?.onlyMainContent ?? true,
        waitFor: options?.waitFor || 3000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract image URLs from markdown content
    const markdown = data.data?.markdown || data.markdown || '';
    const extractedImages = extractImageUrls(markdown, formattedUrl);
    
    console.log(`Scrape successful. Found ${extractedImages.length} images.`);
    
    // Add extracted images to the response
    const enrichedData = {
      ...data,
      data: {
        ...data.data,
        extractedImages,
      },
    };

    return new Response(
      JSON.stringify(enrichedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
