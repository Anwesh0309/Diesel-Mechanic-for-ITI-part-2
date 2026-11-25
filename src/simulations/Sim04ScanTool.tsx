import { useState } from 'react';
import { bi, type Bi } from '@/data/types';
import { useT } from '@/translations';
import { SimFrame } from '@/components/simkit/SimFrame';
import { useRun } from '@/components/simkit/useRun';
import { Seq } from '@/components/simkit/Seq';
import { Choices } from '@/components/simkit/Choices';

const SPNS: { n: number; t: Bi }[] = [
  { n: 102, t: bi('इनटेक मैनिफ़ोल्ड (बूस्ट) दाब', 'Intake-manifold (boost) pressure') },
  { n: 110, t: bi('इंजन कूलेंट तापमान', 'Engine coolant temperature') },
  { n: 157, t: bi('रेल दाब', 'Fuel rail pressure') },
  { n: 1761, t: bi('AdBlue (DEF) टंकी स्तर', 'DEF (AdBlue) tank level') },
  { n: 100, t: bi('इंजन तेल दाब', 'Engine oil pressure') },
  { n: 168, t: bi('बैटरी वोल्टेज', 'Battery voltage') },
];
const FMIS: { n: number; t: Bi }[] = [
  { n: 0, t: bi('सामान्य से बहुत अधिक (सबसे गंभीर)', 'Above normal — most severe') },
  { n: 1, t: bi('सामान्य से बहुत कम (सबसे गंभीर)', 'Below normal — most severe') },
  { n: 3, t: bi('वोल्टेज बहुत ऊँचा / शॉर्ट-हाई', 'Voltage above normal / shorted high') },
  { n: 4, t: bi('वोल्टेज बहुत कम / शॉर्ट-लो', 'Voltage below normal / shorted low') },
  { n: 5, t: bi('करंट कम / ओपन सर्किट', 'Current below normal / open circuit') },
  { n: 18, t: bi('सामान्य से कम — मध्यम गंभीर', 'Below normal — moderately severe') },
];
const CODES = [{ spn: 102, fmi: 3, oc: 7 }, { spn: 110, fmi: 0, oc: 2 }, { spn: 1761, fmi: 18, oc: 1 }];
const PRIO: Bi[] = [bi('SPN 157 · FMI 18 — रेल दाब लक्ष्य से कम', 'SPN 157 · FMI 18 — rail pressure below target'), bi('SPN 168 · FMI 17 — बैटरी वोल्टेज कम', 'SPN 168 · FMI 17 — battery voltage low'), bi('SPN 102 · FMI 4 — बूस्ट सेंसर सर्किट लो', 'SPN 102 · FMI 4 — boost-sensor circuit low'), bi('SPN 639 · FMI 2 — J1939 डेटा-लिंक रुक-रुक कर', 'SPN 639 · FMI 2 — J1939 data link intermittent')];
const PRIO_ORDER = [1, 3, 2, 0];
const CAUSE: Bi[] = [bi('बूस्ट सेंसर खराब', 'Boost sensor is faulty'), bi('VGT वेन यांत्रिक रूप से अटकी (आदेश बनाम वास्तविक पोज़िशन)', 'VGT vanes mechanically stuck (command versus actual position)'), bi('एयर-फ़िल्टर बंद', 'Air filter blocked'), bi('ईंधन टंकी खाली', 'Fuel tank empty')];
const NEXT: Bi[] = [bi('कोड मिटाकर छोड़ दें', 'Clear the code and leave'), bi('वेन/टर्बो साफ़ या मरम्मत करें, फिर एक्चुएटर लर्न व पुनः परीक्षण', 'Clean/repair the vanes/turbo, then learn the actuator and retest'), bi('ECU बदलें', 'Replace the ECU'), bi('बूस्ट सेंसर बदलें', 'Replace the boost sensor')];

type Tab = 'dtc' | 'ff' | 'live' | 'act';

