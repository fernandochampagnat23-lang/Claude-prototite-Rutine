import { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { EXERCISES_BY_ID } from '../data/exercises';
import { replaceExercise } from '../db/actions';
import { Button } from './ui';

/** Lista de alternativas seguras para reemplazar un ejercicio en la sesión y/o en la rutina. */
export function ReplacePicker({
  exerciseId,
  dayId,
  itemUid,
  sessionId,
  onDone,
}: {
  exerciseId: string;
  dayId: number;
  itemUid: string;
  sessionId?: number;
  onDone?: () => void;
}) {
  const [alsoRoutine, setAlsoRoutine] = useState(true);
  const alternatives = EXERCISES_BY_ID[exerciseId]?.alternatives ?? [];
  if (alternatives.length === 0) return <p className="text-muted">Este ejercicio no tiene alternativas cargadas.</p>;

  return (
    <div className="space-y-2">
      {alternatives.map((id) => (
        <Button
          key={id}
          className="w-full justify-start! text-left"
          onClick={async () => {
            await replaceExercise(sessionId, dayId, itemUid, id, sessionId === undefined || alsoRoutine);
            onDone?.();
          }}
        >
          <ArrowRightLeft size={18} aria-hidden className="shrink-0" />
          {EXERCISES_BY_ID[id]?.name ?? id}
        </Button>
      ))}
      {sessionId !== undefined && (
        <label className="flex min-h-12 items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={alsoRoutine}
            onChange={(event) => setAlsoRoutine(event.target.checked)}
            className="h-6 w-6 accent-[var(--color-accent)]"
          />
          Cambiarlo también en mi rutina
        </label>
      )}
    </div>
  );
}
