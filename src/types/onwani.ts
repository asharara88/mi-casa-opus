// ============================================
// ONWANI ADDRESS LOOKUP – TYPE DEFINITIONS
// Abu Dhabi Official Addressing System
// ============================================

export interface OnwaniRawAttributes {
  GUID?: string;
  GISID?: string;
  ADDRESSNUMBER?: string;
  STREET_EN?: string;
  STREET_AR?: string;
  ADDRESS_EN?: string;
  ADDRESS_AR?: string;
  POSTALCODE?: string;
  LAT?: number | string;
  LNG?: number | string;
  QR_CODE?: string;
  PLOTNUMBER?: string;
  PROPERTYNUMBER?: string;
  PROPERTYNAMEENGLISH?: string;
  PROPERTYTYPE?: string;
  MUNICIPALITY_EN?: string;
  DISTRICT_EN?: string;
  SECTOR_EN?: string;
  [key: string]: unknown;
}

export interface OnwaniFeature {
  attributes: OnwaniRawAttributes;
  geometry?: {
    x: number;
    y: number;
  };
}

export interface OnwaniApiResponse {
  features?: OnwaniFeature[];
  error?: {
    code: number;
    message: string;
    details: string[];
  };
}

export interface OnwaniAddress {
  onwani_guid: string;
  onwani_gisid: string;
  full_address_en: string;
  full_address_ar: string;
  building_number: string;
  street_name_en: string;
  street_name_ar: string;
  district: string;
  sector: string;
  municipality: string;
  postal_code: string;
  plot_number: string;
  property_number: string;
  property_name_en: string;
  property_type: string;
  qr_code: string;
  latitude: string;
  longitude: string;
  onwani_raw_json: string;
}

export type OnwaniFieldKey = keyof OnwaniAddress;

export interface OnwaniLookupResult {
  address: OnwaniAddress;
  raw: OnwaniApiResponse;
}

export type OnwaniStatus = 'idle' | 'loading' | 'success' | 'no-result' | 'error';

export interface OnwaniAddressLookupProps {
  entityType: 'lead' | 'listing' | 'deal';
  entityId: string;
  currentValues?: Partial<OnwaniAddress>;
  onAddressResolved: (address: OnwaniAddress) => void;
  initialLat?: string;
  initialLng?: string;
}

export type OnwaniCrmUpdatePayload = Partial<OnwaniAddress>;
