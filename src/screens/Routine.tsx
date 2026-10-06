import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { EXERCISES_BY_ID } from '../data/exercises';
import { ExerciseImage } from '../components/ExerciseImage';
import { formatTarget } from '../logic/format';

export function Routine() {
  const days = useLiveQuery(() => db.routineDays.orderBy('id').toArray(), []);
  const [selected, setSelected] = useState(1);
  if (!days) return null;
  const day = days.find((d) => d.id === selected) ?? days[0];

  return (
    <div>
      <div className="grid grid-cols-5 gap-2" role="tablist" aria-label="Días">
        {days.map((d) => (
          <button
            key={d.id}
            role="tab"
            aria-selected={d.id === day.id}
            onClick={() => setSelected(d.id)}
            className={`h-12 rounded-xl text-base font-bold ${
              d.id === day.id ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-ink border border-line'
            }`}
          >
            Día {d.id}
          </button>
        ))}
      </div>
      <h2 className="mt-4 text-lg font-bold">
        Día {day.id} · {day.title}
      </h2>
      <ul className="mt-3 space-y-3">
        {day.items.map((item) => {
          const exercise = EXERCISES_BY_ID[item.exerciseId];
          if (!exercise) return null;
          return (
            <li key={item.uid} className="flex gap-3 rounded-2xl border border-line bg-surface p-3">
              <ExerciseImage exercise={exercise} className="h-16 w-16 shrink-0 rounded-xl" />
              <div className="min-w-0">
                <p className="font-semibold leading-tight">{exercise.name}</p>
                <p className="text-sm text-muted">{formatTarget(item, exercise.kind)}</p>
                {item.note && <p className="text-sm text-warn">{item.note}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
