type StoredEvent = {
  id: string;
  type: string;
  timestamp: string;
  [key: string]: any;
};

const events: StoredEvent[] = [];

export function addEvent(e: StoredEvent) {
  // prepend so newest first
  events.unshift(e);
  // keep last 100
  if (events.length > 100) events.splice(100);
}

export function getEvents() {
  return events.slice();
}

export function clearEvents() {
  events.length = 0;
}

export function markEventIgnored(id: string) {
  const idx = events.findIndex(e => e.id === id);
  if (idx >= 0) {
    // keep the event but mark as ignored for stats
    (events[idx] as any).ignored = true;
    return true;
  }
  return false;
}

export type { StoredEvent };
