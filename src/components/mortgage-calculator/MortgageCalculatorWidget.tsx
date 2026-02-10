import { useMemo, useState } from 'react';
import { ABU_DHABI_MORTGAGE_DATA } from '@/mortgage-data/abuDhabiMortgageData';
import { formatAed } from '@/lib/money';
import { amortize, buildHybridSegments, buildSingleRateSegments } from '@/lib/mortgageEngine';
import { computeMortgageRegistrationFees } from '@/lib/upfrontFees';
import { QualificationPanel } from './QualificationPanel';
import { SourcesPanel } from './SourcesPanel';
import { RateScraperPanel } from './RateScraperPanel';
import { RateOption } from '@/mortgage-data/types';
import type { ScrapedRate } from '@/hooks/useMortgageRateScraper';

export function MortgageCalculatorWidget() {
  const [purchasePriceAed, setPurchasePriceAed] = useState<number>();
  const [loanAmountAed, setLoanAmountAed] = useState<number>();
  const [termYears, setTermYears] = useState<number>();
  const [rateOptionId, setRateOptionId] = useState<string>();
  const [postFixedRatePct, setPostFixedRatePct] = useState<number>();
  const [monthlyIncomeAed, setMonthlyIncomeAed] = useState<number>();
  const [existingMonthlyDebtsAed, setExistingMonthlyDebtsAed] = useState<number>();
  const [liveRateOptions, setLiveRateOptions] = useState<RateOption[]>([]);

  const allRateOptions = [...ABU_DHABI_MORTGAGE_DATA.rate_options, ...liveRateOptions];
  const rateOption = allRateOptions.find((x) => x.id === rateOptionId);

  const handleScrapedRates = (rates: ScrapedRate[]) => {
    const converted: RateOption[] = rates.map((r, i) => ({
      id: `scraped.${r.bank_name.replace(/\s+/g, '_').toLowerCase()}.${i}`,
      bank_id: r.bank_name.replace(/\s+/g, '_').toUpperCase(),
      bank_name: r.bank_name,
      label: `${r.product_name} — ${r.rate_pct}% (live scraped)`,
      rate_kind: r.rate_kind === 'FIXED_FOR_X_THEN_VARIABLE' ? 'FIXED_FOR_X_THEN_USER_RATE' : 'FIXED_FULL_TERM',
      published_rate_pct: {
        id: `scraped.rate.${i}`,
        label: `${r.bank_name} — ${r.product_name}`,
        value: r.rate_pct,
        unit: '%',
        applies_to: `${r.bank_name} — ${r.product_name}`,
        source: {
          authority_name: r.bank_name,
          source_url: r.source_url,
          publish_date: 'date not stated',
          checked_on: new Date().toISOString().slice(0, 10),
          notes: r.notes || undefined,
        },
      },
      ...(r.fixed_period_months ? {
        fixed_period_months: {
          id: `scraped.fixed.${i}`,
          label: 'Fixed period',
          value: r.fixed_period_months,
          unit: 'months' as const,
          applies_to: `${r.bank_name} fixed period`,
          source: {
            authority_name: r.bank_name,
            source_url: r.source_url,
            publish_date: 'date not stated',
            checked_on: new Date().toISOString().slice(0, 10),
          },
        },
      } : {}),
    }));
    setLiveRateOptions(converted);
  };
  const totalMonths = termYears ? Math.round(termYears * 12) : undefined;

  const segments = useMemo(() => {
    if (!totalMonths || !rateOption || !rateOption.published_rate_pct) return undefined;
    if (rateOption.rate_kind === 'FIXED_FULL_TERM') {
      return buildSingleRateSegments(totalMonths, rateOption.published_rate_pct.value);
    }
    if (!rateOption.fixed_period_months || postFixedRatePct == null) return undefined;
    return buildHybridSegments({
      totalMonths,
      fixedMonths: rateOption.fixed_period_months.value,
      fixedRatePct: rateOption.published_rate_pct.value,
      postFixedRatePct,
    });
  }, [postFixedRatePct, rateOption, totalMonths]);

  const amort = useMemo(() => {
    if (!loanAmountAed || !totalMonths || !segments) return undefined;
    return amortize({ principal: loanAmountAed, totalMonths, segments });
  }, [loanAmountAed, segments, totalMonths]);

  const upfrontLines = useMemo(() => {
    if (!loanAmountAed) return [];
    return computeMortgageRegistrationFees(ABU_DHABI_MORTGAGE_DATA.abu_dhabi_fees, loanAmountAed);
  }, [loanAmountAed]);

  const downPayment = purchasePriceAed != null && loanAmountAed != null ? Math.max(0, purchasePriceAed - loanAmountAed) : 0;
  const upfrontTotal = downPayment + upfrontLines.reduce((sum, l) => sum + l.amountAed, 0);
  const usedSources = Array.from(new Map(upfrontLines.flatMap((x) => x.sources).map((s) => [s.id, s])).values());
  if (rateOption?.published_rate_pct) usedSources.push(rateOption.published_rate_pct);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Abu Dhabi Mortgage Calculator (Guidance)</h1>

      <div className="grid md:grid-cols-2 gap-3">
        <input className="border rounded-md px-3 py-2" placeholder="Purchase price (AED)" value={purchasePriceAed ?? ''} onChange={(e) => setPurchasePriceAed(e.target.value ? Number(e.target.value) : undefined)} />
        <input className="border rounded-md px-3 py-2" placeholder="Loan amount (AED)" value={loanAmountAed ?? ''} onChange={(e) => setLoanAmountAed(e.target.value ? Number(e.target.value) : undefined)} />
        <input className="border rounded-md px-3 py-2" placeholder="Term (years)" value={termYears ?? ''} onChange={(e) => setTermYears(e.target.value ? Number(e.target.value) : undefined)} />
        <select className="border rounded-md px-3 py-2" value={rateOptionId ?? ''} onChange={(e) => setRateOptionId(e.target.value)}>
          <option value="">Select bank rate option</option>
          {allRateOptions.map((option) => (
            <option key={option.id} value={option.id}>{option.bank_name} — {option.label}</option>
          ))}
        </select>
      </div>

      {rateOption?.rate_kind === 'FIXED_FOR_X_THEN_USER_RATE' && (
        <input className="border rounded-md px-3 py-2 w-full" placeholder="Post-fixed rate % (user-entered)" value={postFixedRatePct ?? ''} onChange={(e) => setPostFixedRatePct(e.target.value ? Number(e.target.value) : undefined)} />
      )}

      <div className="border rounded-md p-4 space-y-1">
        <p><strong>Monthly payment:</strong> {amort ? formatAed(amort.schedule[0]?.paymentTotal ?? NaN) : '—'}</p>
        <p><strong>Total interest:</strong> {amort ? formatAed(amort.totalInterest) : '—'}</p>
        <p><strong>Upfront cash (down payment + DARI mortgage registration):</strong> {loanAmountAed ? formatAed(upfrontTotal) : '—'}</p>
      </div>

      <details>
        <summary className="cursor-pointer font-semibold">Qualification (LTV + DBR + optional AECB import)</summary>
        <div className="mt-3">
          <QualificationPanel
            rateOption={rateOption}
            purchasePriceAed={purchasePriceAed}
            loanAmountAed={loanAmountAed}
            monthlyIncomeAed={monthlyIncomeAed}
            existingMonthlyDebtsAed={existingMonthlyDebtsAed}
            monthlyMortgagePaymentAed={amort?.schedule[0]?.paymentTotal}
            onMonthlyIncome={setMonthlyIncomeAed}
            onExistingDebts={setExistingMonthlyDebtsAed}
            aecbEnabled={false}
          />
        </div>
      </details>

      <SourcesPanel used={usedSources} />

      <details>
        <summary className="cursor-pointer font-semibold">🔍 Research Mortgage Rates</summary>
        <div className="mt-3">
          <RateScraperPanel onRatesExtracted={handleScrapedRates} />
        </div>
      </details>
    </div>
  );
}
