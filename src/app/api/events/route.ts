'use server';
import {NextResponse} from 'next/server';
import { getEventHandlers } from '@/lib/events';

export async function POST(request: Request) {
  try {
    const {pathname} = new URL(request.url);
    const eventType = pathname.split('/').pop() || '';

    let body = {};
    // Check if the request has a body. GET requests do not.
    if (request.headers.get('content-type')?.includes('application/json')) {
      try {
        body = await request.json();
      } catch (e) {
        // body is not json, ignore
      }
    }
    
    const eventHandlers = getEventHandlers();
    if (eventHandlers[eventType]) {
      const result = eventHandlers[eventType](body);
      return NextResponse.json({message: result.message}, {status: result.status});
    }

    return NextResponse.json({message: 'Event type not supported'}, {status: 404});
  } catch (error) {
    console.error('Error processing game event:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json(
      {message: 'Error processing event', error: errorMessage},
      {status: 500}
    );
  }
}

export async function GET(request: Request) {
  return POST(request);
}
