import { useState } from 'react';
import { bi, type Bi } from '@/data/types';
import { useT } from '@/translations';
import { SimFrame } from '@/components/simkit/SimFrame';
import { useRun } from '@/components/simkit/useRun';
import { QSteps, type Q } from '@/components/simkit/QSteps';
import { Slide } from '@/components/simkit/Choices';

const surgeX = (pr: number) => 12 + 14 * (pr - 1);
const chokeX = (pr: number) => 92 - 9 * (pr - 1);
const eta = (x: number, pr: number) => 78 - 0.012 * (x - 52) ** 2 - 14 * (pr - 2.3) ** 2;
const E = (rpm: number) => rpm / 2400;
const boost = (rpm: number, v: number) => 0.1 + 3.2 * E(rpm) * (1.15 - 0.01 * v);
const CONDS = [{ rpm: 1000, tgt: 1.3 }, { rpm: 1800, tgt: 1.7 }, { rpm: 2400, tgt: 1.6 }];

const IC: Q[] = [
  { q: bi('कंप्रेसर-आउट 150 °C, इंटरकूलर-आउट 54 °C, परिवेश 30 °C। प्रभावशीलता ε = ?', 'Compressor-out 150 °C, intercooler-out 54 °C, ambient 30 °C. Effectiveness ε = ?'),
    opts: [bi('0.64', '0.64'), bi('0.80', '0.80'), bi('0.36', '0.36'), bi('1.25', '1.25')], ans: 1,
    ok: bi('ε = (150−54)/(150−30) = 0.80।', 'ε = (150−54)/(150−30) = 0.80.'), bad: bi('सूत्र: ε = (T_in − T_out)/(T_in − T_amb)।', 'Formula: ε = (T_in − T_out)/(T_in − T_amb).') },
  { q: bi('एक साल बाद: आउट 84 °C (बाकी वही)। अब ε = ?', 'A year later: out 84 °C (rest unchanged). ε now = ?'),
    opts: [bi('0.44', '0.44'), bi('0.78', '0.78'), bi('0.55', '0.55'), bi('0.64', '0.64')], ans: 2,
    ok: bi('ε = 66/120 = 0.55 — गिरावट साफ़ है।', 'ε = 66/120 = 0.55 — a clear drop.'), bad: bi('(150−84)/(150−30) निकालें।', 'Work out (150−84)/(150−30).') },
  { q: bi('ε 0.80 से 0.55 हुई। सबसे संभावित कारण?', 'ε fell from 0.80 to 0.55. Most likely cause?'),
    opts: [bi('फिन/ट्यूब पर तेल-धूल जमा', 'Oil and dirt deposits on fins/tubes'), bi('ओवर-बूस्ट', 'Over-boost'), bi('ग़लत तेल ग्रेड', 'Wrong oil grade'), bi('केबिन-हीटर कम कूलेंट', 'Low cab-heater coolant')], ans: 0,
    ok: bi('सही — जमाव से ऊष्मा-स्थानांतरण घटता है।', 'Correct — deposits cut heat transfer.'), bad: bi('जो चीज़ ऊष्मा-विनिमय घटाए वह चुनें।', 'Pick the thing that reduces heat exchange.') },
];

