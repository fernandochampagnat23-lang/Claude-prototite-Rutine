import { useState } from 'react';
import { savePreCheck } from '../../db/actions';
import { Button, StickyAction } from '../../components/ui';
import { PainCheckForm, draftToCheck, type PainDraft } from '../../components/PainCheckForm';
import { useSymptomAlert } from '../../components/Alerts';
import type { PainCheck, Session } from '../../types';

export function PreStep({ session, onSaved }: { session: Session; onSaved: (check: PainCheck) => void }) {
  const [draft, setDraft] = useState<PainDraft>(() => ({
    score: session.pre?.score,
    locations: session.pre?.locations ?? [],
    symptoms: session.pre?.symptoms ?? [],
  }));

  const alert = useSymptomAlert();
  const save = async () => {
    const check = draftToCheck(draft);
    await savePreCheck(session.id!, check);
    alert.check(check.symptoms);
    onSaved(check);
  };

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">Antes de empezar</h2>
      <PainCheckForm value={draft} onChange={setDraft} />
      <StickyAction>
        <Button variant="primary" size="lg" className="w-full" disabled={draft.score === undefined} onClick={save}>
          Continuar al calentamiento
        </Button>
      </StickyAction>
    </div>
  );
}
