import type { Bi } from '@/data/types';
import { useT } from '@/translations';

export interface BNode { id: string; x: number; y: number; label: Bi; w?: number; h?: number; kind?: 'part' | 'ctrl' | 'end' }
export interface BDef { nodes: BNode[]; edges: [string, string][]; steps: string[][]; note?: Bi[] }

const W = 100, H = 46;

function anchor(n: BNode, tx: number, ty: number) {
  const w = n.w ?? W, h = n.h ?? H; const cx = n.x + w / 2, cy = n.y + h / 2;
  const dx = tx - cx, dy = ty - cy;
  const k = Math.min((w / 2) / Math.max(Math.abs(dx), 1e-6), (h / 2) / Math.max(Math.abs(dy), 1e-6));
  return [cx + dx * k, cy + dy * k] as const;
}

function lines(s: string): string[] {
  const words = s.split(' ');
  if (words.length < 2 || s.length <= 12) return [s];
  let best = 1, diff = 1e9;
  for (let i = 1; i < words.length; i++) { const a = words.slice(0, i).join(' ').length, b = words.slice(i).join(' ').length; if (Math.abs(a - b) < diff) { diff = Math.abs(a - b); best = i; } }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
}

/** Data-driven animated block diagram used for the Watch stage. */
export function BlockDiagram({ def, step }: { def: BDef; step: number }) {
  const { L } = useT();
  const hi = new Set(def.steps[Math.min(step, def.steps.length - 1)]);
  const byId = Object.fromEntries(def.nodes.map((n) => [n.id, n]));
  const maxY = Math.max(...def.nodes.map((n) => n.y + (n.h ?? H))) + 16;
  return (
    <svg viewBox={`0 0 640 ${maxY}`} className="w-full h-auto" role="img" aria-label="diagram" data-testid="block-diagram">
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="rgb(var(--mute))" /></marker>
        <marker id="arrOn" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="rgb(var(--cool))" /></marker>
      </defs>
      {def.edges.map(([a, b], i) => {
        const A = byId[a], B = byId[b]; if (!A || !B) return null;
        const on = hi.has(a) && hi.has(b);
        const [x1, y1] = anchor(A, B.x + (B.w ?? W) / 2, B.y + (B.h ?? H) / 2);
        const [x2, y2] = anchor(B, A.x + (A.w ?? W) / 2, A.y + (A.h ?? H) / 2);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={on ? 'rgb(var(--cool))' : 'rgb(var(--line))'} strokeWidth={on ? 3 : 2}
          strokeDasharray={on ? '8 6' : undefined} className={on ? 'animate-flow' : undefined} markerEnd={`url(#${on ? 'arrOn' : 'arr'})`} />;
      })}
      {def.nodes.map((n) => {
        const on = hi.has(n.id); const w = n.w ?? W, h = n.h ?? H;
        const ls = lines(L(n.label)); const fs = Math.max(...ls.map((l) => l.length)) > 13 ? 10.5 : 12;
        const stroke = on ? (n.kind === 'ctrl' ? 'rgb(var(--amber))' : 'rgb(var(--cool))') : 'rgb(var(--line))';
        return (
          <g key={n.id} opacity={on ? 1 : 0.55} style={{ transition: 'opacity .3s' }} data-node={n.id} data-on={on ? '1' : '0'}>
            <rect x={n.x} y={n.y} width={w} height={h} rx={n.kind === 'end' ? 22 : 7} fill={on ? (n.kind === 'ctrl' ? 'rgb(var(--amber) / .18)' : 'rgb(var(--cool) / .18)') : 'rgb(var(--panel))'} stroke={stroke} strokeWidth={on ? 2.5 : 1.5} />
            {ls.map((l, i) => <text key={i} x={n.x + w / 2} y={n.y + h / 2 + (i - (ls.length - 1) / 2) * (fs + 2) + fs * 0.35} textAnchor="middle" fontSize={fs} fontWeight={700} fill="rgb(var(--ink))">{l}</text>)}
          </g>
        );
      })}
    </svg>
  );
}
