import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { AlertTriangle } from 'lucide-react';
import { db } from '../../db/db';
import { finishSession } from '../../db/actions';
import { EXERCISES_BY_ID } from '../../data/exercises';
import { TRIGGER_LABELS } from '../../data/guide';
import { evaluateSession } from '../../logic/goldenRule';
import { Button, Chip, SectionTitle, StickyAction } from '../../components/ui';
import { PainCheckForm, draftToCheck, emptyPainDraft, type PainDraft } from '../../components/PainCheckForm';
import { WalkCard } from './WalkCard';
import { useSymptomAlert } from '../../components/Alerts';
import type { Session, Trigger } from '../../types';

const TRIGGERS = Object.keys(TRIGGER_LABELS) as Trigger[];

export function PostStep({ session, onFinished }: { session: Session; onFinished: (session: Session) => void }) {
  const events = useLiveQuery(() => db.painEvents.where('sessionId').equals(session.id!).toArray(), [session.id]);
  const [draft, setDraft] = useState<PainDraft>(emptyPainDraft);
  const [triggers, setTriggers] = useState<Trigger[]>(session.triggers);
  const [notes, setNotes] = useState(session.notes);
  const [picked, setPicked] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const alert = useSymptomAlert();

  const verdict = draft.score !== undefined ? evaluateSession(session.pre?.score, draft.score, events ?? []) : null;
  const doneExercises = [...new Set(session.items.filter((i) => !session.skipped.includes(i.uid)).map((i) => i.exerciseId))];

  const finish = async () => {
    setSaving(true);
    try {
      const finished = await finishSession(session.id!, {
        post: draftToCheck(draft),
        triggers,
        notes: notes.trim(),
        pickedSuspects: picked,
      });
      if (finished) {
        onFinished(finished);
        alert.check(finished.post?.symptoms ?? []);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold">Cierre</h2>
      <div className="mt-4">
        <WalkCard session={session} />
      </div>

      <SectionTitle>Dolor post-sesión</SectionTitle>
      <PainCheckForm value={draft} onChange={setDraft} />

      {verdict?.triggered && (
        <div className="mt-4 rounded-2xl border border-danger bg-danger-bg p-4" role="alert">
          <p className="flex items-center gap-2 font-bold text-danger">
            <AlertTriangle size={20} aria-hidden /> Regla de oro
          </p>
          {verdict.needsUserPick ? (
            <>
              <p className="mt-1">
                Tu dolor subió {draft.score! - (session.pre?.score ?? 0)} puntos respecto al inicio. ¿Qué ejercicio
                sospechas que lo causó? Lo marcaremos para reemplazarlo.
              </p>
              <div className="mt-3 grid gap-2">
                {doneExercises.map((id) => (
                  <Chip
                    key={id}
                    tone="danger"
                    selected={picked.includes(id)}
                    onClick={() => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))}
                  >
                    {EXERCISES_BY_ID[id]?.name}
                  </Chip>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-1">
              Se marcarán en rojo para que los reemplaces:{' '}
              <strong>{verdict.suspects.map((id) => EXERCISES_BY_ID[id]?.name).join(', ')}</strong>
            </p>
          )}
        </div>
      )}

      <SectionTitle>Detonantes del día</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        {TRIGGERS.map((trigger) => (
          <Chip
            key={trigger}
            selected={triggers.includes(trigger)}
            onClick={() => setTriggers((t) => (t.includes(trigger) ? t.filter((x) => x !== trigger) : [...t, trigger]))}
          >
            {TRIGGER_LABELS[trigger]}
          </Chip>
        ))}
      </div>

      <SectionTitle>Notas</SectionTitle>
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={3}
        placeholder="¿Algo que quieras recordar?"
        className="w-full rounded-xl border border-line bg-surface-2 p-3 text-base outline-none focus:border-accent"
      />

      <StickyAction>
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={draft.score === undefined || saving}
          onClick={finish}
        >
          Terminar sesión
        </Button>
      </StickyAction>
    </div>
  );
}
