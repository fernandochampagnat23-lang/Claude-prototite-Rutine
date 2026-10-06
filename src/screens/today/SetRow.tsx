import { useState } from 'react';
import { Check, Play } from 'lucide-react';
import { Stepper } from '../../components/ui';
import { DEFAULT_WEIGHT_STEP } from '../../data/exercises';
import type { Exercise, RoutineItem, SetLog } from '../../types';
import type { SetInput } from '../../db/actions';

/** Una fila por serie: peso, reps (o metros) y el botón para marcarla hecha. */
export function SetRow({
  index,
  exercise,
  item,
  log,
  defaultWeight,
  onSave,
  onStartHold,
}: {
  index: number;
  exercise: Exercise;
  item: RoutineItem;
  log?: SetLog;
  defaultWeight?: number;
  onSave: (input: SetInput) => void;
  onStartHold: () => void;
}) {
  const [weight, setWeight] = useState<number | undefined>(log?.weight ?? defaultWeight);
  const [value, setValue] = useState<number | undefined>(log?.value);
  const done = !!log?.done;
  const isHold = exercise.kind === 'hold';
  const unitName = exercise.kind === 'distance' ? 'Metros' : 'Repeticiones';
  const unitShort = exercise.kind === 'distance' ? 'm' : 'reps';

  const toggleDone = () => {
    if (done) onSave({ weight, value: log?.value, done: false });
    else onSave({ weight: exercise.weighted ? weight : undefined, value: value ?? item.target, done: true });
  };

  return (
    <div
      className={`flex items-center gap-2 rounded-xl p-1 ${done ? 'bg-accent/10' : ''}`}
      data-testid={`set-${index + 1}`}
    >
      <span className="w-5 shrink-0 text-center text-lg font-bold text-muted">{index + 1}</span>

      {exercise.weighted && (
        <div className="min-w-0 flex-1">
          <Stepper
            label={`Peso serie ${index + 1}`}
            suffix={exercise.assisted ? 'kg asist.' : 'kg'}
            value={weight}
            step={exercise.weightStep ?? DEFAULT_WEIGHT_STEP}
            onChange={setWeight}
          />
        </div>
      )}

      {isHold ? (
        <button
          type="button"
          onClick={onStartHold}
          disabled={done}
          className="flex h-14 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 text-lg font-bold disabled:text-muted"
        >
          <Play size={20} aria-hidden />
          {log?.value ?? item.target} s{item.perSide ? ' × lado' : ''}
        </button>
      ) : exercise.weighted ? (
        <label className="flex h-14 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-line bg-surface-2">
          <span className="sr-only">{`${unitName} serie ${index + 1}`}</span>
          <input
            type="number"
            inputMode="numeric"
            value={value ?? ''}
            placeholder={String(item.target)}
            onChange={(event) => setValue(event.target.value === '' ? undefined : Number(event.target.value))}
            onFocus={(event) => event.target.select()}
            className="w-full bg-transparent text-center text-xl font-bold outline-none placeholder:text-ink/60"
          />
          <span className="text-[11px] leading-none text-muted">{unitShort}</span>
        </label>
      ) : (
        <div className="min-w-0 flex-1">
          <Stepper
            label={`${unitName} serie ${index + 1}`}
            suffix={`${unitShort} (obj. ${item.target})`}
            value={value}
            placeholder={item.target}
            step={exercise.kind === 'distance' ? 5 : 1}
            onChange={setValue}
          />
        </div>
      )}

      <button
        type="button"
        onClick={toggleDone}
        aria-pressed={done}
        aria-label={done ? `Serie ${index + 1} hecha, tocar para deshacer` : `Marcar serie ${index + 1} como hecha`}
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 ${
          done ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface-2 text-muted'
        }`}
      >
        <Check size={28} strokeWidth={3} />
      </button>
    </div>
  );
}
