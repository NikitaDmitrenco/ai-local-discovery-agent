import { PhotoEvidence } from '../../domain/types';

export interface RawPhotoCandidate {
  url: string;
  caption?: string;
  source?: string;
  isAttachedToPlaceListing?: boolean;
  isGenericStock?: boolean;
}

export class PhotoVerifier {
  /**
   * Filters and verifies photo candidates against strict place-level authenticity criteria
   */
  verifyPhotos(
    placeId: string,
    placeName: string,
    candidates: RawPhotoCandidate[]
  ): PhotoEvidence[] {
    const verifiedPhotos: PhotoEvidence[] = [];
    const normalizedName = placeName.toLowerCase();
    const nameTokens = normalizedName.split(/\s+/).filter((t) => t.length > 2);

    for (let idx = 0; idx < candidates.length; idx++) {
      const candidate = candidates[idx];
      let confidence = 0.0;
      let isVerified = false;
      let rejectionReason: string | undefined = undefined;

      // 1. Explicit generic stock rejection
      if (candidate.isGenericStock || (candidate.source && candidate.source.toLowerCase().includes('stock'))) {
        rejectionReason = 'Generic stock imagery rejected to prevent misinformation';
        continue;
      }

      // 2. Source check: attached directly to place profile on map / official registry
      if (candidate.isAttachedToPlaceListing || candidate.source?.includes('Official') || candidate.source?.includes('Listing')) {
        confidence += 0.65;
      } else {
        confidence += 0.2;
      }

      // 3. Caption / Contextual Name Check
      const captionLower = (candidate.caption || '').toLowerCase();
      const hasNameMatch = nameTokens.some((token) => captionLower.includes(token));
      if (hasNameMatch) {
        confidence += 0.3;
      } else if (candidate.caption) {
        confidence += 0.15;
      }

      // 4. Valid image URL format check
      if (!candidate.url || !candidate.url.startsWith('http')) {
        continue;
      }

      // 5. Verification threshold check (Strict minimum 0.75 for verified badge)
      if (confidence >= 0.75) {
        isVerified = true;
      } else {
        rejectionReason = `Confidence score (${confidence.toFixed(2)}) below required 0.75 threshold`;
      }

      if (isVerified) {
        verifiedPhotos.push({
          id: `photo-${placeId}-${idx}`,
          url: candidate.url,
          caption: candidate.caption || `${placeName} authentic verified venue photo`,
          verified: true,
          source: candidate.source || 'Verified Place Listing',
          confidence: Math.min(0.99, Math.round(confidence * 100) / 100),
        });
      }
    }

    // Rank verified photos: higher confidence first
    return verifiedPhotos.sort((a, b) => b.confidence - a.confidence);
  }
}
