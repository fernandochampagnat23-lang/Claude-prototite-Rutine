import { addDays } from './dates';

export const REMINDER_TEXT = 'Primera hora del día sin doblar la espalda';

/** ¿Mostrar el aviso matutino? Solo antes del mediodía, si está activado y no se cerró hoy. */
export function shouldShowMorningBanner(
  settings: { reminderEnabled: boolean; reminderDismissedOn?: string },
  today: string,
  hour: number,
): boolean {
  return settings.reminderEnabled && hour < 12 && settings.reminderDismissedOn !== today;
}

const pad = (n: number) => String(n).padStart(2, '0');
const compactDate = (key: string) => key.replaceAll('-', '');

function escapeText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/**
 * Evento de calendario diario con alarma (formato iCalendar). Usa hora "flotante",
 * así suena a la hora local del celular aunque cambie de zona horaria.
 */
export function buildReminderIcs(time: string, now: Date): string {
  const [hh, mm] = time.split(':').map(Number);
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const passed = now.getHours() > hh || (now.getHours() === hh && now.getMinutes() >= mm);
  const start = passed ? addDays(today, 1) : today;
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rutina L5//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:rutina-l5-recordatorio-matutino',
    `DTSTAMP:${stamp}`,
    `DTSTART:${compactDate(start)}T${pad(hh)}${pad(mm)}00`,
    'DURATION:PT5M',
    'RRULE:FREQ=DAILY',
    `SUMMARY:${escapeText(REMINDER_TEXT)}`,
    `DESCRIPTION:${escapeText('Nada de agacharte doblando la columna durante la primera hora. Rutina L5.')}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(REMINDER_TEXT)}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n') + '\r\n';
}
