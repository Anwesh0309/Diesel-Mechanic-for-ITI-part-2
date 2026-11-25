import { useProgress } from '@/store/progress';
import type { Bi, Lang } from '@/data/types';
import { en, type Dict } from './en';
import { hi } from './hi';

export const dicts: Record<Lang, Dict> = { hi, en };

/** UI dictionary + bilingual text picker for the active language (Hindi is the default). */
export function useT() {
  const { lang } = useProgress();
  const t = dicts[lang];
  /** pick Hindi or English from a Bi object */
  const L = (b: Bi) => b[lang];
  /** inline picker: s('हिंदी', 'English') */
  const s = (h: string, e: string) => (lang === 'hi' ? h : e);
  return { t, L, s, lang };
}
