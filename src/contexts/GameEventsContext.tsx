'use client';

import type { ReactNode } from 'react';
import React, { createContext, useState, useCallback, useMemo, useEffect } from 'react';

// Define the types of events
export type AttackEvent = {
  id: string;
  type: 'attack';
  timestamp: string;
  attacker: string;
  defender: string;
  attackType: string;
  hit?: boolean;
  // true when the attack event had no explicit hit info
  silent?: boolean;
};

export type DashEvent = {
  id: string;
  type: 'dash';
  timestamp: string;
  character: string;
};

export type GameEvent = AttackEvent | DashEvent;

// Define the context state
interface GameEventsContextType {
  events: GameEvent[];
  attackCount: number;
  hitCount: number;
  dashCount: number;
  // success rate computed server-side using user formula (rounded percent) or null
  successRateByUserFormula: number | null;
  addAttackEvent: (event?: Partial<Omit<AttackEvent, 'id' | 'type' | 'timestamp'>>) => void;
  addDashEvent: (event?: Partial<Omit<DashEvent, 'id' | 'type' | 'timestamp'>>) => void;
}

// Create the context with a default undefined value
export const GameEventsContext = createContext<GameEventsContextType | undefined>(undefined);

const ATTACK_TYPES = ['Sword Slash', 'Fireball', 'Arrow Shot', 'Axe Swing'];
const HIT_PROBABILITY = 0.7; // 70% chance to hit

// Create the provider component
export function GameEventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [attackCount, setAttackCount] = useState(0);
  const [hitCount, setHitCount] = useState(0);
  const [dashCount, setDashCount] = useState(0);
  const [successRateByUserFormula, setSuccessRateByUserFormula] = useState<number | null>(null);

  const addAttackEvent = useCallback((event: Partial<Omit<AttackEvent, 'id' | 'type' | 'timestamp'>> = {}) => {
    const isHit = event.hit ?? Math.random() < HIT_PROBABILITY;
    const newEvent: AttackEvent = {
      id: crypto.randomUUID(),
      type: 'attack',
      timestamp: new Date().toISOString(),
      attacker: event.attacker || 'Player',
      defender: event.defender || 'Enemy ' + Math.floor(Math.random() * 3 + 1),
      attackType: event.attackType || ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)],
      hit: isHit,
    };
    setEvents(prev => [newEvent, ...prev].slice(0, 100)); // Keep last 100 events
    setAttackCount(prev => prev + 1);
    if (isHit) {
      setHitCount(prev => prev + 1);
    }
  }, []);

  const addDashEvent = useCallback((event: Partial<Omit<DashEvent, 'id' | 'type' | 'timestamp'>> = {}) => {
    const newEvent: DashEvent = {
      id: crypto.randomUUID(),
      type: 'dash',
      timestamp: new Date().toISOString(),
      character: event.character || 'Player',
    };
    setEvents(prev => [newEvent, ...prev].slice(0, 100)); // Keep last 100 events
    setDashCount(prev => prev + 1);
  }, []);

  // Fetch persisted events from the server and merge into client state.
  useEffect(() => {
    let mounted = true;

    async function fetchEvents() {
      try {
        const res = await fetch('/api/events/all');
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted || !data?.events) return;
        // Merge server events (they are newest-first) with current client events, dedupe by id
        const serverEvents: GameEvent[] = data.events;
        setEvents(prev => {
          const map = new Map<string, GameEvent>();
          // add server events first
          for (const e of serverEvents) map.set(e.id, e);
          for (const e of prev) map.set(e.id, e);
          // return as array newest-first
          return Array.from(map.values()).slice(0, 100);
        });

        // Recompute counts from combined events
        setAttackCount(prev => {
          const combined = [...data.events, ...[]];
          const attacks = combined.filter((e: any) => e.type === 'attack').length;
          return attacks;
        });
        setHitCount(prev => {
          const combined = [...data.events, ...[]];
          const hits = combined.filter((e: any) => e.type === 'attack' && e.hit).length;
          return hits;
        });
        setDashCount(prev => {
          const combined = [...data.events, ...[]];
          const dashes = combined.filter((e: any) => e.type === 'dash').length;
          return dashes;
        });

        // Fetch server-side stats (includes user formula success rate)
        try {
          const s = await fetch('/api/events/stats');
          if (s.ok) {
            const sd = await s.json();
            setSuccessRateByUserFormula(sd?.successRateByUserFormula ?? null);
          }
        } catch (e) {
          // ignore
        }
      } catch (e) {
        // ignore
      }
    }

    fetchEvents();
    const id = setInterval(fetchEvents, 3000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const value = useMemo(() => ({
    events,
    attackCount,
    hitCount,
    dashCount,
    successRateByUserFormula,
    addAttackEvent,
    addDashEvent,
  }), [events, attackCount, hitCount, dashCount, successRateByUserFormula, addAttackEvent, addDashEvent]);

  return (
    <GameEventsContext.Provider value={value}>
      {children}
    </GameEventsContext.Provider>
  );
}
