import type { ReactNode } from 'react';
import { useT } from '@/translations';

const INK = 'rgb(var(--ink))', MUTE = 'rgb(var(--mute))', LINE = 'rgb(var(--line))', COOL = 'rgb(var(--cool))', AMBER = 'rgb(var(--amber))', HOT = 'rgb(var(--hot))', OK = 'rgb(var(--ok))', PANEL = 'rgb(var(--panel))';

function Frame({ children, label, h = 270 }: { children: ReactNode; label: string; h?: number }) {
  return <svg viewBox={`0 0 640 ${h}`} className="w-full h-auto" role="img" aria-label={label} data-testid="custom-scene">{children}</svg>;
}
const T = ({ x, y, children, c = INK, size = 13, anchor = 'start', w = 600 }: { x: number; y: number; children: ReactNode; c?: string; size?: number; anchor?: 'start' | 'middle' | 'end'; w?: number }) =>
  <text x={x} y={y} fontSize={size} fill={c} textAnchor={anchor} fontWeight={w}>{children}</text>;
const Draw = ({ d, c, len = 900, dur = 2.2, wd = 3 }: { d: string; c: string; len?: number; dur?: number; wd?: number }) => (
  <path d={d} fill="none" stroke={c} strokeWidth={wd} strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len}>
    <animate attributeName="stroke-dashoffset" from={len} to="0" dur={`${dur}s`} fill="freeze" />
  </path>
);
const Pulse = ({ children }: { children: ReactNode }) => <g><animate attributeName="opacity" values="1;.45;1" dur="1.4s" repeatCount="indefinite" />{children}</g>;

