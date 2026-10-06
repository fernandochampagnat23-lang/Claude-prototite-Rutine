import { db } from './db';
import { toDateKey } from '../logic/dates';
import { evaluateSession } from '../logic/goldenRule';
import type { CheckIn, PainCheck, RoutineItem, Session, SessionStep, Trigger } from '../types';

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

export interface SetInput {
  weight?: number;
  value?: number;
  done: boolean;
}

/** Guarda (o actualiza) una serie de un ejercicio de la sesión. */
export async function saveSet(
  sessionId: number,
  itemUid: string,
  exerciseId: string,
  setIndex: number,
  input: SetInput,
): Promise<void> {
  await db.transaction('rw', db.setLogs, async () => {
    const existing = await db.setLogs
      .where('[sessionId+itemUid]')
      .equals([sessionId, itemUid])
      .filter((log) => log.exerciseId === exerciseId && log.setIndex === setIndex)
      .first();
    const log = { sessionId, itemUid, exerciseId, setIndex, ...input, at: Date.now() };
    if (existing) await db.setLogs.put({ ...log, id: existing.id });
    else await db.setLogs.add(log);
  });
}

/** Registra un "me dolió". Si bajó a la pierna, marca el ejercicio en rojo. */
export async function addPainEvent(sessionId: number, exerciseId: string, radiatesToLeg: boolean): Promise<void> {
  const now = Date.now();
  const date = toDateKey(now);
  await db.transaction('rw', db.painEvents, db.flags, async () => {
    await db.painEvents.add({ sessionId, exerciseId, radiatesToLeg, date, at: now });
    if (radiatesToLeg) await db.flags.put({ exerciseId, reason: 'pierna', date, at: now, sessionId });
  });
}

/** La nota y el carácter opcional eran del ejercicio anterior (p. ej. "si hay máquina"), así que no se heredan. */
function swap(item: RoutineItem, exerciseId: string): RoutineItem {
  const { note: _note, optional: _optional, ...rest } = item;
  return { ...rest, exerciseId };
}

/** Cambia el ejercicio de un ítem en la sesión y, opcionalmente, también en la rutina. */
export async function replaceExercise(
  sessionId: number | undefined,
  dayId: number,
  itemUid: string,
  exerciseId: string,
  alsoInRoutine: boolean,
): Promise<void> {
  await db.transaction('rw', db.sessions, db.routineDays, async () => {
    if (sessionId !== undefined) {
      const session = await db.sessions.get(sessionId);
      if (session) {
        const items = session.items.map((item) => (item.uid === itemUid ? swap(item, exerciseId) : item));
        await db.sessions.update(sessionId, { items });
      }
    }
    if (alsoInRoutine) {
      const day = await db.routineDays.get(dayId);
      if (day) {
        const items = day.items.map((item) => (item.uid === itemUid ? swap(item, exerciseId) : item));
        await db.routineDays.put({ ...day, items });
      }
    }
  });
}

export async function toggleSkip(sessionId: number, itemUid: string): Promise<void> {
  await db.transaction('rw', db.sessions, async () => {
    const session = await db.sessions.get(sessionId);
    if (!session) return;
    const skipped = session.skipped.includes(itemUid)
      ? session.skipped.filter((uid) => uid !== itemUid)
      : [...session.skipped, itemUid];
    await db.sessions.update(sessionId, { skipped });
  });
}

export async function dismissFlag(exerciseId: string): Promise<void> {
  await db.flags.delete(exerciseId);
}

/** Registro de dolor o síntomas fuera de una sesión. */
export async function addCheckin(input: Omit<CheckIn, 'id' | 'date' | 'at'>): Promise<void> {
  const now = Date.now();
  await db.checkins.add({ ...input, date: toDateKey(now), at: now });
}
