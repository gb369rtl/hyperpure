import { useEffect, useMemo, useRef, useState } from 'react';
import { useInView, animate } from 'framer-motion';

// Counts up from 0 to the numeric part of `value` once, when scrolled into view.
// Preserves prefix/suffix, e.g. "10,000+", "99%", "₹24,000".
export default function AnimatedCounter({ value, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  const parsed = useMemo(() => {
    const m = String(value).match(/^([^\d]*)([\d.,]+)(.*)$/);
    if (!m) return null;
    const numStr = m[2].replace(/,/g, '');
    return { prefix: m[1], suffix: m[3], target: parseFloat(numStr) || 0, decimals: (numStr.split('.')[1] || '').length };
  }, [value]);

  const fmt = (v) =>
    parsed.prefix + (parsed.decimals ? v.toFixed(parsed.decimals) : Math.round(v).toLocaleString('en-IN')) + parsed.suffix;

  const [display, setDisplay] = useState(() => (parsed ? fmt(0) : String(value)));

  useEffect(() => {
    if (!parsed || !inView) return;
    const controls = animate(0, parsed.target, {
      duration: 1.7,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(fmt(v)),
    });
    return () => controls.stop();
    // Only re-run when it first comes into view or the source value changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, parsed]);

  return (
    <span ref={ref} className={`${className} nums`}>
      {parsed ? display : String(value)}
    </span>
  );
}
