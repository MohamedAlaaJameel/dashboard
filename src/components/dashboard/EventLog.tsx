'use client';

import React, { useContext, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GameEventsContext, GameEvent, AttackEvent } from '@/contexts/GameEventsContext';
// Summarize action removed from UI per user request
import { Badge } from '@/components/ui/badge';
// AI summary UI removed

function formatEventDetails(event: GameEvent): string {
  if (event.type === 'attack') {
    // If the server recorded this as a silent attack (no hit info), show a clear message
    if ((event as any).silent) {
      return 'Attack attempted (no hit info)';
    }
    return `${event.attacker} used ${event.attackType} on ${event.defender}.`;
  }
  if (event.type === 'dash') {
    return `${event.character} performed a dash.`;
  }
  return 'Unknown event';
}

export default function EventLog() {
  const context = useContext(GameEventsContext);
  const events = context?.events ?? [];

  const eventRows = useMemo(() => {
    return events.map(event => (
      <TableRow key={event.id}>
        <TableCell className="font-medium capitalize">{event.type}</TableCell>
        <TableCell>{formatEventDetails(event)}</TableCell>
        <TableCell>
          {event.type === 'attack' && (
            <Badge variant={event.hit ? 'default' : 'destructive'} className={event.hit ? 'bg-green-600' : ''}>
              {event.hit ? 'Hit' : 'Miss'}
            </Badge>
          )}
        </TableCell>
        <TableCell className="text-right text-muted-foreground">
          {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
        </TableCell>
      </TableRow>
    ));
  }, [events]);

  // AI summary logic removed.

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Event Log</CardTitle>
            <CardDescription>A real-time log of events from the game.</CardDescription>
          </div>
          {/* Summarize with AI button removed */}
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-72">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventRows.length > 0 ? eventRows : <TableRow><TableCell colSpan={4} className="h-24 text-center">No events yet. Try the API endpoints!</TableCell></TableRow>}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* AI summary output removed */}
    </div>
  );
}
