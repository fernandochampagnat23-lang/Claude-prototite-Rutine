import { goToStep } from '../../db/actions';
import { Button, StickyAction } from '../../components/ui';
import { ExerciseCard } from './ExerciseCard';
import type { Session } from '../../types';

export function ExercisesStep({ session }: { session: Session }) {
  return (
    <div>
      <h2 className="text-lg font-bold">
        Día {session.dayId} · {session.dayTitle}
      </h2>
      <div className="mt-4 space-y-4">
        {session.items.map((item, index) => {
          const prev = session.items[index - 1];
          const startsSuperset = item.supersetGroup && prev?.supersetGroup !== item.supersetGroup;
          return (
            <div key={item.uid}>
              {startsSuperset && (
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-warn">
                  Superserie: alterna una serie de cada uno y descansa al final
                </p>
              )}
              <ExerciseCard session={session} item={item} />
            </div>
          );
        })}
      </div>
      <StickyAction>
        <Button variant="primary" size="lg" className="w-full" onClick={() => goToStep(session.id!, 'post')}>
          Ir al cierre
        </Button>
      </StickyAction>
    </div>
  );
}
