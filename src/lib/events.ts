const eventHandlers: Record<
  string,
  (body: any) => {message: string; status: number}
> = {};

export function registerEventHandler(
  eventType: string,
  handler: (body: any) => {message: string; status: number}
) {
  // Log registration attempts. Note: if this function runs in the browser
  // the server process will not share the same module state — see notes below.
  try {
    console.log(`[lib/events] registerEventHandler -> registering handler for: ${eventType}`);
    eventHandlers[eventType] = handler;
    console.log(`[lib/events] registerEventHandler -> current handlers: ${Object.keys(eventHandlers).join(',')}`);
  } catch (e) {
    console.error('[lib/events] registerEventHandler error:', e);
  }
}

export function getEventHandlers() {
  try {
    console.log(`[lib/events] getEventHandlers -> handlers: ${Object.keys(eventHandlers).join(',')}`);
  } catch (e) {
    console.error('[lib/events] getEventHandlers error:', e);
  }
  return eventHandlers;
}
