import { useState } from 'react';
import { AlertTriangle, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { abandonSession, goToStep } from '../db/actions';
import { EXERCISES_BY_ID } from '../data/exercises';
import { useActiveSession } from '../hooks/useSession';
import { useWakeLock } from '../hooks/useWakeLock';
import { Button, Card, Sheet } from '../components/ui';
import { Disclaimer } from '../components/Disclaimer';
import { StartCard } from './today/StartCard';
import { PreStep } from './today/PreStep';
import { WarmupStep } from './today/WarmupStep';
import { ExercisesStep } from './today/ExercisesStep';
import { PostStep } from './today/PostStep';
import type { Session, SessionStep } from '../types';

const STEPS: { id: SessionStep; label: string }[] = [
  { id: 'pre', label: 'Dolor' },
  { id: 'warmup', label: 'Calentamiento' },
  { id: 'exercises', label: 'Ejercicios' },
  { id: 'post', label: 'Cierre' },
];

export function Today() {
  const session = useActiveSession();
  const [finished, setFinished] = useState<Session | null>(null);
  useWakeLock(!!session);

  if (session === undefined) return null;

  if (!session) {
    return (
      <div className="space-y-4">
        {finished && <SessionSummary session={finished} onClose={() => setFinished(null)} />}
        <StartCard />
        <Disclaimer />
      </div>
    );
  }

  return <ActiveSession session={session} onFinished={setFinished} />;
}

function ActiveSession({ session, onFinished }: { session: Session; onFinished: (s: Session) => void }) {
  const [menu, setMenu] = useState(false);
  const currentIndex = STEPS.findIndex((s) => s.id === session.step);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <ol className="grid flex-1 grid-cols-4 gap-1" aria-label="Pasos de la sesión">
          {STEPS.map((step, index) => {
            const reachable = index === 0 || !!session.pre;
            const active = index === currentIndex;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  disabled={!reachable}
                  aria-current={active ? 'step' : undefined}
                  onClick={() => goToStep(session.id!, step.id)}
                  className={`flex w-full flex-col items-center gap-1 rounded-lg py-1 text-[11px] font-semibold ${
                    active ? 'text-accent' : index < currentIndex ? 'text-ink' : 'text-muted'
                  }`}
                >
                  <span
                    className={`h-1.5 w-full rounded-full ${
                      index <= currentIndex ? 'bg-accent' : 'bg-surface-2'
                    }`}
                  />
                  {step.label}
                </button>
              </li>
            );
          })}
        </ol>
        <Button variant="ghost" size="sm" aria-label="Opciones de la sesión" onClick={() => setMenu(true)}>
          <MoreHorizontal size={24} />
        </Button>
      </div>

      {session.step === 'pre' && <PreStep session={session} onSaved={() => undefined} />}
      {session.step === 'warmup' && <WarmupStep session={session} />}
      {session.step === 'exercises' && <ExercisesStep session={session} />}
      {session.step === 'post' && <PostStep session={session} onFinished={onFinished} />}

      <Sheet open={menu} onClose={() => setMenu(false)} title={`Día ${session.dayId} · ${session.dayTitle}`}>
        <p className="mb-4 text-muted">
          Si abandonas la sesión no avanza la rotación: la próxima vez te tocará el mismo día.
        </p>
        <Button
          variant="danger"
          size="lg"
          className="w-full"
          onClick={async () => {
            await abandonSession(session.id!);
            setMenu(false);
          }}
        >
          Abandonar sesión
        </Button>
      </Sheet>
    </div>
  );
}

function SessionSummary({ session, onClose }: { session: Session; onClose: () => void }) {
  const pre = session.pre?.score;
  const post = session.post?.score;
  return (
    <Card className={session.goldenRule ? 'border-danger' : 'border-accent'}>
      <p className={`flex items-center gap-2 text-lg font-bold ${session.goldenRule ? 'text-danger' : 'text-accent'}`}>
        {session.goldenRule ? <AlertTriangle size={22} aria-hidden /> : <CheckCircle2 size={22} aria-hidden />}
        Sesión terminada
      </p>
      <p className="mt-1">
        Día {session.dayId} · dolor {pre ?? '–'} → {post ?? '–'}
        {session.walkMinutes ? ` · caminata ${session.walkMinutes} min` : ''}
      </p>
      {session.goldenRule && session.suspects.length > 0 && (
        <p className="mt-2 text-danger">
          Marcados para reemplazar: {session.suspects.map((id) => EXERCISES_BY_ID[id]?.name).join(', ')}. Puedes
          cambiarlos en Rutina.
        </p>
      )}
      <Button size="sm" className="mt-3" onClick={onClose}>
        Cerrar
      </Button>
    </Card>
  );
}
