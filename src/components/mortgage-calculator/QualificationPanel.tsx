import { RateOption } from '@/mortgage-data/types';
import { InputSlider } from './InputSlider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

type Props = {
  rateOption?: RateOption;
  purchasePriceAed?: number;
  loanAmountAed?: number;
  monthlyIncomeAed?: number;
  existingMonthlyDebtsAed?: number;
  monthlyMortgagePaymentAed?: number;
  onMonthlyIncome: (v?: number) => void;
  onExistingDebts: (v?: number) => void;
  aecbEnabled?: boolean;
  onAecbImportClick?: () => void;
};

export function QualificationPanel(props: Props) {
  const [open, setOpen] = useState(false);
  const ltv = props.purchasePriceAed && props.loanAmountAed ? (props.loanAmountAed / props.purchasePriceAed) * 100 : undefined;
  const dbr =
    props.monthlyIncomeAed && props.existingMonthlyDebtsAed != null && props.monthlyMortgagePaymentAed != null
      ? ((props.existingMonthlyDebtsAed + props.monthlyMortgagePaymentAed) / props.monthlyIncomeAed) * 100
      : undefined;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full cursor-pointer font-semibold text-sm py-2">
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        Qualification (LTV + DBR)
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-3 text-sm pt-2">
          <p className="text-muted-foreground">
            Qualification runs in guidance mode unless your team has sourced and configured an official underwriting threshold.
          </p>

          <InputSlider
            label="Monthly Income"
            value={props.monthlyIncomeAed}
            onChange={props.onMonthlyIncome}
            min={5000}
            max={500000}
            step={1000}
            unit="AED"
            placeholder="AED"
          />

          <InputSlider
            label="Existing Monthly Debts"
            value={props.existingMonthlyDebtsAed}
            onChange={props.onExistingDebts}
            min={0}
            max={200000}
            step={500}
            unit="AED"
            placeholder="AED"
          />

          <button
            type="button"
            onClick={props.onAecbImportClick}
            disabled={!props.aecbEnabled}
            className="border rounded-md px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import from AECB (requires consent)
          </button>
          {!props.aecbEnabled && (
            <p className="text-xs text-muted-foreground">Enable backend consent endpoints before turning this on in production.</p>
          )}

          <div className="border rounded-md p-3 space-y-1">
            <p><strong>LTV:</strong> {ltv ? `${ltv.toFixed(2)}%` : '—'}</p>
            <p className={dbr != null && dbr > 50 ? 'text-destructive font-medium' : ''}>
              <strong>DBR:</strong> {dbr ? `${dbr.toFixed(2)}%` : '—'}
            </p>
            {dbr != null && dbr > 50 && (
              <p className="text-xs text-destructive">
                ⚠ DBR exceeds 50% — UAE Central Bank guidelines cap DBR at 50%. Consider increasing down payment or reducing existing debts to lower your monthly obligation.
              </p>
            )}
            <p className="text-xs text-muted-foreground">DBR = (existing monthly instalments + new mortgage payment) / monthly income.</p>
          </div>

          {props.rateOption?.ltv_caps?.length ? (
            <p className="text-xs text-muted-foreground">Selected bank has published LTV caps; apply only to the correct customer segment.</p>
          ) : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
