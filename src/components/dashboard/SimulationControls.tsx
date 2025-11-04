'use client';

import React, { useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GameEventsContext } from '@/contexts/GameEventsContext';
import { Swords, Wind } from 'lucide-react';

export default function SimulationControls() {
  const context = useContext(GameEventsContext);

  if (!context) {
    return null;
  }

  const { addAttackEvent, addDashEvent } = context;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Simulation Controls</CardTitle>
        <CardDescription>Generate game events manually.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col justify-center gap-4">
        <Button onClick={addAttackEvent} variant="secondary" className="w-full">
          <Swords className="mr-2 h-4 w-4" />
          Simulate Player Attack
        </Button>
        <Button onClick={addDashEvent} variant="secondary" className="w-full">
          <Wind className="mr-2 h-4 w-4" />
          Simulate Player Dash
        </Button>
      </CardContent>
    </Card>
  );
}
