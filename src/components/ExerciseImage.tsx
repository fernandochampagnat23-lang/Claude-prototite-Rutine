import { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import type { Exercise } from '../types';
import { GROUP_LABELS } from '../data/exercises';

/** Foto del ejercicio extraída del documento, o un placeholder si no existe. */
export function ExerciseImage({ exercise, className = '' }: { exercise: Exercise; className?: string }) {
  const [failed, setFailed] = useState(false);
  const src = exercise.image ? `${import.meta.env.BASE_URL}${exercise.image}` : undefined;

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 bg-surface-2 text-muted ${className}`}
        role="img"
        aria-label={`Sin foto de ${exercise.name}`}
      >
        <Dumbbell size={28} aria-hidden />
        <span className="text-[10px] uppercase tracking-wide">{GROUP_LABELS[exercise.group]}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={exercise.name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`bg-white object-contain ${className}`}
    />
  );
}
