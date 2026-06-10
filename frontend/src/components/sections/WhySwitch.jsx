import { Check, X } from 'lucide-react';
import Reveal from '../Reveal.jsx';

export default function WhySwitch({ comparison = { traditional: [], platform: [] } }) {
  return (
    <section id="why" className="section bg-cream-100 dark:bg-ink-800/40">
      <div className="container-x">
        <div className="mb-8 text-center">
          <span className="eyebrow mx-auto w-fit">The smarter choice</span>
          <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-ink dark:text-cream md:text-5xl">
            Why switch to <span className="italic text-brand-700 dark:text-lime-400">Hyperpure?</span>
          </h2>
        </div>

        <div className="relative mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <Reveal className="rounded-3xl border border-ink/10 bg-white p-7 dark:border-cream/10 dark:bg-ink-800 md:p-9">
            <h3 className="text-center font-display text-lg font-semibold text-ink/40 dark:text-cream/40">Traditional Suppliers</h3>
            <ul className="mt-6 space-y-3.5">
              {comparison.traditional.map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm text-ink/70 dark:text-cream/70">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-red-100 text-red-500 dark:bg-red-500/15"><X size={14} /></span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120} className="relative rounded-3xl border border-ink bg-ink p-7 text-cream shadow-card md:p-9">
            <h3 className="text-center font-display text-lg font-semibold text-lime-400">Hyperpure Platform</h3>
            <ul className="mt-6 space-y-3.5">
              {comparison.platform.map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm font-medium text-cream">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lime-400 text-ink"><Check size={14} /></span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
            <span className="grid h-12 w-12 place-items-center rounded-full border-4 border-cream-100 bg-lime-400 font-display text-sm font-bold text-ink dark:border-ink">VS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
