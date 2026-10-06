import Dexie, { type EntityTable } from 'dexie';
import { DEFAULT_ROUTINE } from '../data/routine';
import type { CheckIn, ExerciseFlag, PainEvent, RoutineDay, Session, SetLog, Settings } from '../types';

export const DEFAULT_SETTINGS: Settings = {
  key: 'app',
  restSeconds: 90,
  holdSeconds: 10,
  reminderEnabled: true,
  reminderTime: '07:30',
};

export class RutinaDB extends Dexie {
  routineDays!: EntityTable<RoutineDay, 'id'>;
  sessions!: EntityTable<Session, 'id'>;
  setLogs!: EntityTable<SetLog, 'id'>;
  painEvents!: EntityTable<PainEvent, 'id'>;
  checkins!: EntityTable<CheckIn, 'id'>;
  flags!: EntityTable<ExerciseFlag, 'exerciseId'>;
  settings!: EntityTable<Settings, 'key'>;

  constructor(name = 'rutina-l5') {
    super(name);
    this.version(1).stores({
      routineDays: 'id',
      sessions: '++id, date, status, dayId, startedAt',
      setLogs: '++id, sessionId, exerciseId, [sessionId+itemUid]',
      painEvents: '++id, sessionId, exerciseId, date',
      checkins: '++id, date',
      flags: 'exerciseId',
      settings: 'key',
    });
    this.on('populate', (tx) => {
      tx.table('routineDays').bulkAdd(structuredClone(DEFAULT_ROUTINE));
      tx.table('settings').add({ ...DEFAULT_SETTINGS });
    });
  }
}

export const db = new RutinaDB();

export async function getSettings(): Promise<Settings> {
  const stored = await db.settings.get('app');
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function updateSettings(changes: Partial<Omit<Settings, 'key'>>): Promise<void> {
  const current = await getSettings();
  await db.settings.put({ ...current, ...changes });
}
