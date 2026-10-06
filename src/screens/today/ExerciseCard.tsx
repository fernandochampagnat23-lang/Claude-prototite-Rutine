import { useState } from 'react';
import { MonitorPlay } from 'lucide-react';
import { EXERCISES_BY_ID, youtubeUrl } from '../../data/exercises';
import { formatTarget } from '../../logic/format';
import { ExerciseImage } from '../../components/ExerciseImage';
import { Sheet } from '../../components/ui';
import type { RoutineItem, Session } from '../../types';

export function ExerciseCard({ item }: { session: Session; item: RoutineItem }) {
  const exercise = EXERCISES_BY_ID[item.exerciseId];
  const [zoom, setZoom] = useState(false);
  if (!exercise) return null;

  return (
    <article className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex gap-3">
        <button type="button" onClick={() => setZoom(true)} aria-label={`Ampliar foto de ${exercise.name}`}>
          <ExerciseImage exercise={exercise} className="h-24 w-24 shrink-0 rounded-xl" />
        </button>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold leading-tight">{exercise.name}</h3>
          <p className="font-semibold text-accent">{formatTarget(item, exercise.kind)}</p>
          {item.note && <p className="text-sm text-warn">{item.note}</p>}
        </div>
      </div>
      <p className="mt-3 text-sm text-muted">
        <span className="font-semibold text-ink">Clave: </span>
        {exercise.technique}
      </p>
      <a
        href={youtubeUrl(exercise.name)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-xl border border-line bg-surface-2 px-4 font-semibold"
      >
        <MonitorPlay size={20} aria-hidden /> Ver técnica
      </a>

      <Sheet open={zoom} onClose={() => setZoom(false)} title={exercise.name}>
        <ExerciseImage exercise={exercise} className="aspect-square w-full rounded-2xl" />
        <p className="mt-3 text-muted">{exercise.technique}</p>
      </Sheet>
    </article>
  );
}
