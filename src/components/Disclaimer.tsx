import { Info } from 'lucide-react';
import { DISCLAIMER } from '../data/guide';

export function Disclaimer() {
  return (
    <p className="mt-6 flex gap-2 rounded-xl border border-line bg-surface p-3 text-sm text-muted">
      <Info size={18} className="mt-0.5 shrink-0" aria-hidden />
      <span>{DISCLAIMER}</span>
    </p>
  );
}
