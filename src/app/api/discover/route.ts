import { NextRequest, NextResponse } from 'next/server';
import { DiscoveryService } from '@/services/discoveryService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, location, refinementKey } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'A natural language query is required.' },
        { status: 400 }
      );
    }

    const result = await DiscoveryService.discoverPlaces(
      query,
      location || 'Chișinău, Moldova',
      refinementKey
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/discover route:', error);
    return NextResponse.json(
      { error: 'An error occurred while executing the AI discovery agent.' },
      { status: 500 }
    );
  }
}
