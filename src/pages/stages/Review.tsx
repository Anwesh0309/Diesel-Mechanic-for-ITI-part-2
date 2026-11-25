import { Link } from 'react-router-dom';
import type { Unit } from '@/data/types';
import { STAGES } from '@/data/types';
import { useT } from '@/translations';
import { actions, isDone, useProgress } from '@/store/progress';
import { Ui } from '@/components/icons';
import { Ring } from '@/components/ui/kit';
import { getUnit } from '@/data';

export default function Review({ unit }: { unit: Unit }) {
  const { t, L } = useT();
  const p = useProgress();
  const others = STAGES.filter((s) => s !== 'review');
  const ready = others.every((s) => isDone(p, unit.id, s));
  const signed = isDone(p, unit.id, 'review');
  const next = getUnit(unit.id + 1);
  return (
    <div className="grid gap-5 stage-in" data-testid="stage-review">
      <section className="panel p-4 sm:p-5">
        <h3 className="kicker mb-3">{t.unit.takeaways}</h3>
        <ul className="grid gap-2">
          {unit.review.map((r, i) => <li key={i} className="flex gap-3 text-[15px]"><Ui name="check" size={18} className="text-ok mt-0.5 shrink-0" />{L(r)}</li>)}
        </ul>
      </section>
      <section className="panel p-4 sm:p-5 border-l-4 !border-l-amber">
        <h3 className="kicker !text-amber mb-3">{t.unit.safety}</h3>
        <ul className="grid gap-2">
          {unit.safety.map((r, i) => <li key={i} className="flex gap-3 text-sm"><Ui name="alert" size={17} className="text-amber mt-0.5 shrink-0" />{L(r)}</li>)}
        </ul>
      </section>
      <section className="panel p-4 sm:p-5">
        <h3 className="kicker mb-3">{t.unit.performance}</h3>
        <div className="flex flex-wrap items-center gap-6">
          <div className="text-center"><Ring value={p.simBest[unit.id] ?? 0} label={p.simBest[unit.id] !== undefined ? `${p.simBest[unit.id]}` : '—'} sub={t.stages.simulate.n} /></div>
          <div className="text-center"><Ring value={p.quizBest[unit.id] ?? 0} label={p.quizBest[unit.id] !== undefined ? `${p.quizBest[unit.id]}%` : '—'} sub={t.stages.quiz.n} /></div>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            {others.map((s) => (
              <li key={s} className={`flex items-center gap-2 ${isDone(p, unit.id, s) ? 'text-ok' : 'text-mute'}`}>
                <Ui name={isDone(p, unit.id, s) ? 'check' : 'x'} size={14} />{t.stages[s].n}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {signed ? (
          <div className="chip bg-ok/15 text-ok !text-sm !normal-case px-4 py-2" data-testid="signed"><Ui name="trophy" size={16} />{t.unit.unitComplete}</div>
        ) : (
          <button className="btn btn-amber" data-testid="signoff" disabled={!ready} onClick={() => actions.completeStage(unit.id, 'review', 50)}><Ui name="trophy" size={16} />{t.unit.completeUnit}</button>
        )}
        {!signed && !ready && <span className="text-xs text-mute">{t.unit.needStages}</span>}
        {signed && next && <Link className="btn btn-cool" to={`/unit/${next.id}`} data-testid="next-unit">{t.unit.nextUnit}<Ui name="arrowR" size={16} /></Link>}
        {signed && !next && <Link className="btn btn-cool" to="/progress">{t.nav.progress}<Ui name="arrowR" size={16} /></Link>}
      </div>
    </div>
  );
}
