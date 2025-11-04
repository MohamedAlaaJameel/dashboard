import { NextResponse } from 'next/server';
import { getEventHandlers } from '@/lib/events';

export async function POST(request: Request) {
  try {
    // Debug: log incoming request meta
    try {
      console.log('[events/dash] POST received, url=', request.url);
      console.log('[events/dash] headers=', Object.fromEntries(request.headers));
    } catch (e) {
      // ignore header serialization errors
    }

    let body = {};
    
    // Parse JSON body if present
    if (request.headers.get('content-type')?.includes('application/json')) {
      try {
        body = await request.json();
      } catch (e) {
        // Body is not valid JSON, ignore
      }
    }
    
    // Persist the event server-side so dashboards can fetch it later
    try {
      const id = Date.now().toString() + Math.random().toString(36).slice(2);
      const stored = {
        id,
        type: 'dash',
        timestamp: new Date().toISOString(),
        ...(body || {}),
      };
      // lazy import to avoid circulars in some runtime setups
      const { addEvent } = await import('@/lib/eventsStore');
      addEvent(stored);
      console.log('[events/dash] added event to store:', stored.id);
    } catch (e) {
      console.error('[events/dash] error storing event:', e);
    }

    // Get registered event handlers
    const eventHandlers = getEventHandlers();

    // Log body and current handler keys for debugging
    try {
      console.log('[events/dash] parsed body=', body);
      console.log('[events/dash] available handlers=', Object.keys(eventHandlers).join(','));
    } catch (e) {
      // ignore serialization errors
    }

    // Call the 'dash' event handler if registered
    if (eventHandlers['dash']) {
      const result = eventHandlers['dash'](body);
      // Indicate that the event was dispatched to a registered handler
      return NextResponse.json({ message: result.message, handled: true }, { status: result.status });
    }

    // If no handler registered, return success anyway (for external API calls)
    // but indicate it wasn't handled by the dashboard app
    return NextResponse.json(
      { message: 'Dash event received successfully', handled: false },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing dash event:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json(
      { message: 'Error processing dash event', error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return POST(request);
}
