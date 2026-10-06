import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_SETTINGS } from '../db/db';

export function useActiveSession() {
  return useLiveQuery(
    async () => (await db.sessions.where('status').equals('in_progress').sortBy('startedAt')).at(-1) ?? null,
    [],
  );
}

export function useSettings() {
  return useLiveQuery(async () => ({ ...DEFAULT_SETTINGS, ...(await db.settings.get('app')) }), []) ?? DEFAULT_SETTINGS;
}
