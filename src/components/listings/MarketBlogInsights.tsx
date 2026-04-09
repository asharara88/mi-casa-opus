import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Newspaper,
  Search,
  Loader2,
  Globe,
  TrendingUp,
  Lightbulb,
  BarChart3,
} from 'lucide-react';
import { firecrawlApi, type BlogInsightsResult } from '@/lib/api/firecrawl';
import { BlogArticleCard } from './BlogArticleCard';
import { useDemoMode } from '@/contexts/DemoContext';

interface MarketBlogInsightsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BLOG_PRESETS = [
  { name: 'OIA Blog', url: 'https://www.oiaproperties.com/en/blogs' },
];

// Demo data for testing without API calls
const DEMO_INSIGHTS: BlogInsightsResult = {
  articles: [
    {
      title: 'Abu Dhabi Off-Plan Market Shows Strong Q1 Growth',
      summary: 'The Abu Dhabi off-plan property market recorded a 23% increase in transactions during Q1 2024, driven by strong demand from international investors seeking residency benefits.',
      category: 'Market Trend',
      keyInsights: [
        'Off-plan transactions up 23% year-over-year',
        'International buyers represent 45% of purchases',
        'Saadiyat Island leads premium segment growth',
      ],
      relevantCommunities: ['Saadiyat Island', 'Yas Island', 'Al Reem Island'],
      sentiment: 'bullish',
      publishDate: '2024-01-15',
      author: 'Sarah Ahmed',
      imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop',
      sourceUrl: null,
    },
    {
      title: 'New Regulations Boost Transparency in Property Market',
      summary: 'The Department of Municipalities and Transport introduces new guidelines requiring enhanced disclosure for off-plan projects, improving buyer confidence.',
      category: 'Regulatory',
      keyInsights: [
        'Enhanced disclosure requirements for developers',
        'Escrow account regulations strengthened',
        'Digital transaction records now mandatory',
      ],
      relevantCommunities: [],
      sentiment: 'neutral',
      publishDate: '2024-01-10',
      author: 'Mohamed Al Rashid',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop',
      sourceUrl: null,
    },
    {
      title: 'Hudayriyat Island: The Next Investment Hotspot',
      summary: 'Major infrastructure development on Hudayriyat Island positions it as a prime investment destination with expected 15-20% appreciation over 3 years.',
      category: 'Investment',
      keyInsights: [
        'New beach club and marina opening Q4 2024',
        'Villa prices starting from AED 4.2M',
        'Expected 15-20% capital appreciation',
      ],
      relevantCommunities: ['Hudayriyat Island'],
      sentiment: 'bullish',
      publishDate: '2024-01-08',
      author: 'James Wilson',
      imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop',
      sourceUrl: null,
    },
    {
      title: 'Rental Yields Remain Stable at 6.5% Average',
      summary: 'Despite global economic uncertainty, Abu Dhabi rental yields maintain stability with premium communities outperforming at 7-8% returns.',
      category: 'Market Trend',
      keyInsights: [
        'Average yields stable at 6.5%',
        'Premium areas achieving 7-8% returns',
        'Strong demand from corporate relocations',
      ],
      relevantCommunities: ['Al Reem Island', 'Corniche Area', 'Al Raha Beach'],
      sentiment: 'neutral',
      publishDate: '2024-01-05',
      author: 'Fatima Hassan',
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop',
      sourceUrl: null,
    },
  ],
  marketSummary: 'The Abu Dhabi property market shows strong momentum entering 2024, with off-plan sales leading growth at 23% YoY. Regulatory improvements enhance transparency while rental yields remain stable. Premium island developments continue attracting international investment.',
  topTrends: [
    'Off-plan demand increasing 23% year-over-year',
    'International investor share rising to 45%',
    'Hudayriyat Island emerging as investment hotspot',
    'Rental yields stable at 6.5% average',
    'Enhanced regulatory transparency boosting confidence',
  ],
  sourceName: 'Demo Blog',
  scrapedAt: new Date().toISOString(),
  sourceUrl: 'https://example.com/blog',
};

