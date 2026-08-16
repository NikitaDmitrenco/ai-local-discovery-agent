import { NextRequest, NextResponse } from 'next/server';
import { DiscoveryService } from '@/services/discoveryService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, locationName, refinementKey, sessionId, stream } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid query string' },
        { status: 400 }
      );
    }

    const targetLocation = locationName || 'Chișinău, Moldova';

    // If client requested streaming (SSE)
    if (stream) {
      const responseStream = new TransformStream();
      const writer = responseStream.writable.getWriter();
      const encoder = new TextEncoder();

      const sendEvent = async (type: string, data: any) => {
        try {
          const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
          await writer.write(encoder.encode(payload));
        } catch {
          // Stream might be closed by client
        }
      };

      // Run discovery asynchronously and stream step progress
      (async () => {
        try {
          const result = await DiscoveryService.discoverPlaces(
            query,
            targetLocation,
            refinementKey,
            sessionId,
            (step) => {
              sendEvent('step', step);
            }
          );

          await sendEvent('result', result);
          await sendEvent('done', { status: 'complete' });
        } catch (err: any) {
          await sendEvent('error', { message: err?.message || 'Discovery failed' });
        } finally {
          await writer.close();
        }
      })();

      return new Response(responseStream.readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
        },
      });
    }

    // Default synchronous JSON response
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
