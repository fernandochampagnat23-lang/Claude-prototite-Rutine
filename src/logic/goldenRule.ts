import type { PainEvent } from '../types';

/** Puntos de dolor post-sesión por encima del inicial que activan la regla de oro. */
export const POST_PAIN_THRESHOLD = 2;

/** Regla de oro por sesión: el dolor final supera en 2 puntos o más al inicial. */
export function postPainRuleTriggered(pre: number | undefined, post: number | undefined): boolean {
  if (pre === undefined || post === undefined) return false;
  return post - pre >= POST_PAIN_THRESHOLD;
}

/** Regla de oro por ejercicio: el dolor bajó a la pierna. */
export function exerciseRuleTriggered(events: readonly Pick<PainEvent, 'radiatesToLeg'>[]): boolean {
  return events.some((event) => event.radiatesToLeg);
}

export interface SessionVerdict {
  triggered: boolean;
  /** Ejercicios que mandaron dolor a la pierna en esta sesión. */
  legExercises: string[];
  /** Ejercicios sospechosos ordenados: primero los que bajaron a la pierna, luego el resto con "me dolió". */
  suspects: string[];
  /** Se activó por dolor post-sesión y no hay ningún "me dolió" para señalar: hay que preguntar. */
  needsUserPick: boolean;
}

export function evaluateSession(
  pre: number | undefined,
  post: number | undefined,
  events: readonly Pick<PainEvent, 'exerciseId' | 'radiatesToLeg'>[],
): SessionVerdict {
  const legExercises = unique(events.filter((e) => e.radiatesToLeg).map((e) => e.exerciseId));
  const otherPain = unique(events.filter((e) => !e.radiatesToLeg).map((e) => e.exerciseId)).filter(
    (id) => !legExercises.includes(id),
  );
  const postRule = postPainRuleTriggered(pre, post);
  const triggered = postRule || legExercises.length > 0;
  const suspects = triggered ? [...legExercises, ...otherPain] : [];
  return {
    triggered,
    legExercises,
    suspects,
    needsUserPick: postRule && suspects.length === 0,
  };
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}
