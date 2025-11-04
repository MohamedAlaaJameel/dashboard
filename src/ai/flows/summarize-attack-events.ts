'use server';

/**
 * @fileOverview Summarizes attack events using AI to identify patterns and insights.
 *
 * - summarizeAttackEvents - A function that summarizes attack events.
 * - SummarizeAttackEventsInput - The input type for the summarizeAttackEvents function.
 * - SummarizeAttackEventsOutput - The return type for the summarizeAttackEvents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAttackEventsInputSchema = z.object({
  attackEvents: z.array(
    z.object({
      timestamp: z.string().describe('The timestamp of the attack event.'),
      attacker: z.string().describe('The attacker in the attack event.'),
      defender: z.string().describe('The defender in the attack event.'),
      attackType: z.string().describe('The type of attack used.'),
      hit: z.boolean().describe('Whether the attack hit or missed.'),
    })
  ).describe('An array of attack event objects.'),
});
export type SummarizeAttackEventsInput = z.infer<typeof SummarizeAttackEventsInputSchema>;

const SummarizeAttackEventsOutputSchema = z.object({
  summary: z.string().describe('A summary of the attack events.'),
});
export type SummarizeAttackEventsOutput = z.infer<typeof SummarizeAttackEventsOutputSchema>;

export async function summarizeAttackEvents(input: SummarizeAttackEventsInput): Promise<SummarizeAttackEventsOutput> {
  return summarizeAttackEventsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAttackEventsPrompt',
  input: {schema: SummarizeAttackEventsInputSchema},
  output: {schema: SummarizeAttackEventsOutputSchema},
  prompt: `You are an AI assistant helping a game developer analyze attack events in their game.\n  Given the following attack events, provide a concise summary of the key patterns and insights:\n\n  Attack Events:\n  {{#each attackEvents}}
  - Timestamp: {{timestamp}}, Attacker: {{attacker}}, Defender: {{defender}}, Attack Type: {{attackType}}, Hit: {{hit}}\n  {{/each}}\n\n  Summary:`,
});

const summarizeAttackEventsFlow = ai.defineFlow(
  {
    name: 'summarizeAttackEventsFlow',
    inputSchema: SummarizeAttackEventsInputSchema,
    outputSchema: SummarizeAttackEventsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
