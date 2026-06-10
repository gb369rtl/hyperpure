import { BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp, stagger, viewport } from '../../lib/motion.js';

export default function TrustedBy({ trust = [] }) {
  return (
    <section className="section">
      <div className="container-x text-center">
        <span className="eyebrow mx-auto w-fit">Certified & compliant</span>
        <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-ink dark:text-cream md:text-5xl">
          Trusted across <span className="italic text-brand-700 dark:text-lime-400">India</span>
        </h2>

        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={viewport} className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {trust.map((t) => (
            <motion.div key={t.name} variants={fadeUp} className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-ink/[0.07] bg-white px-4 py-7 transition-all hover:-translate-y-1 hover:border-lime-400 dark:border-cream/10 dark:bg-ink-800">
              <BadgeCheck className="text-lime-600 dark:text-lime-400" size={30} />
              <div className="font-display text-lg font-semibold text-ink dark:text-cream">{t.name}</div>
              <div className="text-xs text-ink/45 dark:text-cream/45 nums">{t.sub}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
