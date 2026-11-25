import { useState } from 'react';
import { bi, type Bi } from '@/data/types';
import { useT } from '@/translations';
import { SimFrame } from '@/components/simkit/SimFrame';
import { useRun } from '@/components/simkit/useRun';
import { QSteps, type Q } from '@/components/simkit/QSteps';
import { Seq } from '@/components/simkit/Seq';

const DEC: Bi[] = [bi('उपयोग (Reuse)', 'Reuse'), bi('मरम्मत (Repair/regrind)', 'Repair / regrind'), bi('बदलें (Replace)', 'Replace')];
const ORDER: Bi[] = [
  bi('पिस्टन व हेड नई गैस्केट के साथ, हेड क्रम से टॉर्क करें', 'Fit pistons and head with a new gasket; torque head in sequence'),
  bi('सभी पुर्ज़े व थ्रेड साफ़ करें; दोबारा-उपयोग योग्य बोल्ट जाँचें', 'Clean all parts and threads; check bolts are reusable'),
  bi('पहली बार चालू: नो-लोड रन-इन, रिसाव व टॉर्क दोबारा देखें', 'First start: no-load run-in, recheck leaks and torque'),
  bi('मेन-कैप क्रम व चरणों में टॉर्क करें, फिर क्रैंक हाथ से घुमाएँ', 'Torque main caps in sequence and stages, then turn the crank by hand'),
  bi('तेल-सिस्टम प्राइम करें; ईंधन-कटऑफ पर क्रैंक कर तेल-दाब आने दें', 'Prime the oil system; crank on fuel cut-off until oil pressure shows'),
  bi('बेयरिंग शेल लगाएँ; ऑयल-क्लीयरेंस (Plastigauge) जाँचें', 'Fit bearing shells; check oil clearance (Plastigauge)'),
];
const ORDER_CORRECT = [1, 5, 3, 0, 4, 2];

const readings = (
  <div className="rounded-md border border-line bg-bg p-3 text-sm overflow-x-auto" data-testid="bore-table">
    <table className="w-full text-center readout text-xs sm:text-sm">
      <thead><tr className="text-mute"><th className="text-left font-semibold">mm</th><th>A (thrust)</th><th>B (axial)</th></tr></thead>
      <tbody>
        {[['Top', '100.12', '100.08'], ['Mid', '100.07', '100.05'], ['Bottom', '100.03', '100.02']].map((r) => <tr key={r[0]} className="border-t border-line/60"><td className="text-left py-1">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>)}
      </tbody>
    </table>
    <div className="mt-2 text-xs text-mute">Std bore 100.00 mm</div>
  </div>
);
const tbl = (rows: [Bi, string, string][]) => <LimitTable rows={rows} />;
function LimitTable({ rows }: { rows: [Bi, string, string][] }) {
  const { L, s } = useT();
  return (
    <div className="rounded-md border border-line bg-bg p-3 text-sm grid gap-1">
      <div className="grid grid-cols-3 gap-2 text-xs text-mute font-bold uppercase tracking-wider"><span>{s('मद', 'Item')}</span><span>{s('मापा', 'Measured')}</span><span>{s('सीमा', 'Limit')}</span></div>
      {rows.map((r, i) => <div key={i} className="grid grid-cols-3 gap-2 border-t border-line/50 pt-1"><span>{L(r[0])}</span><span className="readout">{r[1]}</span><span className="readout text-mute">{r[2]}</span></div>)}
    </div>
  );
}