/* ---------------- Unit 2 — sensors ---------------- */
export function Scene02({ step }: { step: number }) {
  const { s } = useT();
  const toothPath = (() => { let d = 'M20 150'; let x = 20; for (let i = 0; i < 24; i++) { if (i === 11 || i === 12) { d += ` L${x + 22} 150`; x += 22; continue; } d += ` L${x} 110 L${x + 11} 110 L${x + 11} 150 L${x + 22} 150`; x += 22; } return d; })();
  return (
    <Frame label="sensor scene">
      {step === 0 && <g key="s0">
        <T x={20} y={30} size={15}>{s('क्रैंक: 60−2 दाँत (गैप = TDC संदर्भ)', 'Crank: 60−2 teeth (the gap = TDC reference)')}</T>
        <Draw d={toothPath} c={COOL} len={1400} dur={3} />
        <T x={20} y={186} c={MUTE} size={12}>{s('कैम: हर दो क्रैंक-घुमाव पर एक पल्स → चरण (फ़ेज़) पहचान', 'Cam: one pulse per two crank turns → phase identification')}</T>
        <Draw d="M20 240 L180 240 L180 205 L200 205 L200 240 L620 240" c={AMBER} len={900} dur={3} />
        <circle cx="528" cy="130" r="0" fill={HOT}><animate attributeName="r" values="0;9;0" dur="1.6s" repeatCount="indefinite" /></circle>
        <T x={528} y={100} anchor="middle" c={HOT} size={12}>{s('गैप', 'gap')}</T>
      </g>}
      {step === 1 && <g key="s1">
        <T x={20} y={30} size={15}>{s('NTC: तापमान बढ़ने पर प्रतिरोध घटता है', 'NTC: resistance falls as temperature rises')}</T>
        <line x1="50" y1="230" x2="600" y2="230" stroke={LINE} strokeWidth="2" /><line x1="50" y1="50" x2="50" y2="230" stroke={LINE} strokeWidth="2" />
        <Draw d="M50 60 C 120 150, 220 200, 600 222" c={COOL} len={800} dur={2.4} />
        <circle r="8" fill={AMBER}><animateMotion dur="3s" repeatCount="indefinite" path="M50 60 C 120 150, 220 200, 600 222" /></circle>
        <T x={60} y={252} c={MUTE} size={12}>−20 °C</T><T x={590} y={252} c={MUTE} size={12} anchor="end">120 °C</T>
        <T x={62} y={76} c={MUTE} size={12}>{s('~15 kΩ', '~15 kΩ')}</T><T x={590} y={212} c={MUTE} size={12} anchor="end">~0.1 kΩ</T>
      </g>}
      {step === 2 && <g key="s2">
        <T x={20} y={30} size={15}>{s('5 V संदर्भ और संकेत-खिड़की', '5 V reference and the signal window')}</T>
        <rect x="60" y="50" width="70" height="200" rx="6" fill={PANEL} stroke={LINE} />
        <rect x="60" y="50" width="70" height="20" fill="rgb(var(--hot) / .3)" /><rect x="60" y="230" width="70" height="20" fill="rgb(var(--hot) / .3)" />
        <rect x="60" y="70" width="70" height="160" fill="rgb(var(--ok) / .22)" />
        <T x={145} y={64} c={HOT} size={12}>{s('> 4.5 V : शॉर्ट-हाई / FMI 3', '> 4.5 V : shorted high / FMI 3')}</T>
        <T x={145} y={150} c={OK} size={12}>{s('0.5 – 4.5 V : सामान्य', '0.5 – 4.5 V : normal')}</T>
        <T x={145} y={244} c={HOT} size={12}>{s('< 0.5 V : शॉर्ट-लो / FMI 4', '< 0.5 V : shorted low / FMI 4')}</T>
        <circle cx="95" cy="150" r="9" fill={AMBER}><animate attributeName="cy" values="150;100;190;150" dur="4s" repeatCount="indefinite" /></circle>
        <T x={400} y={110} c={MUTE} size={12}>{s('खुला तार → पुल-अप से ~5 V', 'Open wire → pull-up reads ~5 V')}</T>
        <T x={400} y={140} c={MUTE} size={12}>{s('GND से शॉर्ट → ~0 V', 'Short to GND → ~0 V')}</T>
        <T x={400} y={170} c={MUTE} size={12}>{s('गिरा संदर्भ → सभी रीडिंग बहकती हैं', 'Dropped reference → all readings drift')}</T>
      </g>}
      {step === 3 && <g key="s3">
        <T x={20} y={30} size={15}>{s('दो ट्रैक: APP2 = APP1 का आधा, हमेशा', 'Two tracks: APP2 = half of APP1, always')}</T>
        <Draw d="M60 230 L400 60" c={COOL} len={500} dur={2} />
        <Draw d="M60 230 L400 145" c={AMBER} len={500} dur={2.4} />
        <T x={410} y={66} c={COOL} size={12}>APP1</T><T x={410} y={150} c={AMBER} size={12}>APP2</T>
        <rect x="470" y="70" width="140" height="150" rx="8" fill={PANEL} stroke={LINE} />
        <T x={540} y={96} anchor="middle" size={12}>{s('ECU जाँच', 'ECU check')}</T>
        <T x={540} y={126} anchor="middle" c={OK} size={12}>2·APP2 ≈ APP1 ✓</T>
        <Pulse><T x={540} y={170} anchor="middle" c={HOT} size={12}>{s('बेमेल → लिम्प-होम', 'mismatch → limp-home')}</T></Pulse>
      </g>}
    </Frame>
  );
}

