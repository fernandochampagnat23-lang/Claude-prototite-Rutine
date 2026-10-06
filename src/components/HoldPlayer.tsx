import { useEffect, useRef, useState } from 'react';
import { Pause, Play, X } from 'lucide-react';
import { Button } from './ui';
import { useNow } from '../hooks/useNow';
import { signalEnd, signalStart, signalStep } from '../lib/feedback';

type Phase = 'ready' | 'hold' | 'relax' | 'done';

const PREP_SECONDS = 3;

/**
 * Cuenta regresiva a pantalla completa para aguantes: prepara 3 s, aguanta N s,
 * relaja unos segundos y repite. Se usa en el calentamiento McGill y en los isométricos.
 */
export function HoldPlayer({
  title,
  subtitle,
  reps,
  holdSeconds,
  relaxSeconds = 3,
  onComplete,
  onClose,
}: {
  title: string;
  subtitle?: string;
  reps: number;
  holdSeconds: number;
  relaxSeconds?: number;
  onComplete: () => void;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [rep, setRep] = useState(1);
  const [endAt, setEndAt] = useState<number | null>(() => Date.now() + PREP_SECONDS * 1000);
  const [pausedLeft, setPausedLeft] = useState<number | null>(null);
  const now = useNow(endAt !== null, 100);
  const completed = useRef(false);
  // Refs para que un re-render del padre no reinicie los efectos.
  const onCompleteRef = useRef(onComplete);
  const onCloseRef = useRef(onClose);
  onCompleteRef.current = onComplete;
  onCloseRef.current = onClose;

  const phaseTotal = phase === 'ready' ? PREP_SECONDS : phase === 'hold' ? holdSeconds : relaxSeconds;
  const left = endAt !== null ? Math.max(0, (endAt - now) / 1000) : (pausedLeft ?? 0);

  useEffect(() => {
    if (endAt === null || now < endAt) return;
    const t = Date.now();
    if (phase === 'ready' || phase === 'relax') {
      if (phase === 'relax') setRep((r) => r + 1);
      setPhase('hold');
      setEndAt(t + holdSeconds * 1000);
      signalStart();
    } else if (phase === 'hold') {
      if (rep < reps) {
        setPhase('relax');
        setEndAt(t + relaxSeconds * 1000);
        signalStep();
      } else {
        setPhase('done');
        setEndAt(null);
        signalEnd();
        if (!completed.current) {
          completed.current = true;
          onCompleteRef.current();
        }
      }
    }
  }, [now, endAt, phase, rep, reps, holdSeconds, relaxSeconds]);

  useEffect(() => {
    if (phase !== 'done') return;
    const id = window.setTimeout(() => onCloseRef.current(), 1500);
    return () => window.clearTimeout(id);
  }, [phase]);

  const paused = endAt === null && phase !== 'done';
  const togglePause = () => {
    if (paused) {
      setEndAt(Date.now() + (pausedLeft ?? 0) * 1000);
      setPausedLeft(null);
    } else {
      setPausedLeft(left);
      setEndAt(null);
    }
  };

  const label = { ready: 'Prepárate', hold: 'Aguanta', relax: 'Relaja', done: '¡Serie hecha!' }[phase];
  const color = { ready: 'text-warn', hold: 'text-accent', relax: 'text-muted', done: 'text-accent' }[phase];
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const fraction = phase === 'done' ? 1 : phaseTotal ? left / phaseTotal : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg pt-safe pb-safe" role="dialog" aria-modal="true" aria-label={title}>
      <div className="flex items-start justify-between gap-2 p-4">
        <div>
          <p className="text-xl font-bold">{title}</p>
          {subtitle && <p className="text-muted">{subtitle}</p>}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar temporizador">
          <X size={26} />
        </Button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className={`text-2xl font-bold uppercase tracking-wide ${color}`}>{label}</p>
        <div className="relative h-64 w-64">
          <svg viewBox="0 0 240 240" className="h-full w-full -rotate-90" aria-hidden>
            <circle cx="120" cy="120" r={radius} fill="none" stroke="var(--color-surface-2)" strokeWidth="14" />
            <circle
              cx="120"
              cy="120"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - fraction)}
              className={color}
            />
          </svg>
          <p
            className="absolute inset-0 flex items-center justify-center text-7xl font-bold tabular-nums"
            aria-live="polite"
          >
            {phase === 'done' ? '✓' : Math.ceil(left)}
          </p>
        </div>
        {reps > 1 && (
          <p className="text-xl font-semibold">
            Repetición {rep} de {reps}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 p-4">
        <Button size="lg" onClick={togglePause} disabled={phase === 'done'}>
          {paused ? <Play size={22} /> : <Pause size={22} />}
          {paused ? 'Seguir' : 'Pausa'}
        </Button>
        <Button
          size="lg"
          variant="primary"
          onClick={() => {
            if (!completed.current) {
              completed.current = true;
              onComplete();
            }
            onClose();
          }}
        >
          Marcar hecha
        </Button>
      </div>
    </div>
  );
}
