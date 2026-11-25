import { useRef, useState } from 'react';
import { bi, type Bi } from '@/data/types';
import { useT } from '@/translations';
import { SimFrame } from '@/components/simkit/SimFrame';
import { useRun } from '@/components/simkit/useRun';
import { useTicker } from '@/components/simkit/useTicker';
import { Trace } from '@/components/simkit/Trace';
import { Meter } from '@/components/ui/kit';
import { Slide } from '@/components/simkit/Choices';

const SYMP: { t: Bi; a: number }[] = [
  { t: bi('DPF ΔP ऊँचा व हर 150 km पर रीजनरेशन', 'High DPF ΔP and a regeneration every 150 km'), a: 1 },
  { t: bi('सफ़ेद धुआँ व कूलेंट का घटना; वाल्व ठीक', 'White smoke and falling coolant; valve itself fine'), a: 0 },
  { t: bi('AdBlue गुणवत्ता चेतावनी; रिफ़्रैक्टोमीटर पर कम मान', 'AdBlue quality warning; low refractometer reading'), a: 2 },
  { t: bi('EGR वाल्व पोज़िशन त्रुटि; वाल्व कार्बन से भरा', 'EGR valve position error; valve full of carbon'), a: 0 },
];
const SYS: Bi[] = [bi('EGR', 'EGR'), bi('DPF', 'DPF'), bi('SCR / AdBlue', 'SCR / AdBlue')];
const tempFor = (load: number) => 250 + 5.5 * load;
const noxIn = (t: number) => 650 + 220 * Math.sin(t * 0.5);          // ppm engine-out
const idealDose = (nox: number) => nox * 0.6;                        // arbitrary dosing units

