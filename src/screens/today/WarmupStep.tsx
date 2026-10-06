import { useState } from 'react';
import { Check, Play } from 'lucide-react';
import { goToStep, toggleWarmup } from '../../db/actions';
import { updateSettings } from '../../db/db';
import { EXERCISES_BY_ID, MCGILL_SERIES, WARMUP_IDS } from '../../data/exercises';
import { Button, Card, StickyAction } from '../../components/ui';
import { ExerciseImage } from '../../components/ExerciseImage';
import { HoldPlayer } from '../../components/HoldPlayer';
import { unlockAudio } from '../../lib/feedback';
import { useSettings } from '../../hooks/useSession';
import type { Session } from '../../types';

type Side = 'unico' | 'izq' | 'der';

const SIDES: Record<(typeof WARMUP_IDS)[number], Side[]> = {
  'curl-up-mcgill': ['unico'],
  'plancha-lateral': ['izq', 'der'],
  'bird-dog': ['izq', 'der'],
};

const SIDE_LABEL: Record<Side, string> = { unico: 'Serie', izq: 'Izquierda', der: 'Derecha' };

export const warmupKey = (exerciseId: string, series: number, side: Side) => `${exerciseId}:${series}:${side}`;

export const WARMUP_KEYS = WARMUP_IDS.flatMap((id) =>
  MCGILL_SERIES.flatMap((_, series) => SIDES[id].map((side) => warmupKey(id, series, side))),
);

interface Running {
  key: string;
  exerciseId: string;
  reps: number;
  side: Side;
}

/** Calentamiento obligatorio: Big 3 de McGill en series descendentes 5-3-1 con aguantes de 8–10 s. */
export function WarmupStep({ session }: { session: Session }) {
  const settings = useSettings();
  const [running, setRunning] = useState<Running | null>(null);
  const done = new Set(session.warmupDone);
  const total = WARMUP_KEYS.length;
  const completed = WARMUP_KEYS.filter((k) => done.has(k)).length;

  return (
    <div>
      <h2 className="text-lg font-bold">Calentamiento: Big 3 de McGill</h2>
      <p className="mt-1 text-muted">
        Series 5-3-1 aguantando cada repetición. Toca un lado para iniciar la cuenta regresiva.
      </p>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-sm text-muted">Aguante:</span>
        {[8, 10].map((seconds) => (
          <button
            key={seconds}
            type="button"
            aria-pressed={settings.holdSeconds === seconds}
            onClick={() => updateSettings({ holdSeconds: seconds })}
            className={`h-10 rounded-lg px-4 font-semibold ${
              settings.holdSeconds === seconds ? 'bg-accent text-accent-ink' : 'border border-line bg-surface-2'
            }`}
          >
            {seconds} s
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {WARMUP_IDS.map((id) => {
          const exercise = EXERCISES_BY_ID[id];
          return (
            <Card key={id}>
              <div className="flex gap-3">
                <ExerciseImage exercise={exercise} className="h-20 w-20 shrink-0 rounded-xl" />
                <div>
                  <h3 className="text-lg font-bold leading-tight">{exercise.name}</h3>
                  <p className="mt-1 text-sm text-muted">{exercise.technique}</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {MCGILL_SERIES.map((reps, series) => (
                  <div key={series} className="flex items-center gap-2">
                    <span className="w-16 shrink-0 text-sm font-semibold text-muted">
                      {reps} rep{reps > 1 ? 's' : ''}
                    </span>
                    {SIDES[id].map((side) => {
                      const key = warmupKey(id, series, side);
                      const isDone = done.has(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          aria-pressed={isDone}
                          aria-label={`${exercise.name}, ${reps} repeticiones, ${SIDE_LABEL[side]}${isDone ? ', hecha' : ''}`}
                          onClick={() => {
                            if (isDone) {
                              void toggleWarmup(session.id!, key, false);
                            } else {
                              unlockAudio();
                              setRunning({ key, exerciseId: id, reps, side });
                            }
                          }}
                          className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border font-semibold ${
                            isDone ? 'border-accent bg-accent/15 text-accent' : 'border-line bg-surface-2'
                          }`}
                        >
                          {isDone ? <Check size={20} aria-hidden /> : <Play size={18} aria-hidden />}
                          {side === 'unico' ? (isDone ? 'Hecha' : 'Iniciar') : SIDE_LABEL[side]}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <StickyAction>
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={completed < total}
          onClick={() => goToStep(session.id!, 'exercises')}
        >
          {completed < total ? `Calentamiento ${completed}/${total}` : 'Ir a los ejercicios'}
        </Button>
      </StickyAction>

      {running && (
        <HoldPlayer
          title={EXERCISES_BY_ID[running.exerciseId].name}
          subtitle={`${running.reps} repeticiones × ${settings.holdSeconds} s${
            running.side === 'unico' ? '' : ` · ${SIDE_LABEL[running.side].toLowerCase()}`
          }`}
          reps={running.reps}
          holdSeconds={settings.holdSeconds}
          onComplete={() => void toggleWarmup(session.id!, running.key, true)}
          onClose={() => setRunning(null)}
        />
      )}
    </div>
  );
}