/* ---------------- Unit 5 — emissions ---------------- */
export function Scene05({ step }: { step: number }) {
  const { s } = useT();
  return (
    <Frame label="emissions scene">
      {step === 0 && <g key="s0">
        <T x={20} y={30} size={15}>{s('NOx और कालिख एक-दूसरे के विरोधी हैं', 'NOx and soot pull against each other')}</T>
        <line x1="50" y1="230" x2="600" y2="230" stroke={LINE} strokeWidth="2" /><line x1="50" y1="50" x2="50" y2="230" stroke={LINE} strokeWidth="2" />
        <Draw d="M60 70 C 200 100, 380 190, 590 225" c={HOT} len={700} dur={2.2} />
        <Draw d="M60 225 C 260 215, 420 150, 590 70" c={AMBER} len={700} dur={2.2} />
        <T x={70} y={84} c={HOT} size={12}>NOx</T><T x={560} y={92} c={AMBER} size={12} anchor="end">{s('कालिख', 'Soot')}</T>
        <T x={325} y={250} c={MUTE} size={12} anchor="middle">{s('EGR दर →', 'EGR rate →')}</T>
        <Pulse><circle cx="340" cy="155" r="9" fill="none" stroke={OK} strokeWidth="3" /></Pulse>
        <T x={355} y={180} c={OK} size={12}>{s('सही संतुलन', 'the balance')}</T>
      </g>}
      {step === 1 && <g key="s1">
        <T x={20} y={30} size={15}>{s('DPF भरता है, फिर जलकर साफ़ होता है', 'The DPF fills, then burns clean')}</T>
        <rect x="60" y="70" width="320" height="120" rx="14" fill={PANEL} stroke={LINE} strokeWidth="2" />
        {Array.from({ length: 8 }).map((_, i) => <line key={i} x1={80 + i * 38} y1="80" x2={80 + i * 38} y2="180" stroke={LINE} />)}
        <rect x="62" y="72" width="0" height="116" fill={MUTE} opacity=".7"><animate attributeName="width" values="0;316;316;0" keyTimes="0;.55;.7;1" dur="6s" repeatCount="indefinite" /></rect>
        <rect x="62" y="72" width="316" height="116" fill={HOT} opacity="0"><animate attributeName="opacity" values="0;0;.45;0" keyTimes="0;.55;.8;1" dur="6s" repeatCount="indefinite" /></rect>
        <T x={220} y={215} anchor="middle" c={MUTE} size={12}>{s('कालिख जमती है → ΔP बढ़ता है', 'soot builds → ΔP rises')}</T>
        <T x={400} y={110} c={HOT} size={13}>{s('≈ 600 °C पर सक्रिय रीजनरेशन', 'Active regeneration ≈ 600 °C')}</T>
        <T x={400} y={140} c={MUTE} size={12}>{s('> 700 °C = फिल्टर को खतरा', '> 700 °C = danger to the filter')}</T>
      </g>}
      {step === 2 && <g key="s2">
        <T x={20} y={30} size={15}>{s('AdBlue → अमोनिया → NOx का रूपांतरण', 'AdBlue → ammonia → NOx conversion')}</T>
        {[[30, 'NOx + O₂'], [190, 'AdBlue'], [350, 'NH₃'], [490, 'N₂ + H₂O']].map(([x, l], i) => (
          <g key={i}><rect x={x as number} y="100" width={i === 3 ? 120 : 110} height="60" rx="8" fill={PANEL} stroke={i === 3 ? OK : LINE} strokeWidth="2" /><T x={(x as number) + (i === 3 ? 60 : 55)} y={136} anchor="middle" size={13}>{l as string}</T></g>
        ))}
        {[140, 300, 460].map((x) => <line key={x} x1={x} y1="130" x2={x + 48} y2="130" stroke={COOL} strokeWidth="3" strokeDasharray="8 6" markerEnd="url(#a5)"><animate attributeName="stroke-dashoffset" from="0" to="-28" dur="1s" repeatCount="indefinite" /></line>)}
        <defs><marker id="a5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill={COOL} /></marker></defs>
        <T x={245} y={190} anchor="middle" c={MUTE} size={12}>{s('गर्मी से यूरिया → अमोनिया', 'heat turns urea into ammonia')}</T>
        <T x={430} y={212} anchor="middle" c={MUTE} size={12}>{s('SCR उत्प्रेरक (≥ 200 °C)', 'SCR catalyst (≥ 200 °C)')}</T>
      </g>}
      {step === 3 && <g key="s3">
        <T x={20} y={30} size={15}>{s('ECU निगरानी: चेतावनी → पावर-घटाव → स्पीड-सीमा', 'ECU monitoring: warning → derate → speed limit')}</T>
        {[[60, 'rgb(var(--ok))', s('चेतावनी', 'Warning')], [240, 'rgb(var(--amber))', s('टॉर्क-घटाव', 'Torque derate')], [420, 'rgb(var(--hot))', s('स्पीड-सीमा', 'Speed limit')]].map(([x, c, l], i) => (
          <g key={i}><rect x={x as number} y={170 - i * 45} width="150" height={60 + i * 45} rx="8" fill={c as string} opacity=".25" stroke={c as string} strokeWidth="2" /><T x={(x as number) + 75} y={150 - i * 45} anchor="middle" size={13}>{l as string}</T></g>
        ))}
        <T x={320} y={256} anchor="middle" c={MUTE} size={12}>{s('AdBlue घटने / खराब गुणवत्ता / डोज़र-फ़ॉल्ट पर चरण-दर-चरण', 'steps triggered by low AdBlue, poor quality or doser fault')}</T>
      </g>}
    </Frame>
  );
}

