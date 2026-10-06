import { db } from './db';
import type { CheckIn, ExerciseFlag, PainEvent, RoutineDay, Session, SetLog, Settings } from '../types';

export const BACKUP_APP = 'rutina-l5';
export const BACKUP_VERSION = 1;

export interface BackupData {
  routineDays: RoutineDay[];
  sessions: Session[];
  setLogs: SetLog[];
  painEvents: PainEvent[];
  checkins: CheckIn[];
  flags: ExerciseFlag[];
  settings: Settings[];
}

export interface Backup {
  app: typeof BACKUP_APP;
  version: number;
  exportedAt: string;
  data: BackupData;
}

const TABLES = ['routineDays', 'sessions', 'setLogs', 'painEvents', 'checkins', 'flags', 'settings'] as const;

export async function exportBackup(): Promise<Backup> {
  const [routineDays, sessions, setLogs, painEvents, checkins, flags, settings] = await Promise.all([
    db.routineDays.toArray(),
    db.sessions.toArray(),
    db.setLogs.toArray(),
    db.painEvents.toArray(),
    db.checkins.toArray(),
    db.flags.toArray(),
    db.settings.toArray(),
  ]);
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: { routineDays, sessions, setLogs, painEvents, checkins, flags, settings },
  };
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Valida el contenido de un archivo de respaldo. Lanza un error con un mensaje en español. */
export function parseBackup(text: string): Backup {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('El archivo no es un JSON válido.');
  }
  if (!isObject(raw) || raw.app !== BACKUP_APP) throw new Error('El archivo no es un respaldo de esta app.');
  if (typeof raw.version !== 'number' || raw.version > BACKUP_VERSION) {
    throw new Error('El respaldo es de una versión más nueva de la app. Actualízala antes de importar.');
  }
  if (!isObject(raw.data)) throw new Error('El respaldo no tiene datos.');
  const data = raw.data;
  for (const table of TABLES) {
    const rows = data[table];
    if (!Array.isArray(rows) || !rows.every(isObject)) throw new Error(`El respaldo está dañado (${table}).`);
  }
  const days = data.routineDays as unknown[];
  if (days.length === 0 || !days.every((d) => isObject(d) && typeof d.id === 'number' && Array.isArray(d.items))) {
    throw new Error('El respaldo no tiene una rutina válida.');
  }
  return raw as unknown as Backup;
}

/** Reemplaza todos los datos locales por los del respaldo. */
export async function importBackup(backup: Backup): Promise<void> {
  await db.transaction('rw', [db.routineDays, db.sessions, db.setLogs, db.painEvents, db.checkins, db.flags, db.settings], async () => {
    await Promise.all(TABLES.map((table) => db.table(table).clear()));
    await Promise.all(TABLES.map((table) => db.table(table).bulkAdd(backup.data[table])));
  });
}

export function backupFileName(date: string): string {
  return `rutina-l5-respaldo-${date}.json`;
}
