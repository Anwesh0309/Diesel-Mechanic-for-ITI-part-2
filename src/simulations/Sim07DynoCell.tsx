import { useRef, useState } from 'react';
import { bi } from '@/data/types';
import { useT } from '@/translations';
import { SimFrame } from '@/components/simkit/SimFrame';
import { useRun } from '@/components/simkit/useRun';
import { QSteps, type Q } from '@/components/simkit/QSteps';
import { useTicker } from '@/components/simkit/useTicker';

const T0 = (n: number) => 1150 - 0.0004 * (n - 1500) ** 2;
const FAULTS = [(n: number) => T0(n) * (1 - 0.28 * Math.max(0, (1700 - n) / 700)), (n: number) => T0(n) * (1 - 0.35 * Math.max(0, (n - 1800) / 600)), (n: number) => T0(n) * 0.82];
const RPMS = Array.from({ length: 29 }, (_, i) => 1000 + i * 50);
const pw = (t: number, n: number) => (t * n) / 9549;

function Curve({ f, h = 120 }: { f?: (n: number) => number; h?: number }) {
  const X = (n: number) => 8 + ((n - 1000) / 1400) * 284, Y = (t: number) => h - 6 - (t / 1300) * (h - 14);
  return (
    <svg viewBox={`0 0 300 ${h}`} className="w-full rounded-md border border-line bg-bg" role="img" aria-label="torque curve">
      <polyline points={RPMS.map((n) => `${X(n)},${Y(T0(n))}`).join(' ')} fill="none" stroke="rgb(var(--mute))" strokeDasharray="4 3" strokeWidth="1.5" />
      {f && <polyline points={RPMS.map((n) => `${X(n)},${Y(f(n))}`).join(' ')} fill="none" stroke="rgb(var(--amber))" strokeWidth="2.5" />}
    </svg>
  );
}

