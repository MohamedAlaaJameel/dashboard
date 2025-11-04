'use server';

import { summarizeAttackEvents, SummarizeAttackEventsInput } from '@/ai/flows/summarize-attack-events';

export type ActionState = {
  summary?: string;
  error?: string;
  timestamp?: number;
};

export async function getEventSummary(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const eventsJson = formData.get('events') as string;
    if (!eventsJson) {
      return { error: 'No events provided.', timestamp: Date.now() };
    }
    const allEvents = JSON.parse(eventsJson);
    
    // Filter for only attack events as the AI flow is specific to them
    const attackEvents = allEvents.filter((e: any) => e.type === 'attack').map((e: any) => ({
        timestamp: e.timestamp,
        attacker: e.attacker,
        defender: e.defender,
        attackType: e.attackType,
        hit: e.hit,
    }));

    if (attackEvents.length === 0) {
      return { summary: 'No attack events to summarize.', timestamp: Date.now() };
    }

    const input: SummarizeAttackEventsInput = { attackEvents };
    const result = await summarizeAttackEvents(input);
    
    return { summary: result.summary, timestamp: Date.now() };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { error: `Failed to generate summary: ${errorMessage}`, timestamp: Date.now() };
  }
}
