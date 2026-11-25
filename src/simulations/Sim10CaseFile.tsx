import { useState } from 'react';
import { bi, type Bi } from '@/data/types';
import { useT } from '@/translations';
import { SimFrame } from '@/components/simkit/SimFrame';
import { useRun } from '@/components/simkit/useRun';
import { QSteps, MultiPick, type Q } from '@/components/simkit/QSteps';

const QS: Bi[] = [
  bi('यह कब होता है — ठंडे/गर्म इंजन पर, आइडल या लोड में?', 'When does it happen — cold or hot, idle or load?'),
  bi('हाल में ईंधन, फ़िल्टर या इंजेक्टर का कोई काम हुआ?', 'Has any fuel, filter or injector work been done recently?'),
  bi('क्या डिपस्टिक में तेल का स्तर बढ़ा या डीज़ल की गंध है?', 'Has the dipstick level risen or does the oil smell of diesel?'),
  bi('गाड़ी का रंग क्या है?', 'What colour is the vehicle?'),
  bi('ट्रक कितने में खरीदा था?', 'How much did you pay for the truck?'),
  bi('आपके बेड़े में सबसे अच्छा ड्राइवर कौन है?', 'Who is the best driver in your fleet?'),
];
const TESTS: { t: Bi; m: number }[] = [
  { t: bi('डिपस्टिक स्तर व गंध जाँच', 'Dipstick level and smell check'), m: 5 },
  { t: bi('इंजेक्टर लीक-ऑफ (रिटर्न-फ़्लो) परीक्षण', 'Injector leak-off (return-flow) test'), m: 20 },
  { t: bi('फ़ॉल्ट कोड व फ़्रीज़ फ़्रेम पढ़ें', 'Read fault codes and freeze frame'), m: 5 },
  { t: bi('सभी सिलेंडरों का कम्प्रेशन परीक्षण', 'Compression test on all cylinders'), m: 25 },
  { t: bi('बैटरी व स्टार्टर बदलकर देखें', 'Replace battery and starter to see'), m: 35 },
  { t: bi('किसी और ट्रक का ECU लगाकर देखें', 'Swap in the ECU from another truck'), m: 40 },
];
const BUDGET = 60;
const CB: Bi[] = [
  bi('ईंधन-मिले तेल व फ़िल्टर बदलें', 'Change the fuel-diluted oil and filter'),
  bi('बाकी इंजेक्टरों का भी लीक-ऑफ जाँचें', 'Check the other injectors’ leak-off too'),
  bi('डेटा-लॉग के साथ रोड-टेस्ट, 100 km बाद डिपस्टिक दोबारा देखें', 'Road test with data logging; recheck the dipstick after 100 km'),
  bi('कोड मिटाकर गाड़ी सौंप दें', 'Clear the codes and hand the truck over'),
  bi('ग्राहक को कुछ न बताएँ', 'Tell the customer nothing about what was found'),
];
const same = (a: number[], b: number[]) => a.length === b.length && b.every((x) => a.includes(x));
const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