/* ---------------- Unit 6 — turbo ---------------- */
export function Scene06({ step }: { step: number }) {
  const { s } = useT();
  /** ring of 10 guide vanes: tilt 0 = radial (open), tilt ~70 = nearly tangential (closed, narrow gas passage) */
  const vane = (tilt: number) => Array.from({ length: 10 }).map((_, i) => <rect key={i} x="-3" y="-22" width="6" height="44" rx="3" fill={COOL} transform={`rotate(${i * 36}) translate(0 -50) rotate(${tilt})`} />);
  return (
    <Frame label="turbo scene">
      {step === 0 && <g key="s0">
        <T x={20} y={30} size={15}>{s('कंप्रेसर मैप: सर्ज — दक्ष द्वीप — चोक', 'Compressor map: surge — efficient island — choke')}</T>
        <rect x="50" y="50" width="540" height="190" rx="6" fill={PANEL} stroke={LINE} />
        <polygon points="50,50 50,240 190,240 330,50" fill={HOT} opacity=".16" /><polygon points="590,50 590,240 470,240 520,50" fill={HOT} opacity=".16" />
        <line x1="190" y1="240" x2="330" y2="50" stroke={HOT} strokeWidth="3" strokeDasharray="6 4" />
        <ellipse cx="400" cy="135" rx="95" ry="52" fill={OK} opacity=".16" stroke={OK} /><ellipse cx="400" cy="135" rx="55" ry="30" fill={OK} opacity=".2" stroke={OK} />
        <T x={90} y={90} c={HOT} size={13}>{s('सर्ज', 'SURGE')}</T><T x={535} y={90} c={HOT} size={13} anchor="middle">{s('चोक', 'CHOKE')}</T><T x={400} y={139} c={OK} size={13} anchor="middle">η max</T>
        <circle r="7" fill={AMBER}><animateMotion dur="5s" repeatCount="indefinite" path="M250 220 C 300 160, 360 140, 400 135 S 470 100, 500 80" /></circle>
      </g>}
      {step === 1 && <g key="s1">
        <T x={20} y={30} size={15}>{s('वेन बंद = कम rpm पर बूस्ट; वेन खुली = उच्च rpm पर सुरक्षा', 'Vanes closed = boost at low rpm; open = protection at high rpm')}</T>
        <g transform="translate(170 150)"><circle r="78" fill={PANEL} stroke={LINE} strokeWidth="2" />{vane(68)}<circle r="24" fill={AMBER} /></g>
        <g transform="translate(470 150)"><circle r="78" fill={PANEL} stroke={LINE} strokeWidth="2" />{vane(0)}<circle r="24" fill={AMBER} /></g>
        <T x={170} y={248} anchor="middle" c={MUTE} size={12}>{s('बंद: तेज़ गैस, तेज़ टर्बाइन', 'closed: fast gas, fast turbine')}</T>
        <T x={470} y={248} anchor="middle" c={MUTE} size={12}>{s('खुली: कम अवरोध', 'open: less restriction')}</T>
      </g>}
      {step === 2 && <g key="s2">
        <T x={20} y={30} size={15}>{s('इंटरकूलर: ठंडी, घनी हवा = अधिक ऑक्सीजन', 'Intercooler: cool, dense air = more oxygen')}</T>
        <rect x="200" y="80" width="240" height="120" rx="10" fill={PANEL} stroke={LINE} strokeWidth="2" />
        {Array.from({ length: 7 }).map((_, i) => <line key={i} x1={220 + i * 33} y1="90" x2={220 + i * 33} y2="190" stroke={COOL} opacity=".6" />)}
        <line x1="40" y1="140" x2="198" y2="140" stroke={HOT} strokeWidth="6" strokeDasharray="10 6"><animate attributeName="stroke-dashoffset" from="0" to="-32" dur="1s" repeatCount="indefinite" /></line>
        <line x1="442" y1="140" x2="600" y2="140" stroke={COOL} strokeWidth="6" strokeDasharray="10 6"><animate attributeName="stroke-dashoffset" from="0" to="-32" dur="1s" repeatCount="indefinite" /></line>
        <T x={40} y={120} c={HOT} size={14}>150 °C</T><T x={600} y={120} c={COOL} size={14} anchor="end">54 °C</T>
        <T x={320} y={235} anchor="middle" c={MUTE} size={13}>ε = (150 − 54) / (150 − 30) = 0.80</T>
      </g>}
      {step === 3 && <g key="s3">
        <T x={20} y={30} size={15}>{s('टूटा टर्बो: निशान से कारण पढ़ें', 'A failed turbo: read the cause from the marks')}</T>
        <g transform="translate(170 150)">
          {Array.from({ length: 10 }).map((_, i) => <path key={i} d="M0 0 L8 -60 Q22 -62 20 -50 Z" fill={i === 3 ? 'none' : MUTE} stroke={i === 3 ? HOT : 'none'} strokeDasharray="4 3" transform={`rotate(${i * 36})`} opacity={i === 3 ? 1 : 0.8} />)}
          <circle r="14" fill={AMBER} />
        </g>
        <T x={170} y={248} anchor="middle" c={MUTE} size={12}>{s('एक ब्लेड टूटा: बाहरी वस्तु', 'one blade snapped: foreign object')}</T>
        <g transform="translate(470 150)"><rect x="-90" y="-12" width="180" height="24" rx="6" fill={MUTE} /><rect x="-30" y="-12" width="60" height="24" fill="rgb(var(--hot) / .8)"><animate attributeName="opacity" values=".9;.4;.9" dur="1.6s" repeatCount="indefinite" /></rect></g>
        <T x={470} y={90} anchor="middle" size={13}>{s('शाफ़्ट पर नीला/जला निशान', 'blue/burnt marks on the shaft')}</T>
        <T x={470} y={248} anchor="middle" c={MUTE} size={12}>{s('तेल की कमी: फ़ीड-लाइन जाँचें', 'oil starvation: check the feed line')}</T>
      </g>}
    </Frame>
  );
}

