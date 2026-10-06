import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { db } from '../db/db';
import { EXERCISES_BY_ID } from '../data/exercises';
import { TRIGGER_LABELS } from '../data/guide';
import { addDays, formatShortDate, toDateKey, weekStart } from '../logic/dates';
import { legPainStreak } from '../logic/legPain';
import {
  exercisePainRanking,
  exercisesWithWeight,
  painSeries,
  sessionsPerWeek,
  triggerImpact,
  weightSeries,
} from '../logic/stats';
import { Card, SectionTitle } from '../components/ui';
import { ChartCard, ChartTooltip, DataTable, LineKey } from './progress/ChartCard';
import type { Trigger } from '../types';

const SERIES_1 = 'var(--color-series-1)';
const num = (value: number | undefined) => (value === undefined ? '–' : value.toLocaleString('es'));
const SERIES_2 = 'var(--color-series-2)';
const AXIS = { stroke: 'var(--color-line)', tick: { fill: 'var(--color-muted)', fontSize: 12 }, tickLine: false };
const GRID = <CartesianGrid stroke="var(--color-line)" strokeWidth={1} vertical={false} />;
const DOT = { r: 4, strokeWidth: 2, stroke: 'var(--color-surface)' };

type Range = '30' | '90' | 'todo';
const RANGES: { id: Range; label: string }[] = [
  { id: '30', label: '30 días' },
  { id: '90', label: '90 días' },
  { id: 'todo', label: 'Todo' },
];

/** Etiqueta directa solo en el último punto de la línea. */
function endLabel(lastIndex: number, unit = '') {
  return (props: { x?: number | string; y?: number | string; value?: unknown; index?: number }) => {
    if (props.index !== lastIndex || props.value === undefined || props.value === null) return null;
    return (
      <text x={Number(props.x) + 8} y={Number(props.y) + 4} fill="var(--color-ink)" fontSize={12} fontWeight={600}>
        {typeof props.value === 'number' ? props.value.toLocaleString('es') : String(props.value)}
        {unit}
      </text>
    );
  };
}

