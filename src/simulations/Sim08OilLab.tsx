import { useState } from 'react';
import { bi, type Bi } from '@/data/types';
import { useT } from '@/translations';
import { SimFrame } from '@/components/simkit/SimFrame';
import { useRun } from '@/components/simkit/useRun';
import { QSteps, type Q } from '@/components/simkit/QSteps';
import { Slide } from '@/components/simkit/Choices';

type Row = [string, string, string]; // element, value, limit
const report = (id: string, rows: Row[], extra: Bi) => (
  <div className="rounded-md border border-line bg-bg p-3 text-sm" data-report={id}>
    <div className="grid grid-cols-3 gap-x-3 text-xs text-mute font-bold uppercase tracking-wider pb-1 border-b border-line"><span>{'Test'}</span><span>{'ppm'}</span><span>{'Limit'}</span></div>
    {rows.map((r) => <div key={r[0]} className="grid grid-cols-3 gap-x-3 py-1 border-b border-line/50"><span>{r[0]}</span><span className={`readout ${Number(r[1]) > Number(r[2]) ? 'text-hot' : ''}`}>{r[1]}</span><span className="readout text-mute">{r[2]}</span></div>)}
    <ExtraLine t={extra} />
  </div>
);
function ExtraLine({ t }: { t: Bi }) { const { L } = useT(); return <div className="pt-2 text-xs text-mute">{L(t)}</div>; }

const CAUSES: Bi[] = [bi('बाहरी धूल का प्रवेश (एयर-इनटेक)', 'Dirt ingress (air intake)'), bi('बेयरिंग घिसाव', 'Bearing wear'), bi('कूलेंट रिसाव', 'Coolant leak'), bi('ईंधन-मिलावट', 'Fuel dilution')];
const SLOPE = 0.048, START = 10, LIMIT = 100;
const crossH = (LIMIT - START) / SLOPE;
const wear = (h: number) => START + SLOPE * h;