/* ---------------- Unit 7 — dyno ---------------- */
export function Scene07({ step }: { step: number }) {
  const { s } = useT();
  const curve = 'M60 200 C 140 70, 220 60, 330 78 S 520 150, 600 190';
  return (
    <Frame label="dyno scene">
      {step === 0 && <g key="s0">
        <T x={20} y={30} size={15}>{s('इंजन डायनो पर: शाफ़्ट से लोड', 'The engine on the dyno: load through the shaft')}</T>
        <rect x="40" y="90" width="190" height="110" rx="10" fill={PANEL} stroke={LINE} strokeWidth="2" /><T x={135} y={150} anchor="middle" size={15}>{s('इंजन', 'Engine')}</T>
        <rect x="230" y="136" width="170" height="16" fill={MUTE} />
        <rect x="400" y="95" width="160" height="100" rx="50" fill={PANEL} stroke={COOL} strokeWidth="2" />
        <g transform="translate(480 145)">{[0, 60, 120].map((a) => <line key={a} x1="-40" y1="0" x2="40" y2="0" stroke={COOL} strokeWidth="3" transform={`rotate(${a})`} />)}<animateTransform attributeName="transform" type="rotate" from="0 480 145" to="360 480 145" dur="1.2s" repeatCount="indefinite" additive="sum" /></g>
        <T x={480} y={225} anchor="middle" c={COOL} size={13}>{s('डायनो (ब्रेक)', 'Dyno (brake)')}</T>
        <T x={315} y={125} anchor="middle" c={AMBER} size={12}>T, N</T>
      </g>}
      {step === 1 && <g key="s1">
        <T x={20} y={30} size={15}>{s('टॉर्क-वक्र खिंचता है', 'The torque curve is drawn')}</T>
        <line x1="50" y1="220" x2="610" y2="220" stroke={LINE} strokeWidth="2" /><line x1="50" y1="50" x2="50" y2="220" stroke={LINE} strokeWidth="2" />
        <Draw d={curve} c={AMBER} len={800} dur={3} />
        <T x={330} y={248} anchor="middle" c={MUTE} size={12}>{s('इंजन गति (rpm) →', 'Engine speed (rpm) →')}</T>
        <circle cx="260" cy="66" r="0" fill={OK}><animate attributeName="r" values="0;0;9" keyTimes="0;.8;1" dur="3.4s" fill="freeze" /></circle>
        <T x={260} y={50} anchor="middle" c={OK} size={12}>{s('टॉर्क-शिखर', 'peak torque')}</T>
      </g>}
      {step === 2 && <g key="s2">
        <T x={20} y={30} size={15}>{s('विनिर्देश से तुलना: ±5% पट्टी', 'Comparison with spec: ±5% band')}</T>
        <path d={curve} fill="none" stroke={MUTE} strokeWidth="14" opacity=".25" />
        <path d={curve} fill="none" stroke={MUTE} strokeWidth="2" strokeDasharray="5 4" />
        <path d="M60 205 C 140 95, 220 80, 330 100 S 520 160, 600 195" fill="none" stroke={AMBER} strokeWidth="3" />
        <T x={330} y={200} anchor="middle" c={MUTE} size={12}>{s('धूसर पट्टी = स्वीकार्य; नारंगी = माप', 'grey band = acceptable; orange = measured')}</T>
        <Pulse><T x={330} y={248} anchor="middle" c={HOT} size={13}>{s('पट्टी से बाहर → कारण खोजें', 'outside the band → find the cause')}</T></Pulse>
      </g>}
      {step === 3 && <g key="s3">
        <T x={20} y={30} size={15}>{s('BSFC: कटोरे जैसा वक्र, न्यूनतम सबसे दक्ष', 'BSFC: a bowl-shaped curve — the minimum is most efficient')}</T>
        <line x1="50" y1="220" x2="610" y2="220" stroke={LINE} strokeWidth="2" /><line x1="50" y1="50" x2="50" y2="220" stroke={LINE} strokeWidth="2" />
        <Draw d="M60 70 C 160 190, 260 200, 330 198 S 500 170, 600 90" c={COOL} len={800} dur={2.6} />
        <circle cx="330" cy="198" r="9" fill={OK}><animate attributeName="r" values="6;11;6" dur="1.5s" repeatCount="indefinite" /></circle>
        <T x={345} y={186} c={OK} size={13}>≈ 200 g/kWh</T>
        <T x={330} y={248} anchor="middle" c={MUTE} size={12}>η = 3600 / (BSFC × 42.5)</T>
      </g>}
    </Frame>
  );
}

