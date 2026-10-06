import { Info } from 'lucide-react';
import { DISCLAIMER } from '../data/guide';

export function Disclaimer({ className = 'mt-6' }: { className?: string }) {
  return (
    <p className={`${className} flex gap-2 rounded-xl border border-line bg-surface p-3 text-sm text-muted`}>
      <Info size={18} className="mt-0.5 shrink-0" aria-hidden />
      <span>{DISCLAIMER}</span>
    </p>
  );
}
