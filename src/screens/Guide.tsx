import { useState } from 'react';
import { AlertTriangle, Ban, Check, ClipboardPlus, Siren, Stethoscope } from 'lucide-react';
import { AVOID_LIST, DAILY_RULES, SYMPTOM_LABELS } from '../data/guide';
import { EMERGENCY_SYMPTOMS, SPECIALIST_SYMPTOMS } from '../logic/alerts';
import { Button, Card, SectionTitle } from '../components/ui';
import { CheckinSheet } from '../components/CheckinSheet';
import { Disclaimer } from '../components/Disclaimer';

export function Guide() {
  const [checkin, setCheckin] = useState(false);

  return (
    <div>
      <Disclaimer className="" />

      <SectionTitle>Señales de alerta</SectionTitle>
      <div className="space-y-3">
        <Card className="border-danger bg-danger-bg">
          <p className="flex items-center gap-2 text-lg font-bold text-danger">
            <Siren size={22} aria-hidden /> Ve a urgencias si notas
          </p>
          <ul className="mt-2 space-y-1">
            {EMERGENCY_SYMPTOMS.map((s) => (
              <li key={s}>• {SYMPTOM_LABELS[s]}</li>
            ))}
          </ul>
        </Card>
        <Card className="border-warn">
          <p className="flex items-center gap-2 text-lg font-bold text-warn">
            <AlertTriangle size={22} aria-hidden /> Adelanta la cita con el especialista si notas
          </p>
          <ul className="mt-2 space-y-1">
            {SPECIALIST_SYMPTOMS.map((s) => (
              <li key={s}>• {SYMPTOM_LABELS[s]}</li>
            ))}
          </ul>
        </Card>
        <Button size="lg" className="w-full" onClick={() => setCheckin(true)}>
          <ClipboardPlus size={22} aria-hidden /> Registrar dolor o síntoma
        </Button>
      </div>

      <SectionTitle>Reglas diarias</SectionTitle>
      <ol className="space-y-2">
        {DAILY_RULES.map((rule, index) => (
          <li key={rule.title} className="flex gap-3 rounded-2xl border border-line bg-surface p-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 font-bold text-accent">
              {index + 1}
            </span>
            <div>
              <p className="font-semibold">{rule.title}</p>
              <p className="text-sm text-muted">{rule.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <SectionTitle>Ejercicios a evitar y su alternativa</SectionTitle>
      <ul className="space-y-2">
        {AVOID_LIST.map((row) => (
          <li key={row.avoid} className="rounded-2xl border border-line bg-surface p-3">
            <p className="flex items-start gap-2 font-semibold">
              <Ban size={18} className="mt-0.5 shrink-0 text-danger" aria-label="Evitar" />
              <span className="line-through decoration-danger/60">{row.avoid}</span>
            </p>
            <p className="mt-1 flex items-start gap-2">
              <Check size={18} className="mt-0.5 shrink-0 text-accent" aria-label="Alternativa" />
              {row.alternative}
            </p>
          </li>
        ))}
      </ul>

      <SectionTitle>Fase siguiente</SectionTitle>
      <Card>
        <p className="flex items-center gap-2 font-bold">
          <Stethoscope size={20} className="text-accent" aria-hidden /> Bisagra de cadera ligera
        </p>
        <p className="mt-2 text-muted">
          Después de 3 semanas sin dolor en la pierna, la app te avisará para que consultes con tu fisioterapeuta si es
          momento de reintroducir peso muerto rumano con mancuernas o pull-through. La app nunca los agrega por su cuenta.
        </p>
      </Card>

      <CheckinSheet open={checkin} onClose={() => setCheckin(false)} />
    </div>
  );
}
