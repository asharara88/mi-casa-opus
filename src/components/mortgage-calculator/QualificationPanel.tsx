import { RateOption } from '@/mortgage-data/types';

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
  const ltv = props.purchasePriceAed && props.loanAmountAed ? (props.loanAmountAed / props.purchasePriceAed) * 100 : undefined;
  const dbr =
    props.monthlyIncomeAed && props.existingMonthlyDebtsAed != null && props.monthlyMortgagePaymentAed != null
      ? ((props.existingMonthlyDebtsAed + props.monthlyMortgagePaymentAed) / props.monthlyIncomeAed) * 100
      : undefined;

  return (
    <div className="space-y-3 text-sm">
      <p className="text-muted-foreground">
        Qualification runs in guidance mode unless your team has sourced and configured an official underwriting threshold.
      </p>

      <div className="grid gap-2">
        <label className="font-medium">Monthly income (AED)</label>
        <input
          className="border rounded-md px-3 py-2 bg-background"
          value={props.monthlyIncomeAed ?? ''}
          onChange={(e) => props.onMonthlyIncome(e.target.value ? Number(e.target.value) : undefined)}
        />
      </div>

      <div className="grid gap-2">
        <label className="font-medium">Existing monthly debt instalments (AED)</label>
        <input
          className="border rounded-md px-3 py-2 bg-background"
          value={props.existingMonthlyDebtsAed ?? ''}
          onChange={(e) => props.onExistingDebts(e.target.value ? Number(e.target.value) : undefined)}
        />
        <button
          type="button"
          onClick={props.onAecbImportClick}
          disabled={!props.aecbEnabled}
          className="border rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Import from AECB (requires consent)
        </button>
        {!props.aecbEnabled && (
          <p className="text-xs text-muted-foreground">Enable backend consent endpoints before turning this on in production.</p>
        )}
      </div>

      <div className="border rounded-md p-3 space-y-1">
        <p><strong>LTV:</strong> {ltv ? `${ltv.toFixed(2)}%` : '—'}</p>
        <p><strong>DBR:</strong> {dbr ? `${dbr.toFixed(2)}%` : '—'}</p>
        <p className="text-xs text-muted-foreground">DBR = (existing monthly instalments + new mortgage payment) / monthly income.</p>
      </div>

      {props.rateOption?.ltv_caps?.length ? (
        <p className="text-xs text-muted-foreground">Selected bank has published LTV caps; apply only to the correct customer segment.</p>
      ) : null}
    </div>
  );
}
