import { useState, type ReactNode } from 'react';
import { Card } from '../../components/ui';

/** Tarjeta de gráfico con su vista de tabla equivalente. */
export function ChartCard({
  title,
  subtitle,
  legend,
  table,
  children,
}: {
  title: string;
  subtitle?: string;
  legend?: ReactNode;
  table: ReactNode;
  children: ReactNode;
}) {
  const [showTable, setShowTable] = useState(false);
  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="min-h-10 shrink-0 rounded-lg border border-line px-3 text-sm font-semibold text-muted"
        >
          {showTable ? 'Ver gráfico' : 'Ver tabla'}
        </button>
      </div>
      {legend && !showTable && <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted">{legend}</div>}
      <div className="mt-3">{showTable ? <div className="max-h-72 overflow-y-auto">{table}</div> : children}</div>
    </Card>
  );
}

export function LineKey({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="h-0.5 w-4 rounded-full" style={{ background: color }} aria-hidden />
      {label}
    </span>
  );
}

export function DataTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="sticky top-0 bg-surface text-muted">
        <tr>
          {head.map((h) => (
            <th key={h} className="py-2 pr-2 font-semibold">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="tabular-nums">
        {rows.map((row, i) => (
          <tr key={i} className="border-t border-line">
            {row.map((cell, j) => (
              <td key={j} className="py-2 pr-2">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface TooltipEntry {
  name?: string | number;
  value?: number | string | readonly (number | string)[];
  color?: string;
  dataKey?: unknown;
}

/** Tooltip: el valor en primer plano, el nombre de la serie después, con clave de línea. */
export function ChartTooltip({
  active,
  payload,
  label,
  unit = '',
}: {
  active?: boolean;
  payload?: readonly TooltipEntry[];
  label?: string | number;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-bg px-3 py-2 text-sm shadow-xl">
      <p className="mb-1 text-muted">{label}</p>
      {payload.map((entry) => (
        <p key={String(entry.name)} className="flex items-center gap-2">
          <span className="h-0.5 w-3 rounded-full" style={{ background: entry.color }} aria-hidden />
          <strong className="text-base text-ink">
            {Array.isArray(entry.value)
              ? entry.value.join('–')
              : typeof entry.value === 'number'
                ? entry.value.toLocaleString('es')
                : (entry.value ?? '–')}
            {unit}
          </strong>
          <span className="text-muted">{entry.name}</span>
        </p>
      ))}
    </div>
  );
}
