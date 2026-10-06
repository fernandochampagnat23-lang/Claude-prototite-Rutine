import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, Siren } from 'lucide-react';
import { ALERT_MESSAGES, alertLevel, EMERGENCY_SYMPTOMS, type AlertLevel } from '../logic/alerts';
import { SYMPTOM_LABELS } from '../data/guide';
import { Button, Sheet } from './ui';
import type { Symptom } from '../types';

interface AlertApi {
  /** Evalúa los síntomas registrados y muestra el aviso que corresponda. Devuelve el nivel. */
  check: (symptoms: readonly Symptom[]) => AlertLevel;
}

const AlertContext = createContext<AlertApi>({ check: () => 'none' });

export function useSymptomAlert(): AlertApi {
  return useContext(AlertContext);
}

export function AlertProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<{ level: Exclude<AlertLevel, 'none'>; symptoms: Symptom[] } | null>(null);

  const check = useCallback((symptoms: readonly Symptom[]) => {
    const level = alertLevel(symptoms);
    if (level !== 'none') setActive({ level, symptoms: [...symptoms] });
    return level;
  }, []);

  const api = useMemo(() => ({ check }), [check]);
  const close = () => setActive(null);

  return (
    <AlertContext.Provider value={api}>
      {children}
      {active?.level === 'emergency' && (
        <div
          className="pt-safe pb-safe fixed inset-0 z-[60] flex flex-col bg-[#b3001b] text-white"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="emergency-title"
        >
          <div className="flex flex-1 flex-col justify-center gap-5 overflow-y-auto p-6">
            <Siren size={64} aria-hidden />
            <h2 id="emergency-title" className="text-4xl font-black leading-tight">
              {ALERT_MESSAGES.emergency.title}
            </h2>
            <p className="text-xl">{ALERT_MESSAGES.emergency.body}</p>
            <ul className="space-y-2 text-lg font-semibold">
              {active.symptoms
                .filter((s) => EMERGENCY_SYMPTOMS.includes(s))
                .map((s) => (
                  <li key={s}>• {SYMPTOM_LABELS[s]}</li>
                ))}
            </ul>
            <p className="text-base opacity-90">Esta app no da diagnósticos: es un aviso para que busques atención.</p>
          </div>
          <div className="p-6">
            <button
              type="button"
              onClick={close}
              className="min-h-14 w-full rounded-2xl bg-white text-lg font-bold text-[#b3001b]"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
      <Sheet open={active?.level === 'specialist'} onClose={close} title="Aviso">
        <div className="rounded-2xl border border-warn bg-warn/10 p-4">
          <p className="flex items-center gap-2 text-lg font-bold text-warn">
            <AlertTriangle size={22} aria-hidden /> {ALERT_MESSAGES.specialist.title}
          </p>
          <p className="mt-2">{ALERT_MESSAGES.specialist.body}</p>
        </div>
        <Button variant="warn" size="lg" className="mt-4 w-full" onClick={close}>
          Entendido
        </Button>
      </Sheet>
    </AlertContext.Provider>
  );
}
