import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { AlertTriangle, ArrowDown, ArrowUp, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { db } from '../db/db';
import { dismissFlag } from '../db/actions';
import { addItem, moveItem, removeItem, renameDay, resetRoutine, updateItem } from '../db/routine';
import { EXERCISES, EXERCISES_BY_ID, GROUP_LABELS, WALK_ID } from '../data/exercises';
import { ExerciseImage } from '../components/ExerciseImage';
import { ReplacePicker } from '../components/ReplacePicker';
import { Button, SectionTitle, Sheet, Stepper } from '../components/ui';
import { formatTarget, UNIT } from '../logic/format';
import { formatShortDate } from '../logic/dates';
import type { ExerciseFlag, MuscleGroup, RoutineDay, RoutineItem } from '../types';

export function Routine() {
  const days = useLiveQuery(() => db.routineDays.orderBy('id').toArray(), []);
  const flags = useLiveQuery(() => db.flags.toArray(), []);
  const [selected, setSelected] = useState(1);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!days || !flags) return null;
  const day = days.find((d) => d.id === selected) ?? days[0];
  const flagById = new Map(flags.map((f) => [f.exerciseId, f]));
  const editingItem = day.items.find((item) => item.uid === editing);

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
              d.id === day.id ? 'bg-accent text-accent-ink' : 'border border-line bg-surface-2 text-ink'
            }`}
          >
            Día {d.id}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">
          Día {day.id} · {day.title}
        </h2>
        <Button size="sm" variant="ghost" aria-label="Cambiar nombre del día" onClick={() => setRenaming(true)}>
          <Pencil size={18} />
        </Button>
      </div>
      <p className="text-sm text-muted">Toca un ejercicio para editarlo o cambiarlo por una alternativa segura.</p>

      <ul className="mt-3 space-y-3">
        {day.items.map((item) => {
          const exercise = EXERCISES_BY_ID[item.exerciseId];
          if (!exercise) return null;
          const flag = flagById.get(item.exerciseId);
          return (
            <li key={item.uid}>
              <button
                type="button"
                onClick={() => setEditing(item.uid)}
                className={`flex w-full gap-3 rounded-2xl border bg-surface p-3 text-left ${
                  flag ? 'border-danger' : 'border-line'
                }`}
              >
                <ExerciseImage exercise={exercise} className="h-16 w-16 shrink-0 rounded-xl" />
                <div className="min-w-0">
                  <p className={`font-semibold leading-tight ${flag ? 'text-danger' : ''}`}>{exercise.name}</p>
                  <p className="text-sm text-muted">
                    {formatTarget(item, exercise.kind)}
                    {item.supersetGroup && ' · superserie'}
                  </p>
                  {item.note && <p className="text-sm text-warn">{item.note}</p>}
                  {flag && <FlagText flag={flag} />}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <Button size="lg" className="mt-4 w-full" onClick={() => setAdding(true)}>
        <Plus size={22} aria-hidden /> Añadir ejercicio
      </Button>

      <SectionTitle>Rutina original</SectionTitle>
      <Button className="w-full" onClick={() => setConfirmReset(true)}>
        <RotateCcw size={20} aria-hidden /> Restablecer la rutina original
      </Button>

      <Sheet
        open={!!editingItem}
        onClose={() => setEditing(null)}
        title={editingItem ? (EXERCISES_BY_ID[editingItem.exerciseId]?.name ?? '') : ''}
      >
        {editingItem && (
          <ItemEditor
            day={day}
            item={editingItem}
            flag={flagById.get(editingItem.exerciseId)}
            onClose={() => setEditing(null)}
          />
        )}
      </Sheet>

      <Sheet open={adding} onClose={() => setAdding(false)} title={`Añadir al Día ${day.id}`}>
        <Catalog
          onPick={async (id) => {
            await addItem(day.id, id);
            setAdding(false);
          }}
        />
      </Sheet>

      <Sheet open={renaming} onClose={() => setRenaming(false)} title={`Nombre del Día ${day.id}`}>
        <RenameForm
          day={day}
          onDone={async (title) => {
            await renameDay(day.id, title);
            setRenaming(false);
          }}
        />
      </Sheet>

      <Sheet open={confirmReset} onClose={() => setConfirmReset(false)} title="Restablecer rutina">
        <p className="mb-4 text-muted">
          Vuelven los 5 días originales y se pierden tus cambios en la rutina. Tu historial de sesiones no se toca.
        </p>
        <Button
          variant="danger"
          size="lg"
          className="w-full"
          onClick={async () => {
            await resetRoutine();
            setConfirmReset(false);
          }}
        >
          Restablecer
        </Button>
      </Sheet>
    </div>
  );
}

function FlagText({ flag }: { flag: ExerciseFlag }) {
  return (
    <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-danger">
      <AlertTriangle size={14} aria-hidden />
      {flag.reason === 'pierna' ? 'Dolor en la pierna' : 'Sospechoso de aumentar el dolor'} el{' '}
      {formatShortDate(flag.date)}
    </p>
  );
}

function ItemEditor({
  day,
  item,
  flag,
  onClose,
}: {
  day: RoutineDay;
  item: RoutineItem;
  flag?: ExerciseFlag;
  onClose: () => void;
}) {
  const exercise = EXERCISES_BY_ID[item.exerciseId];
  const index = day.items.findIndex((i) => i.uid === item.uid);
  const unitLabel = exercise.kind === 'reps' ? 'reps' : UNIT[exercise.kind];

  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <ExerciseImage exercise={exercise} className="h-20 w-20 shrink-0 rounded-xl" />
        <p className="text-sm text-muted">{exercise.technique}</p>
      </div>

      {flag && (
        <div className="rounded-xl border border-danger bg-danger-bg p-3">
          <FlagText flag={flag} />
          <p className="mt-1 text-sm">Te sugerimos reemplazarlo por una de las alternativas de abajo.</p>
          <Button size="sm" className="mt-2" onClick={() => dismissFlag(item.exerciseId)}>
            Ya no molesta: quitar marca
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1 text-sm font-semibold text-muted">Series</p>
          <Stepper
            label="Series"
            value={item.sets}
            min={1}
            onChange={(sets) => updateItem(day.id, item.uid, { sets: Math.max(1, sets ?? 1) })}
          />
        </div>
        <div>
          <p className="mb-1 text-sm font-semibold text-muted">Objetivo ({unitLabel})</p>
          <Stepper
            label={`Objetivo en ${unitLabel}`}
            value={item.target}
            min={1}
            step={exercise.kind === 'reps' ? 1 : 5}
            onChange={(target) => updateItem(day.id, item.uid, { target: Math.max(1, target ?? 1) })}
          />
        </div>
      </div>

      <label className="flex min-h-12 items-center gap-3">
        <input
          type="checkbox"
          checked={!!item.perSide}
          onChange={(event) => updateItem(day.id, item.uid, { perSide: event.target.checked })}
          className="h-6 w-6 accent-[var(--color-accent)]"
        />
        Por lado
      </label>

      <div>
        <p className="mb-2 font-semibold">Cambiar por una alternativa segura</p>
        <ReplacePicker
          exerciseId={item.exerciseId}
          dayId={day.id}
          itemUid={item.uid}
          existingIds={day.items.map((i) => i.exerciseId)}
          onDone={onClose}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button disabled={index === 0} onClick={() => moveItem(day.id, item.uid, -1)} aria-label="Subir">
          <ArrowUp size={20} /> Subir
        </Button>
        <Button
          disabled={index === day.items.length - 1}
          onClick={() => moveItem(day.id, item.uid, 1)}
          aria-label="Bajar"
        >
          <ArrowDown size={20} /> Bajar
        </Button>
        <Button
          variant="danger"
          onClick={async () => {
            await removeItem(day.id, item.uid);
            onClose();
          }}
        >
          <Trash2 size={20} /> Quitar
        </Button>
      </div>
    </div>
  );
}

const GROUP_ORDER: MuscleGroup[] = [
  'pecho',
  'hombro',
  'triceps',
  'espalda',
  'biceps',
  'cuadriceps',
  'isquios',
  'gluteo',
  'pantorrilla',
  'core',
];

/** Catálogo de ejercicios seguros: solo se pueden añadir ejercicios de esta lista. */
function Catalog({ onPick }: { onPick: (exerciseId: string) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Solo ejercicios que no cargan la columna.</p>
      {GROUP_ORDER.map((group) => (
        <div key={group}>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{GROUP_LABELS[group]}</p>
          <div className="space-y-2">
            {EXERCISES.filter((e) => e.group === group && e.id !== WALK_ID).map((exercise) => (
              <Button key={exercise.id} className="w-full justify-start! text-left" onClick={() => onPick(exercise.id)}>
                {exercise.name}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function RenameForm({ day, onDone }: { day: RoutineDay; onDone: (title: string) => void }) {
  const [title, setTitle] = useState(day.title);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onDone(title);
      }}
    >
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="min-h-12 w-full rounded-xl border border-line bg-surface-2 px-3 text-base outline-none focus:border-accent"
        aria-label="Nombre del día"
      />
      <Button type="submit" variant="primary" size="lg" className="mt-3 w-full">
        Guardar
      </Button>
    </form>
  );
}
