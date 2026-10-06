import { describe, expect, it } from 'vitest';
import { buildReminderIcs, REMINDER_TEXT, shouldShowMorningBanner } from './reminder';

describe('aviso matutino', () => {
  const on = { reminderEnabled: true };

  it('se muestra por la mañana si está activado', () => {
    expect(shouldShowMorningBanner(on, '2026-10-06', 7)).toBe(true);
  });

  it('no se muestra desde el mediodía', () => {
    expect(shouldShowMorningBanner(on, '2026-10-06', 12)).toBe(false);
  });

  it('no se muestra si se cerró hoy, pero sí al día siguiente', () => {
    const dismissed = { ...on, reminderDismissedOn: '2026-10-06' };
    expect(shouldShowMorningBanner(dismissed, '2026-10-06', 8)).toBe(false);
    expect(shouldShowMorningBanner(dismissed, '2026-10-07', 8)).toBe(true);
  });

  it('no se muestra si está desactivado', () => {
    expect(shouldShowMorningBanner({ reminderEnabled: false }, '2026-10-06', 7)).toBe(false);
  });
});

describe('buildReminderIcs', () => {
  it('genera un evento diario con alarma a la hora elegida', () => {
    const ics = buildReminderIcs('07:30', new Date(2026, 9, 6, 6, 0));
    expect(ics).toContain('RRULE:FREQ=DAILY');
    expect(ics).toContain('DTSTART:20261006T073000');
    expect(ics).toContain('BEGIN:VALARM');
    expect(ics).toContain(`SUMMARY:${REMINDER_TEXT}`);
    expect(ics.split('\r\n').at(-1)).toBe('');
  });

  it('si la hora ya pasó hoy, empieza mañana', () => {
    const ics = buildReminderIcs('07:30', new Date(2026, 9, 6, 9, 0));
    expect(ics).toContain('DTSTART:20261007T073000');
  });
});
