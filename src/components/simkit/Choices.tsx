import type { Bi } from '@/data/types';
import { useT } from '@/translations';
import { sound } from '@/lib/sound';

/** Single-choice option list. Each button carries data-ans={index} for testing. */
export function Choices({ options, value, onPick, locked, correct, cols = 1 }: {
  options: Bi[]; value: number | null; onPick: (i: number) => void; locked?: boolean; correct?: number | null; cols?: 1 | 2;
}) {
  const { L } = useT();
  return (
    <div className={`grid gap-2 ${cols === 2 ? 'sm:grid-cols-2' : ''}`} role="radiogroup">
      {options.map((o, i) => (
        <button key={i} data-ans={i} role="radio" aria-checked={value === i} disabled={locked}
          onClick={() => onPick(i)}
          className={`btn !justify-start text-left !h-auto !py-2 ${value === i ? '!border-cool bg-cool/10' : ''} ${correct === i ? '!bg-ok !text-bg !border-transparent' : ''}`}>
          {L(o)}
        </button>
      ))}
    </div>
  );
}

/** Labelled range slider with a monospace readout. */
export function Slide({ id, label, min, max, step = 1, value, onChange, unit, disabled }: {
  id: string; label: string; min: number; max: number; step?: number; value: number; onChange: (v: number) => void; unit?: string; disabled?: boolean;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="flex justify-between"><span className="text-mute">{label}</span><span className="readout text-cool">{Math.round(value * 100) / 100}{unit}</span></span>
      <input type="range" data-testid={id} min={min} max={max} step={step} value={value} disabled={disabled} onChange={(e) => { sound.slideTick(); onChange(Number(e.target.value)); }} className="w-full" />
    </label>
  );
}
