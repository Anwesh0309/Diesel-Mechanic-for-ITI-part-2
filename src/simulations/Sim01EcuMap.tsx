import { useState } from 'react';
import { bi, type Bi } from '@/data/types';
import { useT } from '@/translations';
import { SimFrame } from '@/components/simkit/SimFrame';
import { useRun } from '@/components/simkit/useRun';
import { Choices, Slide } from '@/components/simkit/Choices';

const RPM = [800, 1200, 1600, 2000, 2400];
const PED = [20, 40, 60, 80, 100];
const MAP = [[12, 14, 15, 14, 12], [20, 24, 26, 25, 22], [28, 34, 38, 36, 32], [34, 42, 48, 46, 40], [38, 48, 56, 54, 46]]; // mg/stroke [pedal][rpm]
const QUERIES = [{ r: 2, p: 2 }, { r: 1, p: 3 }, { r: 3, p: 4 }];
const M_AIR = 530;                      // mg of air per stroke at 1 bar absolute (sea level)
const qMax = (boost: number, dens: number) => (M_AIR * dens * (1 + boost)) / (1.3 * 14.5);
const REQ = 56;

const FAULTS: { t: Bi; d: Bi; a: number }[] = [
  { t: bi('कूलेंट-तापमान सेंसर ओपन-सर्किट', 'Coolant-temperature sensor open circuit'), d: bi('इंजन चल रहा है, बाकी सब सामान्य।', 'Engine running, everything else normal.'), a: 0 },
  { t: bi('APP1 व APP2 आपस में मेल नहीं खाते', 'APP1 and APP2 do not agree'), d: bi('ECU यह नहीं जान सकता कि ड्राइवर कितनी माँग कर रहा है।', 'The ECU cannot know how much the driver is asking for.'), a: 1 },
  { t: bi('चलते इंजन पर तेल-दाब पूरी तरह गिरा', 'Oil pressure collapses on a running engine'), d: bi('rpm ऊँचा, तेल दाब ≈ 0, तेल-दाब सेंसर सही है।', 'High rpm, oil pressure ≈ 0, the oil-pressure sensor is proven good.'), a: 3 },
  { t: bi('डैश में एक गैर-ज़रूरी CAN संदेश कभी-कभी नहीं आता', 'One non-critical CAN message to the dash occasionally missing'), d: bi('इंजन की कार्यक्षमता प्रभावित नहीं।', 'No effect on engine performance.'), a: 2 },
];
const REACT: Bi[] = [bi('Substitute मान लेकर चलना + कोड सहेजना', 'Use a substitute value and store a code'), bi('लिम्प-होम: टॉर्क सीमित', 'Limp-home: limit torque'), bi('केवल चेतावनी/कोड', 'Warning/code only'), bi('चेतावनी के बाद इंजन बंद (प्रोटेक्शन)', 'Warn, then shut the engine down (protection)')];

