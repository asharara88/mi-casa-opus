import type { OnwaniApiResponse, OnwaniLookupResult } from '@/types/onwani';
import { mapOnwaniAttributes } from '@/utils/mapOnwaniAddress';

const ONWANI_ENDPOINT =
  'https://onwani.abudhabi.ae/arcgis/rest/services/Onwani/OnwaniAPI/MapServer/1/query';

export async function fetchOnwaniAddress(
  lat: number,
  lng: number
): Promise<OnwaniLookupResult | null> {
  if (!isFinite(lat) || !isFinite(lng)) {
    throw new Error('Invalid coordinates: latitude and longitude must be finite numbers');
  }
  if (lat < -90 || lat > 90) {
    throw new Error('Latitude must be between -90 and 90');
  }
  if (lng < -180 || lng > 180) {
    throw new Error('Longitude must be between -180 and 180');
  }

  const params = new URLSearchParams({
    geometry: `${lng},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: '*',
    f: 'json',
  });

  const url = `${ONWANI_ENDPOINT}?${params.toString()}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new Error(
      `Network error while contacting Onwani API: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
  }

  if (!response.ok) {
    throw new Error(`Onwani API returned HTTP ${response.status}`);
  }

  let data: OnwaniApiResponse;
  try {
    data = await response.json();
  } catch {
    throw new Error('Failed to parse Onwani API response as JSON');
  }

  if (data.error) {
    throw new Error(`Onwani API error: ${data.error.message}`);
  }

  if (!data.features || data.features.length === 0) {
    return null;
  }

  const attrs = data.features[0].attributes;
  const address = mapOnwaniAttributes(attrs);
  address.onwani_raw_json = JSON.stringify(data);

  return { address, raw: data };
}
