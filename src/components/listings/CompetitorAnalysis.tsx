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
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Loader2, 
  AlertCircle, 
  TrendingUp,
  Building2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { firecrawlApi, type AnalysisResult, type CompetitorListing, type MarketInsight } from '@/lib/api/firecrawl';
import { CompetitorListingCard } from './CompetitorListingCard';
import { MarketInsightsPanel } from './MarketInsightsPanel';
import { useDemoMode } from '@/contexts/DemoContext';

interface CompetitorAnalysisProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownListings?: { id: string; price: number; community: string; bedrooms: number }[];
}

// Demo data for when demo mode is active
const DEMO_ANALYSIS_RESULT: AnalysisResult = {
  listings: [
    {
      id: 'comp-1',
      title: '3 BR Apartment in Al Reem Island',
      price: 2100000,
      currency: 'AED',
      bedrooms: 3,
      bathrooms: 3,
      sqft: 1850,
      location: 'Al Reem Island, Abu Dhabi',
      community: 'Al Reem Island',
      propertyType: 'Apartment',
      listingType: 'Sale',
      sourceUrl: 'https://bayut.com/example',
      sourcePlatform: 'Bayut',
    },
    {
      id: 'comp-2',
      title: '4 BR Villa in Yas Island',
      price: 4500000,
      currency: 'AED',
      bedrooms: 4,
      bathrooms: 5,
      sqft: 3200,
      location: 'Yas Island, Abu Dhabi',
      community: 'Yas Island',
      propertyType: 'Villa',
      listingType: 'Sale',
      sourceUrl: 'https://propertyfinder.ae/example',
      sourcePlatform: 'Property Finder',
    },
    {
      id: 'comp-3',
      title: '2 BR Apartment in Corniche Area',
      price: 1800000,
      currency: 'AED',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
      location: 'Corniche Area, Abu Dhabi',
      community: 'Corniche Area',
      propertyType: 'Apartment',
      listingType: 'Sale',
      sourceUrl: 'https://dubizzle.com/example',
      sourcePlatform: 'Dubizzle',
    },
    {
      id: 'comp-4',
      title: '5 BR Villa in Saadiyat Island',
      price: 8200000,
      currency: 'AED',
      bedrooms: 5,
      bathrooms: 6,
      sqft: 6200,
      location: 'Saadiyat Island, Abu Dhabi',
      community: 'Saadiyat Island',
      propertyType: 'Villa',
      listingType: 'Sale',
      sourceUrl: 'https://bayut.com/example2',
      sourcePlatform: 'Bayut',
    },
  ],
  insights: {
    averagePrice: 2800000,
    priceRange: { min: 1500000, max: 8500000 },
    priceTrend: 'up',
    demandLevel: 'high',
    recommendations: [
      'Your Al Reem Island listings are 8% below market average - consider price adjustment',
      'High demand for 3BR apartments - prioritize marketing these units',
      'Yas Island properties showing 12% YoY appreciation',
      'Consider expanding inventory in Saadiyat Island - limited supply',
    ],
    competitorCount: 4,
    communityBreakdown: [
      { community: 'Al Reem Island', avgPrice: 2300000, count: 8 },
      { community: 'Yas Island', avgPrice: 3800000, count: 5 },
      { community: 'Saadiyat Island', avgPrice: 7500000, count: 3 },
      { community: 'Corniche Area', avgPrice: 2100000, count: 4 },
    ],
  },
  summary: 'The Abu Dhabi property market is showing strong momentum with average prices up 6% compared to last quarter. Premium communities like Saadiyat Island and Yas Island are driving growth. Your current listings are competitively priced but there\'s room for optimization in Al Reem Island where market rates have increased.',
  analyzedAt: new Date().toISOString(),
};

const PORTAL_PRESETS = [
  { name: 'Bayut', url: 'https://www.bayut.com/for-sale/property/abu-dhabi/' },
  { name: 'Property Finder', url: 'https://www.propertyfinder.ae/en/search?c=2&l=9&fu=0&rp=y&ob=mr' },
  { name: 'Dubizzle', url: 'https://www.dubizzle.com/en/abudhabi/properties/properties-for-sale/' },
];