export function MarketBlogInsights({ open, onOpenChange }: MarketBlogInsightsProps) {
  const { toast } = useToast();
  const { isDemoMode } = useDemoMode();
  
  const [customUrl, setCustomUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insightsResult, setInsightsResult] = useState<BlogInsightsResult | null>(null);
  const [activeTab, setActiveTab] = useState('search');

  const handleScrape = async (url: string, sourceName?: string) => {
    if (isDemoMode) {
      setInsightsResult(DEMO_INSIGHTS);
      setActiveTab('results');
      toast({
        title: 'Demo Mode',
        description: `Showing ${DEMO_INSIGHTS.articles.length} sample articles`,
      });
      return;
    }

    setIsLoading(true);
    setInsightsResult(null);

    try {
      // Step 1: Scrape the URL using Firecrawl
      const scrapeResponse = await firecrawlApi.scrape(url, {
        formats: ['markdown', 'links'],
        onlyMainContent: false,
        waitFor: 5000,
      });

      if (!scrapeResponse.success) {
        throw new Error(scrapeResponse.error || 'Failed to scrape website');
      }

      const responseData = scrapeResponse.data?.data || scrapeResponse.data || {};
      const scrapedContent = responseData.markdown || '';
      const scrapedLinks = responseData.links || [];
      
      if (!scrapedContent) {
        throw new Error('No content found on the page');
      }

      // Step 2: Extract insights using AI
      const extractResponse = await firecrawlApi.scrapeBlogInsights(
        scrapedContent,
        url,
        sourceName,
        scrapedLinks
      );

      if (!extractResponse.success || !extractResponse.data) {
        throw new Error(extractResponse.error || 'Failed to extract insights');
      }

      setInsightsResult(extractResponse.data);
      setActiveTab('results');

      toast({
        title: 'Analysis Complete',
        description: `Found ${extractResponse.data.articles.length} articles from ${extractResponse.data.sourceName}`,
      });
    } catch (error) {
      console.error('Scrape error:', error);
      toast({
        title: 'Search Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            Market Insights
          </SheetTitle>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-6 mt-4">
            <TabsTrigger value="search">Insights Search</TabsTrigger>
            <TabsTrigger value="results" disabled={!insightsResult}>
              Results {insightsResult && `(${insightsResult.articles.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="flex-1 p-6 pt-4">
            <div className="space-y-6">
              {/* Blog Presets */}
              <div>
                <h3 className="text-sm font-medium mb-3">Quick Access - Real Estate Blogs</h3>
                <div className="flex flex-wrap gap-2">
                  {BLOG_PRESETS.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => handleScrape(preset.url, preset.name)}
                      disabled={isLoading}
                    >
                      <Globe className="h-3.5 w-3.5 mr-1.5" />
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom URL */}
              <div>
                <h3 className="text-sm font-medium mb-3">Custom Blog URL</h3>
                <div className="flex gap-2">
                  <Input
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://realestate-blog.com/articles"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleScrape(customUrl)}
                    disabled={isLoading || !customUrl.trim()}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Loading state */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p className="text-sm">Analyzing blog content...</p>
                  <p className="text-xs mt-1">Extracting market insights</p>
                </div>
              )}

              {/* How it works */}
              {!isLoading && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">How it works</h4>
                  <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                    <li>Select a blog source or enter a custom URL</li>
                    <li>We scrape the blog for article content</li>
                    <li>AI extracts insights, trends, and sentiment</li>
                    <li>Review market intelligence and key takeaways</li>
                  </ol>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="results" className="flex-1 flex flex-col p-0 overflow-hidden">
            {insightsResult && (
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                  {/* Market Summary Card */}
                  <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Market Summary</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{insightsResult.marketSummary}</p>
                    </CardContent>
                  </Card>

                  {/* Top Trends */}
                  {insightsResult.topTrends.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        <h3 className="font-semibold text-sm">Top Trends</h3>
                      </div>
                      <ul className="space-y-2">
                        {insightsResult.topTrends.map((trend, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <TrendingUp className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span>{trend}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Articles Grid */}
                  <div>
                    <h3 className="font-semibold text-sm mb-3">Articles Found ({insightsResult.articles.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {insightsResult.articles.map((article, idx) => (
                        <BlogArticleCard key={idx} article={article} />
                      ))}
                    </div>
                  </div>

                  {/* Source info */}
                  <div className="text-xs text-muted-foreground text-center pt-4 border-t">
                    Source: {insightsResult.sourceName} • Analyzed {new Date(insightsResult.scrapedAt).toLocaleString()}
                  </div>
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
