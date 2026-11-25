import { useState } from 'react';
import { bi, type Bi } from '@/data/types';
import { useT } from '@/translations';
import { SimFrame } from '@/components/simkit/SimFrame';
import { useRun } from '@/components/simkit/useRun';
import { Choices, Slide } from '@/components/simkit/Choices';

/** waveform shapes drawn as SVG paths in a 120×60 box */
const WAVES: { id: number; path: string }[] = [
  { id: 0, path: 'M0 30 Q7 6 14 30 T28 30 T42 30 T56 30 L64 30 L72 30 Q79 6 86 30 T100 30 T114 30' },       // inductive CKP with gap
  { id: 1, path: 'M0 48 H12 V12 H30 V48 H48 V12 H66 V48 H84 V12 H102 V48 H120' },                           // Hall square
  { id: 2, path: 'M0 8 C20 10 30 30 50 42 S90 52 120 52' },                                                   // NTC falling voltage while warming
  { id: 3, path: 'M0 50 L40 50 L100 8 M0 52 L40 52 L100 30' },                                                 // two pedal tracks
];
const NAMES: { id: number; n: Bi }[] = [
  { id: 2, n: bi('NTC कूलेंट सेंसर (गर्म होते समय)', 'NTC coolant sensor (while warming)') },
  { id: 0, n: bi('इंडक्टिव क्रैंक सेंसर (गायब दाँत सहित)', 'Inductive crank sensor (missing tooth)') },
  { id: 3, n: bi('पैडल सेंसर (APP1 व APP2)', 'Pedal sensor (APP1 and APP2)') },
  { id: 1, n: bi('हॉल कैम सेंसर', 'Hall cam sensor') },
];
interface Circ { vref: number; sig: number; gnd: number; ans: number }
const CIRC: Circ[] = [
  { vref: 0.0, sig: 0.0, gnd: 0.0, ans: 1 },
  { vref: 5.0, sig: 4.97, gnd: 0.0, ans: 2 },
  { vref: 5.0, sig: 0.02, gnd: 0.0, ans: 0 },
];
const CAUSES: Bi[] = [bi('सिग्नल तार ग्राउंड से शॉर्ट', 'Signal wire shorted to ground'), bi('5 V रेफ़रेंस ग़ायब (खुला/शॉर्ट)', '5 V reference missing (open/short)'), bi('सेंसर का ग्राउंड तार खुला', 'Sensor ground wire open'), bi('सेंसर व वायरिंग सही', 'Sensor and wiring are fine')];
const PLAUS = [{ a1: 40, a2: 20, ok: true }, { a1: 70, a2: 49, ok: false }, { a1: 90, a2: 45, ok: true }, { a1: 30, a2: 30, ok: false }];

