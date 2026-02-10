export type BankPreset = {
  id: string;
  name: string;
  shortName: string;
  mortgagePageUrl: string;
  alternateUrls?: string[];
  logoEmoji: string;
};

export const UAE_BANK_PRESETS: BankPreset[] = [
  {
    id: 'adcb',
    name: 'Abu Dhabi Commercial Bank',
    shortName: 'ADCB',
    mortgagePageUrl: 'https://www.adcb.com/en/personal/loans/home-loans',
    alternateUrls: [
      'https://www.adcb.com/en/personal/offers/loans/own-your-dream-home',
    ],
    logoEmoji: '🏦',
  },
  {
    id: 'fab',
    name: 'First Abu Dhabi Bank',
    shortName: 'FAB',
    mortgagePageUrl: 'https://www.bankfab.com/en-ae/personal/loans/home-loans',
    logoEmoji: '🏛️',
  },
  {
    id: 'adib',
    name: 'Abu Dhabi Islamic Bank',
    shortName: 'ADIB',
    mortgagePageUrl: 'https://www.adib.ae/en/personal/finance/home-finance',
    logoEmoji: '🕌',
  },
  {
    id: 'enbd',
    name: 'Emirates NBD',
    shortName: 'ENBD',
    mortgagePageUrl: 'https://www.emiratesnbd.com/en/personal-banking/loans/home-loans',
    logoEmoji: '🏢',
  },
  {
    id: 'dib',
    name: 'Dubai Islamic Bank',
    shortName: 'DIB',
    mortgagePageUrl: 'https://www.dib.ae/personal/home-finance',
    logoEmoji: '🌙',
  },
  {
    id: 'mashreq',
    name: 'Mashreq Bank',
    shortName: 'Mashreq',
    mortgagePageUrl: 'https://www.mashreqbank.com/en/uae/personal/loans/mortgage',
    logoEmoji: '💳',
  },
  {
    id: 'rakbank',
    name: 'RAKBANK',
    shortName: 'RAK',
    mortgagePageUrl: 'https://rakbank.ae/wps/portal/retail-banking/loans/home-loans',
    logoEmoji: '🏗️',
  },
  {
    id: 'cbd',
    name: 'Commercial Bank of Dubai',
    shortName: 'CBD',
    mortgagePageUrl: 'https://www.cbd.ae/personal/loans/home-loans',
    logoEmoji: '🏙️',
  },
];
