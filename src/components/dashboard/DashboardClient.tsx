'use client';

import React, { useContext } from 'react';
import { GameEventsContext } from '@/contexts/GameEventsContext';
import StatCard from './StatCard';
import EventLog from './EventLog';
import { Swords, PieChart, Wind } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code } from 'lucide-react';

export default function DashboardClient() {
  const context = useContext(GameEventsContext);

  if (!context) {
    // This can be a loading spinner or some fallback UI
    return <div>Loading...</div>;
  }

    // Defensive extraction from context to avoid runtime/typing issues
    const attackCount = Number((context && (context as any).attackCount) ?? 0);
    const hitCount = Number((context && (context as any).hitCount) ?? 0);
    const dashCount = Number((context && (context as any).dashCount) ?? 0);
    const successRateByUserFormula = context && typeof (context as any).successRateByUserFormula !== 'undefined'
      ? (context as any).successRateByUserFormula
      : null;

  return (
    <main className="flex-1 space-y-8 p-4 md:p-8">
      <header>
        <h1 className="text-4xl font-bold tracking-tight font-headline text-primary">
          Unity Game Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Real-time analytics and insights from your game. Use the API endpoints to generate events.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* 'Total Attacks' hidden per user request */}
        <StatCard
          title="Successful Attacks"
          value={hitCount}
          icon={<PieChart className="h-6 w-6 text-muted-foreground" />}
          description="Total number of successful hit events."
        />
        <StatCard
          title="Success Rate"
          value={successRateByUserFormula === null ? '—' : `${successRateByUserFormula}%`}
          icon={<Code className="h-6 w-6 text-muted-foreground" />}
          description="Success rate computed by the server using the provided formula."
        />
        <StatCard
          title="Total Dashes"
          value={dashCount}
          icon={<Wind className="h-6 w-6 text-muted-foreground" />}
          description="Total number of dashes performed."
        />
        <Card>
            <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
                <CardDescription>Use these endpoints to send events.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 font-mono text-sm">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-600">POST</span>
                    <code className="bg-muted px-2 py-1 rounded-md">/api/events/attack</code>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-600">POST</span>
                    <code className="bg-muted px-2 py-1 rounded-md">/api/events/dash</code>
                </div>
            </CardContent>
        </Card>
      </div>

      <div>
        <EventLog />
      </div>
    </main>
  );
}
