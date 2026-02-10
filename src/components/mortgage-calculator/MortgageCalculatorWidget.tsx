import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ABU_DHABI_MORTGAGE_DATA } from '@/mortgage-data/abuDhabiMortgageData';
import { formatAed } from '@/lib/money';
import { amortize, buildHybridSegments, buildSingleRateSegments } from '@/lib/mortgageEngine';
import { computeMortgageRegistrationFees } from '@/lib/upfrontFees';
import { QualificationPanel } from './QualificationPanel';
import { SourcesPanel } from './SourcesPanel';
import { BankRateSelector } from './BankRateSelector';
import { InputSlider } from './InputSlider';
import { UpfrontBreakdownCard } from './UpfrontBreakdownCard';
import { AmortizationChart } from './AmortizationChart';
import { AmortizationScheduleTable } from './AmortizationScheduleTable';
import { ExtraPaymentSimulator } from './ExtraPaymentSimulator';
import { ComparisonTable } from './ComparisonTable';
import { SavedScenariosPanel } from './SavedScenariosPanel';
import { DealPrefillBanner, type DealContext } from './DealPrefillBanner';
import { RateOption } from '@/mortgage-data/types';
import type { ScrapedRate } from '@/hooks/useMortgageRateScraper';
import type { MortgageScenarioInputs } from '@/hooks/useMortgageScenarios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileDown } from 'lucide-react';
import { exportMortgagePdf } from '@/lib/mortgage-pdf-export';

interface MortgageCalculatorWidgetProps {
  dealContext?: DealContext;
}

