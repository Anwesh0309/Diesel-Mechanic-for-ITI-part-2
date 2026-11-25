import { DieselIcon } from '@/components/icons';
import { UNITS } from '@/data';
import { useT } from '@/translations';
import { bi, type Bi } from '@/data/types';

const SHORT: Record<number, Bi> = {
  2: bi('सेंसर', 'Sensors'), 3: bi('कॉमन रेल', 'Rail'), 4: bi('स्कैन टूल', 'Scan tool'), 5: bi('उत्सर्जन', 'Emissions'),
  6: bi('टर्बो मैप', 'Turbo map'), 7: bi('डायनो', 'Dyno'), 8: bi('प्रेडिक्टिव', 'Predictive'), 9: bi('ओवरहॉल', 'Overhaul'), 10: bi('केस फ़ाइल', 'Case files'),
};
const CX = 320, CY = 190, RX = 245, RY = 135;

/** Home-page art: the ECU at the centre, the other nine modules as live-signal nodes. */
export function SystemMap({ doneIds, onPick }: { doneIds: number[]; onPick: (id: number) => void }) {
  const { L, t } = useT();
  const nodes = UNITS.filter((u) => u.id !== 1).map((u, i) => {
    const a = ((-90 + i * 40) * Math.PI) / 180;
    return { u, x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a) };
  });
  const ecuDone = doneIds.includes(1);
  return (
    <svg viewBox="0 0 640 390" className="w-full h-auto" role="group" aria-label={t.home.mapTitle} data-testid="system-map">
      {nodes.map(({ u, x, y }) => (
        <line key={u.id} x1={CX} y1={CY} x2={x} y2={y} stroke={doneIds.includes(u.id) ? 'rgb(var(--ok))' : 'rgb(var(--cool))'} strokeOpacity=".55" strokeWidth="2" strokeDasharray="7 7" className="animate-flow" style={{ animationDuration: `${1 + (u.id % 4) * 0.35}s`, animationDirection: u.id % 2 ? 'normal' : 'reverse' }} />
      ))}
      {/* ECU */}
      <g data-hotspot="1" tabIndex={0} role="button" aria-label={L(UNITS[0].title)} className="cursor-pointer" onClick={() => onPick(1)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPick(1); }}>
        {[-36, -12, 12, 36].map((d) => <g key={d} stroke="rgb(var(--mute))" strokeWidth="3" strokeLinecap="round"><line x1={CX + d} y1={CY - 52} x2={CX + d} y2={CY - 64} /><line x1={CX + d} y1={CY + 52} x2={CX + d} y2={CY + 64} /><line x1={CX - 64} y1={CY + d} x2={CX - 52} y2={CY + d} /><line x1={CX + 52} y1={CY + d} x2={CX + 64} y2={CY + d} /></g>)}
        <rect x={CX - 52} y={CY - 52} width="104" height="104" rx="10" fill="rgb(var(--panel2))" stroke={ecuDone ? 'rgb(var(--ok))' : 'rgb(var(--cool))'} strokeWidth="3" />
        <rect x={CX - 34} y={CY - 34} width="68" height="68" rx="6" fill="rgb(var(--bg))" stroke="rgb(var(--line))" strokeWidth="2" />
        <text x={CX} y={CY - 2} textAnchor="middle" fontSize="22" fontWeight="800" fill="rgb(var(--cool))" fontFamily="IBM Plex Mono, monospace">{t.home.ecuLabel}</text>
        <text x={CX} y={CY + 20} textAnchor="middle" fontSize="11" fontWeight="700" fill="rgb(var(--mute))">01</text>
      </g>
      {nodes.map(({ u, x, y }) => {
        const done = doneIds.includes(u.id);
        const col = done ? 'rgb(var(--ok))' : 'rgb(var(--cool))';
        return (
          <g key={u.id} data-hotspot={u.id} tabIndex={0} role="button" aria-label={L(u.title)} className="cursor-pointer focus:outline-none" onClick={() => onPick(u.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPick(u.id); }}>
            <title>{L(u.title)}</title>
            <circle cx={x} cy={y} r="27" fill="rgb(var(--panel2))" stroke={col} strokeWidth="2.5" />
            <g transform={`translate(${x - 11},${y - 11})`} color={col}><DieselIcon name={u.icon} size={22} /></g>
            <circle cx={x + 21} cy={y - 21} r="11" fill="rgb(var(--bg))" stroke={col} strokeWidth="1.5" />
            <text x={x + 21} y={y - 17} textAnchor="middle" fontSize="11" fontWeight="800" fill={col} fontFamily="IBM Plex Mono, monospace">{u.id}</text>
            <g className="max-sm:hidden"><text x={x} y={y + 46} textAnchor="middle" fontSize="13" fontWeight="700" fill="rgb(var(--ink))">{L(SHORT[u.id])}</text></g>
          </g>
        );
      })}
    </svg>
  );
}
