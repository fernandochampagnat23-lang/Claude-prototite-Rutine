import { describe, expect, it } from 'vitest';
import type { PainCheck } from '../types';
import { legPainStreak, phaseNoticeEligible, sessionHasLegPain, type PainRecords } from './legPain';

const check = (score: number, locations: PainCheck['locations'] = []): PainCheck => ({
  score,
  locations,
  symptoms: [],
  at: 0,
});

const empty = (): PainRecords => ({ sessions: [], painEvents: [], checkins: [] });

describe('sessionHasLegPain', () => {
  it('lumbar y glúteo no cuentan como pierna', () => {
    expect(sessionHasLegPain({ id: 1, pre: check(3, ['lumbar', 'gluteo_izq']) }, [])).toBe(false);
  });

  it('muslo o pantorrilla en el registro inicial o final cuentan', () => {
    expect(sessionHasLegPain({ id: 1, pre: check(3, ['muslo_izq']) }, [])).toBe(true);
    expect(sessionHasLegPain({ id: 1, post: check(3, ['pantorrilla_pie_izq']) }, [])).toBe(true);
  });

  it('un "me dolió" que bajó a la pierna cuenta solo para su sesión', () => {
    expect(sessionHasLegPain({ id: 1 }, [{ sessionId: 1, radiatesToLeg: true }])).toBe(true);
    expect(sessionHasLegPain({ id: 2 }, [{ sessionId: 1, radiatesToLeg: true }])).toBe(false);
  });
});

describe('legPainStreak', () => {
  it('sin registros la racha es 0', () => {
    expect(legPainStreak(empty(), '2026-10-06')).toEqual({ days: 0 });
  });

  it('sin dolor en la pierna cuenta desde el primer registro, incluido hoy', () => {
    const records = empty();
    records.sessions.push({ id: 1, date: '2026-10-01', pre: check(2, ['lumbar']) });
    expect(legPainStreak(records, '2026-10-06')).toEqual({ days: 6, start: '2026-10-01' });
  });

  it('cuenta los días desde el último dolor en la pierna', () => {
    const records = empty();
    records.sessions.push({ id: 1, date: '2026-09-20', pre: check(4, ['muslo_izq']) });
    records.painEvents.push({ date: '2026-10-02', radiatesToLeg: true });
    records.painEvents.push({ date: '2026-10-04', radiatesToLeg: false });
    expect(legPainStreak(records, '2026-10-06')).toEqual({
      days: 4,
      start: '2026-10-03',
      lastPain: '2026-10-02',
    });
  });

  it('un registro fuera de sesión también corta la racha', () => {
    const records = empty();
    records.sessions.push({ id: 1, date: '2026-09-01' });
    records.checkins.push({ date: '2026-10-05', locations: ['pantorrilla_pie_izq'] });
    expect(legPainStreak(records, '2026-10-06').days).toBe(1);
  });

  it('dolor en la pierna hoy deja la racha en 0', () => {
    const records = empty();
    records.checkins.push({ date: '2026-10-06', locations: ['muslo_izq'] });
    expect(legPainStreak(records, '2026-10-06')).toEqual({ days: 0, lastPain: '2026-10-06' });
  });
});

describe('phaseNoticeEligible (aviso de fase siguiente)', () => {
  const today = '2026-10-31';
  const weekly = ['2026-10-12', '2026-10-19', '2026-10-27'];

  it('con 21 días sin dolor y sesiones cada semana muestra el aviso', () => {
    expect(phaseNoticeEligible({ days: 21, start: '2026-10-11' }, weekly, today)).toBe(true);
  });

  it('con 20 días no alcanza', () => {
    expect(phaseNoticeEligible({ days: 20, start: '2026-10-12' }, weekly, today)).toBe(false);
  });

  it('una semana sin entrenar dentro del período impide el aviso', () => {
    expect(phaseNoticeEligible({ days: 30, start: '2026-10-02' }, ['2026-10-12', '2026-10-27'], today)).toBe(
      false,
    );
  });

  it('sin sesiones no hay aviso aunque no haya dolor registrado', () => {
    expect(phaseNoticeEligible({ days: 40, start: '2026-09-22' }, [], today)).toBe(false);
  });
});