/** Unit 1 — ECU map lab: read the fuel map, see the smoke limiter work, choose fault reactions. */
export default function Sim01EcuMap() {
  const { s, L } = useT();
  const run = useRun(1, 10);
  const [phase, setPhase] = useState(0);
  // phase 0
  const [qi, setQi] = useState(0);
  const [qDone, setQDone] = useState<boolean[]>([false, false, false]);
  const [interp, setInterp] = useState(false);
  const [pick0, setPick0] = useState<number | null>(null);
  // phase 1
  const [boost, setBoost] = useState(0.2);
  const [alt, setAlt] = useState(false);
  const [lockOk, setLockOk] = useState([false, false]);
  // phase 2
  const [fi, setFi] = useState(0);
  const [fOk, setFOk] = useState([false, false, false, false]);
  const [pick2, setPick2] = useState<number | null>(null);

  const dens = alt ? 0.85 : 1;
  const qm = qMax(boost, dens);
  const actual = Math.min(REQ, qm);
  const limited = qm < REQ;
  const allQ = qDone.every(Boolean);
  const interpOpts: Bi[] = [bi('34 mg', '34 mg'), bi('36 mg', '36 mg'), bi('38 mg', '38 mg'), bi('40 mg', '40 mg')];

  const tapCell = (r: number, p: number) => {
    if (phase !== 0 || allQ) return;
    const q = QUERIES[qi];
    if (r === q.r && p === q.p) {
      setQDone((d) => d.map((v, i) => (i === qi ? true : v)));
      run.add(1, bi(`सही: ${MAP[p][r]} mg/स्ट्रोक।`, `Correct: ${MAP[p][r]} mg/stroke.`));
      if (qi < 2) setQi(qi + 1);
    } else run.miss(bi('गलत सेल। rpm कॉलम व पैडल पंक्ति के कटान को दबाएँ।', 'Wrong cell. Tap where the rpm column meets the pedal row.'));
  };
  const submitInterp = () => {
    if (pick0 === null) return;
    if (pick0 === 1) { setInterp(true); run.add(1, bi('सही: 34 + (1400−1200)/(1600−1200) × (38−34) = 36 mg।', 'Correct: 34 + (1400−1200)/(1600−1200) × (38−34) = 36 mg.')); }
    else run.miss(bi('इंटरपोलेशन: 1200 rpm = 34, 1600 rpm = 38; 1400 बीच में है।', 'Interpolate: 1200 rpm = 34, 1600 rpm = 38; 1400 is halfway.'));
  };
  const lock = () => {
    const i = alt ? 1 : 0;
    if (lockOk[i]) return;
    if (!limited && boost <= 1.6) { setLockOk((l) => l.map((v, k) => (k === i ? true : v))); run.add(1, bi('स्मोक लिमिटर नहीं काट रहा — पूरी माँगी गई मात्रा इंजेक्ट हो रही है।', 'The limiter is not cutting — the full requested quantity is injected.')); }
    else if (limited) run.miss(bi(`अभी लिमिटर ${Math.round(REQ - qm)} mg काट रहा है — बूस्ट बढ़ाएँ।`, `The limiter is still cutting ${Math.round(REQ - qm)} mg — raise boost.`));
    else run.miss(bi('बूस्ट बहुत ऊँचा (ओवरबूस्ट)।', 'Boost is too high (overboost).'));
  };
  const fAns = (i: number) => {
    if (fOk[fi]) return;
    setPick2(i);
    if (i === FAULTS[fi].a) {
      setFOk((o) => o.map((v, k) => (k === fi ? true : v)));
      run.add(1, bi('सही प्रतिक्रिया-स्तर।', 'Correct reaction level.'));
      if (fi < FAULTS.length - 1) {
        setTimeout(() => {
          setFi((prev) => (prev < FAULTS.length - 1 ? prev + 1 : prev));
          setPick2(null);
        }, 350);
      }
    }
    else run.miss(bi('इस खराबी की गंभीरता के अनुसार प्रतिक्रिया कम/अधिक है।', 'That reaction is too mild or too harsh for this fault.'));
  };
  const reset = () => { run.reset(); setPhase(0); setQi(0); setQDone([false, false, false]); setInterp(false); setPick0(null); setBoost(0.2); setAlt(false); setLockOk([false, false]); setFi(0); setFOk([false, false, false, false]); setPick2(null); };
  const canNext = phase === 0 ? allQ && interp : phase === 1 ? lockOk[0] && lockOk[1] : fOk.every(Boolean);
  const phases = [bi('फ़्यूल मैप पढ़ें', 'Read the fuel map'), bi('स्मोक लिमिटर', 'Smoke limiter'), bi('खराबी प्रतिक्रिया', 'Fault reaction')];
  const hints = [bi('कॉलम = rpm, पंक्ति = पैडल %। 1400 rpm दो कॉलमों के बीच है।', 'Columns = rpm, rows = pedal %. 1400 rpm sits between two columns.'),
    bi('Q_max = हवा ÷ (1.3 × 14.5)। ऊँचाई पर हवा कम है, इसलिए अधिक बूस्ट चाहिए।', 'Q_max = air ÷ (1.3 × 14.5). Air is thinner at altitude, so more boost is needed.'),
    bi('मामूली = substitute; चालक की माँग अज्ञात = लिम्प; इंजन-नाशक = शटडाउन।', 'Minor = substitute; unknown driver demand = limp; engine-destroying = shutdown.')];

  return (
    <SimFrame run={run} phases={phases} phase={phase} canNext={canNext} onNext={() => { setPhase(phase + 1); }} getHint={() => hints[phase]} onReset={reset}
      title={bi('ECU मैप लैब', 'ECU map lab')}
      intro={bi('ईंधन-मैप से मात्रा पढ़ें, देखें कि स्मोक लिमिटर हवा के हिसाब से ईंधन कैसे काटता है, और खराबी पर ECU की सही प्रतिक्रिया चुनें।', 'Read quantities from the fuel map, watch the smoke limiter trim fuel to the available air, and choose the ECU reaction for each fault.')}>
      {phase === 0 && (
        <div className="grid gap-3" data-testid="ph-map">
          {!allQ ? (
            <p className="font-semibold" data-testid="map-query">{s(`rpm ${RPM[QUERIES[qi].r]} व पैडल ${PED[QUERIES[qi].p]}% का सेल दबाएँ (${qi + 1}/3)`, `Tap the cell for ${RPM[QUERIES[qi].r]} rpm at ${PED[QUERIES[qi].p]}% pedal (${qi + 1}/3)`)}</p>
          ) : (
            <p className="font-semibold">{s('1400 rpm व 60% पैडल पर मात्रा (दो कॉलमों के बीच) कितनी होगी?', 'What quantity applies at 1400 rpm and 60% pedal (between two columns)?')}</p>
          )}
          <div className="overflow-x-auto"><table className="w-full text-center text-sm border-separate border-spacing-1" data-testid="fuel-map">
            <thead><tr><th className="text-mute text-xs">{s('पैडल ↓ / rpm →', 'Pedal ↓ / rpm →')}</th>{RPM.map((r) => <th key={r} className="readout text-xs text-mute">{r}</th>)}</tr></thead>
            <tbody>{[...PED.keys()].reverse().map((p) => (
              <tr key={p}><th className="readout text-xs text-mute">{PED[p]}%</th>
                {RPM.map((_, r) => { const done = qDone.some((d, i) => d && QUERIES[i].r === r && QUERIES[i].p === p);
                  return <td key={r}><button data-cell={`${r}-${p}`} onClick={() => tapCell(r, p)} className={`readout w-full min-w-[44px] py-2 rounded-md border ${done ? 'bg-ok/20 border-ok text-ok' : 'bg-panel border-line hover:border-cool'}`} style={{ backgroundColor: done ? undefined : `rgb(var(--cool) / ${MAP[p][r] / 170})` }}>{MAP[p][r]}</button></td>; })}
              </tr>))}</tbody>
          </table></div>
          {allQ && !interp && (
            <div className="grid gap-2"><Choices options={interpOpts} value={pick0} onPick={setPick0} cols={2} />
              <div><button className="btn btn-amber" onClick={submitInterp} disabled={pick0 === null} data-testid="submit-interp">{s('उत्तर जमा करें', 'Submit')}</button></div></div>
          )}
          {interp && <p className="text-ok font-semibold">{s('मैप पढ़ना पूर्ण।', 'Map reading complete.')}</p>}
        </div>
      )}
      {phase === 1 && (
        <div className="grid gap-4" data-testid="ph-limiter">
          <div className="flex flex-wrap gap-2">
            <button className={`btn ${!alt ? '!border-cool bg-cool/10' : ''}`} data-testid="sc-sea" onClick={() => setAlt(false)}>{s('समुद्र-तल', 'Sea level')}{lockOk[0] ? ' ✓' : ''}</button>
            <button className={`btn ${alt ? '!border-cool bg-cool/10' : ''}`} data-testid="sc-alt" onClick={() => setAlt(true)}>{s('ऊँचाई (हवा 85%)', 'High altitude (air 85%)')}{lockOk[1] ? ' ✓' : ''}</button>
          </div>
          <p className="text-sm text-mute">{s(`1600 rpm, पैडल 100%: मैप ${REQ} mg माँगता है। बूस्ट बढ़ाकर लिमिटर को खुलने दें (अधिकतम सुरक्षित बूस्ट ≈ 1.6 bar)।`, `1600 rpm, pedal 100%: the map asks for ${REQ} mg. Raise boost until the limiter opens (max safe boost ≈ 1.6 bar).`)}</p>
          <Slide id="boost" label={s('बूस्ट (गेज)', 'Boost (gauge)')} min={0} max={2} step={0.05} value={boost} onChange={setBoost} unit=" bar" />
          <div className="grid sm:grid-cols-3 gap-3 text-center">
            <div className="rounded-md border border-line bg-panel p-3"><div className="text-xs text-mute">{s('माँगी गई', 'Requested')}</div><div className="readout text-xl">{REQ} mg</div></div>
            <div className="rounded-md border border-line bg-panel p-3"><div className="text-xs text-mute">{s('लिमिटर अधिकतम', 'Limiter max')}</div><div className="readout text-xl text-amber" data-testid="qmax">{Math.round(qm)} mg</div></div>
            <div className={`rounded-md border p-3 ${limited ? 'border-hot/60 bg-hot/10' : 'border-ok/60 bg-ok/10'}`}><div className="text-xs text-mute">{s('वास्तविक इंजेक्शन', 'Actual injection')}</div><div className="readout text-xl" data-testid="qact">{Math.round(actual)} mg</div></div>
          </div>
          <div className="h-3 rounded bg-panel border border-line overflow-hidden"><div className={`h-full transition-all ${limited ? 'bg-hot' : 'bg-ok'}`} style={{ width: `${(actual / REQ) * 100}%` }} /></div>
          <div><button className="btn btn-amber" onClick={lock} data-testid="lock-boost">{s('यह बूस्ट लॉक करें', 'Lock this boost')}</button></div>
        </div>
      )}
      {phase === 2 && (
        <div className="grid gap-3" data-testid="ph-fault">
          <div className="flex gap-2">{FAULTS.map((_, i) => <button key={i} className={`btn !min-h-0 !py-1 ${i === fi ? '!border-cool' : ''}`} data-fault={i} onClick={() => { setFi(i); setPick2(null); }}>{i + 1}{fOk[i] ? ' ✓' : ''}</button>)}</div>
          <div className="rounded-md border border-line bg-panel p-3"><div className="font-bold">{L(FAULTS[fi].t)}</div><p className="text-sm text-mute">{L(FAULTS[fi].d)}</p></div>
          <Choices options={REACT} value={fOk[fi] ? FAULTS[fi].a : pick2} onPick={fAns} locked={fOk[fi]} correct={fOk[fi] ? FAULTS[fi].a : null} cols={2} />
        </div>
      )}
    </SimFrame>
  );
}
