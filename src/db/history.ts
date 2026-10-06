import { db } from './db';
import { sessionHasLegPain } from '../logic/legPain';
import type { ExerciseSessionHistory } from '../logic/progression';

/**
 * Historial de un ejercicio en sesiones completadas, de la más reciente a la más antigua.
 * Excluye la sesión indicada (normalmente la que está en curso).
 */
export async function exerciseHistory(exerciseId: string, excludeSessionId?: number): Promise<ExerciseSessionHistory[]> {
  const logs = await db.setLogs.where('exerciseId').equals(exerciseId).toArray();
  const bySession = new Map<number, typeof logs>();
  for (const log of logs) {
    if (log.sessionId === excludeSessionId) continue;
    const list = bySession.get(log.sessionId) ?? [];
    list.push(log);
    bySession.set(log.sessionId, list);
  }
  const sessions = (await db.sessions.bulkGet([...bySession.keys()])).filter(
    (s): s is NonNullable<typeof s> => !!s && s.status === 'completed',
  );
  const events = await db.painEvents.where('sessionId').anyOf(sessions.map((s) => s.id!)).toArray();

  return sessions
    .sort((a, b) => (b.finishedAt ?? b.startedAt) - (a.finishedAt ?? a.startedAt))
    .flatMap((session) => {
      const sessionLogs = bySession.get(session.id!)!;
      const item = session.items.find((i) => i.uid === sessionLogs[0].itemUid && i.exerciseId === exerciseId) ??
        session.items.find((i) => i.exerciseId === exerciseId);
      if (!item) return [];
      return [
        {
          sessionId: session.id!,
          date: session.date,
          item: { sets: item.sets, target: item.target },
          logs: sessionLogs,
          legPain: sessionHasLegPain(session, events),
        },
      ];
    });
}
