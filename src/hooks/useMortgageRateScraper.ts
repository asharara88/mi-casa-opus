import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BankPreset } from '@/mortgage-data/bankPresets';
import { toast } from 'sonner';

export type ScrapedRate = {
  bank_name: string;
  product_name: string;
  rate_pct: number;
  rate_kind: 'FIXED_FULL_TERM' | 'FIXED_FOR_X_THEN_VARIABLE';
  fixed_period_months: number | null;
  max_ltv_pct: number | null;
  max_tenor_years: number | null;
  min_salary_aed: number | null;
  currency: string;
  notes: string;
  source_url: string;
};

export type BankScrapeResult = {
  bankId: string;
  bankName: string;
  rates: ScrapedRate[];
  extractionNotes: string;
  scrapedAt: string;
  sourceUrl: string;
  status: 'idle' | 'scraping' | 'extracting' | 'done' | 'error';
  error?: string;
};

export function useMortgageRateScraper() {
  const [results, setResults] = useState<Record<string, BankScrapeResult>>({});
  const [scrapingBankId, setScrapingBankId] = useState<string | null>(null);

  const scrapeBank = useCallback(async (bank: BankPreset) => {
    setScrapingBankId(bank.id);
    setResults(prev => ({
      ...prev,
      [bank.id]: {
        bankId: bank.id,
        bankName: bank.name,
        rates: [],
        extractionNotes: '',
        scrapedAt: '',
        sourceUrl: bank.mortgagePageUrl,
        status: 'scraping',
      },
    }));

    try {
      // Step 1: Scrape with Firecrawl
      const { data: scrapeData, error: scrapeError } = await supabase.functions.invoke('firecrawl-scrape', {
        body: {
          url: bank.mortgagePageUrl,
          options: { formats: ['markdown'], onlyMainContent: true, waitFor: 5000 },
        },
      });

      if (scrapeError || !scrapeData?.success) {
        throw new Error(scrapeData?.error || scrapeError?.message || 'Scraping failed');
      }

      const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';
      if (!markdown || markdown.length < 50) {
        throw new Error('Page returned insufficient content');
      }

      setResults(prev => ({
        ...prev,
        [bank.id]: { ...prev[bank.id], status: 'extracting' },
      }));

      // Step 2: Extract rates via AI
      const { data: extractData, error: extractError } = await supabase.functions.invoke('mortgage-rate-extract', {
        body: {
          content: markdown,
          sourceUrl: bank.mortgagePageUrl,
          bankName: bank.name,
        },
      });

      if (extractError || !extractData?.success) {
        throw new Error(extractData?.error || extractError?.message || 'Extraction failed');
      }

      const result: BankScrapeResult = {
        bankId: bank.id,
        bankName: bank.name,
        rates: extractData.data.rates || [],
        extractionNotes: extractData.data.extraction_notes || '',
        scrapedAt: extractData.data.extracted_at,
        sourceUrl: bank.mortgagePageUrl,
        status: 'done',
      };

      setResults(prev => ({ ...prev, [bank.id]: result }));
      toast.success(`${bank.shortName}: Found ${result.rates.length} rate(s)`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setResults(prev => ({
        ...prev,
        [bank.id]: { ...prev[bank.id], status: 'error', error: errorMsg },
      }));
      toast.error(`${bank.shortName}: ${errorMsg}`);
    } finally {
      setScrapingBankId(null);
    }
  }, []);

  const scrapeAll = useCallback(async (banks: BankPreset[]) => {
    for (const bank of banks) {
      await scrapeBank(bank);
    }
  }, [scrapeBank]);

  const allRates = Object.values(results).flatMap(r => r.rates);

  return { results, scrapeBank, scrapeAll, scrapingBankId, allRates };
}
