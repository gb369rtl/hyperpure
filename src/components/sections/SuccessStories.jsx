import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';

export default function SuccessStories({ stories = [] }) {
  const ref = useRef(null);
  const scrollBy = (dir) => ref.current?.scrollBy({ left: dir * 360, behavior: 'smooth' });

  return (
    <section className="section">
      <div className="container-x">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <span className="eyebrow">Loved by businesses</span>
            <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-ink dark:text-cream md:text-5xl">
              Real businesses, <span className="italic text-brand-700 dark:text-lime-400">real results</span>
            </h2>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button onClick={() => scrollBy(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-ink/15 hover:border-ink dark:border-cream/20" aria-label="Previous"><ChevronLeft size={18} /></button>
            <button onClick={() => scrollBy(1)} className="grid h-11 w-11 place-items-center rounded-full bg-ink text-cream hover:bg-ink-700" aria-label="Next"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div ref={ref} className="no-scrollbar flex snap-x gap-5 overflow-x-auto scroll-smooth pb-2">
          {stories.map((s) => (
            <article key={s.id} className="w-[300px] shrink-0 snap-start rounded-3xl border border-ink/[0.07] bg-white p-7 transition-all hover:-translate-y-1 hover:shadow-card dark:border-cream/10 dark:bg-ink-800 sm:w-[360px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink font-display text-base font-semibold text-lime-400">
                    {s.business.split(' ').slice(0, 2).map((w) => w[0]).join('')}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold leading-tight text-ink dark:text-cream">{s.business}</h3>
                    <p className="text-xs text-ink/45 dark:text-cream/45">{s.location}</p>
                  </div>
                </div>
                <Quote size={28} className="text-lime-400" />
              </div>
              <div className="mt-5 flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/70 dark:text-cream/70">“{s.quote}”</p>
              <p className="mt-5 text-sm font-semibold text-ink dark:text-cream">
                {s.author}<span className="font-normal text-ink/45 dark:text-cream/45">, {s.role}</span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
