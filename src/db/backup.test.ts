import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import { exportBackup, importBackup, parseBackup } from './backup';
import { addPainEvent, startSession, saveSet } from './actions';

beforeEach(async () => {
  db.close();
  await db.delete();
  await db.open();
});

describe('respaldo JSON', () => {
  it('exportar y volver a importar conserva los datos', async () => {
    const id = await startSession(1);
    await saveSet(id, 'd1-1', 'press-pecho-maquina', 0, { weight: 40, value: 10, done: true });
    await addPainEvent(id, 'pec-deck', true);
    const backup = await exportBackup();

    await db.sessions.clear();
    await db.setLogs.clear();
    await db.flags.clear();
    await importBackup(parseBackup(JSON.stringify(backup)));

    const again = await exportBackup();
    expect(again.data).toEqual(backup.data);
    expect(again.data.flags).toHaveLength(1);
    expect(again.data.routineDays).toHaveLength(5);
  });

  it('rechaza archivos que no son JSON', () => {
    expect(() => parseBackup('hola')).toThrow('no es un JSON válido');
  });

  it('rechaza JSON de otra app', () => {
    expect(() => parseBackup(JSON.stringify({ app: 'otra', version: 1, data: {} }))).toThrow('no es un respaldo');
  });

  it('rechaza respaldos de una versión futura', () => {
    expect(() => parseBackup(JSON.stringify({ app: 'rutina-l5', version: 99, data: {} }))).toThrow('más nueva');
  });

  it('rechaza respaldos sin rutina', async () => {
    const backup = await exportBackup();
    backup.data.routineDays = [];
    expect(() => parseBackup(JSON.stringify(backup))).toThrow('rutina válida');
  });

  it('rechaza tablas dañadas', async () => {
    const backup = await exportBackup();
    (backup.data as unknown as Record<string, unknown>).sessions = 'x';
    expect(() => parseBackup(JSON.stringify(backup))).toThrow('dañado');
  });
});
