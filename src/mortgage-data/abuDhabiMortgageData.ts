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
