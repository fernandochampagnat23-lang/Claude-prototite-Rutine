import { db } from './db';
import { toDateKey } from '../logic/dates';
import { evaluateSession } from '../logic/goldenRule';
import type { PainCheck, Session, SessionStep, Trigger } from '../types';

export async function startSession(dayId: number): Promise<number> {
  const day = await db.routineDays.get(dayId);
  if (!day) throw new Error(`No existe el día ${dayId}`);
  // Solo puede haber una sesión en curso.
  await db.sessions.where('status').equals('in_progress').modify({ status: 'abandoned' });
  const now = Date.now();
  const session: Session = {
    date: toDateKey(now),
    startedAt: now,
    dayId,
    dayTitle: day.title,
    status: 'in_progress',
    step: 'pre',
    items: structuredClone(day.items),
    skipped: [],
    warmupDone: [],
    triggers: [],
    notes: '',
    suspects: [],
  };
  return (await db.sessions.add(session)) as number;
}

export async function updateSession(id: number, changes: Partial<Session>): Promise<void> {
  await db.sessions.update(id, changes);
}

export async function savePreCheck(id: number, pre: PainCheck): Promise<void> {
  await db.sessions.update(id, { pre, step: 'warmup' });
}

export async function goToStep(id: number, step: SessionStep): Promise<void> {
  await db.sessions.update(id, { step });
}

export async function toggleWarmup(id: number, key: string, done: boolean): Promise<void> {
  await db.transaction('rw', db.sessions, async () => {
    const session = await db.sessions.get(id);
    if (!session) return;
    const set = new Set(session.warmupDone);
    if (done) set.add(key);
    else set.delete(key);
    await db.sessions.update(id, { warmupDone: [...set] });
  });
}

export async function abandonSession(id: number): Promise<void> {
  await db.sessions.update(id, { status: 'abandoned', finishedAt: Date.now() });
}

export interface FinishInput {
  post: PainCheck;
  triggers: Trigger[];
  notes: string;
  /** Sospechosos elegidos a mano cuando la regla de oro se activa sin ningún "me dolió". */
  pickedSuspects?: string[];
}

/** Cierra la sesión, evalúa la regla de oro y marca en rojo los ejercicios sospechosos. */
export async function finishSession(id: number, input: FinishInput): Promise<Session | undefined> {
  return db.transaction('rw', [db.sessions, db.painEvents, db.flags], async () => {
    const session = await db.sessions.get(id);
    if (!session) return undefined;
    const events = await db.painEvents.where('sessionId').equals(id).toArray();
    const verdict = evaluateSession(session.pre?.score, input.post.score, events);
    const suspects = verdict.needsUserPick ? (input.pickedSuspects ?? []) : verdict.suspects;
    const now = Date.now();
    for (const exerciseId of suspects) {
      const existing = await db.flags.get(exerciseId);
      if (existing?.reason === 'pierna') continue;
      await db.flags.put({
        exerciseId,
        reason: verdict.legExercises.includes(exerciseId) ? 'pierna' : 'regla_de_oro',
        date: session.date,
        at: now,
        sessionId: id,
      });
    }
    // Si el cronómetro de la caminata sigue corriendo, se suma lo caminado hasta ahora.
    const runningWalk = session.walkStartedAt ? Math.round((now - session.walkStartedAt) / 60000) : 0;
    const walked = (session.walkMinutes ?? 0) + runningWalk;
    const changes: Partial<Session> = {
      post: input.post,
      triggers: input.triggers,
      notes: input.notes,
      walkMinutes: walked || undefined,
      walkStartedAt: undefined,
      goldenRule: verdict.triggered,
      suspects,
      status: 'completed',
      finishedAt: now,
    };
    await db.sessions.update(id, changes);
    return { ...session, ...changes };
  });
}
