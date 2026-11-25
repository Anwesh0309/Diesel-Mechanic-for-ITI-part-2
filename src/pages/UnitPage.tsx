import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { STAGES, type Stage } from '@/data/types';
import { getUnit } from '@/data';
import { useT } from '@/translations';
import { isDone, useProgress } from '@/store/progress';
import { DieselIcon, STAGE_ICON, Ui } from '@/components/icons';
import { Ring } from '@/components/ui/kit';
import Watch from './stages/Watch';
import Read from './stages/Read';
import Practice from './stages/Practice';
import Simulate from './stages/Simulate';
import Quiz from './stages/Quiz';
import Apply from './stages/Apply';
import Review from './stages/Review';

export default function UnitPage() {
  const { id, stage } = useParams();
  const { t, L } = useT();
  const p = useProgress();
  const nav = useNavigate();
  const unit = getUnit(Number(id));
  if (!unit) return <div className="panel p-8 text-center"><p className="mb-3">{t.unit.notFound}</p><Link className="btn btn-cool" to="/">{t.nav.home}</Link></div>;
  if (stage && !STAGES.includes(stage as Stage)) return <Navigate to={`/unit/${unit.id}`} replace />;

  const cur: Stage = (stage as Stage) ?? 'watch';
  const idx = STAGES.indexOf(cur);
  const doneCount = STAGES.filter((s) => isDone(p, unit.id, s)).length;
  const firstOpen = STAGES.find((s) => !isDone(p, unit.id, s));
  const go = (s: Stage) => nav(`/unit/${unit.id}/${s}`);

  const body = { watch: Watch, read: Read, practice: Practice, simulate: Simulate, quiz: Quiz, apply: Apply, review: Review }[cur];
  const Body = body;

  return (
    <div className="grid gap-5">
      <div>
        <Link to={`/track/${unit.track}`} className="inline-flex items-center gap-1 text-sm text-mute hover:text-cool"><Ui name="chevL" size={15} />{t.unit.back}</Link>
      </div>

      <header className="panel panel-rivets p-4 sm:p-5 pt-6 flex flex-wrap items-center gap-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-cool/15 text-cool grid place-items-center shrink-0"><DieselIcon name={unit.icon} size={34} /></div>
        <div className="min-w-0 flex-1">
          <div className="kicker">{t.home.jobCard} {String(unit.id).padStart(2, '0')} · {t.part[unit.track].name}</div>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight" data-testid="unit-title">{L(unit.title)}</h1>
          <p className="text-sm text-mute mt-0.5">{L(unit.tagline)}</p>
        </div>
        <Ring value={(doneCount / STAGES.length) * 100} size={64} label={`${doneCount}/7`} />
      </header>

      <div className="grid gap-5 lg:grid-cols-[210px_minmax(0,1fr)] lg:items-start">
        <nav aria-label="stages" className="-mx-3 px-3 lg:mx-0 lg:px-0 overflow-x-auto lg:overflow-visible lg:sticky lg:top-20">
          <div className="hidden lg:block kicker !text-mute mb-2">{t.unit.stageList}</div>
          <ol className="flex gap-1.5 min-w-max lg:min-w-0 lg:flex-col lg:gap-0 lg:relative">
            <span className="hidden lg:block absolute left-[19px] top-5 bottom-5 w-px bg-line" aria-hidden />
            {STAGES.map((s, i) => {
              const d = isDone(p, unit.id, s); const active = s === cur;
              return (
                <li key={s} className="lg:relative">
                  <Link to={`/unit/${unit.id}/${s}`} data-stage={s} aria-current={active ? 'step' : undefined}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border lg:border-transparent text-sm font-bold transition whitespace-nowrap lg:my-0.5
                    ${active ? 'bg-cool text-bg border-cool lg:border-cool' : d ? 'border-ok/50 bg-ok/10 text-ok' : s === firstOpen ? 'border-cool/60 text-ink animate-pulseRing' : 'border-line bg-panel text-mute hover:text-ink lg:bg-transparent'}`}>
                    <span className={`relative grid place-items-center w-6 h-6 rounded-full shrink-0 ${active ? 'bg-bg/20' : d ? 'bg-ok/20' : 'bg-panel2'}`}><Ui name={d && !active ? 'check' : STAGE_ICON[s]} size={14} /></span>
                    <span className="leading-tight"><span className="readout text-[10px] opacity-70 mr-1">{i + 1}</span>{t.stages[s].n}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="grid gap-5 min-w-0">
          {cur === 'watch' && (
            <div className="grid gap-4 md:grid-cols-2">
              <section className="panel p-4"><h2 className="kicker mb-2 !text-base">{t.unit.objectives}</h2>
                <ul className="grid gap-1.5 text-sm">{unit.objectives.map((o, i) => <li key={i} className="flex gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cool shrink-0" />{L(o)}</li>)}</ul></section>
              <section className="panel p-4"><h2 className="kicker mb-2 !text-base">{t.unit.topics}</h2>
                <ul className="flex flex-wrap gap-1.5">{unit.topics.map((o, i) => <li key={i} className="chip bg-panel2 text-ink !normal-case !tracking-normal !text-xs">{L(o)}</li>)}</ul></section>
            </div>
          )}

          <div key={`${unit.id}-${cur}`}><Body unit={unit} /></div>

          <div className="flex justify-between gap-2 pt-1">
            <button className="btn" disabled={idx === 0} onClick={() => go(STAGES[idx - 1])} data-testid="prev-stage"><Ui name="chevL" size={16} />{t.unit.prevStage}</button>
            {idx < STAGES.length - 1
              ? <button className="btn btn-cool" onClick={() => go(STAGES[idx + 1])} data-testid="next-stage">{t.unit.nextStage}<Ui name="chevR" size={16} /></button>
              : <span />}
          </div>
        </div>
      </div>
    </div>
  );
}
