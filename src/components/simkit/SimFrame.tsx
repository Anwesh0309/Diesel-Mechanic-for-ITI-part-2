import { type ReactNode } from 'react';
import type { Bi } from '@/data/types';
import { useT } from '@/translations';
import { Ui } from '@/components/icons';
import { Feedback, Ring } from '@/components/ui/kit';
import { gradeOf, type Run } from './useRun';

interface Props {
  run: Run;
  title: Bi;
  intro: Bi;
  phases: Bi[];
  phase: number;
  canNext: boolean;
  onNext: () => void;
  getHint: () => Bi;
  onReset: () => void;
  children: ReactNode;
}

/** Common chrome for every bench simulation: HUD, phase pills, hint, feedback, result card. */
export function SimFrame({ run, title, intro, phases, phase, canNext, onNext, getHint, onReset, children }: Props) {
  const { t, L } = useT();
  const last = phase >= phases.length - 1;
  const g = gradeOf(run.score);
  const gradeLabel = t.sim.grade[g];

  return (
    <section className="panel panel-rivets p-3 sm:p-5" data-testid="sim">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3 pt-2">
        <div className="min-w-0">
          <div className="kicker">{t.sim.phase} {Math.min(phase + 1, phases.length)}/{phases.length}</div>
          <h3 className="text-xl sm:text-2xl font-bold leading-tight">{L(title)}</h3>
          <p className="text-sm text-mute mt-1 max-w-2xl">{L(intro)}</p>
        </div>
        <div className="flex items-center gap-2 text-xs" data-testid="hud">
          <div className="rounded-md border border-line bg-panel2 px-2.5 py-1.5 text-center"><div className="text-mute">{t.sim.score}</div><div className="readout text-base text-cool" data-testid="sim-score">{run.score}</div></div>
          <div className="rounded-md border border-line bg-panel2 px-2.5 py-1.5 text-center"><div className="text-mute">{t.sim.hints}</div><div className="readout text-base text-amber">{run.hints}</div></div>
          <div className="rounded-md border border-line bg-panel2 px-2.5 py-1.5 text-center"><div className="text-mute">{t.sim.mistakes}</div><div className="readout text-base text-hot">{run.mistakes}</div></div>
        </div>
      </div>

      <ol className="flex flex-wrap gap-1.5 mb-4" aria-label="phases">
        {phases.map((p, i) => (
          <li key={i} className={`chip !normal-case !tracking-normal !text-xs ${i < phase || run.finished ? 'bg-ok/15 text-ok' : i === phase ? 'bg-cool/20 text-cool ring-1 ring-cool/50' : 'bg-panel2 text-mute'}`}>
            {(i < phase || run.finished) ? <Ui name="check" size={12} /> : <span className="readout">{i + 1}</span>}
            <span>{L(p)}</span>
          </li>
        ))}
      </ol>

      {run.finished ? (
        <div className="rounded-lg border border-line bg-panel2 p-5 text-center stage-in" data-testid="sim-result">
          <Ring value={run.score} size={110} stroke={10} label={`${run.score}`} sub="/100" />
          <h4 className="text-2xl font-bold mt-3">{t.sim.complete}</h4>
          <p className="text-lg font-bold text-amber mt-1" data-testid="sim-grade">{gradeLabel}</p>
          <p className="text-sm text-mute mt-1">{t.sim.saved}</p>
          <button className="btn btn-cool mt-4" onClick={onReset} data-testid="sim-replay"><Ui name="reset" size={16} />{t.sim.replay}</button>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-line bg-panel2/60 p-2.5 sm:p-4">{children}</div>
          <div className="mt-3 min-h-[3rem]" aria-live="polite">
            {run.msg && <Feedback key={run.msg.k} tone={run.msg.tone}>{L(run.msg.text)}</Feedback>}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <button className="btn" onClick={() => run.hint(getHint())} data-testid="sim-hint"><Ui name="bulb" size={16} />{t.sim.hint}</button>
            <button className="btn" onClick={onReset} data-testid="sim-reset"><Ui name="reset" size={16} />{t.sim.reset}</button>
            <div className="flex-1" />
            <button className="btn btn-cool" disabled={!canNext} onClick={last ? run.finish : onNext} data-testid="sim-next">
              {last ? t.sim.finish : t.sim.next}<Ui name="arrowR" size={16} />
            </button>
          </div>
        </>
      )}
      <p className="text-[11px] text-mute mt-3">{t.sim.model}</p>
    </section>
  );
}
