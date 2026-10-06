import { db } from './db';
import { DEFAULT_ROUTINE } from '../data/routine';
import { EXERCISES_BY_ID } from '../data/exercises';
import type { RoutineDay, RoutineItem } from '../types';

async function editDay(dayId: number, edit: (day: RoutineDay) => RoutineDay): Promise<void> {
  await db.transaction('rw', db.routineDays, async () => {
    const day = await db.routineDays.get(dayId);
    if (day) await db.routineDays.put(edit(day));
  });
}

export function updateItem(dayId: number, uid: string, changes: Partial<RoutineItem>): Promise<void> {
  return editDay(dayId, (day) => ({
    ...day,
    items: day.items.map((item) => (item.uid === uid ? { ...item, ...changes } : item)),
  }));
}

export function moveItem(dayId: number, uid: string, direction: -1 | 1): Promise<void> {
  return editDay(dayId, (day) => {
    const items = [...day.items];
    const from = items.findIndex((item) => item.uid === uid);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= items.length) return day;
    [items[from], items[to]] = [items[to], items[from]];
    return { ...day, items };
  });
}

export function removeItem(dayId: number, uid: string): Promise<void> {
  return editDay(dayId, (day) => ({ ...day, items: day.items.filter((item) => item.uid !== uid) }));
}

const DEFAULT_TARGET = { reps: 12, hold: 30, distance: 30 } as const;

export function addItem(dayId: number, exerciseId: string): Promise<void> {
  const exercise = EXERCISES_BY_ID[exerciseId];
  const item: RoutineItem = {
    uid: `d${dayId}-${Date.now().toString(36)}`,
    exerciseId,
    sets: 3,
    target: DEFAULT_TARGET[exercise?.kind ?? 'reps'],
  };
  return editDay(dayId, (day) => ({ ...day, items: [...day.items, item] }));
}

export function renameDay(dayId: number, title: string): Promise<void> {
  return editDay(dayId, (day) => ({ ...day, title: title.trim() || day.title }));
}

export async function resetRoutine(): Promise<void> {
  await db.transaction('rw', db.routineDays, async () => {
    await db.routineDays.clear();
    await db.routineDays.bulkAdd(structuredClone(DEFAULT_ROUTINE));
  });
}
