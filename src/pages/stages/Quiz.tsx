import { useState } from 'react';
import type { Unit } from '@/data/types';
import { useT } from '@/translations';
import { actions, useProgress } from '@/store/progress';
import { Feedback, Ring } from '@/components/ui/kit';
import { sound } from '@/lib/sound';

export default function Quiz({ unit }: { unit: Unit }) {
  const { t, L } = useT();
  const p = useProgress();
  const [ans, setAns] = useState<(number | null)[]>(() => unit.quiz.map(() => null));
  const [done, setDone] = useState(false);
  const [warn, setWarn] = useState(false);
  const total = unit.quiz.length;
  const right = ans.filter((a, i) => a === unit.quiz[i].a).length;
  const pct = Math.round((right / total) * 100);
  const passed = pct >= 60;

  const submit = () => {
    if (ans.some((a) => a === null)) { setWarn(true); sound.error(); return; }
    setWarn(false); setDone(true);
    actions.recordQuiz(unit.id, pct);
    if (pct >= 60) { actions.completeStage(unit.id, 'quiz', 20); sound.finish(); }
    else { sound.error(); }
  };
  const retry = () => { sound.relay(); setAns(unit.quiz.map(() => null)); setDone(false); setWarn(false); };

  return (
    <div className="grid gap-4 stage-in" data-testid="stage-quiz">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-bold">{t.unit.quizTitle}</h3>
        <div className="flex gap-2 text-xs"><span className="chip bg-panel2 text-mute">{t.unit.passMark}</span>
          {p.quizBest[unit.id] !== undefined && <span className="chip bg-amber/15 text-amber">{t.unit.best}: {p.quizBest[unit.id]}%</span>}</div>
      </div>

      {done && (
        <div className="panel p-4 flex items-center gap-4" data-testid="quiz-result">
          <Ring value={pct} size={84} />
          <div>
            <div className="text-lg font-bold">{t.unit.result}: <span data-testid="quiz-score">{right}/{total}</span> ({pct}%)</div>
            <div className={passed ? 'text-ok font-semibold' : 'text-hot font-semibold'}>{passed ? t.unit.passed : t.unit.notPassed}</div>
          </div>
        </div>
      )}

      {unit.quiz.map((q, qi) => (
        <fieldset key={qi} className="panel p-4" data-q={qi}>
          <legend className="sr-only">{t.unit.question} {qi + 1}</legend>
          <div className="kicker mb-1">{t.unit.question} {qi + 1} {t.unit.of} {total}</div>
          <p className="font-semibold text-[15px] mb-3">{L(q.q)}</p>
          <div className="grid gap-2">
            {q.o.map((o, oi) => {
              const sel = ans[qi] === oi; const isRight = q.a === oi;
              const cls = done
                ? isRight ? 'border-ok bg-ok/10' : sel ? 'border-hot bg-hot/10' : 'border-line opacity-70'
                : sel ? 'border-cool bg-cool/10' : 'border-line hover:border-cool/60';
              return (
                <button key={oi} disabled={done} data-opt={oi} aria-pressed={sel}
                  onClick={() => setAns((a) => a.map((v, i) => (i === qi ? oi : v)))}
                  className={`text-left flex gap-3 items-start rounded-md border px-3 py-2.5 text-sm transition ${cls}`}>
                  <span className="readout w-6 h-6 grid place-items-center rounded-full bg-panel2 text-xs shrink-0">{'ABCD'[oi]}</span>
                  <span>{L(o)}</span>
                </button>
              );
            })}
          </div>
          {done && <div className="mt-3"><Feedback tone={ans[qi] === q.a ? 'ok' : 'bad'}><b>{ans[qi] === q.a ? t.unit.correct : t.unit.wrong}.</b> {L(q.why)}</Feedback></div>}
        </fieldset>
      ))}

      {warn && !done && <Feedback tone="bad">{t.unit.answerAll}</Feedback>}
      <div className="flex justify-end gap-2">
        {done ? <button className="btn btn-cool" data-testid="quiz-retry" onClick={retry}>{t.unit.retry}</button>
          : <button className="btn btn-cool" data-testid="quiz-submit" onClick={submit}>{t.unit.submit}</button>}
      </div>
    </div>
  );
}
