import { describe, expect, it } from 'vitest';
import { evaluateSession, exerciseRuleTriggered, postPainRuleTriggered } from './goldenRule';

describe('regla de oro por sesión (dolor post vs. inicial)', () => {
  it('se activa cuando el dolor post supera en 2 puntos al inicial', () => {
    expect(postPainRuleTriggered(2, 4)).toBe(true);
  });

  it('se activa cuando la diferencia es mayor a 2', () => {
    expect(postPainRuleTriggered(0, 7)).toBe(true);
  });

  it('no se activa con 1 punto de diferencia', () => {
    expect(postPainRuleTriggered(3, 4)).toBe(false);
  });

  it('no se activa si el dolor baja o se mantiene', () => {
    expect(postPainRuleTriggered(5, 5)).toBe(false);
    expect(postPainRuleTriggered(5, 2)).toBe(false);
  });

  it('no se activa si falta alguno de los dos registros', () => {
    expect(postPainRuleTriggered(undefined, 6)).toBe(false);
    expect(postPainRuleTriggered(1, undefined)).toBe(false);
  });
});

describe('regla de oro por ejercicio (dolor hacia la pierna)', () => {
  it('se activa si algún "me dolió" bajó a la pierna', () => {
    expect(exerciseRuleTriggered([{ radiatesToLeg: false }, { radiatesToLeg: true }])).toBe(true);
  });

  it('no se activa si el dolor se quedó en la espalda', () => {
    expect(exerciseRuleTriggered([{ radiatesToLeg: false }])).toBe(false);
    expect(exerciseRuleTriggered([])).toBe(false);
  });
});

describe('evaluateSession', () => {
  it('sin dolor extra ni eventos no marca nada', () => {
    expect(evaluateSession(2, 3, [])).toEqual({
      triggered: false,
      legExercises: [],
      suspects: [],
      needsUserPick: false,
    });
  });

  it('un ejercicio que bajó a la pierna activa la regla aunque el dolor post no suba', () => {
    const verdict = evaluateSession(2, 2, [{ exerciseId: 'prensa', radiatesToLeg: true }]);
    expect(verdict.triggered).toBe(true);
    expect(verdict.legExercises).toEqual(['prensa']);
    expect(verdict.suspects).toEqual(['prensa']);
    expect(verdict.needsUserPick).toBe(false);
  });

  it('con dolor post +2 señala como sospechosos los "me dolió", primero los de pierna', () => {
    const verdict = evaluateSession(1, 4, [
      { exerciseId: 'hip-thrust', radiatesToLeg: false },
      { exerciseId: 'prensa', radiatesToLeg: true },
      { exerciseId: 'hip-thrust', radiatesToLeg: false },
    ]);
    expect(verdict.triggered).toBe(true);
    expect(verdict.suspects).toEqual(['prensa', 'hip-thrust']);
    expect(verdict.needsUserPick).toBe(false);
  });

  it('con dolor post +2 y sin ningún "me dolió" pide elegir el sospechoso', () => {
    const verdict = evaluateSession(1, 3, []);
    expect(verdict.triggered).toBe(true);
    expect(verdict.suspects).toEqual([]);
    expect(verdict.needsUserPick).toBe(true);
  });

  it('un "me dolió" sin pierna y sin subida de dolor no activa la regla', () => {
    const verdict = evaluateSession(2, 3, [{ exerciseId: 'pec-deck', radiatesToLeg: false }]);
    expect(verdict.triggered).toBe(false);
    expect(verdict.suspects).toEqual([]);
  });
});
