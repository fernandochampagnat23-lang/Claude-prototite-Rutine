const DAY_MS = 24 * 60 * 60 * 1000;

/** Fecha local en formato YYYY-MM-DD. */
export function toDateKey(value: Date | number = new Date()): string {
  const date = typeof value === 'number' ? new Date(value) : value;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function keyToUtc(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Días de calendario entre dos fechas (b - a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((keyToUtc(b) - keyToUtc(a)) / DAY_MS);
}

export function addDays(key: string, days: number): string {
  const date = new Date(keyToUtc(key) + days * DAY_MS);
  return date.toISOString().slice(0, 10);
}

/** Lunes de la semana de la fecha dada. */
export function weekStart(key: string): string {
  const weekday = new Date(keyToUtc(key)).getUTCDay(); // 0 = domingo
  const offset = (weekday + 6) % 7;
  return addDays(key, -offset);
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function formatShortDate(key: string): string {
  const [, m, d] = key.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

export function formatLongDate(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}
