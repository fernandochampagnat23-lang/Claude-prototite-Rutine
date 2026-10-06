import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Play } from 'lucide-react';
import { db } from '../../db/db';
import { startSession } from '../../db/actions';
import { EXERCISES_BY_ID } from '../../data/exercises';
import { nextDayId } from '../../logic/rotation';
import { formatShortDate } from '../../logic/dates';
import { Button, Card } from '../../components/ui';

/** Muestra el siguiente día de la rotación y permite elegir otro. */
export function StartCard() {
  const days = useLiveQuery(() => db.routineDays.orderBy('id').toArray(), []);
  const sessions = useLiveQuery(() => db.sessions.toArray(), []);
  const [chosen, setChosen] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);

  if (!days || !sessions) return null;
  const next = nextDayId(sessions, days.length);
  const dayId = chosen ?? next;
  const day = days.find((d) => d.id === dayId) ?? days[0];
  const lastCompleted = sessions
    .filter((s) => s.status === 'completed')
    .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))[0];

  const start = async () => {
    setStarting(true);
    try {
      await startSession(day.id);
    } finally {
      setStarting(false);
    }
  };

  return (
    <Card>
      <p className="text-sm font-semibold uppercase tracking-wide text-muted">
        {day.id === next ? 'Te toca' : 'Elegiste'}
      </p>
      <h2 className="mt-1 text-2xl font-bold">
        Día {day.id} · {day.title}
      </h2>
      <ul className="mt-3 space-y-1 text-muted">
        {day.items.map((item) => (
          <li key={item.uid} className="flex gap-2">
            <span aria-hidden>•</span>
            <span>
              {EXERCISES_BY_ID[item.exerciseId]?.name}
              {item.optional && ' (opcional)'}
            </span>
          </li>
        ))}
      </ul>

      <Button variant="primary" size="lg" className="mt-4 w-full" onClick={start} disabled={starting}>
        <Play size={22} aria-hidden />
        Empezar Día {day.id}
      </Button>

      <p className="mb-2 mt-5 text-sm font-semibold text-muted">¿Otro día?</p>
      <div className="grid grid-cols-5 gap-2">
        {days.map((d) => (
          <button
            key={d.id}
            type="button"
            aria-pressed={d.id === day.id}
            onClick={() => setChosen(d.id)}
            className={`h-12 rounded-xl text-base font-bold ${
              d.id === day.id ? 'bg-accent/15 text-accent border border-accent' : 'bg-surface-2 border border-line'
            }`}
          >
            {d.id}
          </button>
        ))}
      </div>

      {lastCompleted && (
        <p className="mt-4 text-sm text-muted">
          Última sesión: Día {lastCompleted.dayId} el {formatShortDate(lastCompleted.date)}
          {lastCompleted.pre && lastCompleted.post && (
            <>
              {' '}
              · dolor {lastCompleted.pre.score} → {lastCompleted.post.score}
            </>
          )}
        </p>
      )}
    </Card>
  );
}
