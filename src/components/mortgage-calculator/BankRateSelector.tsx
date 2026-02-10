import { useState, useRef, useEffect } from 'react';
import { UAE_BANK_PRESETS } from '@/mortgage-data/bankPresets';
import { useMortgageRateScraper, ScrapedRate } from '@/hooks/useMortgageRateScraper';
import { RateOption } from '@/mortgage-data/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Globe, ChevronDown, CheckCircle, XCircle } from 'lucide-react';

type Props = {
  allRateOptions: RateOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onRatesExtracted: (rates: ScrapedRate[]) => void;
};

export function BankRateSelector({ allRateOptions, selectedId, onSelect, onRatesExtracted }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { results, scrapeBank, scrapingBankId, allRates } = useMortgageRateScraper();

  const selectedOption = allRateOptions.find(o => o.id === selectedId);

  // Auto-apply scraped rates when they change
  useEffect(() => {
    if (allRates.length > 0) {
      onRatesExtracted(allRates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRates.length]);

  // Close on outside click or Escape key
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative col-span-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full border rounded-md px-3 py-2 text-left flex items-center justify-between bg-background text-sm"
      >
        <span className={selectedOption ? '' : 'text-muted-foreground'}>
          {selectedOption ? `${selectedOption.bank_name} — ${selectedOption.label}` : 'Select bank rate option'}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full border rounded-md bg-popover shadow-lg max-h-[420px] overflow-y-auto">
          {/* Existing rate options */}
          {allRateOptions.length > 0 && (
            <div className="p-1">
              <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">Available Rates</p>
              {allRateOptions.map(option => (
                <button
                  key={option.id}
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-accent flex items-center justify-between ${
                    option.id === selectedId ? 'bg-accent' : ''
                  }`}
                  onClick={() => { onSelect(option.id); setOpen(false); }}
                >
                  <span className="truncate">{option.bank_name} — {option.label}</span>
                  {option.id.startsWith('scraped.') && (
                    <Badge variant="outline" className="ml-2 text-[10px] shrink-0">Live</Badge>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="border-t mx-2" />

          {/* Bank scrape section */}
          <div className="p-1">
            <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">Research Mortgage Rates</p>
            <div className="grid grid-cols-2 gap-1 p-1">
              {UAE_BANK_PRESETS.map(bank => {
                const result = results[bank.id];
                const isScraping = scrapingBankId === bank.id;

                return (
                  <button
                    key={bank.id}
                    type="button"
                    className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent text-left text-sm disabled:opacity-50"
                    disabled={!!scrapingBankId}
                    onClick={(e) => {
                      e.stopPropagation();
                      scrapeBank(bank);
                    }}
                  >
                    {bank.logo ? (
                      <img src={bank.logo} alt={bank.shortName} className="h-5 w-5 object-contain shrink-0" />
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted rounded px-1 shrink-0">{bank.shortName}</span>
                    )}
                    <span className="truncate flex-1">{bank.shortName}</span>
                    {isScraping && <Loader2 className="w-3 h-3 animate-spin text-primary shrink-0" />}
                    {result?.status === 'done' && <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />}
                    {result?.status === 'error' && <XCircle className="w-3 h-3 text-destructive shrink-0" />}
                    {!result && !isScraping && <Globe className="w-3 h-3 text-muted-foreground shrink-0" />}
                  </button>
                );
              })}
            </div>
            {scrapingBankId && (
              <p className="px-2 py-1 text-[11px] text-muted-foreground">
                Scraping & extracting rates…
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