/** Unit 7 — dyno cell: power/torque arithmetic, live sweep, curve-shape diagnosis, BSFC. */
export default function Sim07DynoCell() {
  const { s } = useT();
  const run = useRun(7, 9);
  const [phase, setPhase] = useState(0);
  const [rk, setRk] = useState(0);
  const [sweeping, setSweeping] = useState(false);
  const [rpm, setRpm] = useState(1000);
  const [swept, setSwept] = useState(false);
  const [pts, setPts] = useState<[number, number][]>([]);
  const [d0, setD0] = useState(false); const [d1, setD1] = useState(false); const [d2, setD2] = useState(false); const [d3, setD3] = useState(false);
  const x = useRef({ n: 1000, acc: 0 });

  useTicker(sweeping, (dt) => {
    const c = x.current; c.n = Math.min(2400, c.n + 220 * dt); c.acc += dt;
    if (c.acc > 0.1 || c.n >= 2400) { c.acc = 0; const n = Math.round(c.n); setRpm(n); setPts((p) => [...p, [n, T0(n)]]); }
    if (c.n >= 2400) { setSweeping(false); setSwept(true); }
  });

  const P0: Q[] = [
    { q: bi('टॉर्क 850 N·m, 2200 rpm। शक्ति P = ?', 'Torque 850 N·m at 2200 rpm. Power P = ?'), opts: [bi('195.8 kW', '195.8 kW'), bi('18.7 kW', '18.7 kW'), bi('391.6 kW', '391.6 kW'), bi('99.7 kW', '99.7 kW')], ans: 0,
      ok: bi('P = 850×2200/9549 = 195.8 kW।', 'P = 850×2200/9549 = 195.8 kW.'), bad: bi('P = T × N / 9549 (kW)।', 'P = T × N / 9549 (kW).') },
    { q: bi('इंजन 220 kW पर 2100 rpm। टॉर्क T = ?', 'Engine makes 220 kW at 2100 rpm. Torque T = ?'), opts: [bi('1000 N·m', '1000 N·m'), bi('460 N·m', '460 N·m'), bi('2200 N·m', '2200 N·m'), bi('105 N·m', '105 N·m')], ans: 0,
      ok: bi('T = 220×9549/2100 ≈ 1000 N·m।', 'T = 220×9549/2100 ≈ 1000 N·m.'), bad: bi('T = P × 9549 / N।', 'T = P × 9549 / N.') },
  ];
  const P1: Q[] = [
    { q: bi('वक्र में अधिकतम टॉर्क किस rpm पर?', 'At which rpm is peak torque?'), opts: [bi('1200', '1200'), bi('1500', '1500'), bi('1800', '1800'), bi('2100', '2100')], ans: 1,
      ok: bi('सही — टॉर्क शिखर 1500 rpm पर।', 'Correct — torque peaks at 1500 rpm.'), bad: bi('टॉर्क-वक्र का सबसे ऊँचा बिंदु देखें।', 'Look at the highest point of the torque curve.'),
      note: <div className="grid gap-1"><Curve f={T0} h={120} /><div className="text-xs text-mute">{s('P = T×N/9549 से भी जाँचें: शक्ति-शिखर टॉर्क-शिखर से ऊँचे rpm पर आता है।', 'Check with P = T×N/9549: peak power comes at a higher rpm than peak torque.')}</div></div> },
    { q: bi('अधिकतम शक्ति लगभग किस rpm पर?', 'Roughly at which rpm is peak power?'), opts: [bi('1500', '1500'), bi('1800', '1800'), bi('2100', '2100'), bi('2400', '2400')], ans: 2,
      ok: bi('सही — 2100 rpm पर ≈ 221 kW।', 'Correct — ≈ 221 kW at 2100 rpm.'), bad: bi('हर rpm पर T×N निकालें; 2400 पर टॉर्क गिर चुका है।', 'Work out T×N at each rpm; torque has already dropped by 2400.') },
  ];
  const cap = (a: string, b: string) => <div className="grid gap-1"><div className="text-xs text-mute">{s(a, b)}</div></div>;
  const P2: Q[] = [
    { q: bi('माप (नारंगी) सामान्य (धूसर) से केवल कम rpm पर नीचे है। खराबी का क्षेत्र?', 'Measured (orange) is below normal (grey) only at low rpm. Fault area?'), opts: [bi('बूस्ट/हवा-पथ (टर्बो, रिसाव)', 'Boost/air path (turbo, leaks)'), bi('ईंधन आपूर्ति (पंप/रेल/इंजेक्टर)', 'Fuel delivery (pump/rail/injectors)'), bi('यांत्रिक हानि (कम्प्रेशन, रिंग)', 'Mechanical loss (compression, rings)')], ans: 0,
      ok: bi('सही — टर्बो कम rpm पर कमज़ोर।', 'Correct — turbo is weak at low rpm.'), bad: bi('पूरे वक्र पर असर नहीं, केवल कम rpm पर।', 'Not the whole curve — only the low-rpm end.'), note: <div className="grid gap-1"><Curve f={FAULTS[0]} /></div> },
    { q: bi('माप केवल उच्च rpm पर गिरता है। खराबी का क्षेत्र?', 'Measured falls only at high rpm. Fault area?'), opts: [bi('बूस्ट/हवा-पथ (टर्बो, रिसाव)', 'Boost/air path (turbo, leaks)'), bi('ईंधन आपूर्ति (पंप/रेल/इंजेक्टर)', 'Fuel delivery (pump/rail/injectors)'), bi('यांत्रिक हानि (कम्प्रेशन, रिंग)', 'Mechanical loss (compression, rings)')], ans: 1,
      ok: bi('सही — उच्च rpm पर ईंधन की माँग पूरी नहीं हो रही।', 'Correct — fuel demand is not met at high rpm.'), bad: bi('उच्च-rpm की गिरावट प्रायः आपूर्ति-क्षमता की सीमा दिखाती है।', 'A high-rpm drop usually shows a supply-capacity limit.'), note: <div className="grid gap-1"><Curve f={FAULTS[1]} /></div> },
    { q: bi('पूरा वक्र लगभग 18% नीचे, ब्लो-बाय भी ज़्यादा। खराबी का क्षेत्र?', 'The whole curve is about 18% low, with high blow-by too. Fault area?'), opts: [bi('बूस्ट/हवा-पथ (टर्बो, रिसाव)', 'Boost/air path (turbo, leaks)'), bi('ईंधन आपूर्ति (पंप/रेल/इंजेक्टर)', 'Fuel delivery (pump/rail/injectors)'), bi('यांत्रिक हानि (कम्प्रेशन, रिंग)', 'Mechanical loss (compression, rings)')], ans: 2,
      ok: bi('सही — एक-समान कमी + ब्लो-बाय = यांत्रिक।', 'Correct — uniform loss plus blow-by = mechanical.'), bad: bi('एक-समान कमी हर rpm पर ऊर्जा-हानि दिखाती है।', 'A uniform loss shows energy loss at every rpm.'), note: <div className="grid gap-1"><Curve f={FAULTS[2]} /></div> },
  ];
  const P3: Q[] = [
    { q: bi('ईंधन 52 kg/h, शक्ति 207 kW। BSFC = ?', 'Fuel 52 kg/h at 207 kW. BSFC = ?'), opts: [bi('251 g/kWh', '251 g/kWh'), bi('52 g/kWh', '52 g/kWh'), bi('4.0 g/kWh', '4.0 g/kWh'), bi('0.25 g/kWh', '0.25 g/kWh')], ans: 0,
      ok: bi('BSFC = 52000/207 ≈ 251 g/kWh।', 'BSFC = 52000/207 ≈ 251 g/kWh.'), bad: bi('kg/h को g/h में बदलकर kW से भाग दें।', 'Convert kg/h to g/h and divide by kW.') },
    { q: bi('ताप-दक्षता η = 3600/(BSFC × 42.5) = ?', 'Thermal efficiency η = 3600/(BSFC × 42.5) = ?'), opts: [bi('25.1 %', '25.1 %'), bi('33.7 %', '33.7 %'), bi('42.5 %', '42.5 %'), bi('50.2 %', '50.2 %')], ans: 1,
      ok: bi('η ≈ 33.7% — डीज़ल के लिए सामान्य।', 'η ≈ 33.7% — typical for a diesel.'), bad: bi('3600 ÷ (251 × 42.5)।', '3600 ÷ (251 × 42.5).') },
  ];
  const reset = () => { run.reset(); x.current = { n: 1000, acc: 0 }; setPhase(0); setSweeping(false); setRpm(1000); setSwept(false); setPts([]); setD0(false); setD1(false); setD2(false); setD3(false); setRk((k) => k + 1); };
  const startSweep = () => { x.current = { n: 1000, acc: 0 }; setPts([]); setRpm(1000); setSwept(false); setSweeping(true); };
  const canNext = [d0, d1, d2, d3][phase] ?? false;
  const phases = [bi('शक्ति-टॉर्क गणित', 'Power–torque maths'), bi('डायनो स्वीप', 'Dyno sweep'), bi('वक्र से निदान', 'Curve diagnosis'), bi('BSFC व दक्षता', 'BSFC and efficiency')];
  const hints = [bi('P (kW) = T (N·m) × N (rpm) / 9549।', 'P (kW) = T (N·m) × N (rpm) / 9549.'), bi('पहले स्वीप चलाएँ; शक्ति-शिखर टॉर्क-शिखर से ऊँचे rpm पर होता है।', 'Run the sweep first; peak power sits at a higher rpm than peak torque.'), bi('कम rpm = हवा; उच्च rpm = ईंधन; पूरा वक्र = यांत्रिक।', 'Low rpm = air; high rpm = fuel; whole curve = mechanical.'), bi('BSFC = ईंधन (g/h) ÷ शक्ति (kW)।', 'BSFC = fuel (g/h) ÷ power (kW).')];
  const X = (n: number) => 8 + ((n - 1000) / 1400) * 284, Y = (t: number) => 130 - (t / 1300) * 120;

  return (
    <SimFrame run={run} phases={phases} phase={phase} canNext={canNext} onNext={() => setPhase(phase + 1)} getHint={() => hints[phase]} onReset={reset}
      title={bi('डायनो सेल', 'Dyno cell')}
      intro={bi('शक्ति-टॉर्क की गणना करें, डायनो-स्वीप चलाकर शिखर खोजें, वक्र के आकार से खराबी का क्षेत्र बताएँ और BSFC निकालें।', 'Calculate power and torque, run a dyno sweep and find the peaks, locate faults from curve shape, and work out BSFC.')}>
      {phase === 0 && <QSteps key={'a' + rk} qs={P0} onRight={(t) => run.add(1, t)} onWrong={(t) => run.miss(t)} onDone={() => setD0(true)} />}
      {phase === 1 && (
        <div className="grid gap-3" data-testid="ph-sweep">
          {!swept ? (
            <div className="grid gap-3">
              <svg viewBox="0 0 300 140" className="w-full rounded-md border border-line bg-bg" role="img" aria-label="dyno sweep">
                {pts.length > 1 && <polyline points={pts.map(([n, t]) => `${X(n)},${Y(t)}`).join(' ')} fill="none" stroke="rgb(var(--amber))" strokeWidth="2.5" />}
              </svg>
              <div className="flex items-center gap-3"><button className="btn btn-amber" onClick={startSweep} disabled={sweeping} data-testid="start-sweep">{sweeping ? s('स्वीप चालू…', 'Sweeping…') : s('फुल-लोड स्वीप शुरू करें', 'Start full-load sweep')}</button><span className="readout" data-testid="sweep-rpm">{rpm} rpm</span></div>
            </div>
          ) : <QSteps key={'b' + rk} qs={P1} onRight={(t) => run.add(1, t)} onWrong={(t) => run.miss(t)} onDone={() => setD1(true)} />}
        </div>
      )}
      {phase === 2 && <QSteps key={'c' + rk} qs={P2} onRight={(t) => run.add(1, t)} onWrong={(t) => run.miss(t)} onDone={() => setD2(true)} />}
      {phase === 3 && (
        <div className="grid gap-3">
          {cap('इंजन लोड-पॉइंट: 207 kW, ईंधन 52 kg/h, डीज़ल LHV ≈ 42.5 MJ/kg।', 'Engine load point: 207 kW, fuel 52 kg/h, diesel LHV ≈ 42.5 MJ/kg.')}
          <QSteps key={'d' + rk} qs={P3} onRight={(t) => run.add(1, t)} onWrong={(t) => run.miss(t)} onDone={() => setD3(true)} />
        </div>
      )}
    </SimFrame>
  );
}
