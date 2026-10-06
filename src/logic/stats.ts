import type { CheckIn, PainEvent, Session, SetLog, Trigger } from '../types';
import { addDays, formatShortDate, weekStart } from './dates';

type DoneSession = Pick<Session, 'id' | 'date' | 'status' | 'startedAt' | 'finishedAt' | 'pre' | 'post' | 'triggers'>;

const completed = <T extends Pick<Session, 'status' | 'startedAt' | 'finishedAt'>>(sessions: readonly T[]) =>
  sessions
    .filter((s) => s.status === 'completed')
    .sort((a, b) => (a.finishedAt ?? a.startedAt) - (b.finishedAt ?? b.startedAt));

export interface PainPoint {
  date: string;
  label: string;
  pre?: number;
  post?: number;
}

/** Dolor antes y después de cada sesión completada, en orden cronológico. */
export function painSeries(sessions: readonly DoneSession[]): PainPoint[] {
  return completed(sessions).map((s) => ({
    date: s.date,
    label: formatShortDate(s.date),
    pre: s.pre?.score,
    post: s.post?.score,
  }));
}

export interface WeekCount {
  weekStart: string;
  label: string;
  count: number;
}

/** Sesiones completadas por semana (lunes a domingo), las últimas `weeks` semanas hasta hoy. */
export function sessionsPerWeek(sessions: readonly DoneSession[], today: string, weeks = 8): WeekCount[] {
  const current = weekStart(today);
  const result: WeekCount[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = addDays(current, -7 * i);
    const end = addDays(start, 6);
    result.push({
      weekStart: start,
      label: formatShortDate(start),
      count: completed(sessions).filter((s) => s.date >= start && s.date <= end).length,
    });
  }
  return result;
}

export interface WeightPoint {
  date: string;
  label: string;
  weight: number;
}

/** Peso máximo usado en las series hechas de un ejercicio, por sesión completada. */
export function weightSeries(
  exerciseId: string,
  sessions: readonly DoneSession[],
  logs: readonly Pick<SetLog, 'sessionId' | 'exerciseId' | 'weight' | 'done'>[],
): WeightPoint[] {
  return completed(sessions).flatMap((s) => {
    const weights = logs
      .filter((l) => l.sessionId === s.id && l.exerciseId === exerciseId && l.done && (l.weight ?? 0) > 0)
      .map((l) => l.weight as number);
    if (weights.length === 0) return [];
    return [{ date: s.date, label: formatShortDate(s.date), weight: Math.max(...weights) }];
  });
}

/** Ejercicios con al menos un peso registrado en sesiones completadas. */
export function exercisesWithWeight(
  sessions: readonly DoneSession[],
  logs: readonly Pick<SetLog, 'sessionId' | 'exerciseId' | 'weight' | 'done'>[],
): string[] {
  const ids = new Set(completed(sessions).map((s) => s.id));
  return [...new Set(logs.filter((l) => ids.has(l.sessionId) && l.done && (l.weight ?? 0) > 0).map((l) => l.exerciseId))];
}

export interface TriggerImpact {
  trigger: Trigger;
  /** Registros (sesiones o registros sueltos) con este detonante. */
  count: number;
  /** Dolor medio en los registros con el detonante. */
  avgWith?: number;
  /** Dolor medio en los registros sin el detonante. */
  avgWithout?: number;
}

const average = (values: number[]) =>
  values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : undefined;

/**
 * Compara el dolor con y sin cada detonante. En sesiones se usa el dolor post-sesión;
 * en registros sueltos, el dolor registrado.
 */
export function triggerImpact(
  sessions: readonly DoneSession[],
  checkins: readonly Pick<CheckIn, 'score' | 'triggers'>[],
  triggers: readonly Trigger[],
): TriggerImpact[] {
  const records = [
    ...completed(sessions)
      .filter((s) => s.post)
      .map((s) => ({ score: s.post!.score, triggers: s.triggers })),
    ...checkins.map((c) => ({ score: c.score, triggers: c.triggers })),
  ];
  return triggers
    .map((trigger) => {
      const withT = records.filter((r) => r.triggers.includes(trigger)).map((r) => r.score);
      const withoutT = records.filter((r) => !r.triggers.includes(trigger)).map((r) => r.score);
      return { trigger, count: withT.length, avgWith: average(withT), avgWithout: average(withoutT) };
    })
    .sort((a, b) => b.count - a.count);
}

export interface ExercisePain {
  exerciseId: string;
  total: number;
  leg: number;
}

/** Ejercicios ordenados por cuántas veces mandaron dolor a la pierna y luego por "me dolió" totales. */
export function exercisePainRanking(events: readonly Pick<PainEvent, 'exerciseId' | 'radiatesToLeg'>[]): ExercisePain[] {
  const map = new Map<string, ExercisePain>();
  for (const event of events) {
    const entry = map.get(event.exerciseId) ?? { exerciseId: event.exerciseId, total: 0, leg: 0 };
    entry.total += 1;
    if (event.radiatesToLeg) entry.leg += 1;
    map.set(event.exerciseId, entry);
  }
  return [...map.values()].sort((a, b) => b.leg - a.leg || b.total - a.total);
}
