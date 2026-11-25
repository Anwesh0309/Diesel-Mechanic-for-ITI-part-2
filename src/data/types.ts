export interface Bi { hi: string; en: string }
/** bilingual helper: bi('हिंदी', 'English') */
export const bi = (hi: string, en: string): Bi => ({ hi, en });

export type Lang = 'hi' | 'en';
export type IconName = 'ecu' | 'sensor' | 'rail' | 'dtc' | 'emission' | 'turbo' | 'dyno' | 'oil' | 'caliper' | 'folder';
export type TrackId = 'A' | 'B';

export interface Unit {
  id: number;
  track: TrackId;
  icon: IconName;
  title: Bi;
  tagline: Bi;
  objectives: Bi[];
  topics: Bi[];
  /** 4 animated explanation steps (scene is chosen by unit id) */
  watch: { title: Bi; text: Bi }[];
  read: {
    sections: { h: Bi; p: Bi; bullets?: Bi[] }[];
    terms: { t: Bi; d: Bi }[];
    facts: { label: Bi; value: string | Bi }[];
    formulas?: { name: Bi; expr: string; note: Bi }[];
  };
  practice: { task: Bi; tools: Bi }[];
  quiz: { q: Bi; o: Bi[]; a: number; why: Bi }[];
  apply: { title: Bi; situation: Bi; o: Bi[]; a: number; why: Bi }[];
  safety: Bi[];
  review: Bi[];
}

export const STAGES = ['watch', 'read', 'practice', 'simulate', 'quiz', 'apply', 'review'] as const;
export type Stage = (typeof STAGES)[number];
