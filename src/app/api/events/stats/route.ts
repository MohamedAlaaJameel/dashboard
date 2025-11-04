import { NextResponse } from 'next/server';
import { getEvents } from '@/lib/eventsStore';

export async function GET() {
  try {
    const events = getEvents();

  const attackEvents = events.filter(e => e.type === 'attack');
  const dashEvents = events.filter(e => e.type === 'dash');

  const attackCount = attackEvents.length;
  const dashCount = dashEvents.length;

  // Successful hits = events where hit === true
  const successfulHits = attackEvents.filter(e => e.hit === true).length;

  // Explicit misses = events where hit === false
  const explicitMisses = attackEvents.filter(e => e.hit === false).length;

  // Started attacks = silent start requests (no hit info)
  const startedCount = attackEvents.filter(e => (e as any).silent === true).length;

  // Pair hits to starts by count (FIFO style): each successfulHit consumes one start
  const leftoverStartedMisses = Math.max(0, startedCount - successfulHits);

  // Real misses = explicit misses + leftover started misses
  const realMisses = explicitMisses + leftoverStartedMisses;

  const denom = successfulHits + realMisses;
  const successRate = denom > 0 ? (successfulHits / denom) * 100 : null;

  // User-requested metric (exact float equation provided):
  // successRate = SuccessfulAttacks / (TotalAttacks - SuccessfulAttacks) * 100
  // Keep 'successfulHits' and 'attackCount' semantics unchanged.
  const userDenom = attackCount - successfulHits; // TotalAttacks - SuccessfulAttacks
  const userSuccessRate = userDenom > 0 ? (successfulHits / userDenom) * 100 : null;

    return NextResponse.json(
      {
        attackCount,
        dashCount,
        successfulHits,
  // attacksWithHit kept for backward compatibility; compute how many had explicit hit field
  attacksWithHit: attackEvents.filter(e => typeof e.hit === 'boolean').length,
  startedCount,
  leftoverStartedMisses,
  realMisses,
  successRate: successRate === null ? null : Math.round(successRate),
  // 'successRateByUserFormula' uses the exact equation you provided and is returned as a rounded integer percent.
  successRateByUserFormula: userSuccessRate === null ? null : Math.round(userSuccessRate),
      },
      { status: 200 }
    );
  } catch (e) {
    console.error('[events/stats] GET error:', e);
    return NextResponse.json({ error: 'Failed to compute stats' }, { status: 500 });
  }
}
