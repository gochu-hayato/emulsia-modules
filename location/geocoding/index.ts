interface GeocodeLocation {
  lat: number;
  lng: number;
}

interface GeocodeResult {
  geometry: { location: GeocodeLocation };
  formatted_address: string;
}

interface GeocodeApiResponse {
  results: GeocodeResult[];
  status: string;
}

const GEOCODE_BASE = 'https://maps.googleapis.com/maps/api/geocode/json';

async function fetchGeocode(params: Record<string, string>): Promise<GeocodeApiResponse> {
  const url = new URL(GEOCODE_BASE);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Geocoding APIリクエストに失敗しました: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<GeocodeApiResponse>;
}

export async function geocodeAddress(
  address: string,
  apiKey: string,
): Promise<{ lat: number; lng: number }> {
  const data = await fetchGeocode({ address, key: apiKey });

  if (data.status !== 'OK' || data.results.length === 0) {
    throw new Error(`住所の変換に失敗しました。ステータス: ${data.status}`);
  }

  const { lat, lng } = data.results[0].geometry.location;
  return { lat, lng };
}

export async function reverseGeocode(
  lat: number,
  lng: number,
  apiKey: string,
): Promise<string> {
  const data = await fetchGeocode({ latlng: `${lat},${lng}`, key: apiKey });

  if (data.status !== 'OK' || data.results.length === 0) {
    throw new Error(`座標の変換に失敗しました。ステータス: ${data.status}`);
  }

  return data.results[0].formatted_address;
}
