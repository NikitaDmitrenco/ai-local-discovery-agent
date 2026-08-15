import { NextRequest, NextResponse } from 'next/server';
import { DiscoveryService } from '@/services/discoveryService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, locationName, refinementKey, sessionId } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid query string' },
        { status: 400 }
      );
    }

    const targetLocation = locationName || 'Chișinău, Moldova';
    const result = await DiscoveryService.discoverPlaces(
      query,
      targetLocation,
      refinementKey,
      sessionId
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error executing DiscoveryService:', error);
    return NextResponse.json(
      { error: 'Failed to discover places. Please try again.' },
      { status: 500 }
    );
  }
}