/** Unit 5 — aftertreatment console: DPF regeneration window, SCR dosing, symptom matching. */
export default function Sim05Aftertreatment() {
  const { s, L } = useT();
  const run = useRun(5, 10);
  const [phase, setPhase] = useState(0);
  // phase 0
  const [load, setLoad] = useState(30);
  const [T, setT] = useState(260);
  const [soot, setSoot] = useState(62);
  const [regen, setRegen] = useState(false);
  const [done0, setDone0] = useState(false);
  const [hist, setHist] = useState<number[]>([]);
  const x0 = useRef({ T: 260, soot: 62, over: false, acc: 0, regen: false });
  const loadR = useRef(load); loadR.current = load;
  // phase 1
  const [dose, setDose] = useState(200);
  const [tt, setTt] = useState(0);
  const [eff, setEff] = useState(0);
  const [slip, setSlip] = useState(0);
  const [nIn, setNIn] = useState(650);
  const [ok1, setOk1] = useState(0);
  const [done1, setDone1] = useState(false);
  const x1 = useRef({ t: 0, ok: 0, acc: 0 });
  const doseR = useRef(dose); doseR.current = dose;
  // phase 2
  const [mi, setMi] = useState(0);
  const [mOk, setMOk] = useState([false, false, false, false]);

  useTicker(phase === 0 && !done0 && !run.finished, (dt) => {
    const x = x0.current;
    x.T += (tempFor(loadR.current) - x.T) * Math.min(1, dt / 1.5);
    if (x.regen) {
      const rate = x.T > 450 ? 3.2 * ((x.T - 450) / 150) : 0;
      x.soot = Math.max(0, x.soot - rate * dt);
      if (x.T > 700) { if (!x.over) { x.over = true; run.miss(bi('निकास 700 °C से ऊपर — DPF पिघलने/टूटने का खतरा! लोड घटाएँ।', 'Exhaust above 700 °C — risk of melting/cracking the DPF! Reduce load.')); } } else if (x.T < 660) x.over = false;
    } else x.soot = Math.min(100, x.soot + 0.15 * dt);
    x.acc += dt;
    if (x.acc > 0.12) { x.acc = 0; setT(x.T); setSoot(x.soot); setHist((h) => [...h.slice(-59), x.T]); }
    if (x.regen && x.soot <= 5) { x.regen = false; setRegen(false); setDone0(true); setSoot(x.soot); run.add(3, bi('रीजनरेशन पूर्ण: DPF साफ़।', 'Regeneration complete: DPF clean.')); }
  });
  useTicker(phase === 1 && !done1 && !run.finished, (dt) => {
    const x = x1.current; x.t += dt;
    const temp = Math.min(350, 150 + x.t * 8);
    const n = noxIn(x.t); const d = doseR.current;
    const blocked = temp < 180;
    const ideal = idealDose(n);
    const conv = blocked ? 0 : (temp < 250 ? (temp - 180) / 70 : 1) * 0.97 * Math.min(1, d / ideal);
    const sl = blocked ? 0 : Math.max(0, (d - ideal * 1.15) * 0.25);
    if (!blocked && conv * 100 >= 88 && sl <= 10) x.ok += dt;
    x.acc += dt;
    if (x.acc > 0.12) { x.acc = 0; setTt(temp); setNIn(n); setEff(blocked ? 0 : conv * 100); setSlip(sl); setOk1(x.ok); }
    if (x.ok >= 6) { setDone1(true); setOk1(6); run.add(3, bi('SCR डोज़िंग सफल: उच्च दक्षता व कम अमोनिया स्लिप।', 'SCR dosing achieved: high efficiency with low ammonia slip.')); }
  });

  const startRegen = () => {
    if (soot < 45) { run.say('info', bi('कालिख-भार 45% से कम — रीजनरेशन की ज़रूरत नहीं।', 'Soot load below 45% — regeneration not required.')); return; }
    x0.current.regen = true; setRegen(true);
  };
  const tapSym = (i: number, a: number) => {
    if (mOk[i]) return;
    if (a === SYMP[i].a) { setMOk((o) => o.map((v, k) => (k === i ? true : v))); run.add(1, bi('सही सिस्टम।', 'Correct system.')); if (i === mi && i < 3) setMi(i + 1); }
    else run.miss(bi('इस लक्षण का स्रोत कोई और घटक है।', 'This symptom comes from a different component.'));
  };
  const reset = () => { run.reset(); x0.current = { T: 260, soot: 62, over: false, acc: 0, regen: false }; x1.current = { t: 0, ok: 0, acc: 0 }; setPhase(0); setLoad(30); setT(260); setSoot(62); setRegen(false); setDone0(false); setHist([]); setDose(200); setTt(0); setEff(0); setSlip(0); setNIn(650); setOk1(0); setDone1(false); setMi(0); setMOk([false, false, false, false]); };
  const canNext = phase === 0 ? done0 : phase === 1 ? done1 : mOk.every(Boolean);
  const phases = [bi('DPF रीजनरेशन', 'DPF regeneration'), bi('SCR डोज़िंग', 'SCR dosing'), bi('लक्षण → सिस्टम', 'Symptom → system')];
  const hints = [bi('रीजनरेशन शुरू करें, फिर इंजन-लोड ऐसा रखें कि निकास 550–650 °C रहे (≈ लोड 55–73%); 700 °C से ऊपर खतरा।', 'Start regeneration, then hold engine load so exhaust stays 550–650 °C (≈ load 55–73%); above 700 °C is dangerous.'),
    bi('AdBlue डोज़ को आने वाले NOx के अनुपात में रखें: कम = NOx बचता है; अधिक = अमोनिया स्लिप। 180 °C से नीचे डोज़िंग बंद रहती है।', 'Keep the dose proportional to incoming NOx: too low leaves NOx; too high causes ammonia slip. Dosing is blocked below 180 °C.'),
    bi('फटा कूलर और जमी कालिख EGR; ΔP व रीजनरेशन DPF; गुणवत्ता/डोज़र SCR।', 'Cracked cooler and carbon = EGR; ΔP and regenerations = DPF; quality/doser = SCR.')];
  const tone = T > 700 ? 'hot' : T >= 550 ? 'ok' : 'amber';

  return (
    <SimFrame run={run} phases={phases} phase={phase} canNext={canNext} onNext={() => setPhase(phase + 1)} getHint={() => hints[phase]} onReset={reset}
      title={bi('आफ़्टरट्रीटमेंट कंसोल', 'Aftertreatment console')}
      intro={bi('DPF को सुरक्षित तापमान-विंडो में रीजनरेट करें, बदलते NOx के साथ AdBlue की डोज़िंग साधें और लक्षण से सही उत्सर्जन-घटक पहचानें।', 'Regenerate the DPF inside the safe temperature window, tune AdBlue dosing against changing NOx, and match symptoms to the right emission component.')}>
      {phase === 0 && (
        <div className="grid gap-3" data-testid="ph-dpf">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-3">
              <Meter value={soot} label={s('कालिख-भार', 'Soot load')} unit=" %" tone={soot > 45 ? 'hot' : 'ok'} height={14} band={[0, 45]} />
              <Slide id="eload" label={s('इंजन लोड', 'Engine load')} min={0} max={100} value={load} onChange={setLoad} unit=" %" disabled={done0} />
              <button className="btn btn-amber" onClick={startRegen} disabled={regen || done0} data-testid="start-regen">{regen ? s('रीजनरेशन चालू…', 'Regenerating…') : s('सक्रिय रीजनरेशन शुरू करें', 'Start active regeneration')}</button>
              <p className="text-xs text-mute">{s('समय संकुचित है: वास्तविक रीजनरेशन 15–30 मिनट लेता है।', 'Time is compressed: a real regeneration takes 15–30 minutes.')}</p>
            </div>
            <div className="grid gap-2">
              <div className="flex items-end justify-between"><div className="text-xs text-mute">{s('DPF तापमान', 'DPF temperature')}</div><div className={`readout text-3xl ${tone === 'hot' ? 'text-hot' : tone === 'ok' ? 'text-ok' : 'text-amber'}`} data-testid="dpf-temp">{Math.round(T)} °C</div></div>
              <Trace data={hist} min={200} max={800} band={[550, 650]} height={90} label="DPF temp" />
              <div className="text-xs text-mute">{s('हरी पट्टी = 550–650 °C (सुरक्षित सक्रिय-रीजनरेशन)', 'Green band = 550–650 °C (safe active regeneration)')}</div>
              <div className="readout text-xs" data-testid="soot-val" data-soot={Math.round(soot)}>{s('कालिख', 'Soot')} {Math.round(soot)}%</div>
            </div>
          </div>
        </div>
      )}
      {phase === 1 && (
        <div className="grid gap-3" data-testid="ph-scr">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-3">
              <Slide id="dose" label={s('AdBlue डोज़', 'AdBlue dose')} min={0} max={800} step={5} value={dose} onChange={setDose} unit=" u" disabled={done1 || tt < 180} />
              <div className="rounded-md border border-line bg-panel p-2 text-sm flex justify-between"><span className="text-mute">{s('निकास तापमान', 'Exhaust temperature')}</span><span className="readout" data-testid="scr-temp">{Math.round(tt)} °C</span></div>
              {tt < 180 && <p className="text-xs text-amber">{s('180 °C से नीचे डोज़िंग बंद — निकास गर्म होने दें।', 'Dosing blocked below 180 °C — let the exhaust warm up.')}</p>}
              <div className="rounded-md border border-line bg-panel p-2 text-sm flex justify-between"><span className="text-mute">NOx {s('आने वाला', 'in')}</span><span className="readout" data-testid="nox-in" data-ideal={Math.round(idealDose(nIn))}>{Math.round(nIn)} ppm</span></div>
            </div>
            <div className="grid gap-3">
              <Meter value={eff} label={s('SCR दक्षता', 'SCR efficiency')} unit=" %" tone={eff >= 88 ? 'ok' : 'amber'} band={[88, 100]} height={14} />
              <Meter value={slip} max={40} label={s('अमोनिया स्लिप', 'Ammonia slip')} unit=" ppm" tone={slip > 10 ? 'hot' : 'ok'} band={[0, 10]} height={14} />
              <div><div className="flex justify-between text-xs text-mute mb-1"><span>{s('लक्ष्य-बैंड में समय', 'Time in target')}</span><span className="readout">{ok1.toFixed(1)} / 6 s</span></div>
                <div className="h-2.5 rounded bg-panel border border-line overflow-hidden"><div className="h-full bg-ok" style={{ width: `${Math.min(100, (ok1 / 6) * 100)}%` }} /></div></div>
              <p className="text-xs text-mute">{s('लक्ष्य: दक्षता ≥ 88% व स्लिप ≤ 10 ppm।', 'Target: efficiency ≥ 88% and slip ≤ 10 ppm.')}</p>
            </div>
          </div>
        </div>
      )}
      {phase === 2 && (
        <div className="grid gap-3" data-testid="ph-match">
          <div className="flex gap-2">{SYMP.map((_, i) => <button key={i} className={`btn !min-h-0 !py-1 ${i === mi ? '!border-cool' : ''}`} data-sym={i} onClick={() => setMi(i)}>{i + 1}{mOk[i] ? ' ✓' : ''}</button>)}</div>
          <div className="rounded-md border border-line bg-panel p-3 font-semibold">{L(SYMP[mi].t)}</div>
          <div className="grid sm:grid-cols-3 gap-2">{SYS.map((n, a) => <button key={a} data-sys={a} disabled={mOk[mi]} onClick={() => tapSym(mi, a)} className={`btn ${mOk[mi] && SYMP[mi].a === a ? '!bg-ok !text-bg' : ''}`}>{L(n)}</button>)}</div>
        </div>
      )}
    </SimFrame>
  );
}