/** Unit 9 — inspection bench: bore-gauge arithmetic, reuse/repair/replace decisions, reassembly order. */
export default function Sim09InspectionBench() {
  const { s } = useT();
  const run = useRun(9, 9);
  const [phase, setPhase] = useState(0);
  const [rk, setRk] = useState(0);
  const [d0, setD0] = useState(false); const [d1, setD1] = useState(false); const [d2, setD2] = useState(false);

  const B: Q[] = [
    { q: bi('अधिकतम घिसाव = सबसे बड़ा पाठ्यांक − मानक बोर = ?', 'Maximum wear = largest reading − standard bore = ?'), opts: [bi('0.12 mm', '0.12 mm'), bi('0.08 mm', '0.08 mm'), bi('0.04 mm', '0.04 mm'), bi('0.20 mm', '0.20 mm')], ans: 0, note: readings,
      ok: bi('100.12 − 100.00 = 0.12 mm।', '100.12 − 100.00 = 0.12 mm.'), bad: bi('सबसे ऊपर A-दिशा का पाठ्यांक सबसे बड़ा है।', 'The top A-direction reading is the largest.') },
    { q: bi('ओवैलिटी (शीर्ष पर) = A − B = ?', 'Ovality (at top) = A − B = ?'), opts: [bi('0.09 mm', '0.09 mm'), bi('0.04 mm', '0.04 mm'), bi('0.12 mm', '0.12 mm'), bi('0.02 mm', '0.02 mm')], ans: 1, note: readings,
      ok: bi('100.12 − 100.08 = 0.04 mm।', '100.12 − 100.08 = 0.04 mm.'), bad: bi('एक ही ऊँचाई पर दो दिशाओं का अंतर लें।', 'Take the difference of two directions at one height.') },
    { q: bi('टेपर (A-दिशा) = शीर्ष − तल = ?', 'Taper (A direction) = top − bottom = ?'), opts: [bi('0.05 mm', '0.05 mm'), bi('0.15 mm', '0.15 mm'), bi('0.09 mm', '0.09 mm'), bi('0.01 mm', '0.01 mm')], ans: 2, note: readings,
      ok: bi('100.12 − 100.03 = 0.09 mm।', '100.12 − 100.03 = 0.09 mm.'), bad: bi('एक ही दिशा में ऊपर और नीचे का अंतर लें।', 'Take top minus bottom in the same direction.') },
  ];
  const D: Q[] = [
    { q: bi('सिलेंडर लाइनर निर्णय?', 'Cylinder liner decision?'), opts: DEC, ans: 0, note: tbl([[bi('घिसाव', 'Wear'), '0.12', '0.15'], [bi('ओवैलिटी', 'Ovality'), '0.04', '0.05'], [bi('टेपर', 'Taper'), '0.09', '0.10']]),
      ok: bi('सही — सब सीमा के भीतर: उपयोग।', 'Correct — all within limits: reuse.'), bad: bi('हर मान सीमा से कम है।', 'Every value is under its limit.') },
    { q: bi('क्रैंक का एक जर्नल?', 'A crankshaft journal?'), opts: DEC, ans: 1, note: tbl([[bi('जर्नल ओवैलिटी', 'Journal ovality'), '0.03', '0.015'], [bi('अंडरसाइज़ उपलब्ध', 'Undersize available'), '0.25', '—'], [bi('दरार', 'Cracks'), s('नहीं', 'none'), '—']]),
      ok: bi('सही — सीमा पार, पर अंडरसाइज़ पर रीग्राइंड संभव।', 'Correct — over limit, but regrind to undersize is possible.'), bad: bi('सीमा पार है पर दरार नहीं; अंडरसाइज़ उपलब्ध है।', 'Over limit but not cracked, and an undersize is available.') },
    { q: bi('सिलेंडर हेड?', 'Cylinder head?'), opts: DEC, ans: 2, note: tbl([[bi('डाई-पेनिट्रेंट', 'Dye penetrant'), s('दो वाल्व-सीट के बीच दरार', 'crack between two valve seats'), s('कोई दरार नहीं', 'no cracks')], [bi('फ़्लैटनेस', 'Flatness'), '0.04', '0.10']]),
      ok: bi('सही — सीटों के बीच दरार: बदलें।', 'Correct — a crack between seats: replace.'), bad: bi('सीटों के बीच दरार की मरम्मत भरोसेमंद नहीं।', 'A crack between seats is not a reliable repair.') },
  ];
  const reset = () => { run.reset(); setPhase(0); setD0(false); setD1(false); setD2(false); setRk((k) => k + 1); };
  const canNext = [d0, d1, d2][phase] ?? false;
  const phases = [bi('बोर-गेज गणित', 'Bore-gauge maths'), bi('उपयोग/मरम्मत/बदलाव', 'Reuse / repair / replace'), bi('पुनःसंयोजन क्रम', 'Reassembly order')];
  const hints = [bi('घिसाव = अधिकतम − मानक; ओवैलिटी = A − B; टेपर = ऊपर − नीचे।', 'Wear = max − standard; ovality = A − B; taper = top − bottom.'), bi('सीमा के भीतर = उपयोग; सीमा पार पर सुधार-योग्य = मरम्मत; दरार = बदलाव।', 'Within limits = reuse; over limit but correctable = repair; cracked = replace.'), bi('साफ़ करें → शेल/क्लीयरेंस → मेन-कैप → पिस्टन/हेड → प्राइम → पहला स्टार्ट।', 'Clean → shells/clearance → main caps → pistons/head → prime → first start.')];

  return (
    <SimFrame run={run} phases={phases} phase={phase} canNext={canNext} onNext={() => setPhase(phase + 1)} getHint={() => hints[phase]} onReset={reset}
      title={bi('इंस्पेक्शन बेंच', 'Inspection bench')}
      intro={bi('बोर-गेज पाठ्यांक से घिसाव निकालें, सीमा-तालिका से उपयोग/मरम्मत/बदलाव तय करें और पुनःसंयोजन का सही क्रम लगाएँ।', 'Work wear out of bore-gauge readings, decide reuse/repair/replace from a limits table, and put reassembly in the right order.')}>
      {phase === 0 && <QSteps key={'a' + rk} qs={B} onRight={(t) => run.add(1, t)} onWrong={(t) => run.miss(t)} onDone={() => setD0(true)} />}
      {phase === 1 && <QSteps key={'b' + rk} qs={D} onRight={(t) => run.add(1, t)} onWrong={(t) => run.miss(t)} onDone={() => setD1(true)} />}
      {phase === 2 && (
        <div className="grid gap-3" data-testid="ph-reasm">
          <p className="text-sm text-mute">{s('इंजन पुनःसंयोजन के छह चरण उनके सही क्रम में दबाएँ।', 'Tap the six reassembly steps in their correct order.')}</p>
          <Seq items={ORDER} correct={ORDER_CORRECT} locked={d2} onWrong={() => run.miss(bi('क्रम ग़लत — पहले सफ़ाई, फिर क्लीयरेंस, फिर टॉर्क।', 'Wrong order — clean first, then clearance, then torque.'))}
            onDone={() => { setD2(true); run.add(3, bi('सही पुनःसंयोजन क्रम।', 'Correct reassembly order.')); }} />
        </div>
      )}
    </SimFrame>
  );
}
