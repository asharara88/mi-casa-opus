export type IsoDate = string;

export type SourceMeta = {
  authority_name: string;
  source_url: string;
  publish_date: IsoDate;
  checked_on: IsoDate;
  notes?: string;
};

export type SourcedNumber = {
  id: string;
  label: string;
  value: number;
  unit: '%' | 'AED' | 'years' | 'months';
  applies_to: string;
  source: SourceMeta;
};

export type RateKind = 'FIXED_FULL_TERM' | 'FIXED_FOR_X_THEN_USER_RATE';

export type RateOption = {
  id: string;
  bank_id: string;
  bank_name: string;
  label: string;
  rate_kind: RateKind;
  published_rate_pct?: SourcedNumber;
  fixed_period_months?: SourcedNumber;
  max_tenor_years?: SourcedNumber;
  ltv_caps?: Array<{ segment_label: string; max_ltv_pct: SourcedNumber }>;
};

export type AbuDhabiFeeRules = {
  mortgage_registration: {
    fee_pct_of_mortgage_value: SourcedNumber;
    max_fee_aed: SourcedNumber;
    e_services_fee_aed_ex_vat: SourcedNumber;
    vat_pct: SourcedNumber;
  };
};

export type MortgageDataConfig = {
  checked_on: IsoDate;
  sourced_numbers: Record<string, SourcedNumber>;
  abu_dhabi_fees: AbuDhabiFeeRules;
  rate_options: RateOption[];
  disclaimers: string[];
};