/** Unit 8 — oil-analysis lab: read wear-metal reports, project a trend, pick a strategy, compute availability. */
export default function Sim08OilLab() {
  const { s } = useT();
  const run = useRun(8, 8);
  const [phase, setPhase] = useState(0);
  const [rk, setRk] = useState(0);
  const [d0, setD0] = useState(false);
  const [svc, setSvc] = useState(1000);
  const [d1, setD1] = useState(false);
  const [d2, setD2] = useState(false);

  const R0: Q[] = [
    { q: bi('रिपोर्ट A: सिलिकॉन व आयरन दोनों ऊँचे, एल्युमिनियम थोड़ा। कारण?', 'Report A: silicon and iron both high, aluminium slightly. Cause?'), opts: CAUSES, ans: 0,
      note: report('A', [['Fe', '90', '60'], ['Si', '38', '20'], ['Al', '12', '15'], ['Cu', '8', '30']], bi('सिलिका (धूल) सिलेंडर/रिंग को घिसाती है।', 'Silica (dust) abrades liners and rings.')),
      ok: bi('सही — हवा के रास्ते से धूल।', 'Correct — dust through the air path.'), bad: bi('Si धूल का संकेतक है।', 'Si is the dirt marker.') },
    { q: bi('रिपोर्ट B: तांबा व सीसा ऊँचे, आयरन सामान्य। कारण?', 'Report B: copper and lead high, iron normal. Cause?'), opts: CAUSES, ans: 1,
      note: report('B', [['Cu', '70', '30'], ['Pb', '45', '25'], ['Fe', '15', '60'], ['Si', '6', '20']], bi('बेयरिंग-परत में Cu व Pb होते हैं।', 'Bearing overlay contains Cu and Pb.')),
      ok: bi('सही — बेयरिंग-मिश्रधातु घिस रही है।', 'Correct — bearing alloy is wearing.'), bad: bi('Cu+Pb की जोड़ी बेयरिंग की ओर इशारा करती है।', 'The Cu+Pb pair points to bearings.') },
    { q: bi('रिपोर्ट C: सोडियम व पोटैशियम ऊँचे, ग्लाइकॉल मिला, श्यानता कम। कारण?', 'Report C: sodium and potassium high, glycol found, viscosity low. Cause?'), opts: CAUSES, ans: 2,
      note: report('C', [['Na', '180', '50'], ['K', '60', '20'], ['Fe', '20', '60'], ['Si', '8', '20']], bi('ग्लाइकॉल = कूलेंट का प्रवेश (हेड-गैस्केट/कूलर)।', 'Glycol = coolant entering (head gasket/cooler).')),
      ok: bi('सही — कूलेंट तेल में जा रहा है।', 'Correct — coolant is getting into the oil.'), bad: bi('Na/K + ग्लाइकॉल = कूलेंट।', 'Na/K + glycol = coolant.') },
  ];
  const R2: Q[] = [
    { q: bi('40-टन खदान ट्रक: एक दिन का डाउनटाइम ≈ ₹3 लाख, बेयरिंग-घिसाव ट्रेंड से मापा जा सकता है। रणनीति?', '40-tonne mine truck: a day of downtime ≈ ₹3 lakh, bearing wear can be trended. Strategy?'),
      opts: [bi('रिएक्टिव', 'Reactive'), bi('कैलेंडर आधारित प्रिवेंटिव', 'Calendar-based preventive'), bi('प्रेडिक्टिव (स्थिति-आधारित)', 'Predictive (condition-based)')], ans: 2,
      ok: bi('सही — महँगा डाउनटाइम + मापने योग्य संकेत।', 'Correct — costly downtime plus a measurable signal.'), bad: bi('ऊँची डाउनटाइम-लागत पर इंतज़ार महँगा है।', 'Waiting is expensive when downtime cost is high.') },
    { q: bi('छोटा स्टैंडबाय पंप: सस्ता, दो-दो लगे हैं, बदलना 30 मिनट। रणनीति?', 'Small standby pump: cheap, duplicated, 30-minute swap. Strategy?'),
      opts: [bi('रिएक्टिव (खराब होने पर बदलें)', 'Reactive (run to failure)'), bi('कंपन-निगरानी लगाएँ', 'Install vibration monitoring'), bi('हर 100 घंटे में खोलकर देखें', 'Open and inspect every 100 hours')], ans: 0,
      ok: bi('सही — निगरानी की लागत लाभ से ज़्यादा।', 'Correct — monitoring costs more than it saves.'), bad: bi('कम-जोखिम पर महँगी निगरानी नहीं जमती।', 'Costly monitoring does not pay on low-risk items.') },
    { q: bi('MTBF = 480 h, MTTR = 20 h। उपलब्धता A = ?', 'MTBF = 480 h, MTTR = 20 h. Availability A = ?'), opts: [bi('96.0 %', '96.0 %'), bi('95.0 %', '95.0 %'), bi('24.0 %', '24.0 %'), bi('98.0 %', '98.0 %')], ans: 0,
      ok: bi('A = 480/(480+20) = 96.0%।', 'A = 480/(480+20) = 96.0%.'), bad: bi('A = MTBF ÷ (MTBF + MTTR)।', 'A = MTBF ÷ (MTBF + MTTR).') },
  ];
  const lockSvc = () => {
    if (d1) return;
    const lo = 0.7 * crossH, hi = 0.85 * crossH;
    if (svc >= lo && svc <= hi) { setD1(true); run.add(2, bi('सही अंतराल: सीमा पार होने से पहले सुरक्षा-मार्जिन के साथ।', 'Right interval: before the limit, with a safety margin.')); }
    else if (svc > hi) run.miss(bi('बहुत देर: सीमा के बहुत पास, जोखिम।', 'Too late: too close to the limit.'));
    else run.miss(bi('बहुत जल्दी: तेल/समय की बर्बादी।', 'Too early: wasted oil and time.'));
  };
  const reset = () => { run.reset(); setPhase(0); setSvc(1000); setD0(false); setD1(false); setD2(false); setRk((k) => k + 1); };
  const canNext = [d0, d1, d2][phase] ?? false;
  const phases = [bi('तेल-रिपोर्ट पढ़ें', 'Read oil reports'), bi('ट्रेंड से अंतराल', 'Trend to interval'), bi('रणनीति व उपलब्धता', 'Strategy and availability')];
  const hints = [bi('Si = धूल; Cu+Pb = बेयरिंग; Na/K+ग्लाइकॉल = कूलेंट।', 'Si = dirt; Cu+Pb = bearings; Na/K+glycol = coolant.'), bi('सीमा ≈ 1875 h पर; 70–85% (≈ 1350–1550 h) में सर्विस रखें।', 'The limit is reached ≈ 1875 h; service at 70–85% of that (≈ 1350–1550 h).'), bi('डाउनटाइम महँगा + संकेत मापने योग्य = प्रेडिक्टिव।', 'Costly downtime + a measurable signal = predictive.')];
  const X = (h: number) => 20 + (h / 2400) * 270, Y = (v: number) => 120 - (v / 120) * 110;
  const measured = [0, 250, 500, 750, 1000];

  return (
    <SimFrame run={run} phases={phases} phase={phase} canNext={canNext} onNext={() => setPhase(phase + 1)} getHint={() => hints[phase]} onReset={reset}
      title={bi('ऑयल-एनालिसिस लैब', 'Oil-analysis lab')}
      intro={bi('तीन तेल-रिपोर्टों से घिसने वाला हिस्सा पहचानें, ट्रेंड से सर्विस-अंतराल तय करें और रणनीति व उपलब्धता निकालें।', 'Identify the wearing part from three oil reports, set a service interval from the trend, then choose a strategy and calculate availability.')}>
      {phase === 0 && <QSteps key={'a' + rk} qs={R0} onRight={(t) => run.add(1, t)} onWrong={(t) => run.miss(t)} onDone={() => setD0(true)} />}
      {phase === 1 && (
        <div className="grid md:grid-cols-2 gap-4" data-testid="ph-trend">
          <svg viewBox="0 0 300 140" className="w-full rounded-md border border-line bg-bg" role="img" aria-label="wear trend">
            <line x1="20" x2="290" y1={Y(LIMIT)} y2={Y(LIMIT)} stroke="rgb(var(--hot))" strokeDasharray="5 3" strokeWidth="1.5" />
            <text x="24" y={Y(LIMIT) - 3} fontSize="9" className="fill-hot">{s('घिसाव-सीमा 100 ppm', 'Wear limit 100 ppm')}</text>
            <line x1={X(0)} y1={Y(wear(0))} x2={X(2400)} y2={Y(wear(2400))} stroke="rgb(var(--mute))" strokeDasharray="3 3" />
            <polyline points={measured.map((h) => `${X(h)},${Y(wear(h))}`).join(' ')} fill="none" stroke="rgb(var(--cool))" strokeWidth="2.5" />
            {measured.map((h) => <circle key={h} cx={X(h)} cy={Y(wear(h))} r="3.5" fill="rgb(var(--cool))" />)}
            <line x1={X(svc)} x2={X(svc)} y1="8" y2="124" stroke="rgb(var(--amber))" strokeWidth="2" />
            <text x="150" y="136" textAnchor="middle" fontSize="9" className="fill-mute">{s('चालन-घंटे →', 'Operating hours →')}</text>
          </svg>
          <div className="grid gap-3 content-start">
            <p className="text-sm text-mute">{s('Fe ppm प्रति 250 h लगभग 12 ppm बढ़ रहा है। सीमा कब पार होगी और सर्विस कब रखें?', 'Fe is rising about 12 ppm per 250 h. When will it hit the limit, and when should you service?')}</p>
            <Slide id="svc" label={s('सर्विस-घंटे', 'Service at (h)')} min={500} max={2400} step={50} value={svc} onChange={setSvc} unit=" h" disabled={d1} />
            <div className="text-xs text-mute readout">{s('अनुमानित सीमा-पार', 'Projected limit crossing')}: {Math.round(crossH)} h</div>
            <button className="btn btn-amber" onClick={lockSvc} disabled={d1} data-testid="lock-svc">{s('अंतराल तय करें', 'Set interval')}</button>
          </div>
        </div>
      )}
      {phase === 2 && <QSteps key={'c' + rk} qs={R2} onRight={(t) => run.add(1, t)} onWrong={(t) => run.miss(t)} onDone={() => setD2(true)} />}
    </SimFrame>
  );
}
