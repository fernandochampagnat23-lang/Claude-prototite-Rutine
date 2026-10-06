import { Chip, PainScale } from './ui';
import { LOCATION_LABELS, SYMPTOM_LABELS } from '../data/guide';
import { EMERGENCY_SYMPTOMS } from '../logic/alerts';
import type { PainLocation, Symptom } from '../types';

export interface PainDraft {
  score?: number;
  locations: PainLocation[];
  symptoms: Symptom[];
}

export const emptyPainDraft = (): PainDraft => ({ locations: [], symptoms: [] });

const LOCATIONS = Object.keys(LOCATION_LABELS) as PainLocation[];
const SYMPTOMS = Object.keys(SYMPTOM_LABELS) as Symptom[];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** Registro rápido de dolor: escala 0–10, ubicación y síntomas de alerta. */
export function PainCheckForm({ value, onChange }: { value: PainDraft; onChange: (value: PainDraft) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 font-semibold">¿Cuánto dolor tienes? (0 = nada, 10 = máximo)</p>
        <PainScale value={value.score} onChange={(score) => onChange({ ...value, score })} />
      </div>

      {value.score !== undefined && value.score > 0 && (
        <div>
          <p className="mb-2 font-semibold">¿Dónde?</p>
          <div className="grid grid-cols-2 gap-2">
            {LOCATIONS.map((location) => (
              <Chip
                key={location}
                selected={value.locations.includes(location)}
                onClick={() => onChange({ ...value, locations: toggle(value.locations, location) })}
              >
                {LOCATION_LABELS[location]}
              </Chip>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 font-semibold">¿Notas alguno de estos síntomas?</p>
        <div className="grid gap-2">
          {SYMPTOMS.map((symptom) => (
            <Chip
              key={symptom}
              tone={EMERGENCY_SYMPTOMS.includes(symptom) ? 'danger' : 'warn'}
              selected={value.symptoms.includes(symptom)}
              onClick={() => onChange({ ...value, symptoms: toggle(value.symptoms, symptom) })}
            >
              {SYMPTOM_LABELS[symptom]}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

export function draftToCheck(draft: PainDraft) {
  return {
    score: draft.score ?? 0,
    locations: (draft.score ?? 0) > 0 ? draft.locations : [],
    symptoms: draft.symptoms,
    at: Date.now(),
  };
}