export function MortgageCalculatorWidget({ dealContext }: MortgageCalculatorWidgetProps = {}) {
  const [purchasePriceAed, setPurchasePriceAed] = useState<number>();
  const [loanAmountAed, setLoanAmountAed] = useState<number>();
  const [termYears, setTermYears] = useState<number>();
  const [rateOptionId, setRateOptionId] = useState<string>();
  const [postFixedRatePct, setPostFixedRatePct] = useState<number>();
  const [monthlyIncomeAed, setMonthlyIncomeAed] = useState<number>();
  const [existingMonthlyDebtsAed, setExistingMonthlyDebtsAed] = useState<number>();
  const [liveRateOptions, setLiveRateOptions] = useState<RateOption[]>([]);
  const [extraPayment, setExtraPayment] = useState(0);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [dealApplied, setDealApplied] = useState(false);

  // Auto-apply deal context on mount
  useEffect(() => {
    if (dealContext && !dealApplied) {
      if (dealContext.purchasePrice) {
        setPurchasePriceAed(dealContext.purchasePrice);
        // Suggest 75% LTV
        setLoanAmountAed(Math.round(dealContext.purchasePrice * 0.75));
      }
      if (dealContext.clientIncome) {
        setMonthlyIncomeAed(dealContext.clientIncome);
      }
      setDealApplied(true);
    }
  }, [dealContext]);

  const handleApplyDealContext = (ctx: DealContext) => {
    if (ctx.purchasePrice) {
      setPurchasePriceAed(ctx.purchasePrice);
      setLoanAmountAed(Math.round(ctx.purchasePrice * 0.75));
    }
    if (ctx.clientIncome) {
      setMonthlyIncomeAed(ctx.clientIncome);
    }
    setDealApplied(true);
  };

  const handleLoadScenario = (inputs: MortgageScenarioInputs) => {
    if (inputs.purchasePriceAed != null) setPurchasePriceAed(inputs.purchasePriceAed);
    if (inputs.loanAmountAed != null) setLoanAmountAed(inputs.loanAmountAed);
    if (inputs.termYears != null) setTermYears(inputs.termYears);
    if (inputs.rateOptionId != null) setRateOptionId(inputs.rateOptionId);
    if (inputs.postFixedRatePct != null) setPostFixedRatePct(inputs.postFixedRatePct);
    if (inputs.extraPayment != null) setExtraPayment(inputs.extraPayment);
    if (inputs.comparisonIds) setComparisonIds(inputs.comparisonIds);
  };

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

  const amortWithExtra = useMemo(() => {
    if (!loanAmountAed || !totalMonths || !segments || extraPayment <= 0) return undefined;
    return amortize({ principal: loanAmountAed, totalMonths, segments, extraPaymentMonthly: extraPayment });
  }, [loanAmountAed, segments, totalMonths, extraPayment]);

  const upfrontLines = useMemo(() => {
    if (!loanAmountAed) return [];
    return computeMortgageRegistrationFees(ABU_DHABI_MORTGAGE_DATA.abu_dhabi_fees, loanAmountAed);
  }, [loanAmountAed]);

  const downPayment = purchasePriceAed != null && loanAmountAed != null ? Math.max(0, purchasePriceAed - loanAmountAed) : 0;
  const upfrontTotal = downPayment + upfrontLines.reduce((sum, l) => sum + l.amountAed, 0);
  const usedSources = useMemo(() => {
    const sources = Array.from(new Map(upfrontLines.flatMap((x) => x.sources).map((s) => [s.id, s])).values());
    if (rateOption?.published_rate_pct) sources.push(rateOption.published_rate_pct);
    return sources;
  }, [upfrontLines, rateOption]);

  const handleComparisonToggle = (id: string) => {
    setComparisonIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const currentInputs: MortgageScenarioInputs = {
    purchasePriceAed, loanAmountAed, termYears, rateOptionId, postFixedRatePct, extraPayment, comparisonIds,
  };
  const currentResults = {
    monthlyPayment: amort?.schedule[0]?.paymentTotal,
    totalInterest: amort?.totalInterest,
    upfrontTotal: loanAmountAed ? upfrontTotal : undefined,
  };

  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-5">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-9 w-9"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold">Mortgage Calculator</h1>
      </div>

      {/* Deal Pre-fill Banner */}
      {dealContext && (
        <DealPrefillBanner
          dealContext={dealContext}
          onApply={handleApplyDealContext}
          applied={dealApplied}
        />
      )}

      {/* Interactive Inputs */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          <InputSlider
            label="Purchase Price"
            value={purchasePriceAed}
            onChange={setPurchasePriceAed}
            min={500000}
            max={50000000}
            step={50000}
            unit="AED"
            placeholder="AED"
          />
          <InputSlider
            label="Loan Amount"
            value={loanAmountAed}
            onChange={setLoanAmountAed}
            min={100000}
            max={purchasePriceAed ?? 50000000}
            step={25000}
            unit="AED"
            placeholder="AED"
          />
          <InputSlider
            label="Term"
            value={termYears}
            onChange={setTermYears}
            min={5}
            max={30}
            step={1}
            unit="years"
            placeholder="years"
          />
          <BankRateSelector
            allRateOptions={allRateOptions}
            selectedId={rateOptionId}
            onSelect={setRateOptionId}
            onRatesExtracted={handleScrapedRates}
          />
          {rateOption?.rate_kind === 'FIXED_FOR_X_THEN_USER_RATE' && (
            <InputSlider
              label="Post-fixed Rate"
              value={postFixedRatePct}
              onChange={setPostFixedRatePct}
              min={1}
              max={12}
              step={0.05}
              unit="%"
              placeholder="%"
            />
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Monthly Payment</p>
            <p className="text-xl font-bold text-primary">{amort ? formatAed(amort.schedule[0]?.paymentTotal ?? NaN) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Interest</p>
            <p className="text-xl font-bold text-destructive">{amort ? formatAed(amort.totalInterest) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Upfront Cash</p>
            <p className="text-xl font-bold">{loanAmountAed ? formatAed(upfrontTotal) : '—'}</p>
          </div>
          </div>
          {amort && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportMortgagePdf({
                  purchasePriceAed,
                  loanAmountAed,
                  termYears,
                  rateLabel: rateOption?.label,
                  ratePct: rateOption?.published_rate_pct?.value,
                  monthlyPayment: amort.schedule[0]?.paymentTotal,
                  totalInterest: amort.totalInterest,
                  schedule: amort.schedule,
                  downPayment,
                  upfrontLines,
                  upfrontTotal,
                  extraPayment,
                  baseMonths: amort.schedule.length,
                  baseTotalInterest: amort.totalInterest,
                  extraMonths: amortWithExtra?.schedule.length,
                  extraTotalInterest: amortWithExtra?.totalInterest,
                })}
              >
                <FileDown className="w-4 h-4" />
                Export PDF
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Amortization Chart */}
      {amort && <AmortizationChart schedule={amort.schedule} segments={segments} />}

      {/* Upfront Breakdown */}
      {loanAmountAed && (
        <UpfrontBreakdownCard
          downPayment={downPayment}
          purchasePrice={purchasePriceAed}
          upfrontLines={upfrontLines}
          upfrontTotal={upfrontTotal}
        />
      )}

      {/* Extra Payment Simulator */}
      {amort && (
        <ExtraPaymentSimulator
          extraPayment={extraPayment}
          onExtraPaymentChange={setExtraPayment}
          baseMonths={amort.schedule.length}
          baseTotalInterest={amort.totalInterest}
          extraMonths={amortWithExtra?.schedule.length}
          extraTotalInterest={amortWithExtra?.totalInterest}
          maxPayment={Math.round((amort.schedule[0]?.paymentTotal ?? 5000) * 2)}
        />
      )}

      {/* Multi-Bank Comparison */}
      <ComparisonTable
        rateOptions={allRateOptions}
        selectedIds={comparisonIds}
        onToggle={handleComparisonToggle}
        loanAmount={loanAmountAed}
        totalMonths={totalMonths}
        postFixedRatePct={postFixedRatePct}
      />

      {/* Yearly Schedule */}
      {amort && <AmortizationScheduleTable schedule={amort.schedule} />}

      {/* Save/Load Scenarios */}
      <SavedScenariosPanel
        currentInputs={currentInputs}
        currentResults={currentResults}
        dealId={dealContext?.dealDbId}
        onLoadScenario={handleLoadScenario}
      />

      {/* Qualification */}
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

      <SourcesPanel used={usedSources} />
    </div>
  );
}
