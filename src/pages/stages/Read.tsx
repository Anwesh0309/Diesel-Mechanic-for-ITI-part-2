import type { Unit } from '@/data/types';
import { useT } from '@/translations';
import { actions, isDone, useProgress } from '@/store/progress';
import { Ui } from '@/components/icons';

export default function Read({ unit }: { unit: Unit }) {
  const { t, L, lang } = useT();
  const p = useProgress();
  const done = isDone(p, unit.id, 'read');
  const val = (v: string | { hi: string; en: string }) => (typeof v === 'string' ? v : v[lang]);
  return (
    <div className="grid gap-6 stage-in" data-testid="stage-read">
      <div className="grid gap-4">
        {unit.read.sections.map((s, i) => (
          <article key={i} className="panel p-4 sm:p-5">
            <h3 className="text-xl font-bold mb-2"><span className="readout text-cool mr-2">{String(i + 1).padStart(2, '0')}</span>{L(s.h)}</h3>
            <p className="leading-relaxed text-[15px]">{L(s.p)}</p>
            {s.bullets && (
              <ul className="mt-3 grid gap-1.5">
                {s.bullets.map((b, j) => <li key={j} className="flex gap-2 text-sm"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber shrink-0" />{L(b)}</li>)}
              </ul>
            )}
          </article>
        ))}
      </div>

      {unit.read.formulas && (
        <section>
          <h3 className="kicker mb-2">{t.unit.formulas}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {unit.read.formulas.map((f, i) => (
              <div key={i} className="panel p-4 border-l-4 !border-l-amber">
                <div className="text-sm text-mute">{L(f.name)}</div>
                <div className="readout text-lg sm:text-xl text-amber my-1 break-words">{f.expr}</div>
                <div className="text-xs text-mute">{L(f.note)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="kicker mb-2">{t.unit.facts}</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {unit.read.facts.map((f, i) => (
            <div key={i} className="panel px-4 py-3 flex items-center justify-between gap-3">
              <span className="text-sm text-mute">{L(f.label)}</span>
              <span className="readout text-cool text-right">{val(f.value)}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="kicker mb-2">{t.unit.terms}</h3>
        <dl className="grid gap-2 sm:grid-cols-2">
          {unit.read.terms.map((x, i) => (
            <div key={i} className="panel px-4 py-3"><dt className="font-bold text-ink">{L(x.t)}</dt><dd className="text-sm text-mute mt-0.5">{L(x.d)}</dd></div>
          ))}
        </dl>
      </section>

      <div className="flex justify-center">
        {done ? (
          <div className="chip bg-ok/15 text-ok !text-sm !normal-case px-4 py-2" data-testid="read-done"><Ui name="check" size={16} />{t.unit.readDone}</div>
        ) : (
          <button className="btn btn-cool" data-testid="mark-read" onClick={() => actions.completeStage(unit.id, 'read', 10)}><Ui name="check" size={16} />{t.unit.markRead}</button>
        )}
      </div>
    </div>
  );
}
