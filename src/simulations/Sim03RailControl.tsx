import { useRef, useState } from 'react';
import { bi, type Bi } from '@/data/types';
import { useT } from '@/translations';
import { SimFrame } from '@/components/simkit/SimFrame';
import { useRun } from '@/components/simkit/useRun';
import { useTicker } from '@/components/simkit/useTicker';
import { Trace } from '@/components/simkit/Trace';
import { Choices, Slide } from '@/components/simkit/Choices';

const TARGET = 1400;
const GOAL_S = 8;                    // seconds inside the ±5 % band
const QINJ = { idle: 5, load: 25 };
const A = 150;                       // pressure gain (bar per s per flow unit)

/** Rail model: dP/dt = A (Qpump − Qinj − open·√P)   (open = PCV opening 0–1). */
const rail = (P: number, imv: number, open: number, qinj: number, dt: number) => {
  const flow = 0.5 * imv - qinj - open * Math.sqrt(Math.max(P, 0));
  return Math.max(0, Math.min(2400, P + A * flow * dt));
};

const TRACES: { name: Bi; data: number[]; note: Bi; ans: number }[] = [
  { name: bi('ट्रेस 1 — क्रैंकिंग', 'Trace 1 — cranking'), data: [0, 40, 90, 125, 140, 148, 150, 150, 150, 150, 150, 150],
    note: bi('IMV ड्यूटी 100%, PCV को पूरा बंद करने का आदेश; PCV रिटर्न-फ़्लो बहुत अधिक; इंजेक्टर रिटर्न सामान्य।', 'IMV duty 100%, PCV commanded fully closed; PCV return flow very high; injector returns normal.'), ans: 0 },
  { name: bi('ट्रेस 2 — लोड पर', 'Trace 2 — under load'), data: [1400, 1400, 1398, 1380, 1330, 1250, 1170, 1120, 1100, 1090, 1085, 1080],
    note: bi('आइडल पर लक्ष्य पर स्थिर; ऊँचे लोड पर पिछड़ता है। IMV ड्यूटी 100% (संतृप्त); PCV रिटर्न व इंजेक्टर रिटर्न सामान्य।', 'Steady at target at idle; lags at high load. IMV duty saturated at 100%; PCV and injector returns normal.'), ans: 1 },
  { name: bi('ट्रेस 3 — इंजन बंद करने के बाद', 'Trace 3 — after shut-off'), data: [1400, 1100, 780, 520, 340, 240, 180, 150, 130, 120, 110, 105],
    note: bi('दाब 4–5 सेकंड में बहुत गिरा (सामान्य: मिनटों में थोड़ा); इंजेक्टर 3 का रिटर्न-फ़्लो बाकी से 5 गुना।', 'Pressure collapsed within 4–5 s (normal: slow decay over minutes); injector 3 return flow is 5× the others.'), ans: 2 },
];
const CAUSES: Bi[] = [bi('PCV अटका-खुला', 'PCV stuck open'), bi('घिसा उच्च-दाब पंप', 'Worn high-pressure pump'), bi('रिसता इंजेक्टर', 'Leaking injector'), bi('रेल-दाब सेंसर खराब', 'Faulty rail-pressure sensor')];
const RF = [11, 12, 10, 38];
const RF_LIMIT = 20;
const ACTIONS: Bi[] = [bi('इंजेक्टर 4 बदलें, कोड डालें, सिस्टम की सफ़ाई/तेल जाँच', 'Replace injector 4, code it, check system cleanliness/oil'), bi('सभी इंजेक्टर बदलें', 'Replace all injectors'), bi('कुछ न करें', 'Do nothing'), bi('रेल बदलें', 'Replace the rail')];

