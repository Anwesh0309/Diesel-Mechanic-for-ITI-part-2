import { useEffect } from 'react';
import type { Unit } from '@/data/types';
import { useT } from '@/translations';
import { actions, useProgress } from '@/store/progress';
import { Feedback } from '@/components/ui/kit';
import { sound } from '@/lib/sound';

export default function Apply({ unit }: { unit: Unit }) {
  const { t, L } = useT();
  const p = useProgress();
  const answered = unit.apply.filter((_, i) => p.applied[`${unit.id}:${i}`] !== undefined).length;
  useEffect(() => { if (answered === unit.apply.length) actions.completeStage(unit.id, 'apply', 20); }, [answered, unit]);
  return (
    <div className="grid gap-4 stage-in" data-testid="stage-apply">
      <p className="text-sm text-mute max-w-2xl">{t.unit.applyHelp}</p>
      {unit.apply.map((c, ci) => {
        const chosen = p.applied[`${unit.id}:${ci}`];
        const has = chosen !== undefined;
        return (
          <article key={ci} className="panel p-4 sm:p-5" data-case={ci}>
            <div className="hazard h-1 rounded mb-3 opacity-80" />
            <div className="kicker mb-1">{t.unit.caseWord} {ci + 1} · {t.home.jobCard} {String(unit.id).padStart(2, '0')}</div>
            <h3 className="text-xl font-bold mb-1">{L(c.title)}</h3>
            <p className="text-[15px] leading-relaxed mb-3">{L(c.situation)}</p>
            <div className="text-xs font-bold uppercase tracking-wider text-mute mb-2">{t.unit.yourChoice}</div>
            <div className="grid gap-2">
              {c.o.map((o, oi) => {
                const sel = chosen === oi; const isRight = c.a === oi;
                const cls = has ? (isRight ? 'border-ok bg-ok/10' : sel ? 'border-hot bg-hot/10' : 'border-line opacity-70') : 'border-line hover:border-cool/60';
                return (
                  <button key={oi} data-opt={oi} onClick={() => {
                    actions.setApplied(unit.id, ci, oi);
                    if (oi === c.a) sound.success();
                    else sound.error();
                  }}
                    className={`text-left flex gap-3 items-start rounded-md border px-3 py-2.5 text-sm transition ${cls}`}>
                    <span className="readout w-6 h-6 grid place-items-center rounded-full bg-panel2 text-xs shrink-0">{'ABCD'[oi]}</span><span>{L(o)}</span>
                  </button>
                );
              })}
            </div>
            {has && <div className="mt-3"><Feedback tone={chosen === c.a ? 'ok' : 'bad'}><b>{chosen === c.a ? t.unit.correct : t.unit.wrong}.</b> {L(c.why)}</Feedback></div>}
          </article>
        );
      })}
    </div>
  );
}
