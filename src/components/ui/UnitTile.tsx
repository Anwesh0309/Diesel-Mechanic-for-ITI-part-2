import { Link } from 'react-router-dom';
import type { Unit } from '@/data/types';
import { STAGES } from '@/data/types';
import { useT } from '@/translations';
import { isDone, useProgress } from '@/store/progress';
import { DieselIcon } from '@/components/icons';
import { Chip } from './kit';

/** Module tile: big index, icon, title, 7-segment stage bar. */
export function UnitTile({ unit }: { unit: Unit }) {
  const { t, L } = useT();
  const p = useProgress();
  const n = STAGES.filter((s) => isDone(p, unit.id, s)).length;
  const status = n === 0 ? 'new' : n === STAGES.length ? 'done' : 'going';
  return (
    <Link to={`/unit/${unit.id}`} data-unit={unit.id} className="panel group flex overflow-hidden transition hover:!border-cool/70 hover:-translate-y-0.5">
      <div className="w-16 shrink-0 bg-panel2 border-r border-line flex flex-col items-center justify-between py-3 group-hover:bg-cool/10 transition">
        <span className="readout text-2xl text-cool leading-none">{String(unit.id).padStart(2, '0')}</span>
        <DieselIcon name={unit.icon} size={28} className="text-mute group-hover:text-cool transition" />
      </div>
      <div className="p-4 flex flex-col gap-2 min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-lg leading-tight">{L(unit.title)}</h4>
          <Chip tone={status === 'done' ? 'ok' : status === 'going' ? 'amber' : 'mute'}>{t.home.status[status]}</Chip>
        </div>
        <p className="text-sm text-mute leading-snug">{L(unit.tagline)}</p>
        <div className="flex gap-1 mt-auto pt-1" aria-label={`${n}/7`}>
          {STAGES.map((s) => <span key={s} title={t.stages[s].n} className={`h-1.5 flex-1 rounded-full ${isDone(p, unit.id, s) ? 'bg-ok' : 'bg-line'}`} />)}
        </div>
      </div>
    </Link>
  );
}
