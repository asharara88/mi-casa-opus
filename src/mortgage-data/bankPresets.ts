import adcbLogo from '@/assets/bank-logos/adcb.png';
import fabLogo from '@/assets/bank-logos/fab.png';
import adibLogo from '@/assets/bank-logos/adib.png';
import enbdLogo from '@/assets/bank-logos/enbd.png';
import dibLogo from '@/assets/bank-logos/dib.png';
import cbdLogo from '@/assets/bank-logos/cbd.png';
import rakbankLogo from '@/assets/bank-logos/rakbank.png';
import mashreqLogo from '@/assets/bank-logos/mashreq.png';

export type BankPreset = {
  id: string;
  name: string;
  shortName: string;
  mortgagePageUrl: string;
  alternateUrls?: string[];
  logo?: string;
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
    logo: adcbLogo,
  },
  {
    id: 'fab',
    name: 'First Abu Dhabi Bank',
    shortName: 'FAB',
    mortgagePageUrl: 'https://www.bankfab.com/en-ae/personal/loans/home-loans',
    logo: fabLogo,
  },
  {
    id: 'adib',
    name: 'Abu Dhabi Islamic Bank',
    shortName: 'ADIB',
    mortgagePageUrl: 'https://www.adib.ae/en/personal/finance/home-finance',
    logo: adibLogo,
  },
  {
    id: 'enbd',
    name: 'Emirates NBD',
    shortName: 'ENBD',
    mortgagePageUrl: 'https://www.emiratesnbd.com/en/personal-banking/loans/home-loans',
    logo: enbdLogo,
  },
  {
    id: 'dib',
    name: 'Dubai Islamic Bank',
    shortName: 'DIB',
    mortgagePageUrl: 'https://www.dib.ae/personal/home-finance',
    logo: dibLogo,
  },
  {
    id: 'mashreq',
    name: 'Mashreq Bank',
    shortName: 'Mashreq',
    mortgagePageUrl: 'https://www.mashreqbank.com/en/uae/personal/loans/mortgage',
    logo: mashreqLogo,
  },
  {
    id: 'rakbank',
    name: 'RAKBANK',
    shortName: 'RAK',
    mortgagePageUrl: 'https://rakbank.ae/wps/portal/retail-banking/loans/home-loans',
    logo: rakbankLogo,
  },
  {
    id: 'cbd',
    name: 'Commercial Bank of Dubai',
    shortName: 'CBD',
    mortgagePageUrl: 'https://www.cbd.ae/personal/loans/home-loans',
    logo: cbdLogo,
  },
];
