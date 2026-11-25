import { useState, type ReactNode } from 'react';
import type { Bi } from '@/data/types';
import { useT } from '@/translations';
import { Choices } from './Choices';

export interface Q { q: Bi; opts: Bi[]; ans: number; ok?: Bi; bad?: Bi; note?: ReactNode }

/** A short series of single-answer questions asked one after another (calculation / diagnosis steps). */
export function QSteps({ qs, onRight, onWrong, onDone }: { qs: Q[]; onRight: (t?: Bi) => void; onWrong: (t?: Bi) => void; onDone?: () => void }) {
  const { s, L } = useT();
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const q = qs[Math.min(i, qs.length - 1)];
  const submit = () => {
    if (pick === null || done) return;
    if (pick === q.ans) {
      onRight(q.ok);
      if (i >= qs.length - 1) { setDone(true); onDone?.(); } else { setI(i + 1); setPick(null); }
    } else onWrong(q.bad);
  };
  return (
    <div className="grid gap-3" data-testid="qsteps" data-step={i} data-done={done ? 1 : 0}>
      <div className="flex gap-1.5">{qs.map((_, k) => <span key={k} className={`readout grid place-items-center w-7 h-7 rounded-full text-xs ${k < i || done ? 'bg-ok text-bg' : k === i ? 'bg-cool text-bg' : 'bg-panel2 text-mute'}`}>{k + 1}</span>)}</div>
      {q.note}
      <div className="rounded-md border border-line bg-panel p-3 font-semibold">{L(q.q)}</div>
      <Choices options={q.opts} value={done ? q.ans : pick} onPick={setPick} locked={done} correct={done ? q.ans : null} cols={2} />
      <div><button className="btn btn-amber" data-testid="submit-q" onClick={submit} disabled={pick === null || done}>{s('उत्तर जमा करें', 'Submit answer')}</button></div>
    </div>
  );
}

/** Multi-select chips. Each carries data-pick={index}. */
export function MultiPick({ items, sel, onToggle, locked }: { items: Bi[]; sel: number[]; onToggle: (i: number) => void; locked?: boolean }) {
  const { L } = useT();
  return (
    <div className="grid gap-2" role="group">
      {items.map((it, i) => (
        <button key={i} data-pick={i} disabled={locked} aria-pressed={sel.includes(i)} onClick={() => onToggle(i)}
          className={`btn !justify-start text-left !h-auto !py-2 ${sel.includes(i) ? '!border-cool bg-cool/10' : ''}`}>
          <span className={`readout mr-2 grid place-items-center w-5 h-5 rounded border text-[10px] ${sel.includes(i) ? 'bg-cool text-bg border-transparent' : 'border-line'}`}>{sel.includes(i) ? '✓' : ''}</span>{L(it)}
        </button>
      ))}
    </div>
  );
}
