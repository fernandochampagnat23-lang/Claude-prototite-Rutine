import type { Session } from '../types';

type SessionLike = Pick<Session, 'dayId' | 'status' | 'startedAt' | 'finishedAt'>;

/**
 * Siguiente día de la rotación 1 → 5 → 1. Solo cuenta la última sesión completada;
 * una sesión abandonada no avanza la rotación.
 */
export function nextDayId(sessions: SessionLike[], dayCount = 5): number {
  let last: SessionLike | undefined;
  for (const session of sessions) {
    if (session.status !== 'completed') continue;
    const time = session.finishedAt ?? session.startedAt;
    const lastTime = last ? (last.finishedAt ?? last.startedAt) : -Infinity;
    if (time >= lastTime) last = session;
  }
  if (!last) return 1;
  return (last.dayId % dayCount) + 1;
}
