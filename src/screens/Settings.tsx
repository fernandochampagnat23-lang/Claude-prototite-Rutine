import { useRef, useState } from 'react';
import { CalendarPlus, Download, Upload } from 'lucide-react';
import { db, updateSettings } from '../db/db';
import { backupFileName, exportBackup, importBackup, parseBackup, type Backup } from '../db/backup';
import { useSettings } from '../hooks/useSession';
import { toDateKey } from '../logic/dates';
import { buildReminderIcs, REMINDER_TEXT } from '../logic/reminder';
import { formatClock } from '../logic/format';
import { Button, Card, SectionTitle, Sheet, Stepper } from '../components/ui';
import { Disclaimer } from '../components/Disclaimer';

function download(content: string, fileName: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const REST_PRESETS = [60, 90, 120, 150];

export function SettingsScreen() {
  const settings = useSettings();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Backup | null>(null);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [confirmWipe, setConfirmWipe] = useState(false);

  const onExport = async () => {
    const backup = await exportBackup();
    download(JSON.stringify(backup, null, 2), backupFileName(toDateKey()), 'application/json');
    setMessage({ tone: 'ok', text: `Respaldo descargado: ${backup.data.sessions.length} sesiones.` });
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      setPending(parseBackup(await file.text()));
      setMessage(null);
    } catch (error) {
      setMessage({ tone: 'error', text: (error as Error).message });
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const confirmImport = async () => {
    if (!pending) return;
    await importBackup(pending);
    setMessage({ tone: 'ok', text: `Respaldo importado: ${pending.data.sessions.length} sesiones.` });
    setPending(null);
  };

  return (
    <div>
      <SectionTitle>Descanso entre series</SectionTitle>
      <Card>
        <div className="grid grid-cols-4 gap-2">
          {REST_PRESETS.map((seconds) => (
            <button
              key={seconds}
              type="button"
              aria-pressed={settings.restSeconds === seconds}
              onClick={() => updateSettings({ restSeconds: seconds })}
              className={`h-12 rounded-xl border font-semibold ${
                settings.restSeconds === seconds ? 'border-accent bg-accent/15 text-accent' : 'border-line bg-surface-2'
              }`}
            >
              {formatClock(seconds)}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <Stepper
            label="Descanso en segundos"
            suffix="segundos"
            value={settings.restSeconds}
            step={15}
            min={15}
            onChange={(value) => updateSettings({ restSeconds: Math.max(15, value ?? 90) })}
          />
        </div>
      </Card>

      <SectionTitle>Calentamiento McGill</SectionTitle>
      <Card>
        <p className="mb-2 text-sm text-muted">Duración de cada aguante</p>
        <div className="grid grid-cols-2 gap-2">
          {[8, 10].map((seconds) => (
            <button
              key={seconds}
              type="button"
              aria-pressed={settings.holdSeconds === seconds}
              onClick={() => updateSettings({ holdSeconds: seconds })}
              className={`h-12 rounded-xl border font-semibold ${
                settings.holdSeconds === seconds ? 'border-accent bg-accent/15 text-accent' : 'border-line bg-surface-2'
              }`}
            >
              {seconds} segundos
            </button>
          ))}
        </div>
      </Card>

      <SectionTitle>Recordatorio por la mañana</SectionTitle>
      <Card>
        <p className="font-semibold">“{REMINDER_TEXT}”</p>
        <label className="mt-3 flex min-h-12 items-center gap-3">
          <input
            type="checkbox"
            checked={settings.reminderEnabled}
            onChange={(event) => updateSettings({ reminderEnabled: event.target.checked })}
            className="h-6 w-6 accent-[var(--color-accent)]"
          />
          Mostrarlo en Hoy antes del mediodía
        </label>
        <label className="mt-2 flex items-center justify-between gap-3">
          <span>Hora del aviso en el calendario</span>
          <input
            type="time"
            value={settings.reminderTime}
            onChange={(event) => event.target.value && updateSettings({ reminderTime: event.target.value })}
            className="min-h-12 rounded-xl border border-line bg-surface-2 px-3 text-base"
          />
        </label>
        <Button
          className="mt-3 w-full"
          onClick={() =>
            download(buildReminderIcs(settings.reminderTime, new Date()), 'recordatorio-rutina-l5.ics', 'text/calendar')
          }
        >
          <CalendarPlus size={20} aria-hidden /> Añadir aviso diario al calendario
        </Button>
        <p className="mt-2 text-sm text-muted">
          Descarga un evento diario con alarma. Ábrelo y elige “Añadir” en tu app de calendario: suena aunque la app esté
          cerrada y sin internet.
        </p>
      </Card>

      <SectionTitle>Respaldo</SectionTitle>
      <Card>
        <p className="text-sm text-muted">
          Tus datos viven solo en este celular. Descarga un respaldo de vez en cuando y guárdalo en un lugar seguro.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button onClick={onExport}>
            <Download size={20} aria-hidden /> Exportar
          </Button>
          <Button onClick={() => fileInput.current?.click()}>
            <Upload size={20} aria-hidden /> Importar
          </Button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => onFile(event.target.files?.[0])}
          aria-label="Archivo de respaldo"
        />
        {message && (
          <p
            role="status"
            className={`mt-3 rounded-xl p-3 text-sm ${message.tone === 'ok' ? 'bg-accent/10 text-accent' : 'bg-danger-bg text-danger'}`}
          >
            {message.text}
          </p>
        )}
      </Card>

      <SectionTitle>Datos</SectionTitle>
      <Button variant="danger" className="w-full" onClick={() => setConfirmWipe(true)}>
        Borrar todos los datos
      </Button>

      <Disclaimer />

      <Sheet open={!!pending} onClose={() => setPending(null)} title="Importar respaldo">
        {pending && (
          <>
            <p className="mb-4">
              Respaldo del {new Date(pending.exportedAt).toLocaleString('es')} con {pending.data.sessions.length}{' '}
              sesiones. <strong>Reemplazará todos los datos actuales</strong> de este celular.
            </p>
            <Button variant="danger" size="lg" className="w-full" onClick={confirmImport}>
              Reemplazar mis datos
            </Button>
          </>
        )}
      </Sheet>

      <Sheet open={confirmWipe} onClose={() => setConfirmWipe(false)} title="Borrar todos los datos">
        <p className="mb-4">
          Se borran sesiones, registros, rutina y ajustes. No se puede deshacer: exporta un respaldo antes si lo
          necesitas.
        </p>
        <Button
          variant="danger"
          size="lg"
          className="w-full"
          onClick={async () => {
            db.close();
            await db.delete();
            window.location.reload();
          }}
        >
          Borrar todo
        </Button>
      </Sheet>
    </div>
  );
}
