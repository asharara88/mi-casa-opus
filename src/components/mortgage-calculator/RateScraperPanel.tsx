import { useState } from 'react';
import { UAE_BANK_PRESETS, BankPreset } from '@/mortgage-data/bankPresets';
import { useMortgageRateScraper, ScrapedRate } from '@/hooks/useMortgageRateScraper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Globe, CheckCircle, XCircle, ArrowRight, RefreshCw } from 'lucide-react';

type Props = {
  onRatesExtracted?: (rates: ScrapedRate[]) => void;
};

export function RateScraperPanel({ onRatesExtracted }: Props) {
  const { results, scrapeBank, scrapeAll, scrapingBankId, allRates } = useMortgageRateScraper();
  const [selectedBanks, setSelectedBanks] = useState<Set<string>>(new Set(UAE_BANK_PRESETS.map(b => b.id)));

  const toggleBank = (id: string) => {
    setSelectedBanks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleScrapeAll = () => {
    const banks = UAE_BANK_PRESETS.filter(b => selectedBanks.has(b.id));
    scrapeAll(banks);
  };

  const handleApplyRates = () => {
    if (onRatesExtracted && allRates.length > 0) {
      onRatesExtracted(allRates);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">UAE Bank Rate Scraper</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleScrapeAll}
            disabled={!!scrapingBankId || selectedBanks.size === 0}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Scrape All Selected
          </Button>
          {allRates.length > 0 && (
            <Button size="sm" onClick={handleApplyRates}>
              <ArrowRight className="w-4 h-4 mr-1" />
              Apply {allRates.length} Rate(s)
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {UAE_BANK_PRESETS.map(bank => {
          const result = results[bank.id];
          const isActive = selectedBanks.has(bank.id);
          const isScraping = scrapingBankId === bank.id;

          return (
            <BankCard
              key={bank.id}
              bank={bank}
              result={result}
              isActive={isActive}
              isScraping={isScraping}
              onToggle={() => toggleBank(bank.id)}
              onScrape={() => scrapeBank(bank)}
              disabled={!!scrapingBankId}
            />
          );
        })}
      </div>

      {allRates.length > 0 && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Extracted Rates ({allRates.length})</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allRates.map((rate, i) => (
                <div key={i} className="flex items-center justify-between border rounded-md px-3 py-2 text-sm">
                  <div>
                    <span className="font-medium">{rate.bank_name}</span>
                    <span className="text-muted-foreground ml-2">— {rate.product_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {rate.rate_pct}%
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {rate.rate_kind === 'FIXED_FULL_TERM' ? 'Fixed' : `Fixed ${rate.fixed_period_months}m`}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function BankCard({
  bank,
  result,
  isActive,
  isScraping,
  onToggle,
  onScrape,
  disabled,
}: {
  bank: BankPreset;
  result?: ReturnType<typeof useMortgageRateScraper>['results'][string];
  isActive: boolean;
  isScraping: boolean;
  onToggle: () => void;
  onScrape: () => void;
  disabled: boolean;
}) {
  const statusIcon = () => {
    if (!result) return null;
    if (result.status === 'scraping' || result.status === 'extracting') {
      return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
    }
    if (result.status === 'done') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (result.status === 'error') {
      return <XCircle className="w-4 h-4 text-destructive" />;
    }
    return null;
  };

  return (
    <Card
      className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-primary/50' : 'opacity-60'}`}
      onClick={onToggle}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {bank.logo ? (
              <img src={bank.logo} alt={bank.shortName} className="h-6 w-auto object-contain" />
            ) : (
              <span className="text-xs font-bold text-muted-foreground bg-muted rounded px-1.5 py-0.5">{bank.shortName}</span>
            )}
            <span className="font-medium text-sm">{bank.shortName}</span>
          </div>
          {statusIcon()}
        </div>

        <p className="text-xs text-muted-foreground mb-2 truncate">{bank.name}</p>

        {result?.status === 'done' && (
          <p className="text-xs text-green-600">{result.rates.length} rate(s) found</p>
        )}
        {result?.status === 'error' && (
          <p className="text-xs text-destructive truncate">{result.error}</p>
        )}
        {result?.status === 'scraping' && (
          <p className="text-xs text-muted-foreground">Scraping page…</p>
        )}
        {result?.status === 'extracting' && (
          <p className="text-xs text-muted-foreground">Extracting rates…</p>
        )}

        <Button
          size="sm"
          variant="ghost"
          className="w-full mt-2 h-7 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onScrape();
          }}
          disabled={disabled || !isActive}
        >
          <Globe className="w-3 h-3 mr-1" />
          {isScraping ? 'Scraping…' : 'Scrape'}
        </Button>
      </CardContent>
    </Card>
  );
}
