import { useEffect } from 'react';
import type { Unit } from '@/data/types';
import { useT } from '@/translations';
import { actions, useProgress } from '@/store/progress';
import { Ui } from '@/components/icons';
import { Meter } from '@/components/ui/kit';

export default function Practice({ unit }: { unit: Unit }) {
  const { t, L } = useT();
  const p = useProgress();
  const total = unit.practice.length;
  const n = unit.practice.filter((_, i) => p.ticks[`${unit.id}:${i}`]).length;
  useEffect(() => { if (n === total && total > 0) actions.completeStage(unit.id, 'practice', 20); }, [n, total, unit.id]);
  return (
    <div className="grid gap-4 stage-in" data-testid="stage-practice">
      <p className="text-sm text-mute max-w-2xl">{t.unit.practiceHelp}</p>
      <div className="panel p-4"><Meter value={n} max={total} label={`${n}/${total} ${t.unit.tasksDone}`} tone="ok" height={12} /></div>
      <ol className="grid gap-3">
        {unit.practice.map((x, i) => {
          const on = !!p.ticks[`${unit.id}:${i}`];
          return (
            <li key={i}>
              <button onClick={() => actions.setTick(unit.id, i, !on)} aria-pressed={on} data-task={i}
                className={`w-full text-left panel p-4 flex gap-3 items-start transition ${on ? '!border-ok/60 bg-ok/5' : 'hover:!border-cool/60'}`}>
                <span className={`mt-0.5 grid place-items-center w-7 h-7 rounded-md border-2 shrink-0 ${on ? 'bg-ok border-ok text-bg' : 'border-line text-transparent'}`}><Ui name="check" size={16} stroke={3} /></span>
                <span className="min-w-0">
                  <span className="kicker block mb-0.5">{t.unit.step} {i + 1}</span>
                  <span className={`block leading-relaxed ${on ? 'text-mute' : ''}`}>{L(x.task)}</span>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber"><Ui name="tools" size={13} />{t.unit.tools}: {L(x.tools)}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
