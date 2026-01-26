import { supabase } from '@/integrations/supabase/client';

export type FirecrawlResponse<T = any> = {
  success: boolean;
  error?: string;
  data?: T;
};

export type ScrapeOptions = {
  formats?: ('markdown' | 'html' | 'rawHtml' | 'links')[];
  onlyMainContent?: boolean;
  waitFor?: number;
};

export type CompetitorListing = {
  id: string;
  title: string;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  location: string;
  community: string;
  propertyType: string;
  listingType: 'Sale' | 'Rent';
  sourceUrl: string;
  sourcePlatform: string;
  imageUrl?: string;
};

export type MarketInsight = {
  averagePrice: number;
  priceRange: { min: number; max: number };
  priceTrend: 'up' | 'down' | 'stable';
  demandLevel: 'high' | 'medium' | 'low';
  recommendations: string[];
  competitorCount: number;
  communityBreakdown: { community: string; avgPrice: number; count: number }[];
};

export type AnalysisResult = {
  listings: CompetitorListing[];
  insights: MarketInsight;
  summary: string;
  analyzedAt: string;
};

export const firecrawlApi = {
  // Scrape a single URL
  async scrape(url: string, options?: ScrapeOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
      body: { url, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Analyze competitor listings using AI
  async analyzeCompetitors(
    scrapedContent: string,
    sourceUrl: string,
    ownListings?: { id: string; price: number; community: string; bedrooms: number }[]
  ): Promise<FirecrawlResponse<AnalysisResult>> {
    const { data, error } = await supabase.functions.invoke('competitor-analyze', {
      body: { 
        content: scrapedContent, 
        sourceUrl,
        ownListings 
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },
};
