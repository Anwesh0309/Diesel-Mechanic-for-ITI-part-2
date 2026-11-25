import { type ReactNode } from 'react';
import { Ui } from '@/components/icons';

/** Circular progress ring (0–100). */
export function Ring({ value, size = 64, stroke = 7, label, sub }: { value: number; size?: number; stroke?: number; label?: ReactNode; sub?: string }) {
  const r = (size - stroke) / 2; const c = 2 * Math.PI * r; const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={`${Math.round(v)}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--line))" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--cool))" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} style={{ transition: 'stroke-dashoffset .6s ease' }} />
      </svg>
      <div className="absolute text-center leading-none">
        <div className="readout text-sm">{label ?? `${Math.round(v)}%`}</div>
        {sub && <div className="text-[9px] text-mute mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

/** Horizontal bar meter with optional green band. */
export function Meter({ value, max = 100, label, unit, tone = 'cool', band, height = 10 }: {
  value: number; max?: number; label?: string; unit?: string; tone?: 'cool' | 'amber' | 'hot' | 'ok'; band?: [number, number]; height?: number;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const col = { cool: 'bg-cool', amber: 'bg-amber', hot: 'bg-hot', ok: 'bg-ok' }[tone];
  return (
    <div>
      {label && <div className="flex justify-between text-xs mb-1"><span className="text-mute">{label}</span><span className="readout">{Math.round(value * 10) / 10}{unit}</span></div>}
      <div className="relative rounded bg-panel2 border border-line overflow-hidden" style={{ height }}>
        {band && <div className="absolute inset-y-0 bg-ok/25 border-x border-ok/60" style={{ left: `${(band[0] / max) * 100}%`, width: `${((band[1] - band[0]) / max) * 100}%` }} />}
        <div className={`absolute inset-y-0 left-0 ${col} transition-[width] duration-200`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Round dial gauge with needle (SVG). */
export function Dial({ value, min = 0, max = 100, label, unit, zones, size = 140 }: {
  value: number; min?: number; max?: number; label: string; unit: string; zones?: { from: number; to: number; tone: 'ok' | 'amber' | 'hot' }[]; size?: number;
}) {
  const a0 = -210, a1 = 30; const t = (v: number) => a0 + ((Math.max(min, Math.min(max, v)) - min) / (max - min)) * (a1 - a0);
  const pt = (ang: number, r: number) => [70 + r * Math.cos((ang * Math.PI) / 180), 72 + r * Math.sin((ang * Math.PI) / 180)];
  const arc = (from: number, to: number, r: number) => { const [x0, y0] = pt(t(from), r); const [x1, y1] = pt(t(to), r); const large = t(to) - t(from) > 180 ? 1 : 0; return `M${x0} ${y0} A${r} ${r} 0 ${large} 1 ${x1} ${y1}`; };
  const [nx, ny] = pt(t(value), 46);
  const colr = { ok: 'rgb(var(--ok))', amber: 'rgb(var(--amber))', hot: 'rgb(var(--hot))' };
  return (
    <svg viewBox="0 0 140 130" width={size} height={size * 0.93} role="img" aria-label={`${label} ${Math.round(value)} ${unit}`}>
      <circle cx="70" cy="72" r="60" fill="rgb(var(--panel2))" stroke="rgb(var(--line))" strokeWidth="2" />
      <path d={arc(min, max, 52)} stroke="rgb(var(--line))" strokeWidth="6" fill="none" strokeLinecap="round" />
      {zones?.map((z, i) => <path key={i} d={arc(z.from, z.to, 52)} stroke={colr[z.tone]} strokeWidth="6" fill="none" />)}
      {Array.from({ length: 11 }, (_, i) => { const [x0, y0] = pt(a0 + (i / 10) * (a1 - a0), 44); const [x1, y1] = pt(a0 + (i / 10) * (a1 - a0), 48); return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="rgb(var(--mute))" strokeWidth="1" />; })}
      <line x1="70" y1="72" x2={nx} y2={ny} stroke="rgb(var(--cool))" strokeWidth="3" strokeLinecap="round" style={{ transition: 'all .25s ease' }} />
      <circle cx="70" cy="72" r="5" fill="rgb(var(--cool))" />
      <text x="70" y="98" textAnchor="middle" fontSize="15" fontWeight="700" fill="rgb(var(--ink))" fontFamily="JetBrains Mono, monospace">{Math.round(value)}</text>
      <text x="70" y="111" textAnchor="middle" fontSize="8.500" fill="rgb(var(--mute))">{unit}</text>
      <text x="70" y="124" textAnchor="middle" fontSize="8.500" fontWeight="700" fill="rgb(var(--cool))">{label}</text>
    </svg>
  );
}

/** Banner for feedback messages. */
export function Feedback({ tone, children }: { tone: 'ok' | 'bad' | 'info'; children: ReactNode }) {
  const m = { ok: ['border-ok/60 bg-ok/10', 'check'], bad: ['border-hot/60 bg-hot/10', 'alert'], info: ['border-cool/50 bg-cool/10', 'bulb'] } as const;
  const [cls, ic] = m[tone];
  return (
    <div role="status" data-tone={tone} className={`flex gap-2.5 items-start border-l-4 rounded-md px-3 py-2.5 text-sm ${cls}`}>
      <Ui name={ic} size={17} className={tone === 'ok' ? 'text-ok mt-0.5' : tone === 'bad' ? 'text-hot mt-0.5' : 'text-cool mt-0.5'} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function Chip({ children, tone = 'cool' }: { children: ReactNode; tone?: 'cool' | 'amber' | 'ok' | 'hot' | 'mute' }) {
  const m = { cool: 'bg-cool/15 text-cool', amber: 'bg-amber/15 text-amber', ok: 'bg-ok/15 text-ok', hot: 'bg-hot/15 text-hot', mute: 'bg-panel2 text-mute' };
  return <span className={`chip ${m[tone]}`}>{children}</span>;
}

export function SectionTitle({ kicker, children, right }: { kicker?: string; children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-4">
      <div>{kicker && <div className="kicker mb-1">{kicker}</div>}<h2 className="text-2xl sm:text-3xl font-bold leading-tight">{children}</h2></div>
      {right}
    </div>
  );
}
