import { GeocodingProvider, GeocodingResult } from '../types';
import { Coordinates } from '../../domain/types';

export class NominatimGeocodingProvider implements GeocodingProvider {
  name = 'OpenStreetMapNominatim';

  async reverseGeocode(coordinates: Coordinates): Promise<GeocodingResult> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coordinates.lat}&lon=${coordinates.lng}`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'AILocalDiscoveryAgent/1.0' },
      });

      if (!response.ok) throw new Error(`Reverse geocode failed: ${response.status}`);
      const data = await response.json();

      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.municipality ||
        data.address?.county ||
        'Local Area';

      const country = data.address?.country || 'Moldova';

      return {
        city,
        region: data.address?.state || data.address?.region,
        country,
        formattedAddress: data.display_name || `${city}, ${country}`,
        coordinates,
      };
    } catch (error) {
      console.warn('Nominatim reverse geocode fallback to default:', error);
      return {
        city: 'Chișinău',
        country: 'Moldova',
        formattedAddress: 'Chișinău, Moldova',
        coordinates,
      };
    }
  }

  async forwardGeocode(query: string): Promise<GeocodingResult | null> {
    try {
      const encoded = encodeURIComponent(query);
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encoded}&limit=1`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'AILocalDiscoveryAgent/1.0' },
      });

      if (!response.ok) throw new Error(`Forward geocode failed: ${response.status}`);
      const data = await response.json();

      if (!data || data.length === 0) return null;

      const first = data[0];
      const lat = parseFloat(first.lat);
      const lng = parseFloat(first.lon);

      return {
        city: first.name || query,
        country: 'Moldova',
        formattedAddress: first.display_name,
        coordinates: { lat, lng },
      };
    } catch (error) {
      console.warn('Nominatim forward geocode failed, falling back:', error);
      return {
        city: query,
        country: 'Moldova',
        formattedAddress: `${query}, Moldova`,
        coordinates: { lat: 47.0245, lng: 28.8322 },
      };
    }
  }
}
