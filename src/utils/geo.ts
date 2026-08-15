import { Coordinates } from '../domain/types';

/**
 * Calculates great-circle distance between two geographic points in kilometers
 * using the Haversine formula.
 */
export function haversineDistanceKm(c1: Coordinates, c2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(c2.lat - c1.lat);
  const dLon = toRad(c2.lng - c1.lng);
  const lat1 = toRad(c1.lat);
  const lat2 = toRad(c2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Math.round(d * 10) / 10;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Estimates driving time in minutes based on distance and road factors
 */
export function estimateDriveTimeMinutes(distanceKm: number): number {
  if (distanceKm <= 5) return Math.max(5, Math.round(distanceKm * 2.5));
  if (distanceKm <= 20) return Math.round(10 + (distanceKm - 5) * 1.4);
  return Math.round(25 + (distanceKm - 20) * 1.1);
}

/**
 * Normalizes place names for fuzzy matching and deduplication
 */
export function normalizePlaceName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04FF\u0100-\u024F\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if two places are likely the exact same entity across different sources
 */
export function arePlacesDuplicates(
  nameA: string,
  coordA: Coordinates,
  nameB: string,
  coordB: Coordinates
): boolean {
  const dist = haversineDistanceKm(coordA, coordB);
  const normA = normalizePlaceName(nameA);
  const normB = normalizePlaceName(nameB);

  // Exact spaceless match within 2 km
  const noSpaceA = normA.replace(/\s+/g, '');
  const noSpaceB = normB.replace(/\s+/g, '');
  if (dist < 2.0 && (noSpaceA === noSpaceB || noSpaceA.includes(noSpaceB) || noSpaceB.includes(noSpaceA))) {
    return true;
  }

  // Exact name match or substring within 800 meters
  if (dist < 0.8 && (normA.includes(normB) || normB.includes(normA))) {
    return true;
  }

  // Close location (< 300 meters) with similar key tokens
  if (dist < 0.3) {
    const tokensA = new Set(normA.split(' '));
    const tokensB = new Set(normB.split(' '));
    const intersection = Array.from(tokensA).filter((t) => tokensB.has(t) && t.length > 2);
    if (intersection.length > 0) return true;
  }

  return false;
}