export function CompetitorAnalysis({ open, onOpenChange, ownListings }: CompetitorAnalysisProps) {
  const { isDemoMode } = useDemoMode();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<'scraping' | 'analyzing' | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (targetUrl: string) => {
    if (!targetUrl) {
      toast({
        title: 'URL Required',
        description: 'Please enter a property portal URL to analyze',
        variant: 'destructive',
      });
      return;
    }

    // Demo mode - show mock data
    if (isDemoMode) {
      setIsLoading(true);
      setLoadingStep('scraping');
      setError(null);
      
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoadingStep('analyzing');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setResult(DEMO_ANALYSIS_RESULT);
      setIsLoading(false);
      setLoadingStep(null);
      toast({
        title: 'Analysis Complete (Demo)',
        description: `Found ${DEMO_ANALYSIS_RESULT.listings.length} competitor listings`,
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Step 1: Scrape the URL
      setLoadingStep('scraping');
      const scrapeResponse = await firecrawlApi.scrape(targetUrl);
      
      if (!scrapeResponse.success) {
        throw new Error(scrapeResponse.error || 'Failed to scrape page');
      }

      const scrapedContent = scrapeResponse.data?.markdown || scrapeResponse.data?.data?.markdown || '';
      
      if (!scrapedContent) {
        throw new Error('No content found on the page');
      }

      // Step 2: Analyze with AI
      setLoadingStep('analyzing');
      const analysisResponse = await firecrawlApi.analyzeCompetitors(
        scrapedContent,
        targetUrl,
        ownListings
      );

      if (!analysisResponse.success) {
        throw new Error(analysisResponse.error || 'Failed to analyze listings');
      }

      setResult(analysisResponse.data || null);
      toast({
        title: 'Analysis Complete',
        description: `Found ${analysisResponse.data?.listings?.length || 0} competitor listings`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setError(message);
      toast({
        title: 'Analysis Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setLoadingStep(null);
    }
  };

  const handlePresetClick = (presetUrl: string) => {
    setUrl(presetUrl);
    handleAnalyze(presetUrl);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Competitor Analysis
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Description */}
          <p className="text-sm text-muted-foreground">
            Analyze competitor listings from property portals to get market insights and pricing recommendations.
          </p>

          {/* Portal Presets */}
          <div className="flex flex-wrap gap-2">
            {PORTAL_PRESETS.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick(preset.url)}
                disabled={isLoading}
              >
                {preset.name}
              </Button>
            ))}
          </div>

          {/* URL Input */}
          <div className="flex gap-2">
            <Input
              placeholder="https://bayut.com/for-sale/property/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              onClick={() => handleAnalyze(url)} 
              disabled={isLoading || !url}
              className="btn-gold"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div>
                  <div className="font-medium text-foreground">
                    {loadingStep === 'scraping' ? 'Scraping page...' : 'Analyzing listings with AI...'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {loadingStep === 'scraping' 
                      ? 'Extracting property data from the portal'
                      : 'Generating market insights and recommendations'
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Card className="border-destructive/50">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <div className="font-medium text-destructive">Analysis Failed</div>
                  <div className="text-sm text-muted-foreground">{error}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && !isLoading && (
            <ScrollArea className="flex-1">
              <div className="space-y-4 pr-4">
                {/* Market Insights */}
                <MarketInsightsPanel insights={result.insights} summary={result.summary} />

                {/* Competitor Listings */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4 text-primary" />
                    <h3 className="font-medium text-foreground">Competitor Listings</h3>
                    <Badge variant="outline">{result.listings.length}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {result.listings.map((listing) => (
                      <CompetitorListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                </div>

                {/* Analysis Timestamp */}
                <div className="text-xs text-muted-foreground text-center pt-4">
                  Analyzed at {new Date(result.analyzedAt).toLocaleString()}
                </div>
              </div>
            </ScrollArea>
          )}

          {/* Empty State */}
          {!result && !isLoading && !error && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Enter a property portal URL or select a preset to start analysis</p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
