import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { AlertTriangle, CheckCircle2, MonitorPlay, TrendingUp, Zap } from 'lucide-react';
import { db } from '../../db/db';
import { addPainEvent, dismissFlag, saveSet, toggleSkip } from '../../db/actions';
import { exerciseHistory } from '../../db/history';
import { EXERCISES_BY_ID, youtubeUrl } from '../../data/exercises';
import { formatTarget } from '../../logic/format';
import { formatShortDate } from '../../logic/dates';
import { describeSuggestion, suggestProgression, workingWeight } from '../../logic/progression';
import { ExerciseImage } from '../../components/ExerciseImage';
import { HoldPlayer } from '../../components/HoldPlayer';
import { ReplacePicker } from '../../components/ReplacePicker';
import { useRestTimer } from '../../components/RestTimer';
import { Button, Sheet } from '../../components/ui';
import { useSettings } from '../../hooks/useSession';
import { unlockAudio } from '../../lib/feedback';
import { SetRow } from './SetRow';
import type { RoutineItem, Session } from '../../types';

export function ExerciseCard({
  session,
  item,
  restAfterSet,
  nextInSuperset,
}: {
  session: Session;
  item: RoutineItem;
  /** Falso en el primer ejercicio de una superserie: el descanso va después del segundo. */
  restAfterSet: boolean;
  nextInSuperset?: string;
}) {
  const exercise = EXERCISES_BY_ID[item.exerciseId];
  const sessionId = session.id!;
  const settings = useSettings();
  const rest = useRestTimer();
  const [zoom, setZoom] = useState(false);
  const [askPain, setAskPain] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [holdSet, setHoldSet] = useState<number | null>(null);
  const [weightOverride, setWeightOverride] = useState<number | undefined>();
  const [painNote, setPainNote] = useState<string | null>(null);

  const logs = useLiveQuery(
    () =>
      db.setLogs
        .where('[sessionId+itemUid]')
        .equals([sessionId, item.uid])
        .filter((log) => log.exerciseId === item.exerciseId)
        .toArray(),
    [sessionId, item.uid, item.exerciseId],
  );
  const history = useLiveQuery(() => exerciseHistory(item.exerciseId, sessionId), [item.exerciseId, sessionId]);
  const flag = useLiveQuery(() => db.flags.get(item.exerciseId), [item.exerciseId]);
  const events = useLiveQuery(
    () =>
      db.painEvents
        .where('sessionId')
        .equals(sessionId)
        .filter((e) => e.exerciseId === item.exerciseId)
        .toArray(),
    [sessionId, item.exerciseId],
  );

  if (!exercise || !logs || !history || !events) return null;

  const skipped = session.skipped.includes(item.uid);
  const legNow = events.some((e) => e.radiatesToLeg);
  const flaggedBefore = !!flag && flag.sessionId !== sessionId;
  const doneCount = new Set(logs.filter((l) => l.done).map((l) => l.setIndex)).size;
  const allDone = doneCount >= item.sets;
  const suggestion = suggestProgression(exercise, history);
  const last = history[0];
  const lastBySet = new Map(last?.logs.filter((l) => l.done).map((l) => [l.setIndex, l.weight]));
  const lastWorking = last ? workingWeight(last) : undefined;

  const afterSet = () => {
    if (restAfterSet) rest.start(settings.restSeconds);
  };

  const onPainAnswer = async (radiates: boolean) => {
    await addPainEvent(sessionId, item.exerciseId, radiates);
    setAskPain(false);
    setPainNote(
      radiates ? null : 'Anotado. Si se repite, baja el peso o recorta el rango. Si baja a la pierna, para.',
    );
  };

  const border = legNow ? 'border-danger border-2' : flaggedBefore ? 'border-danger' : allDone ? 'border-accent' : 'border-line';

  return (
    <article className={`rounded-2xl border bg-surface p-4 ${border} ${skipped ? 'opacity-60' : ''}`}>
      <div className="flex gap-3">
        <button type="button" onClick={() => setZoom(true)} aria-label={`Ampliar foto de ${exercise.name}`}>
          <ExerciseImage exercise={exercise} className="h-24 w-24 shrink-0 rounded-xl" />
        </button>
        <div className="min-w-0 flex-1">
          <h3 className={`text-lg font-bold leading-tight ${legNow ? 'text-danger' : ''}`}>{exercise.name}</h3>
          <p className="font-semibold text-accent">{formatTarget(item, exercise.kind)}</p>
          {item.note && <p className="text-sm text-warn">{item.note}</p>}
          <p className="mt-1 flex items-center gap-1 text-sm text-muted">
            {allDone && <CheckCircle2 size={16} className="text-accent" aria-hidden />}
            {doneCount}/{item.sets} series
            {last && lastWorking !== undefined && ` · última vez ${lastWorking} kg`}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm text-muted">
        <span className="font-semibold text-ink">Clave: </span>
        {exercise.technique}
      </p>

      {legNow && (
        <div className="mt-3 rounded-xl border border-danger bg-danger-bg p-3" role="alert">
          <p className="flex items-center gap-2 font-bold text-danger">
            <AlertTriangle size={20} aria-hidden /> Te mandó dolor a la pierna
          </p>
          <p className="mt-1">Te sugerimos parar este ejercicio y cambiarlo por una alternativa segura.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="danger" onClick={() => setReplacing(true)}>
              Reemplazar
            </Button>
            {!skipped && <Button onClick={() => toggleSkip(sessionId, item.uid)}>Parar aquí</Button>}
          </div>
        </div>
      )}

      {!legNow && flaggedBefore && flag && (
        <div className="mt-3 rounded-xl border border-danger/60 bg-danger-bg p-3">
          <p className="font-semibold text-danger">
            {flag.reason === 'pierna'
              ? `Te dio dolor en la pierna el ${formatShortDate(flag.date)}.`
              : `Sospechoso de aumentar el dolor el ${formatShortDate(flag.date)}.`}{' '}
            Considera reemplazarlo.
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button size="sm" variant="danger" onClick={() => setReplacing(true)}>
              Reemplazar
            </Button>
            <Button size="sm" onClick={() => dismissFlag(item.exerciseId)}>
              Ya no molesta
            </Button>
          </div>
        </div>
      )}

      {suggestion && !legNow && (
        <div className="mt-3 rounded-xl border border-accent/60 bg-accent/10 p-3">
          <p className="flex items-center gap-2 font-bold text-accent">
            <TrendingUp size={20} aria-hidden /> {describeSuggestion(suggestion)}
          </p>
          <p className="mt-1 text-sm text-muted">
            Completaste todo dos sesiones seguidas sin dolor en la pierna.
          </p>
          {suggestion.type === 'weight' && (
            <Button size="sm" className="mt-2" onClick={() => setWeightOverride(suggestion.low)}>
              Usar {suggestion.low.toLocaleString('es')} kg
            </Button>
          )}
        </div>
      )}

      {item.optional && (
        <Button size="sm" className="mt-3" onClick={() => toggleSkip(sessionId, item.uid)}>
          {skipped ? 'Hacer este ejercicio' : 'Omitir (opcional)'}
        </Button>
      )}

      {!skipped && (
        <div className="mt-3 space-y-2">
          {Array.from({ length: item.sets }, (_, index) => {
            const log = logs.find((l) => l.setIndex === index);
            // El peso de la serie anterior de hoy manda; si no, el de la última sesión.
            const carry = logs
              .filter((l) => l.done && l.setIndex < index && l.weight !== undefined)
              .sort((a, b) => b.setIndex - a.setIndex)[0]?.weight;
            const defaultWeight = weightOverride ?? carry ?? lastBySet.get(index) ?? lastWorking;
            return (
              <SetRow
                key={`${item.exerciseId}-${index}-${log?.done ? 'd' : `${weightOverride ?? ''}-${carry ?? ''}`}`}
                index={index}
                exercise={exercise}
                item={item}
                log={log}
                defaultWeight={defaultWeight}
                onSave={async (input) => {
                  await saveSet(sessionId, item.uid, item.exerciseId, index, input);
                  if (input.done) afterSet();
                }}
                onStartHold={() => {
                  unlockAudio();
                  setHoldSet(index);
                }}
              />
            );
          })}
          {nextInSuperset && <p className="text-sm font-semibold text-warn">Sin descanso: sigue con {nextInSuperset}.</p>}
        </div>
      )}

      {painNote && <p className="mt-3 rounded-xl bg-warn/10 p-3 text-sm text-warn">{painNote}</p>}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <a
          href={youtubeUrl(exercise.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 px-3 font-semibold"
        >
          <MonitorPlay size={20} aria-hidden /> Ver técnica
        </a>
        <Button variant={legNow ? 'danger' : 'secondary'} onClick={() => setAskPain(true)}>
          <Zap size={20} aria-hidden /> Me dolió
        </Button>
      </div>

      <Sheet open={zoom} onClose={() => setZoom(false)} title={exercise.name}>
        <ExerciseImage exercise={exercise} className="aspect-square w-full rounded-2xl" />
        <p className="mt-3 text-muted">{exercise.technique}</p>
      </Sheet>

      <Sheet open={askPain} onClose={() => setAskPain(false)} title={`Me dolió: ${exercise.name}`}>
        <p className="mb-4 text-lg">¿El dolor bajó a la pierna?</p>
        <div className="grid gap-3">
          <Button variant="danger" size="lg" onClick={() => onPainAnswer(true)}>
            Sí, bajó a la pierna
          </Button>
          <Button size="lg" onClick={() => onPainAnswer(false)}>
            No, se quedó en la espalda o el glúteo
          </Button>
        </div>
      </Sheet>

      <Sheet open={replacing} onClose={() => setReplacing(false)} title={`Reemplazar ${exercise.name}`}>
        <ReplacePicker
          exerciseId={item.exerciseId}
          dayId={session.dayId}
          itemUid={item.uid}
          sessionId={sessionId}
          onDone={() => setReplacing(false)}
        />
      </Sheet>

      {holdSet !== null && (
        <HoldPlayer
          title={exercise.name}
          subtitle={`Serie ${holdSet + 1} de ${item.sets} · ${item.target} s${item.perSide ? ' por lado' : ''}`}
          reps={item.perSide ? 2 : 1}
          repLabel="Lado"
          relaxLabel="Cambia de lado"
          relaxSeconds={5}
          holdSeconds={item.target}
          onComplete={async () => {
            await saveSet(sessionId, item.uid, item.exerciseId, holdSet, { value: item.target, done: true });
            afterSet();
          }}
          onClose={() => setHoldSet(null)}
        />
      )}
    </article>
  );
}
