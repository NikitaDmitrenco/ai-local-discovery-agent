import { GeocodingProvider, GeocodingResult } from '../types';
import { Coordinates } from '../../domain/types';

export class MockGeocodingProvider implements GeocodingProvider {
  name = 'MockGeocodingEngine';

  async reverseGeocode(coordinates: Coordinates): Promise<GeocodingResult> {
    return {
      city: 'Chișinău',
      region: 'Chișinău Municipality',
      country: 'Moldova',
      formattedAddress: 'Chișinău, Moldova',
      coordinates,
    };
  }

  async forwardGeocode(query: string): Promise<GeocodingResult | null> {
    const q = query.toLowerCase();
    if (q.includes('orhei')) {
      return {
        city: 'Orhei',
        region: 'Orhei District',
        country: 'Moldova',
        formattedAddress: 'Orhei, Moldova',
        coordinates: { lat: 47.3833, lng: 28.8167 },
      };
    }
    if (q.includes('vadul')) {
      return {
        city: 'Vadul lui Vodă',
        region: 'Chișinău',
        country: 'Moldova',
        formattedAddress: 'Vadul lui Vodă, Moldova',
        coordinates: { lat: 47.0917, lng: 29.0750 },
      };
    }
    return {
      city: 'Chișinău',
      region: 'Chișinău Municipality',
      country: 'Moldova',
      formattedAddress: 'Chișinău, Moldova',
      coordinates: { lat: 47.0245, lng: 28.8322 },
    };
  }
}
