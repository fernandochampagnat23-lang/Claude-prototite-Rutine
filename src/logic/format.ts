import type { ExerciseKind, RoutineItem } from '../types';

export const UNIT: Record<ExerciseKind, string> = { reps: 'reps', hold: 's', distance: 'm' };

/** "4 × 10", "3 × 30 s", "3 × 30 m por lado". */
export function formatTarget(item: Pick<RoutineItem, 'sets' | 'target' | 'perSide'>, kind: ExerciseKind): string {
  const unit = kind === 'reps' ? '' : ` ${UNIT[kind]}`;
  return `${item.sets} × ${item.target}${unit}${item.perSide ? ' por lado' : ''}`;
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
