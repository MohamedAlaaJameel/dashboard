import { NextResponse } from 'next/server';
import { getEvents } from '@/lib/eventsStore';

export async function GET() {
  try {
    const events = getEvents();
    return NextResponse.json({ events }, { status: 200 });
  } catch (e) {
    console.error('[events/all] GET error:', e);
    return NextResponse.json({ events: [] }, { status: 500 });
  }
}
