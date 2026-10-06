import type { CheckIn, PainEvent, PainLocation, Session } from '../types';
import { addDays, daysBetween } from './dates';

/** Ubicaciones que cuentan como "dolor en la pierna". Lumbar y glúteo se registran pero no cuentan. */
export const LEG_LOCATIONS: PainLocation[] = ['muslo_izq', 'pantorrilla_pie_izq'];

export function hasLegLocation(locations: readonly PainLocation[] | undefined): boolean {
  return !!locations?.some((location) => LEG_LOCATIONS.includes(location));
}

type SessionPain = Pick<Session, 'pre' | 'post'> & { id?: number };
type EventPain = Pick<PainEvent, 'sessionId' | 'radiatesToLeg'>;

/** Una sesión tiene dolor en la pierna si el registro inicial o final lo indica, o algún ejercicio lo mandó a la pierna. */
export function sessionHasLegPain(session: SessionPain, events: readonly EventPain[]): boolean {
  if (hasLegLocation(session.pre?.locations) || hasLegLocation(session.post?.locations)) return true;
  return events.some((event) => event.sessionId === session.id && event.radiatesToLeg);
}

export interface PainRecords {
  sessions: Pick<Session, 'id' | 'date' | 'pre' | 'post'>[];
  painEvents: Pick<PainEvent, 'date' | 'radiatesToLeg'>[];
  checkins: Pick<CheckIn, 'date' | 'locations'>[];
}

/** Fechas (YYYY-MM-DD) con algún registro de dolor en la pierna. */
export function legPainDates(records: PainRecords): string[] {
  const dates = new Set<string>();
  for (const session of records.sessions) {
    if (hasLegLocation(session.pre?.locations) || hasLegLocation(session.post?.locations)) dates.add(session.date);
  }
  for (const event of records.painEvents) if (event.radiatesToLeg) dates.add(event.date);
  for (const checkin of records.checkins) if (hasLegLocation(checkin.locations)) dates.add(checkin.date);
  return [...dates].sort();
}

function firstRecordDate(records: PainRecords): string | undefined {
  const all = [
    ...records.sessions.map((s) => s.date),
    ...records.painEvents.map((e) => e.date),
    ...records.checkins.map((c) => c.date),
  ].sort();
  return all[0];
}

export interface LegPainStreak {
  /** Días seguidos sin dolor en la pierna hasta hoy (incluido). */
  days: number;
  /** Primer día de la racha actual. */
  start?: string;
  /** Último día con dolor en la pierna, si lo hubo. */
  lastPain?: string;
}

export function legPainStreak(records: PainRecords, today: string): LegPainStreak {
  const painDates = legPainDates(records).filter((date) => date <= today);
  const lastPain = painDates.at(-1);
  if (lastPain) {
    if (lastPain === today) return { days: 0, lastPain };
    return { days: daysBetween(lastPain, today), start: addDays(lastPain, 1), lastPain };
  }
  const first = firstRecordDate(records);
  if (!first || first > today) return { days: 0 };
  return { days: daysBetween(first, today) + 1, start: first };
}

/** Días sin dolor en la pierna necesarios para el aviso de fase siguiente. */
export const PHASE_DAYS = 21;

/**
 * Aviso de fase siguiente: 3 semanas sin dolor en la pierna y al menos una sesión completada
 * en cada una de esas semanas (para que no salte solo por no usar la app).
 * Es solo un aviso para consultar al fisioterapeuta: nunca desbloquea ejercicios.
 */
export function phaseNoticeEligible(
  streak: LegPainStreak,
  completedSessionDates: readonly string[],
  today: string,
): boolean {
  if (streak.days < PHASE_DAYS) return false;
  for (let week = 0; week < 3; week++) {
    const end = addDays(today, -7 * week);
    const start = addDays(end, -6);
    const trained = completedSessionDates.some((date) => date >= start && date <= end);
    if (!trained) return false;
  }
  return true;
}
