import { useEffect, useRef, useState } from 'react';

// ── Scroll-triggered number animation ────────────────────────────────
// Counts from 0 up to `target` once the element holding the returned ref
// comes into view. Attach the ref to whatever should trigger the count.
//
//   const { count, ref } = useCountUp(500, { fallback: 1200 });
//   return <span ref={ref}>{count}+</span>;
//
// Options:
//   duration  how long the count takes, in ms
//   delay     wait this long before watching for visibility, for staggering
//             a row of numbers
//   fallback  start after this long even if the element was never seen;
//             0 disables it. Use it above the fold, where a missed trigger
//             would strand the number on 0 in front of the reader. Leave it
//             off further down the page so numbers still count on scroll
//             rather than running unseen.
export default function useCountUp(target, { duration = 1600, delay = 0, fallback = 0 } = {}) {
  const [count,   setCount]   = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    let observer = null;

    // Watch on a hair-trigger: requiring a set fraction of the element to be
    // visible means short viewports can miss it entirely and never count.
    // The cleanup has to live out here — returning it from inside the
    // timeout hands it to setTimeout, which discards it.
    const timer = setTimeout(() => {
      if (!el || typeof IntersectionObserver === 'undefined') { setStarted(true); return; }
      observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
        { threshold: 0, rootMargin: '200px' }
      );
      observer.observe(el);
    }, delay);

    const failsafe = fallback ? setTimeout(() => setStarted(true), delay + fallback) : null;

    return () => {
      clearTimeout(timer);
      if (failsafe) clearTimeout(failsafe);
      if (observer) observer.disconnect();
    };
  }, [delay, fallback]);

  useEffect(() => {
    if (!started) return;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const dur = reduced ? 0 : duration;

    let frame = 0;
    let startTime = null;
    const step = (ts) => {
      if (startTime === null) startTime = ts;
      const progress = dur > 0 ? Math.min((ts - startTime) / dur, 1) : 1;
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);

    // rAF is paused in background tabs, so a page opened in one would show 0
    // until it is focused. Snap to the real number if the frames never came.
    const safety = setTimeout(() => setCount(target), dur + 400);

    return () => { cancelAnimationFrame(frame); clearTimeout(safety); };
  }, [started, target, duration]);

  return { count, ref };
}