/* ---------------- Unit 9 — overhaul ---------------- */
export function Scene09({ step }: { step: number }) {
  const { s } = useT();
  const parts = [s('हेड', 'Head'), s('पिस्टन', 'Pistons'), s('सम्प', 'Sump'), s('क्रैंक', 'Crank')];
  return (
    <Frame label="overhaul scene">
      {step === 0 && <g key="s0">
        <T x={20} y={30} size={15}>{s('क्रम से खोलें, हर चीज़ पर निशान लगाएँ', 'Strip in order, mark everything')}</T>
        {parts.map((p, i) => (
          <g key={i} opacity="0"><animate attributeName="opacity" from="0" to="1" begin={`${i * 0.8}s`} dur=".4s" fill="freeze" />
            <rect x={40 + i * 150} y="100" width="125" height="70" rx="8" fill={PANEL} stroke={COOL} strokeWidth="2" />
            <circle cx={40 + i * 150} cy="100" r="14" fill={AMBER} /><T x={40 + i * 150} y={105} anchor="middle" c="rgb(var(--bg))" size={13}>{i + 1}</T>
            <T x={102 + i * 150} y={141} anchor="middle" size={14}>{p}</T></g>
        ))}
        <T x={320} y={230} anchor="middle" c={MUTE} size={12}>{s('पिस्टन/बेयरिंग पर सिलेंडर-नंबर; फ़ोटो व रिकॉर्ड', 'cylinder numbers on pistons/bearings; photos and records')}</T>
      </g>}
      {step === 1 && <g key="s1">
        <T x={20} y={30} size={15}>{s('बोर मापें: तीन ऊँचाई × दो दिशाएँ', 'Measure the bore: three heights × two directions')}</T>
        <rect x="120" y="55" width="150" height="180" rx="6" fill={PANEL} stroke={LINE} strokeWidth="2" />
        {[85, 145, 205].map((y, i) => <g key={y}><line x1="125" y1={y} x2="265" y2={y} stroke={COOL} strokeWidth="2" strokeDasharray="6 4"><animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1s" repeatCount="indefinite" /></line><T x={280} y={y + 4} c={MUTE} size={12}>{[s('ऊपर', 'Top'), s('बीच', 'Mid'), s('नीचे', 'Bottom')][i]}</T></g>)}
        <g transform="translate(470 145)"><circle r="62" fill={PANEL} stroke={LINE} strokeWidth="2" /><ellipse rx="56" ry="48" fill="none" stroke={AMBER} strokeWidth="2.5" strokeDasharray="5 3" /><line x1="-56" y1="0" x2="56" y2="0" stroke={COOL} strokeWidth="2" /><line x1="0" y1="-48" x2="0" y2="48" stroke={COOL} strokeWidth="2" /></g>
        <T x={470} y={232} anchor="middle" c={MUTE} size={12}>{s('A − B = ओवैलिटी', 'A − B = ovality')}</T>
      </g>}
      {step === 2 && <g key="s2">
        <T x={20} y={30} size={15}>{s('ध्यान से देखें: दरार, सीट, बेयरिंग', 'Look closely: cracks, seats, bearings')}</T>
        <rect x="50" y="70" width="250" height="140" rx="10" fill={PANEL} stroke={LINE} strokeWidth="2" />
        <circle cx="130" cy="140" r="30" fill="none" stroke={LINE} strokeWidth="3" /><circle cx="220" cy="140" r="30" fill="none" stroke={LINE} strokeWidth="3" />
        <Draw d="M148 120 L172 132 L186 128 L204 120" c={HOT} len={120} dur={2} wd={3} />
        <T x={175} y={235} anchor="middle" c={HOT} size={12}>{s('सीटों के बीच दरार', 'crack between seats')}</T>
        <path d="M400 190 A 80 80 0 0 1 560 190" fill="none" stroke={MUTE} strokeWidth="18" /><path d="M450 120 A 80 80 0 0 1 510 130" fill="none" stroke={AMBER} strokeWidth="18" strokeLinecap="round" />
        <T x={480} y={235} anchor="middle" c={AMBER} size={12}>{s('बेयरिंग शेल पर घिसाव-पट्टी', 'wear streak on the bearing shell')}</T>
      </g>}
      {step === 3 && <g key="s3">
        <T x={20} y={30} size={15}>{s('निर्णय लें, फिर नियम से जोड़ें', 'Decide, then rebuild by the rules')}</T>
        {[[OK, s('उपयोग', 'Reuse')], [AMBER, s('मरम्मत', 'Repair')], [HOT, s('बदलें', 'Replace')]].map(([c, l], i) => (
          <g key={i}><circle cx={100 + i * 120} cy="110" r="34" fill={c as string} opacity=".25" stroke={c as string} strokeWidth="3" /><T x={100 + i * 120} y={115} anchor="middle" size={14}>{l as string}</T></g>
        ))}
        <line x1="460" y1="110" x2="610" y2="110" stroke={COOL} strokeWidth="3" strokeDasharray="8 6"><animate attributeName="stroke-dashoffset" from="0" to="-28" dur="1s" repeatCount="indefinite" /></line>
        <T x={535} y={90} anchor="middle" c={COOL} size={12}>{s('साफ़ → क्लीयरेंस → टॉर्क → प्राइम', 'clean → clearance → torque → prime')}</T>
        <T x={320} y={225} anchor="middle" c={MUTE} size={12}>{s('सीमा-तालिका से, अंदाज़े से नहीं', 'from the limits table, not from a guess')}</T>
      </g>}
    </Frame>
  );
}
