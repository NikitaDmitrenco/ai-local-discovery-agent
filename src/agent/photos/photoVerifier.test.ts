import { PhotoVerifier, RawPhotoCandidate } from './photoVerifier';

async function runPhotoVerifierTests() {
  const verifier = new PhotoVerifier();

  const candidates: RawPhotoCandidate[] = [
    {
      url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
      caption: 'WakePark Ghidighici cable wakeboarding reservoir line',
      source: 'Official Venue Profile',
      isAttachedToPlaceListing: true,
      isGenericStock: false,
    },
    {
      url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739',
      caption: 'Ghidighici lakeside wooden cabin deck',
      source: 'Verified Traveler Photo',
      isAttachedToPlaceListing: true,
      isGenericStock: false,
    },
    {
      url: 'https://stockphotos.example.com/generic-wakeboard.jpg',
      caption: 'Generic wakeboarder in California',
      source: 'Stock Photo Agency',
      isAttachedToPlaceListing: false,
      isGenericStock: true,
    },
    {
      url: 'https://random-site.com/blurry-water.jpg',
      caption: 'Unverified lake snippet',
      source: 'Random Forum',
      isAttachedToPlaceListing: false,
      isGenericStock: false,
    },
  ];

  console.log('Testing PhotoVerifier with photo candidates...');
  const verified = verifier.verifyPhotos('wakepark-1', 'WakePark Ghidighici', candidates);

  console.log(`Verified ${verified.length} out of ${candidates.length} photos.`);
  console.log('Verified Photos:', JSON.stringify(verified, null, 2));

  // Assertions
  const verifiedCountCorrect = verified.length === 2;
  const stockRejected = !verified.some((p) => p.url.includes('stockphotos'));
  const blurryRejected = !verified.some((p) => p.url.includes('blurry-water'));
  const allAboveThreshold = verified.every((p) => p.verified && p.confidence >= 0.75);

  console.log('\n--- Photo Verifier Acceptance Checks ---');
  console.log('✓ Valid photos verified with high confidence:', verifiedCountCorrect);
  console.log('✓ Generic stock photo strictly rejected:', stockRejected);
  console.log('✓ Low confidence unverified photo rejected:', blurryRejected);
  console.log('✓ All verified photos satisfy confidence threshold:', allAboveThreshold);

  if (!verifiedCountCorrect || !stockRejected || !blurryRejected || !allAboveThreshold) {
    throw new Error('PhotoVerifier failed core acceptance criteria.');
  }

  console.log('\nAll Milestone 10 Photo Discovery & Verification acceptance criteria PASSED!');
}

runPhotoVerifierTests().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