/** Unit 4 — scan-tool console: decode SPN/FMI, prioritise DTCs, work a live-data case. */
export default function Sim04ScanTool() {
  const { s, L } = useT();
  const run = useRun(4, 7);
  const [phase, setPhase] = useState(0);
  const [ci, setCi] = useState(0);
  const [selS, setSelS] = useState<number | null>(null);
  const [selF, setSelF] = useState<number | null>(null);
  const [cOk, setCOk] = useState([false, false, false]);
  const [prioDone, setPrioDone] = useState(false);
  const [tab, setTab] = useState<Tab>('dtc');
  const [cmd, setCmd] = useState<number | null>(null);
  const [ran, setRan] = useState(false);
  const [pCause, setPCause] = useState<number | null>(null);
  const [causeOk, setCauseOk] = useState(false);
  const [pNext, setPNext] = useState<number | null>(null);
  const [nextOk, setNextOk] = useState(false);
  const [showRef, setShowRef] = useState(true);

  const code = CODES[ci];
  const submitDecode = () => {
    if (selS === null || selF === null || cOk[ci]) return;
    if (selS === code.spn && selF === code.fmi) {
      setCOk((o) => o.map((v, i) => (i === ci ? true : v)));
      run.add(1, bi('सही डिकोडिंग।', 'Correct decode.'));
      if (ci < CODES.length - 1) {
        setTimeout(() => {
          setCi((prev) => (prev < CODES.length - 1 ? prev + 1 : prev));
          setSelS(null);
          setSelF(null);
        }, 350);
      }
    }
    else run.miss(bi(selS !== code.spn ? 'SPN ग़लत — पैरामीटर-सूची देखें।' : 'FMI ग़लत — FMI तालिका देखें।', selS !== code.spn ? 'Wrong SPN — check the parameter list.' : 'Wrong FMI — check the FMI table.'));
  };
  const runAct = (p: number) => { setCmd(p); setRan(true); };
  const subCause = () => {
    if (pCause === null || causeOk) return;
    if (!ran) { run.say('info', bi('पहले एक्चुएटर टेस्ट चलाकर देखें।', 'Run the actuator test first.')); return; }
    if (pCause === 1) { setCauseOk(true); run.add(1, bi('सही — आदेश बदलता है पर वास्तविक पोज़िशन नहीं।', 'Correct — the command changes but actual position does not.')); } else run.miss(bi('बूस्ट सेंसर का मान स्पीड/दाब से सुसंगत है; एक्चुएटर-परीक्षण देखें।', 'The boost sensor value agrees with other data; look at the actuator test.'));
  };
  const subNext = () => {
    if (pNext === null || nextOk) return;
    if (pNext === 1) { setNextOk(true); run.add(1, bi('सही अगला कदम।', 'Correct next step.')); } else run.miss(bi('कोड मिटाना या सेंसर बदलना कारण नहीं ठीक करेगा।', 'Clearing codes or replacing the sensor will not fix the cause.'));
  };
  const reset = () => { run.reset(); setPhase(0); setCi(0); setSelS(null); setSelF(null); setCOk([false, false, false]); setPrioDone(false); setTab('dtc'); setCmd(null); setRan(false); setPCause(null); setCauseOk(false); setPNext(null); setNextOk(false); };
  const canNext = phase === 0 ? cOk.every(Boolean) : phase === 1 ? prioDone : causeOk && nextOk;
  const phases = [bi('SPN/FMI डिकोड', 'Decode SPN/FMI'), bi('कोड-प्राथमिकता', 'Prioritise codes'), bi('लाइव डेटा केस', 'Live-data case')];
  const hints = [bi('SPN = क्या; FMI = कैसे। FMI 3 शॉर्ट-हाई, 4 शॉर्ट-लो, 5 खुला।', 'SPN = what; FMI = how. FMI 3 shorted high, 4 shorted low, 5 open.'),
    bi('क्रम: बैटरी/पावर → संचार → सेंसर-सर्किट → प्रदर्शन।', 'Order: battery/power → communication → sensor circuit → performance.'),
    bi('बूस्ट लक्ष्य 1.6 पर वास्तविक 0.4 और VGT आदेश 80% पर पोज़िशन 20% — एक्चुएटर-टैब चलाएँ।', 'Boost target 1.6 vs actual 0.4, and VGT command 80% with position 20% — run the actuator tab.')];
  const tabs: [Tab, Bi][] = [['dtc', bi('कोड', 'Codes')], ['ff', bi('फ़्रीज़ फ़्रेम', 'Freeze frame')], ['live', bi('लाइव डेटा', 'Live data')], ['act', bi('एक्चुएटर टेस्ट', 'Actuator test')]];
  const rowCls = 'flex justify-between border-b border-line/60 py-1.5 text-sm';

  return (
    <SimFrame run={run} phases={phases} phase={phase} canNext={canNext} onNext={() => setPhase(phase + 1)} getHint={() => hints[phase]} onReset={reset}
      title={bi('स्कैन-टूल कंसोल', 'Scan-tool console')}
      intro={bi('J1939 कोड डिकोड करें, कई कोड में मूल कारण का क्रम तय करें और स्कैन-टूल के डेटा से वास्तविक खराबी सिद्ध करें।', 'Decode J1939 codes, order several codes by root cause, and prove the real fault from scan-tool data.')}>
      {phase === 0 && (
        <div className="grid gap-3" data-testid="ph-decode">
          <div className="flex gap-2">{CODES.map((_, i) => <button key={i} data-code={i} className={`btn !min-h-0 !py-1 ${i === ci ? '!border-cool' : ''}`} onClick={() => { setCi(i); setSelS(null); setSelF(null); }}>{i + 1}{cOk[i] ? ' ✓' : ''}</button>)}</div>
          <div className="rounded-md bg-bg border border-line p-4 text-center"><div className="text-xs text-mute">{s('सक्रिय कोड', 'Active code')}</div>
            <div className="readout text-2xl sm:text-3xl text-amber" data-testid="code-line">SPN {code.spn} · FMI {code.fmi} · OC {code.oc}</div></div>
          <div className="grid md:grid-cols-2 gap-3">
            <div><div className="text-xs font-bold uppercase tracking-wider text-mute mb-1">SPN</div>
              <div className="grid gap-1.5">{SPNS.map((p) => <button key={p.n} data-spn={p.n} disabled={cOk[ci]} onClick={() => setSelS(p.n)} className={`btn !justify-start text-left !h-auto !py-1.5 !text-xs ${(cOk[ci] ? code.spn : selS) === p.n ? '!border-cool bg-cool/10' : ''}`}><span className="readout mr-2">{p.n}</span>{L(p.t)}</button>)}</div></div>
            <div><div className="text-xs font-bold uppercase tracking-wider text-mute mb-1">FMI <button className="underline ml-2" onClick={() => setShowRef(!showRef)}>{showRef ? s('छुपाएँ', 'hide') : s('दिखाएँ', 'show')}</button></div>
              <div className="grid gap-1.5">{FMIS.map((f) => <button key={f.n} data-fmi={f.n} disabled={cOk[ci]} onClick={() => setSelF(f.n)} className={`btn !justify-start text-left !h-auto !py-1.5 !text-xs ${(cOk[ci] ? code.fmi : selF) === f.n ? '!border-cool bg-cool/10' : ''}`}><span className="readout mr-2">{f.n}</span>{showRef ? L(f.t) : ''}</button>)}</div></div>
          </div>
          <div><button className="btn btn-amber" onClick={submitDecode} disabled={selS === null || selF === null || cOk[ci]} data-testid="submit-decode">{s('डिकोड जमा करें', 'Submit decode')}</button></div>
        </div>
      )}
      {phase === 1 && (
        <div className="grid gap-3" data-testid="ph-prio">
          <p className="text-sm text-mute">{s('चार सक्रिय कोड मिले हैं। उन्हें उस क्रम में दबाएँ जिसमें आप ठीक करेंगे (मूल कारण पहले)।', 'Four active codes were found. Tap them in the order you would fix them (root cause first).')}</p>
          <Seq items={PRIO} correct={PRIO_ORDER} onWrong={() => run.miss(bi('पहले पावर/संचार जैसे मूल कारण, प्रदर्शन-कोड सबसे अंत में।', 'Root causes such as power/communication first, performance codes last.'))}
            onDone={() => { setPrioDone(true); run.add(2, bi('सही क्रम: बैटरी → डेटा-लिंक → सेंसर-सर्किट → प्रदर्शन।', 'Correct order: battery → data link → sensor circuit → performance.')); }} locked={prioDone} />
        </div>
      )}
      {phase === 2 && (
        <div className="grid gap-3" data-testid="ph-live">
          <div className="rounded-md border border-line bg-panel p-3 text-sm"><b>{s('शिकायत:', 'Complaint:')}</b> {s('ट्रक ढलान पर चढ़ते समय शक्ति खो देता है।', 'The truck loses power when climbing hills.')}</div>
          <div className="flex flex-wrap gap-1.5" role="tablist">{tabs.map(([k, n]) => <button key={k} role="tab" data-tab={k} aria-selected={tab === k} onClick={() => setTab(k)} className={`btn !min-h-0 !py-1.5 ${tab === k ? '!bg-cool !text-bg' : ''}`}>{L(n)}</button>)}</div>
          <div className="rounded-md bg-bg border border-line p-3 min-h-[8rem]" data-testid="tab-body">
            {tab === 'dtc' && <div><div className={rowCls}><span className="readout">SPN 102 · FMI 18</span><span>{s('बूस्ट दाब लक्ष्य से कम', 'Boost pressure below target')}</span></div><div className={rowCls}><span className="readout">SPN 2790 · FMI 7</span><span>{s('VGT पोज़िशन — यांत्रिक अनुत्तरदायी', 'VGT position — mechanical not responding')}</span></div></div>}
            {tab === 'ff' && <div>{[[s('इंजन गति', 'Engine speed'), '1800 rpm'], [s('लोड', 'Load'), '92 %'], [s('कूलेंट', 'Coolant'), '88 °C'], [s('वाहन गति', 'Vehicle speed'), '34 km/h']].map(([a, b]) => <div key={a} className={rowCls}><span>{a}</span><span className="readout">{b}</span></div>)}</div>}
            {tab === 'live' && <div>{[[s('बूस्ट लक्ष्य', 'Boost target'), '1.60 bar'], [s('बूस्ट वास्तविक', 'Boost actual'), '0.40 bar'], [s('VGT आदेश', 'VGT command'), '80 %'], [s('VGT वास्तविक पोज़िशन', 'VGT actual position'), '20 %'], [s('एयर-फ़िल्टर ΔP', 'Air-filter ΔP'), '12 mbar']].map(([a, b]) => <div key={a} className={rowCls}><span>{a}</span><span className="readout">{b}</span></div>)}</div>}
            {tab === 'act' && <div className="grid gap-2"><p className="text-sm text-mute">{s('VGT को आदेश दें और वास्तविक पोज़िशन देखें (इंजन आइडल पर)।', 'Command the VGT and read actual position (engine at idle).')}</p>
              <div className="flex gap-2">{[0, 50, 100].map((p) => <button key={p} className={`btn ${cmd === p ? '!border-cool' : ''}`} data-cmd={p} onClick={() => runAct(p)}>{p}%</button>)}</div>
              <div className={rowCls}><span>{s('आदेश', 'Command')}</span><span className="readout">{cmd === null ? '—' : `${cmd} %`}</span></div>
              <div className={rowCls}><span>{s('वास्तविक पोज़िशन', 'Actual position')}</span><span className="readout text-hot" data-testid="vgt-actual">{cmd === null ? '—' : '20 %'}</span></div></div>}
          </div>
          <div><div className="text-xs font-bold uppercase tracking-wider text-mute mb-1">{s('मूल कारण', 'Root cause')}</div>
            <Choices options={CAUSE} value={causeOk ? 1 : pCause} onPick={setPCause} locked={causeOk} correct={causeOk ? 1 : null} cols={2} />
            <div className="mt-2"><button className="btn btn-amber" onClick={subCause} disabled={pCause === null || causeOk} data-testid="submit-cause">{s('कारण जमा करें', 'Submit cause')}</button></div></div>
          {causeOk && <div><div className="text-xs font-bold uppercase tracking-wider text-mute mb-1">{s('अगला कदम', 'Next step')}</div>
            <Choices options={NEXT} value={nextOk ? 1 : pNext} onPick={setPNext} locked={nextOk} correct={nextOk ? 1 : null} cols={2} />
            <div className="mt-2"><button className="btn btn-amber" onClick={subNext} disabled={pNext === null || nextOk} data-testid="submit-next">{s('जमा करें', 'Submit')}</button></div></div>}
        </div>
      )}
    </SimFrame>
  );
}
