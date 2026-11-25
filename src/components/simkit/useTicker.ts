import { useEffect, useRef } from 'react';

/** requestAnimationFrame loop; cb receives dt in seconds (capped). */
export function useTicker(active: boolean, cb: (dt: number) => void) {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    if (!active) return;
    let id = 0; let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      ref.current(dt);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [active]);
}
