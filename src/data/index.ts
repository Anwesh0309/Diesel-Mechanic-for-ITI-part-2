import type { TrackId, Unit } from './types';
import { bi } from './types';
import { unit01 } from './unit01';
import { unit02 } from './unit02';
import { unit03 } from './unit03';
import { unit04 } from './unit04';
import { unit05 } from './unit05';
import { unit06 } from './unit06';
import { unit07 } from './unit07';
import { unit08 } from './unit08';
import { unit09 } from './unit09';
import { unit10 } from './unit10';

export const UNITS: Unit[] = [unit01, unit02, unit03, unit04, unit05, unit06, unit07, unit08, unit09, unit10];
export const getUnit = (id: number) => UNITS.find((u) => u.id === id);
export const unitsOfTrack = (k: TrackId) => UNITS.filter((u) => u.track === k);
export const TRACKS: TrackId[] = ['A', 'B'];

export const TRACK_TITLE = {
  A: bi('ट्रैक A — नियंत्रण, डेटा व उत्सर्जन', 'Track A — Control, Data and Emissions'),
  B: bi('ट्रैक B — प्रदर्शन व विश्वसनीयता', 'Track B — Performance and Reliability'),
} as const;
