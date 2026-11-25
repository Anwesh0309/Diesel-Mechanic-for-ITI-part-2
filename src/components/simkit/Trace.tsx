/** Small sparkline of recent values. */
export function Trace({ data, min, max, band, height = 56, label }: { data: number[]; min: number; max: number; band?: [number, number]; height?: number; label?: string }) {
  const w = 240; const n = Math.max(2, data.length);
  const y = (v: number) => height - ((Math.max(min, Math.min(max, v)) - min) / (max - min)) * (height - 4) - 2;
  const pts = data.map((v, i) => `${(i / (n - 1)) * w},${y(v)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }} role="img" aria-label={label}>
      <rect width={w} height={height} rx="4" fill="rgb(var(--panel))" stroke="rgb(var(--line))" />
      {band && <rect x="0" width={w} y={y(band[1])} height={Math.max(1, y(band[0]) - y(band[1]))} fill="rgb(var(--ok) / .2)" />}
      {data.length > 1 && <polyline points={pts} fill="none" stroke="rgb(var(--cool))" strokeWidth="2" strokeLinejoin="round" />}
    </svg>
  );
}
