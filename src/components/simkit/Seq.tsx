import { useState } from 'react';
import type { Bi } from '@/data/types';
import { useT } from '@/translations';

/** Tap-in-sequence picker: the learner taps items in the correct order. */
export function Seq({ items, correct, onWrong, onDone, locked }: {
  items: Bi[]; correct: number[]; onWrong: () => void; onDone: () => void; locked?: boolean;
}) {
  const { L } = useT();
  const [picked, setPicked] = useState<number[]>([]);
  const [shake, setShake] = useState<number | null>(null);
  const tap = (i: number) => {
    if (locked || picked.includes(i)) return;
    if (correct[picked.length] === i) {
      const n = [...picked, i]; setPicked(n);
      if (n.length === correct.length) onDone();
    } else { setShake(i); onWrong(); setTimeout(() => setShake(null), 400); }
  };
  return (
    <ul className="grid gap-2" data-testid="seq">
      {items.map((it, i) => {
        const pos = picked.indexOf(i);
        return (
          <li key={i}>
            <button onClick={() => tap(i)} disabled={pos >= 0} data-seq={i}
              className={`w-full text-left flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition ${pos >= 0 ? 'border-ok/60 bg-ok/10' : 'border-line bg-panel hover:border-cool/60'} ${shake === i ? 'ring-2 ring-hot' : ''}`}>
              <span className={`readout grid place-items-center w-7 h-7 rounded-full text-xs shrink-0 ${pos >= 0 ? 'bg-ok text-bg' : 'bg-panel2 text-mute'}`}>{pos >= 0 ? pos + 1 : '?'}</span>
              <span>{L(it)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
