import type { IconName } from '@/data/types';

interface P { size?: number; className?: string; stroke?: number }
const base = (size: number, stroke: number, className?: string) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: stroke,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className, 'aria-hidden': true,
});

/** Diesel-trade icon set (original line icons) for the ten Part 2 units. */
export function DieselIcon({ name, size = 22, className, stroke = 1.8 }: P & { name: IconName }) {
  const p = base(size, stroke, className);
  switch (name) {
    case 'ecu': return (<svg {...p}><rect x="6" y="6" width="12" height="12" rx="1.500" /><path d="M9 10h6M9 14h3" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></svg>);
    case 'sensor': return (<svg {...p}><path d="M3 12h4l2-5 3 10 2-5h7" /><circle cx="4" cy="19" r="1.200" /><path d="M8 19h12" /></svg>);
    case 'rail': return (<svg {...p}><path d="M3 8h18M3 11h18" /><path d="M6 11v4l1 3M12 11v4l1 3M18 11v4l1 3" /><path d="M5 8V5M12 8V5M19 8V5" /></svg>);
    case 'dtc': return (<svg {...p}><rect x="3" y="5" width="18" height="11" rx="1.500" /><path d="M7 9h3M7 12h6M15 9h2" /><path d="M8 20h8M12 16v4" /></svg>);
    case 'emission': return (<svg {...p}><rect x="3" y="9" width="13" height="7" rx="2" /><path d="M6 9v7M9 9v7M12 9v7" /><path d="M16 12h5" /><path d="M18 6c1.500-1.500 0-2.500 1.500-4M14 7c1-1 0-2 1-3" /></svg>);
    case 'turbo': return (<svg {...p}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="1.600" /><path d="M12 10.400C12 6 14 5 16 5M13.600 12C18 12 19 14 19 16M12 13.600C12 18 10 19 8 19M10.400 12C6 12 5 10 5 8" /></svg>);
    case 'dyno': return (<svg {...p}><path d="M4 18V6M4 18h16" /><path d="M6 15c3 0 3-7 6-7s3 5 8 3" /><path d="M6 12c3 0 3-3 6-3s3 4 8 5" strokeDasharray="2 2.500" /></svg>);
    case 'oil': return (<svg {...p}><path d="M12 3c3.500 4.200 5 6.600 5 9a5 5 0 0 1-10 0c0-2.400 1.500-4.800 5-9z" /><path d="M10 12.500h4M12 10.500v4" /></svg>);
    case 'caliper': return (<svg {...p}><path d="M3 6h18v4H3z" /><path d="M6 10v8M6 18h3M16 10v6" /><path d="M7 6v2M10 6v2M13 6v2M16 6v2" /></svg>);
    case 'folder': return (<svg {...p}><path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M8 13l2.500 2.500L16 10.500" /></svg>);
  }
}

export type UiIcon = 'menu' | 'x' | 'check' | 'chevL' | 'chevR' | 'play' | 'pause' | 'sun' | 'moon' | 'home' | 'lock' | 'bulb' | 'reset' | 'alert' | 'arrowR' | 'list' | 'bars' | 'eye' | 'book' | 'tools' | 'cpu' | 'quiz' | 'flag' | 'doc' | 'trophy' | 'sound' | 'mute';

export function Ui({ name, size = 18, className, stroke = 2 }: P & { name: UiIcon }) {
  const p = base(size, stroke, className);
  switch (name) {
    case 'menu': return (<svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
    case 'x': return (<svg {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>);
    case 'check': return (<svg {...p}><path d="M5 12.500l4.500 4.500L19 7.500" /></svg>);
    case 'chevL': return (<svg {...p}><path d="M15 5l-7 7 7 7" /></svg>);
    case 'chevR': return (<svg {...p}><path d="M9 5l7 7-7 7" /></svg>);
    case 'play': return (<svg {...p} fill="currentColor"><path d="M8 5v14l11-7z" /></svg>);
    case 'pause': return (<svg {...p} fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>);
    case 'sun': return (<svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.500 1.500M17.500 17.500L19 19M19 5l-1.500 1.500M6.500 17.500L5 19" /></svg>);
    case 'moon': return (<svg {...p}><path d="M20 14.500A8 8 0 0 1 9.500 4 8 8 0 1 0 20 14.500z" /></svg>);
    case 'home': return (<svg {...p}><path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" /></svg>);
    case 'lock': return (<svg {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>);
    case 'bulb': return (<svg {...p}><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.500 10.900c.700.600 1 1.300 1 2.100h5c0-.800.300-1.500 1-2.100A6 6 0 0 0 12 3z" /></svg>);
    case 'reset': return (<svg {...p}><path d="M4 12a8 8 0 1 0 3-6.200" /><path d="M4 4v4.500h4.500" /></svg>);
    case 'alert': return (<svg {...p}><path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18v.01" /></svg>);
    case 'arrowR': return (<svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
    case 'list': return (<svg {...p}><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></svg>);
    case 'bars': return (<svg {...p}><path d="M5 20V10M12 20V4M19 20v-7" /></svg>);
    case 'eye': return (<svg {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>);
    case 'book': return (<svg {...p}><path d="M4 5a2 2 0 0 1 2-2h13v17H6a2 2 0 0 0-2 2z" /><path d="M4 19V5M9 7h6" /></svg>);
    case 'tools': return (<svg {...p}><path d="M14 6a4 4 0 0 0 5 5L10 20a2 2 0 0 1-3-3z" /><path d="M4 4l5 5M7 3l-4 4 3 3 4-4z" /></svg>);
    case 'cpu': return (<svg {...p}><rect x="6" y="6" width="12" height="12" rx="1.500" /><rect x="10" y="10" width="4" height="4" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></svg>);
    case 'quiz': return (<svg {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 9.500a3 3 0 1 1 4 2.800c-.700.300-1 .900-1 1.700M12 17v.01" /></svg>);
    case 'flag': return (<svg {...p}><path d="M5 21V4M5 4h12l-2 4 2 4H5" /></svg>);
    case 'doc': return (<svg {...p}><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h7M9 17h7" /></svg>);
    case 'trophy': return (<svg {...p}><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 13v4M8 21h8M10 17h4" /></svg>);
    case 'sound': return (<svg {...p}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>);
    case 'mute': return (<svg {...p}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>);
  }
}

export const STAGE_ICON: Record<string, UiIcon> = { watch: 'eye', read: 'book', practice: 'tools', simulate: 'cpu', quiz: 'quiz', apply: 'flag', review: 'doc' };