/** Unit 10 — one end-to-end case file: interview → evidence ladder → root cause → estimate → comeback checks. */
export default function Sim10CaseFile() {
  const { s } = useT();
  const run = useRun(10, 8);
  const [phase, setPhase] = useState(0);
  const [rk, setRk] = useState(0);
  const [iq, setIq] = useState<number[]>([]); const [d0, setD0] = useState(false);
  const [tt, setTt] = useState<number[]>([]); const [testOk, setTestOk] = useState(false); const [causeOk, setCauseOk] = useState(false);
  const [cb, setCb] = useState<number[]>([]); const [cbOk, setCbOk] = useState(false); const [estOk, setEstOk] = useState(false);
  const tog = (set: React.Dispatch<React.SetStateAction<number[]>>) => (i: number) => set((a) => (a.includes(i) ? a.filter((x) => x !== i) : [...a, i]));

  const submitInterview = () => {
    if (d0) return;
    if (same(iq, [0, 1, 2])) { setD0(true); run.add(2, bi('सही प्रश्न चुने: समय/परिस्थिति, हाल का काम, तेल की स्थिति।', 'Right questions: conditions, recent work, oil condition.')); }
    else run.miss(bi('केवल वही प्रश्न चुनें जो निदान में काम आएँ।', 'Select only the questions that help the diagnosis.'));
  };
  const total = tt.reduce((a, i) => a + TESTS[i].m, 0);
  const submitTests = () => {
    if (testOk) return;
    if (total > BUDGET) run.miss(bi('समय-बजट 60 मिनट से अधिक।', 'Over the 60-minute budget.'));
    else if (!tt.includes(1)) run.miss(bi('सबसे निर्णायक परीक्षण (लीक-ऑफ) छूट गया।', 'You missed the decisive test (leak-off).'));
    else if (tt.includes(4) || tt.includes(5)) run.miss(bi('बिना प्रमाण पुर्ज़े बदलना/अदला-बदली समय-धन की बर्बादी है।', 'Swapping parts without evidence wastes time and money.'));
    else { setTestOk(true); run.add(2, bi('प्रमाण-आधारित परीक्षण-सेट, बजट के भीतर।', 'Evidence-based test set, within budget.')); }
  };
  const submitCb = () => {
    if (cbOk) return;
    if (same(cb, [0, 1, 2])) { setCbOk(true); run.add(2, bi('कॉमबैक-रोकथाम की सही जाँचें।', 'The right comeback-prevention checks.')); }
    else run.miss(bi('कोड मिटाना या ग्राहक को न बताना कॉमबैक बढ़ाता है।', 'Clearing codes or keeping the customer in the dark raises comebacks.'));
  };
  const CAUSE: Q[] = [{ q: bi('मूल कारण क्या है?', 'What is the root cause?'), opts: [bi('स्टार्टर कमज़ोर — बदलें', 'Weak starter — replace it'), bi('सिलेंडर 2 का इंजेक्टर रिस रहा है (अधिक लीक-ऑफ) → ओवर-फ़्यूलिंग व तेल में डीज़ल', 'Injector 2 leaking (excess leak-off) → over-fuelling and diesel in the oil'), bi('खराब डीज़ल', 'Bad diesel'), bi('कमज़ोर बैटरी', 'Weak battery')], ans: 1,
    ok: bi('सही — लक्षण नहीं, कारण: रिसता इंजेक्टर।', 'Correct — the cause, not the symptom: a leaking injector.'), bad: bi('गर्म-स्टार्ट की दिक्कत लक्षण है; सबूत (लीक-ऑफ, तेल) क्या कहते हैं?', 'Hard hot-start is the symptom; what does the evidence (leak-off, oil) say?'),
    note: <div className="rounded-md border border-line bg-bg p-3 text-sm grid gap-1"><div className="flex justify-between"><span>{s('इंजेक्टर लीक-ऑफ (सिलेंडर 1/2/3/4)', 'Injector leak-off (cyl 1/2/3/4)')}</span><span className="readout">12 / <b className="text-hot">96</b> / 11 / 13 ml</span></div><div className="flex justify-between"><span>{s('डिपस्टिक', 'Dipstick')}</span><span className="readout text-hot">{s('+12 mm, डीज़ल गंध', '+12 mm, diesel smell')}</span></div></div> }];
  const EST: Q[] = [{ q: bi('रिपेयर-ऑर्डर कुल (GST 18% सहित) = ?', 'Repair-order total (incl. 18% GST) = ?'), opts: [bi('₹29,300', '₹29,300'), bi('₹34,574', '₹34,574'), bi('₹31,200', '₹31,200'), bi('₹36,000', '₹36,000')], ans: 1,
    ok: bi('29,300 × 1.18 = ₹34,574।', '29,300 × 1.18 = ₹34,574.'), bad: bi('उप-योग निकालकर उस पर 18% जोड़ें।', 'Add up the subtotal, then add 18%.'),
    note: <div className="rounded-md border border-line bg-bg p-3 text-sm grid gap-1">{[[s('इंजेक्टर', 'Injector'), 18000], [s('सील किट', 'Seal kit'), 1200], [s('श्रम 4 h × ₹900', 'Labour 4 h × ₹900'), 3600], [s('तेल व फ़िल्टर', 'Oil and filter'), 6500]].map(([a, b]) => <div key={String(a)} className="flex justify-between"><span>{a}</span><span className="readout">{inr(b as number)}</span></div>)}</div> }];

  const reset = () => { run.reset(); setPhase(0); setIq([]); setD0(false); setTt([]); setTestOk(false); setCauseOk(false); setCb([]); setCbOk(false); setEstOk(false); setRk((k) => k + 1); };
  const canNext = [d0, testOk && causeOk, estOk && cbOk][phase] ?? false;
  const phases = [bi('ग्राहक साक्षात्कार', 'Customer interview'), bi('प्रमाण व मूल कारण', 'Evidence and root cause'), bi('अनुमान व कॉमबैक-रोकथाम', 'Estimate and comeback prevention')];
  const hints = [bi('वे तीन प्रश्न चुनें जो समय, हाल का काम और तेल की स्थिति पूछते हैं।', 'Pick the three that ask about conditions, recent work and oil condition.'), bi('60 मिनट में डिपस्टिक + लीक-ऑफ + कोड (30 मिनट) काफ़ी हैं।', 'Dipstick + leak-off + codes (30 min) fit the 60-minute budget.'), bi('उप-योग ₹29,300; ऊपर 18% GST।', 'Subtotal ₹29,300; add 18% GST on top.')];

  return (
    <SimFrame run={run} phases={phases} phase={phase} canNext={canNext} onNext={() => setPhase(phase + 1)} getHint={() => hints[phase]} onReset={reset}
      title={bi('केस-फ़ाइल: गर्म स्टार्ट में दिक्कत', 'Case file: hard hot start')}
      intro={bi('एक पूरा वर्कशॉप-केस: साक्षात्कार, सीमित समय में प्रमाण-आधारित परीक्षण, मूल कारण, लागत-अनुमान और कॉमबैक-रोकथाम।', 'One full workshop case: interview, evidence-based tests in limited time, root cause, cost estimate and comeback prevention.')}>
      <div className="rounded-md border border-line bg-panel p-3 text-sm mb-3"><b>{s('शिकायत:', 'Complaint:')}</b> {s('ट्रक गर्म होने पर मुश्किल से स्टार्ट होता है, सफ़ेद धुआँ देता है और खुरदुरा चलता है।', 'The truck is hard to start when hot, gives white smoke and runs rough.')}</div>
      {phase === 0 && (
        <div className="grid gap-3" data-testid="ph-interview">
          <p className="text-sm text-mute">{s('ग्राहक से कौन-से तीन प्रश्न पूछेंगे?', 'Which three questions will you ask the customer?')}</p>
          <MultiPick items={QS} sel={iq} onToggle={tog(setIq)} locked={d0} />
          <div><button className="btn btn-amber" onClick={submitInterview} disabled={d0 || iq.length === 0} data-testid="submit-interview">{s('प्रश्न जमा करें', 'Submit questions')}</button></div>
        </div>
      )}
      {phase === 1 && (
        <div className="grid gap-4" data-testid="ph-evidence">
          <div className="grid gap-2">
            <div className="flex justify-between text-sm"><span className="text-mute">{s('परीक्षण चुनें (बजट 60 मिनट)', 'Choose tests (60-minute budget)')}</span><span className={`readout ${total > BUDGET ? 'text-hot' : 'text-cool'}`} data-testid="budget">{total} / {BUDGET} min</span></div>
            <MultiPick items={TESTS.map((t) => bi(`${t.t.hi} — ${t.m} मिनट`, `${t.t.en} — ${t.m} min`))} sel={tt} onToggle={tog(setTt)} locked={testOk} />
            <div><button className="btn btn-amber" onClick={submitTests} disabled={testOk || tt.length === 0} data-testid="submit-tests">{s('परीक्षण-योजना जमा करें', 'Submit test plan')}</button></div>
          </div>
          {testOk && <QSteps key={'c' + rk} qs={CAUSE} onRight={(t) => { run.add(1, t); setCauseOk(true); }} onWrong={(t) => run.miss(t)} />}
        </div>
      )}
      {phase === 2 && (
        <div className="grid gap-4" data-testid="ph-close">
          <QSteps key={'e' + rk} qs={EST} onRight={(t) => { run.add(1, t); setEstOk(true); }} onWrong={(t) => run.miss(t)} />
          <div className="grid gap-2"><p className="text-sm text-mute">{s('कॉमबैक रोकने के लिए कौन-से तीन काम करेंगे?', 'Which three actions will you take to prevent a comeback?')}</p>
            <MultiPick items={CB} sel={cb} onToggle={tog(setCb)} locked={cbOk} />
            <div><button className="btn btn-amber" onClick={submitCb} disabled={cbOk || cb.length === 0} data-testid="submit-cb">{s('जमा करें', 'Submit')}</button></div></div>
        </div>
      )}
    </SimFrame>
  );
}
