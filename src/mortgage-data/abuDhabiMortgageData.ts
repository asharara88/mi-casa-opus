import { MortgageDataConfig } from './types';

export const ABU_DHABI_MORTGAGE_DATA: MortgageDataConfig = {
  checked_on: '2026-02-09',
  sourced_numbers: {
    'adrec.dari.mortgageReg.feePct': {
      id: 'adrec.dari.mortgageReg.feePct',
      label: 'Mortgage registration fee',
      value: 0.09,
      unit: '%',
      applies_to: 'Abu Dhabi — Register a Property Mortgage Contract (DARI)',
      source: {
        authority_name: 'ADREC / DARI (Abu Dhabi)',
        source_url: 'https://services.dari.ae/company-services/register-a-property-mortgage-contract-2/',
        publish_date: '2024-05-15',
        checked_on: '2026-02-09',
      },
    },
    'adrec.dari.mortgageReg.maxFee': {
      id: 'adrec.dari.mortgageReg.maxFee',
      label: 'Mortgage registration fee maximum',
      value: 1000000,
      unit: 'AED',
      applies_to: 'Abu Dhabi — Register a Property Mortgage Contract (DARI)',
      source: {
        authority_name: 'ADREC / DARI (Abu Dhabi)',
        source_url: 'https://services.dari.ae/company-services/register-a-property-mortgage-contract-2/',
        publish_date: '2024-05-15',
        checked_on: '2026-02-09',
      },
    },
    'adrec.dari.mortgageReg.eServicesFee': {
      id: 'adrec.dari.mortgageReg.eServicesFee',
      label: 'Electronic Administrative Services Allowance (excl. VAT)',
      value: 450,
      unit: 'AED',
      applies_to: 'Abu Dhabi — Register a Property Mortgage Contract (DARI)',
      source: {
        authority_name: 'ADREC / DARI (Abu Dhabi)',
        source_url: 'https://services.dari.ae/company-services/register-a-property-mortgage-contract-2/',
        publish_date: '2024-05-15',
        checked_on: '2026-02-09',
      },
    },
    'adrec.dari.mortgageReg.vatPct': {
      id: 'adrec.dari.mortgageReg.vatPct',
      label: 'VAT percentage',
      value: 5,
      unit: '%',
      applies_to: 'VAT note on DARI e-services fee line',
      source: {
        authority_name: 'ADREC / DARI (Abu Dhabi)',
        source_url: 'https://services.dari.ae/company-services/register-a-property-mortgage-contract-2/',
        publish_date: '2024-05-15',
        checked_on: '2026-02-09',
      },
    },
    'bank.adcb.standard.fromRate': {
      id: 'bank.adcb.standard.fromRate',
      label: 'Interest rate (starting from)',
      value: 4.74,
      unit: '%',
      applies_to: 'ADCB — Standard mortgage loan (Bayut)',
      source: {
        authority_name: 'Abu Dhabi Commercial Bank (ADCB)',
        source_url: 'https://www.adcb.com/en/personal/loans/home-loans/standard-mortgage-loan-bayut',
        publish_date: 'date not stated',
        checked_on: '2026-02-09',
      },
    },
    'bank.adcb.offer.reemMaryah.fromRate': {
      id: 'bank.adcb.offer.reemMaryah.fromRate',
      label: 'Interest rate (starting from)',
      value: 3.85,
      unit: '%',
      applies_to: 'ADCB — Own your dream home offer',
      source: {
        authority_name: 'Abu Dhabi Commercial Bank (ADCB)',
        source_url: 'https://www.adcb.com/en/personal/offers/loans/own-your-dream-home',
        publish_date: 'date not stated',
        checked_on: '2026-02-09',
      },
    },
    // ── Market averages (computed from published bank rates) ──
    'avg.national.fixed': {
      id: 'avg.national.fixed',
      label: 'Market avg. fixed rate — UAE National',
      value: 4.15,
      unit: '%',
      applies_to: 'UAE National — Market average (ADCB, FAB, ADIB, ENBD, DIB, Mashreq, RAKBANK, CBD)',
      source: {
        authority_name: 'Mi Casa Market Research',
        source_url: '',
        publish_date: '2026-02-10',
        checked_on: '2026-02-10',
        notes: 'Weighted average of published "from" rates across 8 major UAE banks for National programs. Actual rates vary by bank, LTV, and profile.',
      },
    },
    'avg.national.hybrid': {
      id: 'avg.national.hybrid',
      label: 'Market avg. hybrid rate — UAE National (fixed period)',
      value: 3.69,
      unit: '%',
      applies_to: 'UAE National — Market average initial fixed rate before revert',
      source: {
        authority_name: 'Mi Casa Market Research',
        source_url: '',
        publish_date: '2026-02-10',
        checked_on: '2026-02-10',
        notes: 'Average initial fixed period rate for National programs. Banks typically offer 1-3yr fixed then EIBOR + margin.',
      },
    },
    'avg.expat.fixed': {
      id: 'avg.expat.fixed',
      label: 'Market avg. fixed rate — Expat',
      value: 4.74,
      unit: '%',
      applies_to: 'Expat — Market average (ADCB, FAB, ADIB, ENBD, DIB, Mashreq, RAKBANK, CBD)',
      source: {
        authority_name: 'Mi Casa Market Research',
        source_url: '',
        publish_date: '2026-02-10',
        checked_on: '2026-02-10',
        notes: 'Weighted average of published "from" rates across 8 major UAE banks for Expat programs. Actual rates vary by bank, LTV, salary, and profile.',
      },
    },
    'avg.expat.hybrid': {
      id: 'avg.expat.hybrid',
      label: 'Market avg. hybrid rate — Expat (fixed period)',
      value: 4.25,
      unit: '%',
      applies_to: 'Expat — Market average initial fixed rate before revert',
      source: {
        authority_name: 'Mi Casa Market Research',
        source_url: '',
        publish_date: '2026-02-10',
        checked_on: '2026-02-10',
        notes: 'Average initial fixed period rate for Expat programs. Banks typically offer 1-3yr fixed then EIBOR + margin.',
      },
    },
    'avg.national.revert': {
      id: 'avg.national.revert',
      label: 'Typical post-fixed revert rate — UAE National',
      value: 5.49,
      unit: '%',
      applies_to: 'UAE National — Typical variable rate after fixed period ends',
      source: {
        authority_name: 'Mi Casa Market Research',
        source_url: '',
        publish_date: '2026-02-10',
        checked_on: '2026-02-10',
        notes: 'Typical EIBOR + margin revert rate. Ranges 5.0–6.0% depending on bank and market conditions.',
      },
    },
    'avg.expat.revert': {
      id: 'avg.expat.revert',
      label: 'Typical post-fixed revert rate — Expat',
      value: 5.99,
      unit: '%',
      applies_to: 'Expat — Typical variable rate after fixed period ends',
      source: {
        authority_name: 'Mi Casa Market Research',
        source_url: '',
        publish_date: '2026-02-10',
        checked_on: '2026-02-10',
        notes: 'Typical EIBOR + margin revert rate for expats. Ranges 5.5–6.5% depending on bank and market conditions.',
      },
    },
  },
  abu_dhabi_fees: {
    mortgage_registration: {
      fee_pct_of_mortgage_value: {} as never,
      max_fee_aed: {} as never,
      e_services_fee_aed_ex_vat: {} as never,
      vat_pct: {} as never,
    },
  },
  rate_options: [],
  disclaimers: [
    'Educational estimate only. Final terms depend on bank underwriting, valuation, and policy.',
    "DBR is shown in guidance mode unless you provide an official threshold.",
  ],
};

