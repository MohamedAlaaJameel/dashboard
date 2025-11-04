'use server';

const eventHandlers: Record<
  string,
  (body: any) => {message: string; status: number}
> = {};

export async function registerEventHandler(
  eventType: string,
  handler: (body: any) => {message: string; status: number}
) {
  // Log registration for debugging: this will appear in the Next server logs
  try {
    // Avoid serializing the handler function itself (may not be serializable)
    console.log(`[events] registerEventHandler -> registering handler for: ${eventType}`);
    eventHandlers[eventType] = handler;
    console.log(`[events] registerEventHandler -> current handlers: ${Object.keys(eventHandlers).join(',')}`);
  } catch (e) {
    console.error('[events] registerEventHandler error:', e);
  }
}

export async function getEventHandlers() {
    // Log access to handlers so we can see when routes try to dispatch
    try {
      console.log(`[events] getEventHandlers -> handlers: ${Object.keys(eventHandlers).join(',')}`);
    } catch (e) {
      console.error('[events] getEventHandlers error:', e);
    }
    return eventHandlers;
}
