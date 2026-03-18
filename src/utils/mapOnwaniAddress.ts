import type { OnwaniRawAttributes, OnwaniAddress } from '@/types/onwani';

function safeStr(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

export function mapOnwaniAttributes(attrs: OnwaniRawAttributes): OnwaniAddress {
  return {
    onwani_guid: safeStr(attrs.GUID),
    onwani_gisid: safeStr(attrs.GISID),
    building_number: safeStr(attrs.ADDRESSNUMBER),
    street_name_en: safeStr(attrs.STREET_EN),
    street_name_ar: safeStr(attrs.STREET_AR),
    full_address_en: safeStr(attrs.ADDRESS_EN),
    full_address_ar: safeStr(attrs.ADDRESS_AR),
    postal_code: safeStr(attrs.POSTALCODE),
    latitude: safeStr(attrs.LAT),
    longitude: safeStr(attrs.LNG),
    qr_code: safeStr(attrs.QR_CODE),
    plot_number: safeStr(attrs.PLOTNUMBER),
    property_number: safeStr(attrs.PROPERTYNUMBER),
    property_name_en: safeStr(attrs.PROPERTYNAMEENGLISH),
    property_type: safeStr(attrs.PROPERTYTYPE),
    municipality: safeStr(attrs.MUNICIPALITY_EN),
    district: safeStr(attrs.DISTRICT_EN),
    sector: safeStr(attrs.SECTOR_EN),
    onwani_raw_json: '',
  };
}

export function mergeOnwaniIntoExisting(
  existing: Partial<OnwaniAddress>,
  incoming: OnwaniAddress
): OnwaniAddress {
  const merged = { ...incoming };
  for (const key of Object.keys(merged) as (keyof OnwaniAddress)[]) {
    if (key === 'onwani_raw_json') continue;
    if (!merged[key] && existing[key]) {
      merged[key] = existing[key]!;
    }
  }
  merged.onwani_raw_json = incoming.onwani_raw_json;
  return merged;
}
