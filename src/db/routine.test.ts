import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import { addItem, moveItem, removeItem, resetRoutine, updateItem } from './routine';
import { replaceExercise } from './actions';

beforeEach(async () => {
  db.close();
  await db.delete();
  await db.open();
});

const day1 = async () => (await db.routineDays.get(1))!;

describe('edición de la rutina', () => {
  it('reemplazar un ejercicio en la rutina conserva series y objetivo', async () => {
    await replaceExercise(undefined, 1, 'd1-3', 'aperturas-mancuernas', true);
    expect((await day1()).items[2]).toEqual({ uid: 'd1-3', exerciseId: 'aperturas-mancuernas', sets: 3, target: 12 });
  });

  it('editar, mover, quitar y añadir', async () => {
    await updateItem(1, 'd1-1', { sets: 5 });
    await moveItem(1, 'd1-1', 1);
    await removeItem(1, 'd1-7');
    await addItem(1, 'plancha-frontal');
    const items = (await day1()).items;
    expect(items[1]).toMatchObject({ uid: 'd1-1', sets: 5 });
    expect(items.some((i) => i.uid === 'd1-7')).toBe(false);
    expect(items.at(-1)).toMatchObject({ exerciseId: 'plancha-frontal', sets: 3, target: 30 });
  });

  it('restablecer vuelve a la rutina original', async () => {
    await removeItem(1, 'd1-1');
    await resetRoutine();
    expect((await day1()).items[0].uid).toBe('d1-1');
  });
});

describe('reemplazo', () => {
  it('no hereda la nota ni el carácter opcional del ejercicio anterior', async () => {
    await replaceExercise(undefined, 3, 'd3-1', 'belt-squat', true);
    await replaceExercise(undefined, 3, 'd3-2', 'prensa-una-pierna', true);
    const items = (await db.routineDays.get(3))!.items;
    expect(items[0]).toEqual({ uid: 'd3-1', exerciseId: 'belt-squat', sets: 4, target: 12 });
    expect(items[1]).toEqual({ uid: 'd3-2', exerciseId: 'prensa-una-pierna', sets: 3, target: 10 });
  });
});
