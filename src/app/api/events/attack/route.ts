import { NextResponse } from 'next/server';
import { getEventHandlers } from '@/lib/events';
import { addEvent } from '@/lib/eventsStore';

export async function POST(request: Request) {
  try {
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

      // Try to infer an attackType from the URL path if the client posted to
      // /api/events/attack/<type> (e.g. /api/events/attack/kick) or use body.attackType.
      const { pathname } = new URL(request.url);
      const parts = pathname.split('/').filter(Boolean);
      const attackIndex = parts.indexOf('attack');
      let inferredType: string | undefined = undefined;
      if (attackIndex >= 0 && parts.length > attackIndex + 1) {
        inferredType = parts[attackIndex + 1];
      }

      const attackType = (body && (body as any).attackType) || inferredType || (body && (body as any).type) || 'Unknown Attack';
      const attacker = (body && (body as any).attacker) || 'Player';
      const defender = (body && (body as any).defender) || 'Dummy';
      const hitVal = (body && typeof (body as any).hit === 'boolean') ? (body as any).hit : undefined;

      const stored: any = {
        id,
        type: 'attack',
        timestamp: new Date().toISOString(),
        attackType,
        attacker,
        defender,
      };

      // Mark silent if no explicit hit information was provided
      const silent = hitVal === undefined;
      stored.silent = silent;
      // record kind for clarity: 'start' for silent start requests, 'result' for hits/misses
      stored.kind = silent ? 'start' : 'result';
      if (!silent) stored.hit = hitVal;

      // copy any other fields the client sent (non-destructively)
      try {
        if (body && typeof body === 'object') {
          for (const [k, v] of Object.entries(body as any)) {
            if (!(k in stored)) stored[k] = v;
          }
        }
      } catch (e) {
        // ignore
      }

      addEvent(stored);
      console.log('[events/attack] added event to store:', stored.id, stored.attackType, stored.attacker, stored.defender, stored.hit);
    } catch (e) {
      console.error('[events/attack] error storing event:', e);
    }

    // Get registered event handlers
    const eventHandlers = getEventHandlers();

    // Call the 'attack' event handler if registered
    if (eventHandlers['attack']) {
      const result = eventHandlers['attack'](body);
      return NextResponse.json({ message: result.message, handled: true }, { status: result.status });
    }

    // If no handler registered, return success anyway (for external API calls)
    return NextResponse.json(
      { message: 'Attack event received successfully', handled: false },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing attack event:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json(
      { message: 'Error processing attack event', error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return POST(request);
}
