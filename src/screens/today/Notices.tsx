import { useLiveQuery } from 'dexie-react-hooks';
import { Stethoscope, Sun, X } from 'lucide-react';
import { db, updateSettings } from '../../db/db';
import { toDateKey } from '../../logic/dates';
import { legPainStreak, phaseNoticeEligible } from '../../logic/legPain';
import { REMINDER_TEXT, shouldShowMorningBanner } from '../../logic/reminder';
import { useSettings } from '../../hooks/useSession';
import { Button, Card } from '../../components/ui';

export function MorningBanner() {
  const settings = useSettings();
  const now = new Date();
  const today = toDateKey(now);
  if (!shouldShowMorningBanner(settings, today, now.getHours())) return null;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-warn/60 bg-warn/10 p-3">
      <Sun size={24} className="shrink-0 text-warn" aria-hidden />
      <p className="flex-1 font-semibold">{REMINDER_TEXT}</p>
      <button
        type="button"
        aria-label="Cerrar recordatorio de hoy"
        onClick={() => updateSettings({ reminderDismissedOn: today })}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted"
      >
        <X size={22} />
      </button>
    </div>
  );
}

/**
 * Aviso de fase siguiente tras 3 semanas sin dolor en la pierna.
 * Solo sugiere consultar al fisioterapeuta: la app nunca desbloquea ejercicios de bisagra.
 */
export function PhaseNotice() {
  const settings = useSettings();
  const records = useLiveQuery(async () => {
    const [sessions, painEvents, checkins] = await Promise.all([
      db.sessions.toArray(),
      db.painEvents.toArray(),
      db.checkins.toArray(),
    ]);
    return { sessions, painEvents, checkins };
  }, []);
  if (!records) return null;
  const today = toDateKey();
  const streak = legPainStreak(records, today);
  const completedDates = records.sessions.filter((s) => s.status === 'completed').map((s) => s.date);
  if (!phaseNoticeEligible(streak, completedDates, today)) return null;
  if (settings.phaseNoticeDismissedFor === streak.start) return null;

  return (
    <Card className="border-accent">
      <p className="flex items-center gap-2 text-lg font-bold text-accent">
        <Stethoscope size={22} aria-hidden /> {streak.days} días sin dolor en la pierna
      </p>
      <p className="mt-2">
        Puedes consultar con tu fisioterapeuta si es momento de reintroducir bisagra ligera: peso muerto rumano con
        mancuernas o pull-through.
      </p>
      <p className="mt-2 text-sm text-muted">
        La app no agrega estos ejercicios por su cuenta: decídelo con tu fisio y, si te da el OK, pídele que te guíe
        la técnica.
      </p>
      <Button size="sm" className="mt-3" onClick={() => updateSettings({ phaseNoticeDismissedFor: streak.start })}>
        Entendido
      </Button>
    </Card>
  );
}