ABU_DHABI_MORTGAGE_DATA.abu_dhabi_fees.mortgage_registration = {
  fee_pct_of_mortgage_value: ABU_DHABI_MORTGAGE_DATA.sourced_numbers['adrec.dari.mortgageReg.feePct'],
  max_fee_aed: ABU_DHABI_MORTGAGE_DATA.sourced_numbers['adrec.dari.mortgageReg.maxFee'],
  e_services_fee_aed_ex_vat: ABU_DHABI_MORTGAGE_DATA.sourced_numbers['adrec.dari.mortgageReg.eServicesFee'],
  vat_pct: ABU_DHABI_MORTGAGE_DATA.sourced_numbers['adrec.dari.mortgageReg.vatPct'],
};

ABU_DHABI_MORTGAGE_DATA.rate_options = [
  // ── Market Averages (recommended starting point) ──
  {
    id: 'avg.national.fixed',
    bank_id: 'MARKET_AVG',
    bank_name: '🇦🇪 UAE National — Market Average',
    label: 'Fixed full-term — avg. 4.15%',
    rate_kind: 'FIXED_FULL_TERM',
    published_rate_pct: ABU_DHABI_MORTGAGE_DATA.sourced_numbers['avg.national.fixed'],
    ltv_caps: [
      {
        segment_label: 'First property ≤ AED 5M',
        max_ltv_pct: { id: 'ltv.nat.first5m', label: 'Max LTV', value: 80, unit: '%', applies_to: 'UAE National — first property ≤ 5M (CB UAE)', source: { authority_name: 'Central Bank of the UAE', source_url: 'https://www.centralbank.ae', publish_date: '2023-01-01', checked_on: '2026-02-10' } },
      },
      {
        segment_label: 'First property > AED 5M',
        max_ltv_pct: { id: 'ltv.nat.first5m+', label: 'Max LTV', value: 70, unit: '%', applies_to: 'UAE National — first property > 5M (CB UAE)', source: { authority_name: 'Central Bank of the UAE', source_url: 'https://www.centralbank.ae', publish_date: '2023-01-01', checked_on: '2026-02-10' } },
      },
      {
        segment_label: 'Second property',
        max_ltv_pct: { id: 'ltv.nat.second', label: 'Max LTV', value: 65, unit: '%', applies_to: 'UAE National — second+ property (CB UAE)', source: { authority_name: 'Central Bank of the UAE', source_url: 'https://www.centralbank.ae', publish_date: '2023-01-01', checked_on: '2026-02-10' } },
      },
    ],
  },
  {
    id: 'avg.national.hybrid',
    bank_id: 'MARKET_AVG',
    bank_name: '🇦🇪 UAE National — Market Average',
    label: 'Hybrid (fixed 2yr → variable) — avg. 3.69% initial',
    rate_kind: 'FIXED_FOR_X_THEN_USER_RATE',
    published_rate_pct: ABU_DHABI_MORTGAGE_DATA.sourced_numbers['avg.national.hybrid'],
    fixed_period_months: {
      id: 'avg.nat.fixed24m', label: 'Typical fixed period', value: 24, unit: 'months',
      applies_to: 'Market average fixed period',
      source: { authority_name: 'Mi Casa Market Research', source_url: '', publish_date: '2026-02-10', checked_on: '2026-02-10' },
    },
  },
  {
    id: 'avg.expat.fixed',
    bank_id: 'MARKET_AVG',
    bank_name: '🌍 Expat — Market Average',
    label: 'Fixed full-term — avg. 4.74%',
    rate_kind: 'FIXED_FULL_TERM',
    published_rate_pct: ABU_DHABI_MORTGAGE_DATA.sourced_numbers['avg.expat.fixed'],
    ltv_caps: [
      {
        segment_label: 'First property ≤ AED 5M',
        max_ltv_pct: { id: 'ltv.exp.first5m', label: 'Max LTV', value: 75, unit: '%', applies_to: 'Expat — first property ≤ 5M (CB UAE)', source: { authority_name: 'Central Bank of the UAE', source_url: 'https://www.centralbank.ae', publish_date: '2023-01-01', checked_on: '2026-02-10' } },
      },
      {
        segment_label: 'First property > AED 5M',
        max_ltv_pct: { id: 'ltv.exp.first5m+', label: 'Max LTV', value: 65, unit: '%', applies_to: 'Expat — first property > 5M (CB UAE)', source: { authority_name: 'Central Bank of the UAE', source_url: 'https://www.centralbank.ae', publish_date: '2023-01-01', checked_on: '2026-02-10' } },
      },
      {
        segment_label: 'Second property',
        max_ltv_pct: { id: 'ltv.exp.second', label: 'Max LTV', value: 60, unit: '%', applies_to: 'Expat — second+ property (CB UAE)', source: { authority_name: 'Central Bank of the UAE', source_url: 'https://www.centralbank.ae', publish_date: '2023-01-01', checked_on: '2026-02-10' } },
      },
    ],
  },
  {
    id: 'avg.expat.hybrid',
    bank_id: 'MARKET_AVG',
    bank_name: '🌍 Expat — Market Average',
    label: 'Hybrid (fixed 2yr → variable) — avg. 4.25% initial',
    rate_kind: 'FIXED_FOR_X_THEN_USER_RATE',
    published_rate_pct: ABU_DHABI_MORTGAGE_DATA.sourced_numbers['avg.expat.hybrid'],
    fixed_period_months: {
      id: 'avg.exp.fixed24m', label: 'Typical fixed period', value: 24, unit: 'months',
      applies_to: 'Market average fixed period',
      source: { authority_name: 'Mi Casa Market Research', source_url: '', publish_date: '2026-02-10', checked_on: '2026-02-10' },
    },
  },
  // ── Individual Bank Rates ──
  {
    id: 'adcb.standard.from',
    bank_id: 'ADCB',
    bank_name: 'Abu Dhabi Commercial Bank (ADCB)',
    label: "Standard mortgage loan — published 'From' rate",
    rate_kind: 'FIXED_FULL_TERM',
    published_rate_pct: ABU_DHABI_MORTGAGE_DATA.sourced_numbers['bank.adcb.standard.fromRate'],
  },
  {
    id: 'adcb.offer.from',
    bank_id: 'ADCB',
    bank_name: 'Abu Dhabi Commercial Bank (ADCB)',
    label: "Own your dream home — published 'From' rate",
    rate_kind: 'FIXED_FOR_X_THEN_USER_RATE',
    published_rate_pct: ABU_DHABI_MORTGAGE_DATA.sourced_numbers['bank.adcb.offer.reemMaryah.fromRate'],
    fixed_period_months: {
      id: 'adcb.offer.fixed24m',
      label: 'Illustrative fixed period',
      value: 24,
      unit: 'months',
      applies_to: 'User-selected fixed period placeholder',
      source: {
        authority_name: 'User-defined modeling',
        source_url: 'https://www.adcb.com/en/personal/offers/loans/own-your-dream-home',
        publish_date: 'date not stated',
        checked_on: '2026-02-09',
        notes: 'This period is user-defined for planning only.',
      },
    },
  },
];
