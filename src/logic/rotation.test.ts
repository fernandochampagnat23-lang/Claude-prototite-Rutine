import { describe, expect, it } from 'vitest';
import { nextDayId } from './rotation';

describe('nextDayId', () => {
  it('sin historial empieza en el Día 1', () => {
    expect(nextDayId([])).toBe(1);
  });

  it('sigue al último día completado', () => {
    expect(
      nextDayId([
        { dayId: 1, status: 'completed', startedAt: 1, finishedAt: 2 },
        { dayId: 2, status: 'completed', startedAt: 3, finishedAt: 4 },
      ]),
    ).toBe(3);
  });

  it('después del Día 5 vuelve al Día 1', () => {
    expect(nextDayId([{ dayId: 5, status: 'completed', startedAt: 1, finishedAt: 2 }])).toBe(1);
  });

  it('una sesión abandonada no avanza la rotación', () => {
    expect(
      nextDayId([
        { dayId: 2, status: 'completed', startedAt: 1, finishedAt: 2 },
        { dayId: 3, status: 'abandoned', startedAt: 3 },
      ]),
    ).toBe(3);
  });

  it('si se eligió otro día, la rotación sigue desde ese día', () => {
    expect(
      nextDayId([
        { dayId: 1, status: 'completed', startedAt: 1, finishedAt: 2 },
        { dayId: 4, status: 'completed', startedAt: 3, finishedAt: 4 },
      ]),
    ).toBe(5);
  });
});