export function Progress() {
  const data = useLiveQuery(async () => {
    const [sessions, setLogs, painEvents, checkins] = await Promise.all([
      db.sessions.toArray(),
      db.setLogs.toArray(),
      db.painEvents.toArray(),
      db.checkins.toArray(),
    ]);
    return { sessions, setLogs, painEvents, checkins };
  }, []);
  const [range, setRange] = useState<Range>('30');
  const [exerciseId, setExerciseId] = useState<string>('');
  const today = toDateKey();

  const view = useMemo(() => {
    if (!data) return null;
    const from = range === 'todo' ? '0000-00-00' : addDays(today, -Number(range) + 1);
    const sessions = data.sessions.filter((s) => s.date >= from);
    const done = sessions.filter((s) => s.status === 'completed');
    const firstDate = done.map((s) => s.date).sort()[0] ?? today;
    const weeks =
      range === 'todo'
        ? Math.min(26, Math.max(1, Math.floor((Date.parse(weekStart(today)) - Date.parse(weekStart(firstDate))) / 6048e5) + 1))
        : range === '30'
          ? 5
          : 13;
    const sessionIds = new Set(sessions.map((s) => s.id));
    return {
      done,
      pain: painSeries(sessions),
      weekly: sessionsPerWeek(sessions, today, weeks),
      weighted: exercisesWithWeight(sessions, data.setLogs),
      triggers: triggerImpact(
        sessions,
        data.checkins.filter((c) => c.date >= from),
        Object.keys(TRIGGER_LABELS) as Trigger[],
      ),
      ranking: exercisePainRanking(data.painEvents.filter((e) => e.date >= from)),
      setLogs: data.setLogs.filter((l) => sessionIds.has(l.sessionId)),
    };
  }, [data, range, today]);

  if (!data || !view) return null;

  const streak = legPainStreak(data, today);
  const allDone = data.sessions.filter((s) => s.status === 'completed');
  const thisWeek = allDone.filter((s) => s.date >= weekStart(today)).length;
  const selected = view.weighted.includes(exerciseId) ? exerciseId : (view.weighted[0] ?? '');
  const weights = selected ? weightSeries(selected, view.done, view.setLogs) : [];
  const weightValues = weights.map((w) => w.weight);
  const weightDomain: [number, number] = weights.length
    ? [Math.max(0, Math.floor((Math.min(...weightValues) - 2.5) / 5) * 5), Math.ceil((Math.max(...weightValues) + 2.5) / 5) * 5]
    : [0, 10];
  const recent = [...allDone].sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0)).slice(0, 10);

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm font-semibold text-muted">Días seguidos sin dolor en la pierna</p>
        <p className="text-6xl font-bold leading-tight">{streak.days}</p>
        <p className="text-sm text-muted">
          {streak.lastPain
            ? `Último dolor en la pierna: ${formatShortDate(streak.lastPain)}`
            : streak.start
              ? `Sin dolor en la pierna desde el ${formatShortDate(streak.start)}`
              : 'Empieza a registrar para ver tu racha'}
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-sm font-semibold text-muted">Sesiones esta semana</p>
          <p className="text-3xl font-bold">
            {thisWeek}
            <span className="text-lg text-muted"> / 5</span>
          </p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-muted">Sesiones totales</p>
          <p className="text-3xl font-bold">{allDone.length}</p>
        </Card>
      </div>

      <div className="flex gap-2" role="group" aria-label="Período">
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={range === r.id}
            onClick={() => setRange(r.id)}
            className={`min-h-11 flex-1 rounded-xl border font-semibold ${
              range === r.id ? 'border-accent bg-accent/15 text-accent' : 'border-line bg-surface-2'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {view.done.length === 0 ? (
        <Card>
          <p className="text-muted">Todavía no hay sesiones completadas en este período.</p>
        </Card>
      ) : (
        <>
          <ChartCard
            title="Dolor antes y después"
            subtitle="Escala 0–10 por sesión"
            legend={
              <>
                <LineKey color={SERIES_1} label="Antes" />
                <LineKey color={SERIES_2} label="Después" />
              </>
            }
            table={
              <DataTable
                head={['Fecha', 'Antes', 'Después']}
                rows={[...view.pain].reverse().map((p) => [p.label, p.pre ?? '–', p.post ?? '–'])}
              />
            }
          >
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={view.pain} margin={{ top: 8, right: 28, bottom: 0, left: -24 }}>
                {GRID}
                <XAxis dataKey="label" {...AXIS} interval="preserveStartEnd" minTickGap={24} />
                <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} {...AXIS} axisLine={false} />
                <Tooltip
                  cursor={{ stroke: 'var(--color-muted)', strokeWidth: 1 }}
                  content={({ active, payload, label }) => (
                    <ChartTooltip active={active} payload={payload} label={label} />
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="pre"
                  name="Antes"
                  stroke={SERIES_1}
                  strokeWidth={2}
                  dot={{ ...DOT, fill: SERIES_1 }}
                  activeDot={{ ...DOT, r: 6, fill: SERIES_1 }}
                  isAnimationActive={false}
                >
                  <LabelList dataKey="pre" content={endLabel(view.pain.length - 1)} />
                </Line>
                <Line
                  type="monotone"
                  dataKey="post"
                  name="Después"
                  stroke={SERIES_2}
                  strokeWidth={2}
                  dot={{ ...DOT, fill: SERIES_2 }}
                  activeDot={{ ...DOT, r: 6, fill: SERIES_2 }}
                  isAnimationActive={false}
                >
                  <LabelList dataKey="post" content={endLabel(view.pain.length - 1)} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Sesiones por semana"
            subtitle="Objetivo: 5 por semana"
            table={
              <DataTable
                head={['Semana del', 'Sesiones']}
                rows={[...view.weekly].reverse().map((w) => [w.label, w.count])}
              />
            }
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={view.weekly} margin={{ top: 16, right: 8, bottom: 0, left: -24 }}>
                {GRID}
                <XAxis dataKey="label" {...AXIS} interval="preserveStartEnd" minTickGap={16} />
                <YAxis domain={[0, 6]} ticks={[0, 1, 2, 3, 4, 5, 6]} allowDecimals={false} {...AXIS} axisLine={false} />
                <ReferenceLine y={5} stroke="var(--color-muted)" strokeWidth={1} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  content={({ active, payload, label }) => (
                    <ChartTooltip active={active} payload={payload} label={`Semana del ${label}`} />
                  )}
                />
                <Bar
                  dataKey="count"
                  name="sesiones"
                  fill={SERIES_1}
                  maxBarSize={24}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Peso por ejercicio"
            subtitle="Peso máximo de cada sesión"
            table={
              <DataTable head={['Fecha', 'Peso']} rows={[...weights].reverse().map((w) => [w.label, `${num(w.weight)} kg`])} />
            }
          >
            {view.weighted.length === 0 ? (
              <p className="text-muted">Registra pesos en tus series para ver la evolución.</p>
            ) : (
              <>
                <label className="mb-3 block">
                  <span className="sr-only">Ejercicio</span>
                  <select
                    value={selected}
                    onChange={(event) => setExerciseId(event.target.value)}
                    className="min-h-12 w-full rounded-xl border border-line bg-surface-2 px-3 text-base"
                  >
                    {view.weighted.map((id) => (
                      <option key={id} value={id}>
                        {EXERCISES_BY_ID[id]?.name ?? id}
                      </option>
                    ))}
                  </select>
                </label>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={weights} margin={{ top: 8, right: 60, bottom: 0, left: -16 }}>
                    {GRID}
                    <XAxis dataKey="label" {...AXIS} interval="preserveStartEnd" minTickGap={24} />
                    <YAxis {...AXIS} axisLine={false} domain={weightDomain} tickCount={5} allowDecimals={false} />
                    <Tooltip
                      cursor={{ stroke: 'var(--color-muted)', strokeWidth: 1 }}
                      content={({ active, payload, label }) => (
                        <ChartTooltip active={active} payload={payload} label={label} unit=" kg" />
                      )}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      name="peso"
                      stroke={SERIES_1}
                      strokeWidth={2}
                      dot={{ ...DOT, fill: SERIES_1 }}
                      activeDot={{ ...DOT, r: 6, fill: SERIES_1 }}
                      isAnimationActive={false}
                    >
                      <LabelList dataKey="weight" content={endLabel(weights.length - 1, ' kg')} />
                    </Line>
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}
          </ChartCard>
        </>
      )}

      <SectionTitle>Qué te empeora</SectionTitle>
      <Card>
        <h3 className="font-bold">Detonantes</h3>
        <p className="mb-2 text-sm text-muted">Dolor medio con y sin cada detonante (post-sesión y registros sueltos).</p>
        {view.triggers.every((t) => t.count === 0) ? (
          <p className="text-muted">Todavía no registraste detonantes en este período.</p>
        ) : (
          <DataTable
            head={['Detonante', 'Veces', 'Con', 'Sin']}
            rows={view.triggers.map((t) => [TRIGGER_LABELS[t.trigger], t.count, num(t.avgWith), num(t.avgWithout)])}
          />
        )}
      </Card>
      <Card>
        <h3 className="font-bold">Ejercicios con "me dolió"</h3>
        {view.ranking.length === 0 ? (
          <p className="mt-1 text-muted">Ningún ejercicio te dolió en este período.</p>
        ) : (
          <DataTable
            head={['Ejercicio', 'Veces', 'A la pierna']}
            rows={view.ranking.map((r) => [EXERCISES_BY_ID[r.exerciseId]?.name ?? r.exerciseId, r.total, r.leg])}
          />
        )}
      </Card>

      {recent.length > 0 && (
        <>
          <SectionTitle>Últimas sesiones</SectionTitle>
          <ul className="space-y-2">
            {recent.map((s) => (
              <li key={s.id} className="rounded-2xl border border-line bg-surface p-3">
                <p className="flex items-center gap-2 font-semibold">
                  {s.goldenRule && <AlertTriangle size={16} className="text-danger" aria-label="Regla de oro" />}
                  {formatShortDate(s.date)} · Día {s.dayId} · {s.dayTitle}
                </p>
                <p className="text-sm text-muted">
                  Dolor {s.pre?.score ?? '–'} → {s.post?.score ?? '–'}
                  {s.walkMinutes ? ` · caminata ${s.walkMinutes} min` : ''}
                  {s.triggers.length > 0 && ` · ${s.triggers.map((t) => TRIGGER_LABELS[t]).join(', ')}`}
                </p>
                {s.notes && <p className="mt-1 text-sm">{s.notes}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
