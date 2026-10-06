import { useState } from 'react';
import { addCheckin } from '../db/actions';
import { TRIGGER_LABELS } from '../data/guide';
import { useSymptomAlert } from './Alerts';
import { PainCheckForm, draftToCheck, emptyPainDraft, type PainDraft } from './PainCheckForm';
import { Button, Chip, Sheet } from './ui';
import type { Trigger } from '../types';

const TRIGGERS = Object.keys(TRIGGER_LABELS) as Trigger[];

/** Registro rápido de dolor y síntomas en cualquier momento (por ejemplo, un día sin gimnasio). */
export function CheckinSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [draft, setDraft] = useState<PainDraft>(emptyPainDraft);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [note, setNote] = useState('');
  const alert = useSymptomAlert();

  const reset = () => {
    setDraft(emptyPainDraft());
    setTriggers([]);
    setNote('');
  };

  const save = async () => {
    const check = draftToCheck(draft);
    await addCheckin({ score: check.score, locations: check.locations, symptoms: check.symptoms, triggers, note: note.trim() });
    reset();
    onClose();
    alert.check(check.symptoms);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Registrar dolor o síntoma">
      <PainCheckForm value={draft} onChange={setDraft} />
      <p className="mb-2 mt-5 font-semibold">¿Algún detonante?</p>
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
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={2}
        placeholder="Nota (opcional)"
        className="mt-4 w-full rounded-xl border border-line bg-surface-2 p-3 text-base outline-none focus:border-accent"
      />
      <Button variant="primary" size="lg" className="mt-4 w-full" disabled={draft.score === undefined} onClick={save}>
        Guardar registro
      </Button>
    </Sheet>
  );
}
