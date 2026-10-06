import { Footprints, Play, Square } from 'lucide-react';
import { updateSession } from '../../db/actions';
import { useNow } from '../../hooks/useNow';
import { formatClock } from '../../logic/format';
import { signalEnd, unlockAudio } from '../../lib/feedback';
import { Button, Card, Stepper } from '../../components/ui';
import { useEffect, useRef } from 'react';
import type { Session } from '../../types';

const WALK_TARGET_MIN = 15;

/** Caminata de cierre en cinta inclinada, 15–20 min, con cronómetro. */
export function WalkCard({ session }: { session: Session }) {
  const running = session.walkStartedAt !== undefined;
  const now = useNow(running, 500);
  const elapsed = running ? (now - session.walkStartedAt!) / 1000 : 0;
  const announced = useRef(false);

  useEffect(() => {
    if (running && elapsed >= WALK_TARGET_MIN * 60 && !announced.current) {
      announced.current = true;
      signalEnd();
    }
  }, [running, elapsed]);

  const start = () => {
    unlockAudio();
    announced.current = false;
    void updateSession(session.id!, { walkStartedAt: Date.now() });
  };
  const stop = () => {
    const minutes = Math.round(elapsed / 60);
    void updateSession(session.id!, { walkStartedAt: undefined, walkMinutes: (session.walkMinutes ?? 0) + minutes });
  };

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Footprints size={22} className="text-accent" aria-hidden />
        <h3 className="text-lg font-bold">Caminata en cinta inclinada</h3>
      </div>
      <p className="mt-1 text-sm text-muted">15–20 minutos a paso cómodo, tronco erguido, sin agarrarte.</p>

      {running ? (
        <div className="mt-3 text-center">
          <p className="text-5xl font-bold tabular-nums" aria-live="off">
            {formatClock(elapsed)}
          </p>
          <p className="text-sm text-muted">
            {elapsed >= WALK_TARGET_MIN * 60 ? '¡Objetivo cumplido! Puedes seguir hasta 20 min.' : `Objetivo: ${WALK_TARGET_MIN} min`}
          </p>
          <Button size="lg" className="mt-3 w-full" onClick={stop}>
            <Square size={20} aria-hidden /> Terminar caminata
          </Button>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-3">
          <Stepper
            label="Minutos de caminata"
            suffix="min"
            value={session.walkMinutes}
            onChange={(walkMinutes) => void updateSession(session.id!, { walkMinutes })}
          />
          <Button variant="primary" size="lg" onClick={start}>
            <Play size={20} aria-hidden /> Iniciar
          </Button>
        </div>
      )}
    </Card>
  );
}
