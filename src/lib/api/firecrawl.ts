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

// Developer Project Scraping Types
export type ScrapedProject = {
  name: string;
  community: string;
  location: string;
  projectType: string;
  status: string;
  totalUnits: number | null;
  availableUnits: number | null;
  priceFrom: number | null;
  priceTo: number | null;
  expectedHandover: string | null;
  commissionPercent: number | null;
  paymentPlan: string | null;
  amenities: string[];
  brochureUrl: string | null;
  floorPlansUrl: string | null;
  description: string | null;
};

export type DeveloperScrapeResult = {
  projects: ScrapedProject[];
  developerInfo: {
    name: string;
    website: string;
  };
  scrapedAt: string;
  sourceUrl: string;
};

// Listing Extraction Types
export type ExtractedListing = {
  title: string;
  propertyType: string;
  listingType: 'Sale' | 'Rent';
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  community: string;
  building: string | null;
  city: string;
  description: string;
  amenities: string[];
  permitNumber: string | null;
  agentName: string | null;
  agentPhone: string | null;
  referenceNumber: string | null;
  imageUrls: string[];
};

export type ListingExtractResult = {
  listing: ExtractedListing;
  confidence: number;
  extractedFields: string[];
  missingFields: string[];
  sourcePlatform: string;
  sourceUrl: string;
  extractedAt: string;
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

  // Scrape and extract developer projects
  async scrapeDeveloperProjects(
    scrapedContent: string,
    sourceUrl: string,
    developerName?: string
  ): Promise<FirecrawlResponse<DeveloperScrapeResult>> {
    const { data, error } = await supabase.functions.invoke('developer-project-scrape', {
      body: { 
        content: scrapedContent, 
        sourceUrl,
        developerName 
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Extract listing details from a property portal URL
  async extractListingFromUrl(
    scrapedContent: string,
    sourceUrl: string
  ): Promise<FirecrawlResponse<ListingExtractResult>> {
    const { data, error } = await supabase.functions.invoke('listing-extract', {
      body: { 
        content: scrapedContent, 
        sourceUrl 
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },
};
