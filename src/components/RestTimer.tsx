import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Timer, X } from 'lucide-react';
import { useNow } from '../hooks/useNow';
import { formatClock } from '../logic/format';
import { signalEnd, unlockAudio } from '../lib/feedback';

interface RestState {
  endAt: number;
  duration: number;
  label?: string;
}

interface RestApi {
  start: (seconds: number, label?: string) => void;
  stop: () => void;
}

const RestContext = createContext<RestApi>({ start: () => undefined, stop: () => undefined });
const STORAGE_KEY = 'rutina-l5:rest';

function load(): RestState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as RestState;
    return state.endAt > Date.now() ? state : null;
  } catch {
    return null;
  }
}

function save(state: RestState | null) {
  try {
    if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sin almacenamiento: el temporizador funciona igual mientras la app esté abierta.
  }
}

export function useRestTimer(): RestApi {
  return useContext(RestContext);
}

/**
 * Temporizador de descanso entre series. Se calcula con la hora de fin, así que no se desfasa
 * si el celular bloquea la pantalla o la app pasa a segundo plano.
 */
export function RestTimerProvider({ children }: { children: ReactNode }) {
  const [rest, setRest] = useState<RestState | null>(load);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const now = useNow(rest !== null, 250);
  const signaled = useRef(false);

  const start = useCallback((seconds: number, label?: string) => {
    unlockAudio();
    signaled.current = false;
    setFinishedAt(null);
    const state = { endAt: Date.now() + seconds * 1000, duration: seconds, label };
    save(state);
    setRest(state);
  }, []);

  const stop = useCallback(() => {
    save(null);
    setRest(null);
    setFinishedAt(null);
  }, []);

  const adjust = (delta: number) => {
    if (!rest) return;
    const endAt = Math.max(Date.now() + 1000, rest.endAt + delta * 1000);
    const state = { ...rest, endAt, duration: Math.max(rest.duration + delta, 1) };
    save(state);
    setRest(state);
  };

  useEffect(() => {
    if (!rest || now < rest.endAt || signaled.current) return;
    signaled.current = true;
    signalEnd();
    save(null);
    setRest(null);
    setFinishedAt(Date.now());
  }, [now, rest]);

  useEffect(() => {
    if (finishedAt === null) return;
    const id = window.setTimeout(() => setFinishedAt(null), 4000);
    return () => window.clearTimeout(id);
  }, [finishedAt]);

  const api = useMemo(() => ({ start, stop }), [start, stop]);
  const left = rest ? Math.max(0, (rest.endAt - now) / 1000) : 0;

  return (
    <RestContext.Provider value={api}>
      {children}
      {(rest || finishedAt) && (
        <div className="pb-safe fixed inset-x-0 bottom-16 z-40 px-3 pb-2" role="timer" aria-live="polite">
          <div
            className={`mx-auto flex max-w-lg items-center gap-2 rounded-2xl border p-2 shadow-2xl ${
              rest ? 'border-accent bg-surface' : 'border-accent bg-accent text-accent-ink'
            }`}
          >
            {rest ? (
              <>
                <button
                  type="button"
                  onClick={() => adjust(-15)}
                  className="h-14 w-14 shrink-0 rounded-xl bg-surface-2 text-lg font-bold"
                  aria-label="Restar 15 segundos"
                >
                  −15
                </button>
                <div className="flex flex-1 flex-col items-center">
                  <span className="flex items-center gap-1 text-xs font-semibold uppercase text-muted">
                    <Timer size={14} aria-hidden /> {rest.label ?? 'Descanso'}
                  </span>
                  <span className="text-4xl font-bold tabular-nums text-accent">{formatClock(left)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => adjust(15)}
                  className="h-14 w-14 shrink-0 rounded-xl bg-surface-2 text-lg font-bold"
                  aria-label="Sumar 15 segundos"
                >
                  +15
                </button>
                <button
                  type="button"
                  onClick={stop}
                  className="flex h-14 w-12 shrink-0 items-center justify-center rounded-xl text-muted"
                  aria-label="Terminar descanso"
                >
                  <X size={22} />
                </button>
              </>
            ) : (
              <button type="button" onClick={stop} className="h-14 w-full text-lg font-bold">
                ¡A la siguiente serie!
              </button>
            )}
          </div>
        </div>
      )}
    </RestContext.Provider>
  );
}
