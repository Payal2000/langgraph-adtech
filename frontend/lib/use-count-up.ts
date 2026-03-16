'use client';

import { useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
  start?: number;
  end: number;
  duration?: number;
  decimals?: number;
  easing?: (t: number) => number;
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

/**
 * Animates a number from `start` to `end` over `duration` ms.
 * Returns the current animated value.
 */
export function useCountUp({
  start = 0,
  end,
  duration = 800,
  decimals = 0,
  easing = easeOutQuart,
}: UseCountUpOptions): number {
  const [value, setValue] = useState(start);
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      const current = start + (end - start) * easedProgress;
      const rounded = parseFloat(current.toFixed(decimals));

      setValue(rounded);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setValue(end);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, start, duration, decimals, easing]);

  return value;
}