/** Unit 3 — rail pressure control room: live closed-loop control, trace diagnosis, return-flow test. */
export default function Sim03RailControl() {
  const { s, L } = useT();
  const run = useRun(3, 8);
  const [phase, setPhase] = useState(0);
  // phase 0 — live
  const [imv, setImv] = useState(48);
  const [open, setOpen] = useState(50);
  const [P, setP] = useState(1400);
  const [loadMode, setLoadMode] = useState<'idle' | 'load'>('idle');
  const [inband, setInband] = useState(0);
  const [hist, setHist] = useState<number[]>([1400]);
  const [won, setWon] = useState(false);
  const st = useRef({ P: 1400, t: 0, inb: 0, over: false, switchAt: 6, mode: 'idle' as 'idle' | 'load', acc: 0 });
  const imvR = useRef(imv); imvR.current = imv;
  const openR = useRef(open); openR.current = open;

  useTicker(phase === 0 && !won && !run.finished, (dt) => {
    const x = st.current;
    x.t += dt;
    if (x.t >= x.switchAt) { x.mode = x.mode === 'idle' ? 'load' : 'idle'; x.switchAt = x.t + 6; setLoadMode(x.mode); }
    x.P = rail(x.P, imvR.current, openR.current / 100, QINJ[x.mode], dt);
    if (x.P > 1750) { x.P = 1750; if (!x.over) { x.over = true; run.miss(bi('अतिदाब! सेफ़्टी रिलीफ़ खुला — IMV घटाएँ या PCV खोलें।', 'Overpressure! Safety relief opened — lower IMV or open the PCV.')); } } else if (x.P < 1600) x.over = false;
    if (Math.abs(x.P - TARGET) <= TARGET * 0.05) x.inb += dt;
    x.acc += dt;
    if (x.acc > 0.12) { x.acc = 0; setP(x.P); setInband(x.inb); setHist((h) => [...h.slice(-59), x.P]); }
    if (x.inb >= GOAL_S && !won) { setWon(true); setP(x.P); setInband(GOAL_S); run.add(3, bi('दाब नियंत्रण सफल: लक्ष्य ±5% में पर्याप्त समय रहा।', 'Pressure control achieved: enough time inside the ±5% band.')); }
  });

  const [ti, setTi] = useState(0);
  const [tOk, setTOk] = useState([false, false, false]);
  const [pickT, setPickT] = useState<number | null>(null);
  const [rfPick, setRfPick] = useState<number | null>(null);
  const [rfOk, setRfOk] = useState(false);
  const [actPick, setActPick] = useState<number | null>(null);
  const [actOk, setActOk] = useState(false);

  const submitTrace = () => {
    if (pickT === null || tOk[ti]) return;
    if (pickT === TRACES[ti].ans) {
      setTOk((o) => o.map((v, i) => (i === ti ? true : v)));
      run.add(1, bi('सही — ट्रेस व डेटा दोनों इसी कारण की पुष्टि करते हैं।', 'Correct — both trace and data confirm that cause.'));
      if (ti < TRACES.length - 1) {
        setTimeout(() => {
          setTi((prev) => (prev < TRACES.length - 1 ? prev + 1 : prev));
          setPickT(null);
        }, 350);
      }
    }
    else run.miss(bi('ट्रेस के साथ दिए रिटर्न-फ़्लो/IMV डेटा से मिलाएँ।', 'Match it with the return-flow/IMV data given with the trace.'));
  };
  const tapBar = (i: number) => {
    if (rfOk) return; setRfPick(i);
    if (RF[i] > RF_LIMIT) { setRfOk(true); run.add(1, bi('सही — इंजेक्टर 4 सीमा (20 ml) से बहुत ऊपर।', 'Correct — injector 4 is far above the 20 ml limit.')); }
    else run.miss(bi('यह इंजेक्टर सीमा के भीतर है।', 'That injector is inside the limit.'));
  };
  const submitAct = () => {
    if (actPick === null || actOk) return;
    if (actPick === 0) { setActOk(true); run.add(1, bi('सही कार्रवाई।', 'Correct action.')); } else run.miss(bi('केवल बाहर का इंजेक्टर बदलें व कोड डालना न भूलें।', 'Replace only the odd injector and remember to code it.'));
  };
  const reset = () => { run.reset(); st.current = { P: 1400, t: 0, inb: 0, over: false, switchAt: 6, mode: 'idle', acc: 0 }; setPhase(0); setImv(48); setOpen(50); setP(1400); setLoadMode('idle'); setInband(0); setHist([1400]); setWon(false); setTi(0); setTOk([false, false, false]); setPickT(null); setRfPick(null); setRfOk(false); setActPick(null); setActOk(false); };
  const canNext = phase === 0 ? won : phase === 1 ? tOk.every(Boolean) : rfOk && actOk;
  const phases = [bi('क्लोज़्ड-लूप नियंत्रण', 'Closed-loop control'), bi('दाब ट्रेस', 'Pressure traces'), bi('रिटर्न-फ़्लो परीक्षण', 'Return-flow test')];
  const hints = [bi('लोड बढ़ने पर IMV बढ़ाएँ (अधिक ईंधन), आइडल पर घटाएँ। लगभग: आइडल ≈ 47%, लोड ≈ 87% (PCV 50%)।', 'Raise the IMV on load (more fuel), lower it at idle. Roughly: idle ≈ 47%, load ≈ 87% (PCV 50%).'),
    bi('न बने = PCV/पंप; पिछड़े व IMV संतृप्त = पंप; बंद पर गिरे = रिसाव।', 'Won\'t build = PCV/pump; lags with IMV saturated = pump; collapses at shut-off = leak.'),
    bi('सीमा से बहुत ऊपर वाली पट्टी चुनें।', 'Pick the bar far above the limit.')];
  const dev = ((P - TARGET) / TARGET) * 100;

  return (
    <SimFrame run={run} phases={phases} phase={phase} canNext={canNext} onNext={() => setPhase(phase + 1)} getHint={() => hints[phase]} onReset={reset}
      title={bi('रेल-दाब कंट्रोल रूम', 'Rail pressure control room')}
      intro={bi('IMV व PCV से रेल-दाब को 1400 bar पर बाँधें जबकि लोड बदलता रहता है; फिर दाब-ट्रेस से खराबी पहचानें और रिटर्न-फ़्लो परखें।', 'Hold rail pressure at 1400 bar with the IMV and PCV while load keeps changing; then diagnose faults from pressure traces and read a return-flow test.')}>
      {phase === 0 && (
        <div className="grid gap-4" data-testid="ph-loop">
          <div className="grid sm:grid-cols-[1fr_1.2fr] gap-4 items-start">
            <div className="grid gap-3">
              <Slide id="imv" label={s('IMV ड्यूटी (पंप में ईंधन)', 'IMV duty (fuel into pump)')} min={0} max={100} value={imv} onChange={setImv} unit=" %" disabled={won} />
              <Slide id="pcv" label={s('PCV खुलाव (रेल से वापसी)', 'PCV opening (return from rail)')} min={10} max={100} value={open} onChange={setOpen} unit=" %" disabled={won} />
              <div className={`chip !normal-case !text-sm w-fit ${loadMode === 'load' ? 'bg-hot/20 text-hot' : 'bg-cool/15 text-cool'}`} data-testid="load-mode" data-mode={loadMode}>{loadMode === 'load' ? s('लोड: उच्च', 'Load: HIGH') : s('लोड: आइडल', 'Load: IDLE')}</div>
            </div>
            <div className="grid gap-2">
              <div className="flex items-end justify-between"><div className="text-xs text-mute">{s('रेल दाब', 'Rail pressure')} · {s('लक्ष्य', 'target')} {TARGET}</div><div className={`readout text-3xl ${Math.abs(dev) <= 5 ? 'text-ok' : 'text-hot'}`} data-testid="rail-p">{Math.round(P)} <span className="text-sm text-mute">bar</span></div></div>
              <Trace data={hist} min={0} max={1800} band={[TARGET * 0.95, TARGET * 1.05]} height={90} label="rail pressure" />
              <div><div className="flex justify-between text-xs text-mute mb-1"><span>{s('बैंड में समय', 'Time in band')}</span><span className="readout">{inband.toFixed(1)} / {GOAL_S} s</span></div>
                <div className="h-2.5 rounded bg-panel border border-line overflow-hidden"><div className="h-full bg-ok transition-all" style={{ width: `${Math.min(100, (inband / GOAL_S) * 100)}%` }} data-testid="band-bar" /></div></div>
            </div>
          </div>
          {won && <p className="text-ok font-semibold">{s('लक्ष्य पूरा — अगले चरण पर जाएँ।', 'Goal reached — go to the next phase.')}</p>}
        </div>
      )}
      {phase === 1 && (
        <div className="grid gap-3" data-testid="ph-trace">
          <div className="flex gap-2">{TRACES.map((_, i) => <button key={i} className={`btn !min-h-0 !py-1 ${i === ti ? '!border-cool' : ''}`} data-trace={i} onClick={() => { setTi(i); setPickT(null); }}>{i + 1}{tOk[i] ? ' ✓' : ''}</button>)}</div>
          <div className="rounded-md border border-line bg-panel p-3"><div className="font-bold mb-1">{L(TRACES[ti].name)}</div>
            <Trace data={TRACES[ti].data} min={0} max={1800} height={80} label="trace" />
            <p className="text-sm text-mute mt-2">{L(TRACES[ti].note)}</p></div>
          <Choices options={CAUSES} value={tOk[ti] ? TRACES[ti].ans : pickT} onPick={setPickT} locked={tOk[ti]} correct={tOk[ti] ? TRACES[ti].ans : null} cols={2} />
          <div><button className="btn btn-amber" onClick={submitTrace} disabled={pickT === null || tOk[ti]} data-testid="submit-trace">{s('कारण जमा करें', 'Submit cause')}</button></div>
        </div>
      )}
      {phase === 2 && (
        <div className="grid gap-3" data-testid="ph-return">
          <p className="text-sm text-mute">{s(`रिटर्न-फ़्लो (ml / 30 s, सीमा ≈ ${RF_LIMIT} ml)। जो इंजेक्टर बाहर है, उसकी पट्टी दबाएँ।`, `Return flow (ml / 30 s, limit ≈ ${RF_LIMIT} ml). Tap the bar of the injector that is out.`)}</p>
          <div className="flex items-end gap-3 h-40 px-2 border-b border-line relative">
            <div className="absolute left-0 right-0 border-t-2 border-dashed border-amber" style={{ bottom: `${(RF_LIMIT / 45) * 100}%` }}><span className="absolute right-0 -top-5 text-[10px] text-amber">{RF_LIMIT} ml</span></div>
            {RF.map((v, i) => <button key={i} data-bar={i} onClick={() => tapBar(i)} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
              <span className="readout text-xs">{v}</span><span className={`w-full rounded-t ${rfOk && v > RF_LIMIT ? 'bg-ok' : rfPick === i ? 'bg-hot' : 'bg-cool'}`} style={{ height: `${(v / 45) * 100}%` }} /></button>)}
          </div>
          <div className="flex justify-around text-xs text-mute">{RF.map((_, i) => <span key={i}>{s('इंजेक्टर', 'Inj.')} {i + 1}</span>)}</div>
          {rfOk && <><p className="font-semibold">{s('सही कार्रवाई चुनें:', 'Choose the right action:')}</p><Choices options={ACTIONS} value={actPick} onPick={setActPick} locked={actOk} correct={actOk ? 0 : null} />
            <div><button className="btn btn-amber" onClick={submitAct} disabled={actPick === null || actOk} data-testid="submit-act">{s('जमा करें', 'Submit')}</button></div></>}
        </div>
      )}
    </SimFrame>
  );
}
