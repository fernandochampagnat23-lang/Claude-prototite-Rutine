import { describe, expect, it } from 'vitest';
import {
  describeSuggestion,
  isComplete,
  suggestProgression,
  workingWeight,
  type ExerciseSessionHistory,
} from './progression';

const weighted = { kind: 'reps' as const, weighted: true };

function entry(
  weights: number[],
  reps: number[],
  options: Partial<Pick<ExerciseSessionHistory, 'legPain' | 'item'>> = {},
): ExerciseSessionHistory {
  return {
    sessionId: Math.random(),
    date: '2026-10-01',
    item: options.item ?? { sets: weights.length, target: 10 },
    legPain: options.legPain ?? false,
    logs: weights.map((weight, setIndex) => ({ setIndex, weight, value: reps[setIndex], done: true })),
  };
}

const full = (w: number) => entry([w, w, w, w], [10, 10, 10, 10]);

describe('isComplete y workingWeight', () => {
  it('una serie con menos reps que el objetivo deja el ejercicio incompleto', () => {
    expect(isComplete(entry([40, 40, 40, 40], [10, 10, 10, 8]))).toBe(false);
  });

  it('faltan series → incompleto', () => {
    expect(isComplete({ ...full(40), item: { sets: 5, target: 10 } })).toBe(false);
  });

  it('series no marcadas como hechas no cuentan', () => {
    const e = full(40);
    e.logs[3].done = false;
    expect(isComplete(e)).toBe(false);
  });

  it('el peso de trabajo es el menor de las series hechas', () => {
    expect(workingWeight(entry([40, 42.5, 42.5], [10, 10, 10]))).toBe(40);
  });
});

describe('suggestProgression', () => {
  it('dos sesiones completas sin dolor en la pierna → subir entre 2,5 y 5 %', () => {
    expect(suggestProgression(weighted, [full(40), full(40)])).toEqual({
      type: 'weight',
      direction: 'up',
      from: 40,
      low: 41,
      high: 42,
    });
  });

  it('redondea a 0,5 kg sin pasarse del rango', () => {
    const s = suggestProgression(weighted, [full(55), full(55)]);
    // 55 × 1,025 = 56,375 → 56,5 ; 55 × 1,05 = 57,75 → 57,5
    expect(s).toMatchObject({ low: 56.5, high: 57.5 });
  });

  it('con pesos pequeños sugiere al menos el incremento mínimo', () => {
    const s = suggestProgression(weighted, [full(5), full(5)]);
    expect(s).toMatchObject({ low: 5.5, high: 5.5 });
  });

  it('una sola sesión no alcanza', () => {
    expect(suggestProgression(weighted, [full(40)])).toBeNull();
  });

  it('si la última sesión no se completó, no sugiere', () => {
    expect(suggestProgression(weighted, [entry([40, 40, 40, 40], [10, 10, 9, 8]), full(40)])).toBeNull();
  });

  it('si la sesión anterior no se completó, no sugiere', () => {
    expect(suggestProgression(weighted, [full(40), entry([40, 40, 40, 40], [10, 10, 10, 7])])).toBeNull();
  });

  it('dolor en la pierna en cualquiera de las dos sesiones bloquea la progresión', () => {
    const painful = entry([40, 40, 40, 40], [10, 10, 10, 10], { legPain: true });
    expect(suggestProgression(weighted, [painful, full(40)])).toBeNull();
    expect(suggestProgression(weighted, [full(40), painful])).toBeNull();
  });

  it('si ya subió el peso en la última sesión, espera a completarlo dos veces', () => {
    expect(suggestProgression(weighted, [full(42.5), full(40)])).toBeNull();
  });

  it('solo mira las dos sesiones más recientes', () => {
    const incomplete = entry([40, 40, 40, 40], [10, 10, 10, 6]);
    expect(suggestProgression(weighted, [full(40), full(40), incomplete])).not.toBeNull();
    expect(suggestProgression(weighted, [incomplete, full(40), full(40)])).toBeNull();
  });

  it('en ejercicios asistidos sugiere bajar la asistencia', () => {
    const s = suggestProgression({ ...weighted, assisted: true }, [full(30), full(30)]);
    // 30 × 0,975 = 29,25 → 29 ; 30 × 0,95 = 28,5
    expect(s).toEqual({ type: 'weight', direction: 'down', from: 30, low: 28.5, high: 29 });
  });

  it('en isométricos sin peso sugiere +5 s', () => {
    const hold = { kind: 'hold' as const, weighted: false };
    const plank = (target: number) => ({
      sessionId: 1,
      date: '2026-10-01',
      legPain: false,
      item: { sets: 3, target },
      logs: [0, 1, 2].map((setIndex) => ({ setIndex, value: target, done: true })),
    });
    expect(suggestProgression(hold, [plank(30), plank(30)])).toEqual({ type: 'time', from: 30, to: 35 });
  });

  it('ejercicios de peso corporal por reps no tienen sugerencia', () => {
    expect(suggestProgression({ kind: 'reps', weighted: false }, [full(0), full(0)])).toBeNull();
  });

  it('sin peso registrado no sugiere', () => {
    const noWeight = entry([0, 0, 0, 0], [10, 10, 10, 10]);
    expect(suggestProgression(weighted, [noWeight, noWeight])).toBeNull();
  });
});

describe('describeSuggestion', () => {
  it('texto de subida con rango', () => {
    expect(describeSuggestion({ type: 'weight', direction: 'up', from: 40, low: 41, high: 42 })).toBe(
      'Sube a 41–42 kg',
    );
  });

  it('usa coma decimal', () => {
    expect(describeSuggestion({ type: 'weight', direction: 'up', from: 55, low: 56.5, high: 57.5 })).toBe(
      'Sube a 56,5–57,5 kg',
    );
  });
});
