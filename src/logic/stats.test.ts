import { describe, expect, it } from 'vitest';
import { exercisePainRanking, painSeries, sessionsPerWeek, triggerImpact, weightSeries } from './stats';
import type { Session } from '../types';

const session = (id: number, date: string, pre: number, post: number, extra: Partial<Session> = {}) => ({
  id,
  date,
  status: 'completed' as const,
  startedAt: Date.parse(`${date}T18:00:00`),
  finishedAt: Date.parse(`${date}T19:00:00`),
  pre: { score: pre, locations: [], symptoms: [], at: 0 },
  post: { score: post, locations: [], symptoms: [], at: 0 },
  triggers: [],
  ...extra,
});

describe('painSeries', () => {
  it('ordena por fecha e ignora sesiones no completadas', () => {
    const series = painSeries([
      session(2, '2026-10-03', 3, 2),
      session(1, '2026-10-01', 2, 4),
      session(3, '2026-10-04', 1, 1, { status: 'abandoned' }),
    ]);
    expect(series).toEqual([
      { date: '2026-10-01', label: '1 oct', pre: 2, post: 4 },
      { date: '2026-10-03', label: '3 oct', pre: 3, post: 2 },
    ]);
  });
});

describe('sessionsPerWeek', () => {
  it('cuenta sesiones por semana de lunes a domingo', () => {
    const weeks = sessionsPerWeek(
      [session(1, '2026-09-28', 0, 0), session(2, '2026-10-04', 0, 0), session(3, '2026-10-05', 0, 0)],
      '2026-10-06',
      2,
    );
    expect(weeks).toEqual([
      { weekStart: '2026-09-28', label: '28 sep', count: 2 },
      { weekStart: '2026-10-05', label: '5 oct', count: 1 },
    ]);
  });
});

describe('weightSeries', () => {
  it('toma el peso máximo de las series hechas de cada sesión', () => {
    const series = weightSeries(
      'prensa',
      [session(1, '2026-10-01', 0, 0), session(2, '2026-10-03', 0, 0)],
      [
        { sessionId: 1, exerciseId: 'prensa', weight: 80, done: true },
        { sessionId: 1, exerciseId: 'prensa', weight: 90, done: true },
        { sessionId: 1, exerciseId: 'prensa', weight: 100, done: false },
        { sessionId: 2, exerciseId: 'hip-thrust', weight: 60, done: true },
      ],
    );
    expect(series).toEqual([{ date: '2026-10-01', label: '1 oct', weight: 90 }]);
  });
});

describe('triggerImpact', () => {
  it('compara el dolor medio con y sin cada detonante', () => {
    const impact = triggerImpact(
      [
        session(1, '2026-10-01', 2, 6, { triggers: ['mochila'] }),
        session(2, '2026-10-02', 2, 2),
      ],
      [{ score: 4, triggers: ['mochila', 'estres'] }],
      ['estres', 'mochila'],
    );
    expect(impact).toEqual([
      { trigger: 'mochila', count: 2, avgWith: 5, avgWithout: 2 },
      { trigger: 'estres', count: 1, avgWith: 4, avgWithout: 4 },
    ]);
  });
});

describe('exercisePainRanking', () => {
  it('prioriza los ejercicios que mandaron dolor a la pierna', () => {
    expect(
      exercisePainRanking([
        { exerciseId: 'a', radiatesToLeg: false },
        { exerciseId: 'a', radiatesToLeg: false },
        { exerciseId: 'b', radiatesToLeg: true },
      ]),
    ).toEqual([
      { exerciseId: 'b', total: 1, leg: 1 },
      { exerciseId: 'a', total: 2, leg: 0 },
    ]);
  });
});
