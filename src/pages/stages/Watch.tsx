import { useEffect, useState } from 'react';
import type { Unit } from '@/data/types';
import { useT } from '@/translations';
import { actions } from '@/store/progress';
import { Ui } from '@/components/icons';
import { Scene } from '@/components/scenes';

export default function Watch({ unit }: { unit: Unit }) {
  const { t, L } = useT();
  const total = unit.watch.length;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [seen, setSeen] = useState<number[]>([0]);

  useEffect(() => { setSeen((s) => (s.includes(step) ? s : [...s, step])); }, [step]);
  useEffect(() => { if (seen.length >= total) actions.completeStage(unit.id, 'watch', 10); }, [seen, total, unit.id]);
  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => { if (step < total - 1) setStep(step + 1); else setPlaying(false); }, 6500);
    return () => clearTimeout(id);
  }, [playing, step, total]);

  const cur = unit.watch[step];
  return (
    <div className="grid gap-4 stage-in" data-testid="stage-watch">
      <div className="panel panel-rivets overflow-hidden">
        <div className="p-2 sm:p-4 bg-panel2/50"><Scene unit={unit.id} step={step} /></div>
      </div>
      <div className="panel p-4 sm:p-5" aria-live="polite">
        <div className="kicker mb-1" data-testid="watch-step">{t.unit.step} {step + 1} {t.unit.of} {total}</div>
        <h3 className="text-xl font-bold mb-1">{L(cur.title)}</h3>
        <p className="leading-relaxed text-[15px]">{L(cur.text)}</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button className="btn" data-testid="watch-prev" disabled={step === 0} onClick={() => { setPlaying(false); setStep(step - 1); }}><Ui name="chevL" size={16} />{t.unit.prev}</button>
        <div className="flex items-center gap-2">
          {unit.watch.map((_, i) => (
            <button key={i} aria-label={`${t.unit.step} ${i + 1}`} onClick={() => { setPlaying(false); setStep(i); }}
              className={`h-3 rounded-full transition-all ${i === step ? 'w-8 bg-cool' : seen.includes(i) ? 'w-3 bg-ok' : 'w-3 bg-line'}`} />
          ))}
        </div>
        <div className="flex gap-2">
          <button className="btn" data-testid="watch-play" onClick={() => { if (!playing && step === total - 1) setStep(0); setPlaying(!playing); }}>
            <Ui name={playing ? 'pause' : 'play'} size={16} />{playing ? t.unit.pause : t.unit.play}
          </button>
          <button className="btn btn-cool" data-testid="watch-next" disabled={step === total - 1} onClick={() => { setPlaying(false); setStep(step + 1); }}>{t.unit.next}<Ui name="chevR" size={16} /></button>
        </div>
      </div>
    </div>
  );
}
