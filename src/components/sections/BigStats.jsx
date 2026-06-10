import { Users, MapPin, PackageCheck, Boxes } from 'lucide-react';
import AnimatedCounter from '../AnimatedCounter.jsx';

const ICONS = [Users, MapPin, PackageCheck, Boxes];

export default function BigStats({ stats = [] }) {
  return (
    <section className="grain relative overflow-hidden bg-ink py-12 text-cream md:py-14">
      <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-lime-400/10 blur-3xl" />
      <div className="container-x relative">
        <div className="mb-8 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-lime-400">By the numbers</span>
          <h2 className="mt-3 font-display text-3xl font-medium md:text-4xl">Built on trust, proven at scale</h2>
        </div>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s, i) => {
            const I = ICONS[i % ICONS.length];
            return (
              <div key={s.label} className="text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-cream/10 text-lime-400">
                  <I size={22} />
                </span>
                <AnimatedCounter value={s.value} className="mt-4 block font-display text-4xl font-semibold md:text-5xl" />
                <div className="mt-1 text-sm text-cream/70">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
