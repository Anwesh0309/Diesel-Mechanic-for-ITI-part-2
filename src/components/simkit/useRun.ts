import { useCallback, useRef, useState } from 'react';
import { actions } from '@/store/progress';
import type { Bi } from '@/data/types';
import { clamp } from '@/lib/util';
import { sound } from '@/lib/sound';

export type Tone = 'ok' | 'bad' | 'info';
export interface Msg { tone: Tone; text: Bi; k: number }

export function gradeOf(score: number): 'd' | 'm' | 'p' | 't' {
  return score >= 85 ? 'd' : score >= 70 ? 'm' : score >= 50 ? 'p' : 't';
}

/** Scoring + feedback state shared by every simulation. score = points/max*100 - hints*3 - mistakes*2 */
export function useRun(unit: number, maxPoints: number) {
  const [points, setPoints] = useState(0);
  const [hints, setHints] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [finished, setFinished] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const done = useRef(false);
  const k = useRef(0);

  const score = clamp(Math.round((points / maxPoints) * 100 - hints * 3 - mistakes * 2), 0, 100);

  const say = useCallback((tone: Tone, text: Bi) => {
    k.current += 1;
    setMsg({ tone, text, k: k.current });
    if (tone === 'ok') sound.success();
    else if (tone === 'bad') sound.error();
    else if (tone === 'info') sound.hint();
  }, []);
  const add = useCallback((n = 1, text?: Bi) => {
    setPoints((p) => p + n);
    if (text) say('ok', text);
    else sound.success();
  }, [say]);
  const miss = useCallback((text?: Bi) => {
    setMistakes((m) => m + 1);
    if (text) say('bad', text);
    else sound.error();
  }, [say]);
  const hint = useCallback((text: Bi) => {
    setHints((h) => h + 1);
    say('info', text);
  }, [say]);
  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true; setFinished(true);
    sound.finish();
    const s = clamp(Math.round((points / maxPoints) * 100 - hints * 3 - mistakes * 2), 0, 100);
    actions.recordSim(unit, s);
    actions.completeStage(unit, 'simulate', 20);
  }, [points, hints, mistakes, maxPoints, unit]);
  const reset = useCallback(() => {
    done.current = false; setPoints(0); setHints(0); setMistakes(0); setFinished(false); setMsg(null);
    sound.relay();
  }, []);

  return { points, hints, mistakes, finished, msg, score, say, add, miss, hint, finish, reset, maxPoints };
}
export type Run = ReturnType<typeof useRun>;