/** Unit 2 — sensor bench: waveforms, 5 V-circuit voltage windows, APP plausibility. */
export default function Sim02SensorBench() {
  const { s, L } = useT();
  const run = useRun(2, 10);
  const [phase, setPhase] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [ci, setCi] = useState(0);
  const [meas, setMeas] = useState<Record<string, boolean>>({});
  const [cOk, setCOk] = useState([false, false, false]);
  const [pickC, setPickC] = useState<number | null>(null);
  const [app1, setApp1] = useState(60);
  const [app2, setApp2] = useState(10);
  const [aOk, setAOk] = useState([false, false]);
  const [pset, setPset] = useState<number[]>([]);
  const [pDone, setPDone] = useState(false);

  const tol = Math.abs(app2 * 2 - app1) <= 6;
  const mk = (k: string) => `${ci}:${k}`;
  const c = CIRC[ci];

  const pairName = (nid: number) => {
    if (sel === null || matched.includes(sel)) return;
    if (sel === nid) { setMatched((m) => [...m, sel]); run.add(1, bi('सही मिलान।', 'Correct match.')); setSel(null); }
    else run.miss(bi('यह तरंग उस सेंसर की नहीं। आकार देखें: AC साइन, डिजिटल वर्ग, गिरता वक्र या दो ट्रैक।', 'That waveform does not belong to that sensor. Look at the shape: AC sine, digital square, falling curve or two tracks.'));
  };
  const submitCirc = () => {
    if (pickC === null || cOk[ci]) return;
    if (pickC === c.ans) {
      setCOk((o) => o.map((v, i) => (i === ci ? true : v)));
      run.add(1, bi('सही निदान।', 'Correct diagnosis.'));
      if (ci < CIRC.length - 1) {
        setTimeout(() => {
          setCi((prev) => (prev < CIRC.length - 1 ? prev + 1 : prev));
          setPickC(null);
        }, 350);
      }
    }
    else run.miss(bi('मापे गए वोल्टेज इस कारण से मेल नहीं खाते। 5 V व सिग्नल दोनों देखें।', 'The measured voltages do not fit that cause. Compare both the 5 V and the signal.'));
  };
  const checkApp = (want: boolean, idx: number) => {
    if (aOk[idx]) return;
    if (tol === want) { setAOk((o) => o.map((v, i) => (i === idx ? true : v))); run.add(1, want ? bi('सही: जोड़ी सुसंगत है (APP2 ≈ APP1/2)।', 'Correct: the pair is plausible (APP2 ≈ APP1/2).') : bi('सही: ECU इसे असंगत मानकर लिम्प-मोड में जाएगा।', 'Correct: the ECU will see this as implausible and enter limp mode.')); }
    else run.miss(want ? bi('यह जोड़ी सहनशीलता (±6%) से बाहर है। APP2 को APP1 का आधा रखें।', 'This pair is outside the ±6% tolerance. Set APP2 to half of APP1.') : bi('यह जोड़ी अभी सुसंगत है; लिम्प के लिए APP2 को आधे से दूर ले जाएँ।', 'This pair is still plausible; move APP2 away from half of APP1 to provoke limp.'));
  };
  const togglePl = (i: number) => { if (!pDone) setPset((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i])); };
  const submitPl = () => {
    const want = PLAUS.map((p, i) => (p.ok ? i : -1)).filter((i) => i >= 0);
    if (want.length === pset.length && want.every((i) => pset.includes(i))) { setPDone(true); run.add(1, bi('सही: केवल सुसंगत जोड़ियाँ चुनीं।', 'Correct: only the plausible pairs were chosen.')); }
    else run.miss(bi('जाँचें: APP2 × 2 ≈ APP1 (±6)?', 'Check: is APP2 × 2 ≈ APP1 (±6)?'));
  };
  const reset = () => { run.reset(); setPhase(0); setSel(null); setMatched([]); setCi(0); setMeas({}); setCOk([false, false, false]); setPickC(null); setApp1(60); setApp2(10); setAOk([false, false]); setPset([]); setPDone(false); };
  const canNext = phase === 0 ? matched.length === 4 : phase === 1 ? cOk.every(Boolean) : aOk.every(Boolean) && pDone;
  const phases = [bi('तरंग मिलाएँ', 'Match the waveform'), bi('5 V सर्किट दोष', '5 V circuit faults'), bi('प्लॉज़िबिलिटी', 'Plausibility')];
  const hints = [bi('AC साइन = इंडक्टिव; वर्ग = हॉल; गिरता वक्र = तापमान; दो रेखाएँ = पैडल।', 'AC sine = inductive; square = Hall; falling curve = temperature; two lines = pedal.'),
    bi('रेफ़रेंस 0 V = सप्लाई गई; रेफ़रेंस 5 V पर सिग्नल 5 V = ग्राउंड खुला; रेफ़रेंस 5 V पर सिग्नल 0 V = सिग्नल शॉर्ट।', 'Reference 0 V = supply lost; reference 5 V with signal 5 V = ground open; reference 5 V with signal 0 V = signal shorted.'),
    bi('नियम: |2 × APP2 − APP1| ≤ 6।', 'Rule: |2 × APP2 − APP1| ≤ 6.')];

  return (
    <SimFrame run={run} phases={phases} phase={phase} canNext={canNext} onNext={() => setPhase(phase + 1)} getHint={() => hints[phase]} onReset={reset}
      title={bi('सेंसर सिग्नल बेंच', 'Sensor signal bench')}
      intro={bi('तरंगें पहचानें, 5 V सर्किट के वोल्टेज से दोष खोजें और जाँचें कि ECU कौन-सी पैडल जोड़ी स्वीकार करेगा।', 'Recognise waveforms, find circuit faults from voltages and check which pedal pairs the ECU will accept.')}>
      {phase === 0 && (
        <div className="grid gap-3" data-testid="ph-wave">
          <p className="text-sm text-mute">{s('पहले एक तरंग चुनें, फिर उसका सेंसर चुनें।', 'Choose a waveform first, then its sensor.')}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {WAVES.map((w) => (
              <button key={w.id} data-wave={w.id} disabled={matched.includes(w.id)} aria-pressed={sel === w.id} onClick={() => setSel(w.id)}
                className={`rounded-md border p-2 bg-panel ${sel === w.id ? 'border-cool ring-2 ring-cool/40' : matched.includes(w.id) ? 'border-ok bg-ok/10' : 'border-line hover:border-cool/60'}`}>
                <svg viewBox="0 0 120 60" className="w-full h-auto" aria-label={`waveform ${w.id + 1}`}><path d={w.path} fill="none" stroke={matched.includes(w.id) ? 'rgb(var(--ok))' : 'rgb(var(--cool))'} strokeWidth="2.5" strokeLinejoin="round" /><line x1="0" y1="56" x2="120" y2="56" stroke="rgb(var(--line))" /></svg>
                <div className="readout text-xs text-mute">{String.fromCharCode(65 + w.id)}</div>
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {NAMES.map((n) => <button key={n.id} data-name={n.id} disabled={matched.includes(n.id)} onClick={() => pairName(n.id)} className={`btn !justify-start text-left !h-auto !py-2 ${matched.includes(n.id) ? '!border-ok !bg-ok/10' : ''}`}>{L(n.n)}</button>)}
          </div>
        </div>
      )}
      {phase === 1 && (
        <div className="grid gap-3" data-testid="ph-circuit">
          <div className="flex gap-2">{CIRC.map((_, i) => <button key={i} className={`btn !min-h-0 !py-1 ${i === ci ? '!border-cool' : ''}`} data-circ={i} onClick={() => { setCi(i); setPickC(null); }}>{s('केस', 'Case')} {i + 1}{cOk[i] ? ' ✓' : ''}</button>)}</div>
          <svg viewBox="0 0 300 90" className="w-full max-w-md mx-auto h-auto" role="img" aria-label="5 V circuit">
            <rect x="10" y="20" width="60" height="50" rx="6" fill="rgb(var(--panel))" stroke="rgb(var(--cool))" strokeWidth="2" /><text x="40" y="50" textAnchor="middle" fontSize="12" fontWeight="700" fill="rgb(var(--ink))">ECU</text>
            <rect x="230" y="20" width="60" height="50" rx="6" fill="rgb(var(--panel))" stroke="rgb(var(--mute))" strokeWidth="2" /><text x="260" y="50" textAnchor="middle" fontSize="12" fontWeight="700" fill="rgb(var(--ink))">{s('सेंसर', 'Sensor')}</text>
            {[['5V', 30, 'rgb(var(--hot))'], ['SIG', 45, 'rgb(var(--amber))'], ['GND', 60, 'rgb(var(--mute))']].map(([t, y, col], i) => (<g key={i}><line x1="70" y1={Number(y) - 0} x2="230" y2={Number(y)} stroke={String(col)} strokeWidth="2.5" /><text x="150" y={Number(y) - 3} textAnchor="middle" fontSize="9" fill={String(col)} fontWeight="700">{String(t)}</text></g>))}
          </svg>
          <div className="grid sm:grid-cols-3 gap-2 text-center">
            {([['vref', s('5 V रेफ़रेंस मापें', 'Measure 5 V reference'), c.vref], ['sig', s('सिग्नल मापें', 'Measure signal'), c.sig], ['gnd', s('ग्राउंड-ड्रॉप मापें', 'Measure ground drop'), c.gnd]] as const).map(([k, label, v]) => (
              <div key={k} className="rounded-md border border-line bg-panel p-2"><button className="btn !min-h-0 !py-1 w-full" data-measure={k} onClick={() => setMeas((m) => ({ ...m, [mk(k)]: true }))}>{label}</button>
                <div className="readout text-xl mt-1" data-testid={`read-${k}`}>{meas[mk(k)] ? `${v.toFixed(2)} V` : '— —'}</div></div>))}
          </div>
          <Choices options={CAUSES} value={cOk[ci] ? c.ans : pickC} onPick={setPickC} locked={cOk[ci]} correct={cOk[ci] ? c.ans : null} cols={2} />
          <div><button className="btn btn-amber" disabled={pickC === null || cOk[ci] || !(meas[mk('vref')] && meas[mk('sig')])} onClick={submitCirc} data-testid="submit-circ">{s('निदान जमा करें', 'Submit diagnosis')}</button>
            {!(meas[mk('vref')] && meas[mk('sig')]) && <span className="text-xs text-mute ml-3">{s('पहले 5 V व सिग्नल मापें।', 'Measure 5 V and signal first.')}</span>}</div>
        </div>
      )}
      {phase === 2 && (
        <div className="grid gap-4" data-testid="ph-app">
          <div className="grid sm:grid-cols-2 gap-3">
            <Slide id="app1" label="APP1" min={0} max={100} value={app1} onChange={setApp1} unit=" %" />
            <Slide id="app2" label="APP2" min={0} max={100} value={app2} onChange={setApp2} unit=" %" />
          </div>
          <div className={`rounded-md border p-3 text-sm ${tol ? 'border-ok/60 bg-ok/10' : 'border-hot/60 bg-hot/10'}`} data-testid="app-verdict" data-plausible={tol ? '1' : '0'}>{tol ? s('ECU: जोड़ी सुसंगत (APP2 ≈ APP1/2)', 'ECU: pair plausible (APP2 ≈ APP1/2)') : s('ECU: असंगत — लिम्प-मोड', 'ECU: implausible — limp mode')}</div>
          <div className="flex flex-wrap gap-2 items-center">
            <button className={`btn ${aOk[0] ? '!border-ok' : ''}`} data-testid="check-good" onClick={() => checkApp(true, 0)}>{s('1) सुसंगत जोड़ी सेट करके जाँचें', '1) Set a plausible pair and check')}{aOk[0] ? ' ✓' : ''}</button>
            <button className={`btn ${aOk[1] ? '!border-ok' : ''}`} data-testid="check-bad" onClick={() => checkApp(false, 1)}>{s('2) असंगत जोड़ी से लिम्प कराएँ', '2) Provoke limp with an implausible pair')}{aOk[1] ? ' ✓' : ''}</button>
          </div>
          <div>
            <p className="font-semibold mb-2">{s('3) कौन-सी जोड़ियाँ (APP1 / APP2) ECU स्वीकार करेगा? सभी चुनें।', '3) Which pairs (APP1 / APP2) will the ECU accept? Select all.')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{PLAUS.map((p, i) => <button key={i} data-pair={i} aria-pressed={pset.includes(i)} onClick={() => togglePl(i)} className={`btn readout ${pset.includes(i) ? '!border-cool bg-cool/10' : ''} ${pDone && p.ok ? '!border-ok' : ''}`}>{p.a1} / {p.a2}</button>)}</div>
            <div className="mt-2"><button className="btn btn-amber" onClick={submitPl} disabled={pDone || pset.length === 0} data-testid="submit-pairs">{s('उत्तर जमा करें', 'Submit')}</button></div>
          </div>
        </div>
      )}
    </SimFrame>
  );
}
