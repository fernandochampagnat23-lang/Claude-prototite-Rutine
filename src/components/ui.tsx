import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { X } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'warn';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink active:brightness-90',
  secondary: 'bg-surface-2 text-ink border border-line active:bg-line',
  danger: 'bg-danger text-white active:brightness-90',
  warn: 'bg-warn text-black active:brightness-90',
  ghost: 'bg-transparent text-ink active:bg-surface-2',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'min-h-10 px-3 text-sm rounded-lg',
    md: 'min-h-12 px-4 text-base rounded-xl',
    lg: 'min-h-14 px-5 text-lg rounded-2xl',
  };
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 font-semibold select-none transition disabled:pointer-events-none disabled:border-line! disabled:bg-surface-2! disabled:text-muted! ${sizes[size]} ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl bg-surface border border-line p-4 ${className}`}>{children}</section>;
}

export function Chip({
  selected,
  onClick,
  children,
  tone = 'accent',
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  tone?: 'accent' | 'danger' | 'warn';
}) {
  const on = {
    accent: 'bg-accent/15 border-accent text-accent',
    danger: 'bg-danger/15 border-danger text-danger',
    warn: 'bg-warn/15 border-warn text-warn',
  }[tone];
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-12 rounded-xl border px-3 py-2 text-left text-base font-medium transition ${
        selected ? on : 'border-line bg-surface-2 text-ink'
      }`}
    >
      {children}
    </button>
  );
}

/** Escala de dolor 0–10 con botones grandes. */
export function PainScale({ value, onChange }: { value?: number; onChange: (value: number) => void }) {
  return (
    <div className="grid grid-cols-6 gap-2" role="radiogroup" aria-label="Dolor de 0 a 10">
      {Array.from({ length: 11 }, (_, n) => {
        const selected = value === n;
        const color = n <= 3 ? 'bg-accent text-accent-ink' : n <= 6 ? 'bg-warn text-black' : 'bg-danger text-white';
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(n)}
            className={`h-14 rounded-xl text-xl font-bold border transition ${
              selected ? `${color} border-transparent scale-105` : 'bg-surface-2 border-line text-ink'
            }`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

/** Campo numérico con botones − y + grandes para usar con el pulgar. */
export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  label,
  suffix,
}: {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  step?: number;
  min?: number;
  label: string;
  suffix?: string;
}) {
  const current = value ?? 0;
  const set = (next: number) => onChange(Math.max(min, Math.round(next * 100) / 100));
  return (
    <div className="flex items-stretch rounded-xl border border-line bg-surface-2 overflow-hidden">
      <button
        type="button"
        aria-label={`Restar ${step} a ${label}`}
        onClick={() => set(current - step)}
        className="w-11 shrink-0 text-2xl font-bold text-muted active:bg-line"
      >
        −
      </button>
      <label className="flex min-w-0 flex-1 flex-col items-center justify-center py-1">
        <span className="sr-only">{label}</span>
        <input
          type="number"
          inputMode="decimal"
          value={value ?? ''}
          placeholder="0"
          onChange={(event) => {
            const raw = event.target.value.replace(',', '.');
            onChange(raw === '' ? undefined : Number(raw));
          }}
          onFocus={(event) => event.target.select()}
          className="w-full bg-transparent text-center text-xl font-bold outline-none"
        />
        {suffix && <span className="text-[11px] leading-none text-muted">{suffix}</span>}
      </label>
      <button
        type="button"
        aria-label={`Sumar ${step} a ${label}`}
        onClick={() => set(current + step)}
        className="w-11 shrink-0 text-2xl font-bold text-muted active:bg-line"
      >
        +
      </button>
    </div>
  );
}

/** Hoja inferior modal, cómoda para una mano. */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl border-t border-line bg-surface p-4 pb-safe">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar">
            <X size={22} />
          </Button>
        </div>
        <div className="pb-4">{children}</div>
      </div>
    </div>
  );
}

/** Barra fija sobre la navegación inferior para la acción principal de cada paso. */
export function StickyAction({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 -mx-4 mt-6 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur">
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-muted">{children}</h2>;
}
