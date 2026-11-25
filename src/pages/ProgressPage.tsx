import { Link } from 'react-router-dom';
import { STAGES } from '@/data/types';
import { UNITS, unitsOfTrack } from '@/data';
import { useT } from '@/translations';
import { actions, isDone, useProgress } from '@/store/progress';
import { Ui } from '@/components/icons';
import { Ring } from '@/components/ui/kit';

export default function ProgressPage() {
  const { t, L } = useT();
  const p = useProgress();
  const pct = (ids: number[]) => ids.length ? Math.round((ids.reduce((a, id) => a + STAGES.filter((s) => isDone(p, id, s)).length, 0) / (ids.length * STAGES.length)) * 100) : 0;
  const all = UNITS.map((u) => u.id);
  const trackADone = unitsOfTrack('A').every((u) => STAGES.every((s) => isDone(p, u.id, s)));
  const trackBDone = unitsOfTrack('B').every((u) => STAGES.every((s) => isDone(p, u.id, s)));
  const badges = [
    { k: 'start', on: p.xp > 0 }, { k: 'trackA', on: trackADone }, { k: 'trackB', on: trackBDone },
    { k: 'sim', on: Object.values(p.simBest).some((v) => v >= 85) }, { k: 'all', on: trackADone && trackBDone },
  ] as const;
  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-center gap-5">
        <div className="flex-1 min-w-[12rem]"><div className="kicker">{t.progress.overall}</div><h1 className="text-3xl sm:text-4xl font-bold" data-testid="progress-title">{t.progress.title}</h1></div>
        <div className="flex gap-4 items-center">
          <Ring value={pct(all)} size={84} data-testid="overall" />
          <div className="panel px-4 py-2 text-center"><div className="text-xs text-mute">{t.progress.xp}</div><div className="readout text-2xl text-amber" data-testid="xp-total">{p.xp}</div></div>
        </div>
      </header>

      <section className="grid gap-2 sm:grid-cols-5" aria-label={t.progress.badges}>
        {badges.map((b) => (
          <div key={b.k} className={`panel p-3 text-center ${b.on ? '!border-amber/60' : 'opacity-50'}`} data-badge={b.k} data-on={b.on ? '1' : '0'}>
            <Ui name="trophy" size={26} className={b.on ? 'text-amber mx-auto' : 'text-mute mx-auto'} />
            <div className="text-xs font-bold mt-1">{t.progress.badge[b.k]}</div>
          </div>
        ))}
      </section>

      <section className="panel overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]" data-testid="matrix">
          <caption className="text-left kicker p-3">{t.progress.matrix}</caption>
          <thead><tr className="text-mute text-xs border-b border-line">
            <th className="text-left p-3">{t.home.jobCard}</th>
            {STAGES.map((s) => <th key={s} className="p-2 font-bold">{t.stages[s].n}</th>)}
            <th className="p-2">{t.progress.sim}</th><th className="p-2">{t.progress.quiz}</th>
          </tr></thead>
          <tbody>
            {UNITS.map((u) => (
              <tr key={u.id} className="border-b border-line/60 last:border-0">
                <td className="p-3"><Link to={`/unit/${u.id}`} className="font-semibold hover:text-cool"><span className="readout text-cool mr-2">{String(u.id).padStart(2, '0')}</span>{L(u.title)}</Link></td>
                {STAGES.map((s) => (
                  <td key={s} className="p-2 text-center">
                    <Link to={`/unit/${u.id}/${s}`} aria-label={`${u.id} ${s}`} className={`inline-grid place-items-center w-7 h-7 rounded-md ${isDone(p, u.id, s) ? 'bg-ok text-bg' : 'bg-panel2 text-transparent border border-line'}`} data-cell={`${u.id}:${s}`} data-done={isDone(p, u.id, s) ? '1' : '0'}><Ui name="check" size={14} stroke={3} /></Link>
                  </td>
                ))}
                <td className="p-2 text-center readout text-cool">{p.simBest[u.id] !== undefined ? p.simBest[u.id] : '—'}</td>
                <td className="p-2 text-center readout text-amber">{p.quizBest[u.id] !== undefined ? `${p.quizBest[u.id]}%` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="flex justify-end">
        <button className="btn !text-hot" data-testid="reset-progress" onClick={() => { if (window.confirm(t.progress.confirmReset)) actions.reset(); }}><Ui name="reset" size={16} />{t.progress.reset}</button>
      </div>
    </div>
  );
}
