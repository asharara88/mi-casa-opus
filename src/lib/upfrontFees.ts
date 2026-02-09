import { AbuDhabiFeeRules, SourcedNumber } from '@/mortgage-data/types';

export type UpfrontLine = { label: string; amountAed: number; sources: SourcedNumber[] };

export function computeMortgageRegistrationFees(abuDhabiFees: AbuDhabiFeeRules, mortgageAmountAed: number): UpfrontLine[] {
  const feePct = abuDhabiFees.mortgage_registration.fee_pct_of_mortgage_value.value / 100;
  const cap = abuDhabiFees.mortgage_registration.max_fee_aed.value;
  const regFee = Math.min(mortgageAmountAed * feePct, cap);
  const eFeeExVat = abuDhabiFees.mortgage_registration.e_services_fee_aed_ex_vat.value;
  const vat = abuDhabiFees.mortgage_registration.vat_pct.value / 100;

  return [
    {
      label: 'Abu Dhabi mortgage registration (DARI) — % fee',
      amountAed: regFee,
      sources: [abuDhabiFees.mortgage_registration.fee_pct_of_mortgage_value, abuDhabiFees.mortgage_registration.max_fee_aed],
    },
    {
      label: 'Abu Dhabi mortgage registration (DARI) — e-services fee incl. VAT',
      amountAed: eFeeExVat * (1 + vat),
      sources: [abuDhabiFees.mortgage_registration.e_services_fee_aed_ex_vat, abuDhabiFees.mortgage_registration.vat_pct],
    },
  ];
}