/** Unit 6 — compressor map, VGT vane tuning, intercooler effectiveness. */
export default function Sim06CompressorMap() {
  const { s, L } = useT();
  const run = useRun(6, 8);
  const [phase, setPhase] = useState(0);
  const [flow, setFlow] = useState(40);
  const [pr, setPr] = useState(1.6);
  const [locked0, setLocked0] = useState(false);
  const [ci, setCi] = useState(0);
  const [vane, setVane] = useState(50);
  const [vOk, setVOk] = useState([false, false, false]);
  const [rk, setRk] = useState(0);
  const [d2, setD2] = useState(false);

  const surge = flow < surgeX(pr), choke = flow > chokeX(pr), ef = eta(flow, pr);
  const state: Bi = surge ? bi('सर्ज क्षेत्र!', 'Surge zone!') : choke ? bi('चोक क्षेत्र!', 'Choke zone!') : ef < 72 ? bi('कम दक्षता', 'Low efficiency') : bi('दक्ष क्षेत्र', 'Efficient zone');
  const X = (x: number) => 30 + x * 2.6, Y = (p: number) => 180 - (p - 1) * 64;
  const lockPoint = () => {
    if (locked0) return;
    if (surge) run.miss(bi('सर्ज: कंप्रेसर में प्रवाह-उलटाव — दाब बढ़ाने पर प्रवाह भी बढ़ाएँ।', 'Surge: flow reversal — raise flow when pressure is high.'));
    else if (choke) run.miss(bi('चोक: प्रवाह सीमा पर, दक्षता गिरती है।', 'Choke: flow is at its limit and efficiency collapses.'));
    else if (ef < 72) run.miss(bi('सुरक्षित है पर दक्षता 72% से कम — द्वीप के केंद्र की ओर जाएँ।', 'Safe but efficiency is under 72% — move toward the island centre.'));
    else { setLocked0(true); run.add(2, bi('सही बिंदु: सर्ज व चोक के बीच, उच्च-दक्षता द्वीप के अंदर।', 'Right point: between surge and choke, inside the high-efficiency island.')); }
  };
  const cond = CONDS[ci], b = boost(cond.rpm, vane);
  const lockVane = () => {
    if (vOk[ci]) return;
    if (Math.abs(b - cond.tgt) <= 0.08) {
      const n = vOk.map((v, i) => (i === ci ? true : v)); setVOk(n); run.add(1, bi('बूस्ट लक्ष्य पर।', 'Boost on target.'));
      const nx = n.findIndex((v) => !v); if (nx >= 0) setCi(nx);
    } else run.miss(bi(b < cond.tgt ? 'बूस्ट कम — वेन और बंद करें (कम खुली)।' : 'बूस्ट ज़्यादा — वेन और खोलें।', b < cond.tgt ? 'Boost low — close the vanes more.' : 'Boost high — open the vanes more.'));
  };
  const reset = () => { run.reset(); setPhase(0); setFlow(40); setPr(1.6); setLocked0(false); setCi(0); setVane(50); setVOk([false, false, false]); setD2(false); setRk((k) => k + 1); };
  const canNext = phase === 0 ? locked0 : phase === 1 ? vOk.every(Boolean) : d2;
  const phases = [bi('कंप्रेसर मैप', 'Compressor map'), bi('VGT वेन ट्यूनिंग', 'VGT vane tuning'), bi('इंटरकूलर ε', 'Intercooler ε')];
  const hints = [bi('द्वीप का केंद्र लगभग प्रवाह 52%, PR 2.3 पर है।', 'The island centre is near flow 52%, PR 2.3.'),
    bi('कम rpm पर वेन ज़्यादा बंद (≈25%), उच्च rpm पर ज़्यादा खुली (≈68%)।', 'At low rpm the vanes are well closed (≈25%), at high rpm more open (≈68%).'),
    bi('ε = (T_in − T_out)/(T_in − T_amb)।', 'ε = (T_in − T_out)/(T_in − T_amb).')];
  const ell = (lvl: number) => ({ rx: Math.sqrt(lvl / 0.012) * 2.6, ry: Math.sqrt(lvl / 14) * 64 });

  return (
    <SimFrame run={run} phases={phases} phase={phase} canNext={canNext} onNext={() => setPhase(phase + 1)} getHint={() => hints[phase]} onReset={reset}
      title={bi('टर्बो टेस्ट-बेंच', 'Turbo test bench')}
      intro={bi('कंप्रेसर मैप पर सर्ज और चोक से बचते हुए सही बिंदु चुनें, VGT वेन से तीन गति पर बूस्ट साधें और इंटरकूलर की प्रभावशीलता निकालें।', 'Pick a point on the compressor map that avoids surge and choke, tune VGT vanes for boost at three speeds, and calculate intercooler effectiveness.')}>
      {phase === 0 && (
        <div className="grid md:grid-cols-2 gap-4" data-testid="ph-map">
          <svg viewBox="0 0 300 200" className="w-full rounded-md border border-line bg-bg" role="img" aria-label="compressor map">
            <polygon points={`${X(surgeX(1))},${Y(1)} ${X(surgeX(3.5))},${Y(3.5)} 30,${Y(3.5)} 30,${Y(1)}`} fill="rgb(var(--hot) / .14)" />
            <polygon points={`${X(chokeX(1))},${Y(1)} ${X(chokeX(3.5))},${Y(3.5)} 290,${Y(3.5)} 290,${Y(1)}`} fill="rgb(var(--hot) / .14)" />
            <polyline points={[1, 3.5].map((p) => `${X(surgeX(p))},${Y(p)}`).join(' ')} stroke="rgb(var(--hot))" strokeWidth="2" strokeDasharray="5 3" fill="none" />
            <polyline points={[1, 3.5].map((p) => `${X(chokeX(p))},${Y(p)}`).join(' ')} stroke="rgb(var(--hot))" strokeWidth="2" strokeDasharray="5 3" fill="none" />
            {[6, 3, 1.2].map((l, i) => <ellipse key={i} cx={X(52)} cy={Y(2.3)} rx={ell(l).rx} ry={ell(l).ry} fill="rgb(var(--ok) / .12)" stroke="rgb(var(--ok) / .6)" />)}
            <circle cx={X(flow)} cy={Y(pr)} r="6" fill="rgb(var(--amber))" stroke="rgb(var(--bg))" strokeWidth="2" data-testid="map-dot" />
            <text x="34" y="14" className="fill-mute" fontSize="9">{s('सर्ज', 'SURGE')}</text><text x="262" y="14" className="fill-mute" fontSize="9">{s('चोक', 'CHOKE')}</text>
            <text x="150" y="196" textAnchor="middle" className="fill-mute" fontSize="9">{s('वायु-प्रवाह →', 'Air flow →')}</text>
            <text x="8" y="100" className="fill-mute" fontSize="9" transform="rotate(-90 8 100)">{s('दाब अनुपात', 'Pressure ratio')}</text>
          </svg>
          <div className="grid gap-3 content-start">
            <Slide id="flow" label={s('वायु-प्रवाह', 'Air flow')} min={5} max={98} value={flow} onChange={setFlow} unit=" %" disabled={locked0} />
            <Slide id="pr" label={s('दाब अनुपात', 'Pressure ratio')} min={1} max={3.5} step={0.05} value={pr} onChange={setPr} disabled={locked0} />
            <div className="rounded-md border border-line bg-panel p-2 text-sm flex justify-between"><span>{L(state)}</span><span className="readout" data-testid="eta">η {ef.toFixed(0)} %</span></div>
            <button className="btn btn-amber" onClick={lockPoint} disabled={locked0} data-testid="lock-point">{s('यह ऑपरेटिंग-बिंदु लॉक करें', 'Lock this operating point')}</button>
          </div>
        </div>
      )}
      {phase === 1 && (
        <div className="grid gap-3" data-testid="ph-vgt">
          <div className="flex gap-2">{CONDS.map((c, i) => <button key={i} data-cond={i} onClick={() => setCi(i)} className={`btn !min-h-0 !py-1.5 ${i === ci ? '!border-cool' : ''}`}>{c.rpm} rpm{vOk[i] ? ' ✓' : ''}</button>)}</div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-3"><Slide id="vane" label={s('वेन खुलाव', 'Vane opening')} min={0} max={100} value={vane} onChange={setVane} unit=" %" disabled={vOk[ci]} />
              <button className="btn btn-amber" onClick={lockVane} disabled={vOk[ci]} data-testid="lock-vane">{s('बूस्ट लॉक करें', 'Lock boost')}</button></div>
            <div className="rounded-md border border-line bg-panel p-3 grid gap-1 text-sm">
              <div className="flex justify-between"><span className="text-mute">{s('लक्ष्य बूस्ट', 'Target boost')}</span><span className="readout text-amber">{cond.tgt.toFixed(2)} bar</span></div>
              <div className="flex justify-between"><span className="text-mute">{s('वास्तविक बूस्ट', 'Actual boost')}</span><span className={`readout ${Math.abs(b - cond.tgt) <= 0.08 ? 'text-ok' : 'text-hot'}`} data-testid="boost">{b.toFixed(2)} bar</span></div>
              <div className="text-xs text-mute">{s('सहनसीमा ± 0.08 bar', 'Tolerance ± 0.08 bar')}</div></div>
          </div>
        </div>
      )}
      {phase === 2 && <QSteps key={rk} qs={IC} onRight={(t) => run.add(1, t)} onWrong={(t) => run.miss(t)} onDone={() => setD2(true)} />}
    </SimFrame>
  );
}
