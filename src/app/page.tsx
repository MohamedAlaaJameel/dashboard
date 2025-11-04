'use client';
import DashboardClient from '@/components/dashboard/DashboardClient';
import { GameEventsContext, GameEventsProvider } from '@/contexts/GameEventsContext';
import { registerEventHandler } from '@/lib/events';
import { useContext, useEffect } from 'react';

function EventApiProvider({children}: {children: React.ReactNode}) {
  const context = useContext(GameEventsContext);
  if (!context) {
    throw new Error('EventApiProvider must be used within a GameEventsProvider');
  }

  useEffect(() => {
    registerEventHandler('attack', (body: any) => {
      context.addAttackEvent(body);
      return { message: 'Attack event received successfully', status: 200 };
    });

    registerEventHandler('dash', (body: any) => {
      context.addDashEvent(body);
      return { message: 'Dash event received successfully', status: 200 };
    });
  }, [context]);

  return <>{children}</>
}

export default function Home() {
  return (
    <GameEventsProvider>
      <EventApiProvider>
        <DashboardClient />
      </EventApiProvider>
    </GameEventsProvider>
  );
}
