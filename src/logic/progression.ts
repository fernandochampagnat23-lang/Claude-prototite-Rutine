import type { Exercise, RoutineItem, SetLog } from '../types';

/** Historial de un ejercicio en una sesión completada. */
export interface ExerciseSessionHistory {
  sessionId: number;
  date: string;
  item: Pick<RoutineItem, 'sets' | 'target'>;
  logs: Pick<SetLog, 'setIndex' | 'weight' | 'value' | 'done'>[];
  /** La sesión tuvo dolor en la pierna (registro inicial/final o algún ejercicio que bajó a la pierna). */
  legPain: boolean;
}

export type ProgressionSuggestion =
  | { type: 'weight'; direction: 'up' | 'down'; from: number; low: number; high: number }
  | { type: 'time'; from: number; to: number };

export const PROGRESSION_MIN = 0.025;
export const PROGRESSION_MAX = 0.05;
export const HOLD_INCREMENT_SECONDS = 5;
const STEP = 0.5;
const EPS = 1e-9;

const ceilTo = (value: number, step: number) => Math.ceil(value / step - EPS) * step;
const floorTo = (value: number, step: number) => Math.floor(value / step + EPS) * step;

/** Todas las series hechas y cada una llegó al objetivo. */
export function isComplete(entry: ExerciseSessionHistory): boolean {
  const completedSets = new Set(
    entry.logs.filter((log) => log.done && (log.value ?? 0) >= entry.item.target).map((log) => log.setIndex),
  );
  return completedSets.size >= entry.item.sets;
}

/** Peso de trabajo: el menor peso de las series hechas (criterio conservador). */
export function workingWeight(entry: ExerciseSessionHistory): number | undefined {
  const weights = entry.logs
    .filter((log) => log.done && typeof log.weight === 'number' && log.weight > 0)
    .map((log) => log.weight as number);
  return weights.length ? Math.min(...weights) : undefined;
}

/**
 * Sugerencia de progresión: si las dos últimas sesiones de este ejercicio se completaron enteras,
 * sin dolor en la pierna y con el mismo peso, sugiere subir entre 2,5 y 5 %.
 * En ejercicios asistidos sugiere bajar la asistencia; en isométricos sin peso, +5 s.
 * @param history sesiones completadas con este ejercicio, de la más reciente a la más antigua.
 */
export function suggestProgression(
  exercise: Pick<Exercise, 'kind' | 'weighted' | 'assisted'>,
  history: readonly ExerciseSessionHistory[],
): ProgressionSuggestion | null {
  if (history.length < 2) return null;
  const [latest, previous] = history;
  if (latest.legPain || previous.legPain) return null;
  if (!isComplete(latest) || !isComplete(previous)) return null;

  if (exercise.weighted) {
    const current = workingWeight(latest);
    const before = workingWeight(previous);
    if (current === undefined || before === undefined) return null;
    if (exercise.assisted) {
      // Menos asistencia = más difícil. Si ya se bajó la asistencia en la última sesión, esperar.
      if (before > current) return null;
      const high = floorTo(current * (1 - PROGRESSION_MIN), STEP);
      let low = ceilTo(current * (1 - PROGRESSION_MAX), STEP);
      if (low > high) low = high;
      if (high <= 0) return null;
      return { type: 'weight', direction: 'down', from: current, low, high };
    }
    // Si ya subió el peso en la última sesión, esperar a completarlo dos veces.
    if (before < current) return null;
    const low = ceilTo(current * (1 + PROGRESSION_MIN), STEP);
    let high = floorTo(current * (1 + PROGRESSION_MAX), STEP);
    if (high < low) high = low;
    return { type: 'weight', direction: 'up', from: current, low, high };
  }

  if (exercise.kind === 'hold') {
    if (latest.item.target !== previous.item.target) return null;
    return { type: 'time', from: latest.item.target, to: latest.item.target + HOLD_INCREMENT_SECONDS };
  }

  return null;
}

export function formatKg(value: number): string {
  return `${value.toLocaleString('es', { maximumFractionDigits: 2 })} kg`;
}

export function describeSuggestion(suggestion: ProgressionSuggestion): string {
  if (suggestion.type === 'time') return `Sube a ${suggestion.to} s por serie`;
  const range =
    suggestion.low === suggestion.high
      ? formatKg(suggestion.low)
      : `${suggestion.low.toLocaleString('es')}–${formatKg(suggestion.high)}`;
  return suggestion.direction === 'up' ? `Sube a ${range}` : `Baja la asistencia a ${range}`;
}
