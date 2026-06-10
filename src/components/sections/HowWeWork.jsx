import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Icon from '../../lib/iconMap.jsx';
import { fadeUp, stagger, viewport } from '../../lib/motion.js';

export default function HowWeWork({ steps = [] }) {
  return (
    <section className="section">
      <div className="container-x">
        <div className="overflow-hidden rounded-[2.5rem] border border-ink/[0.07] bg-white p-6 dark:border-cream/10 dark:bg-ink-800 md:p-10">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[320px_1fr]">
            <div>
              <span className="eyebrow">From farm to fork</span>
              <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-ink dark:text-cream md:text-5xl">
                How we <span className="italic text-brand-700 dark:text-lime-400">work</span>
              </h2>
              <p className="mt-4 text-ink/70 dark:text-cream/70">
                Quality checked at every step — so you get consistent, safe and reliable supply, every single time.
              </p>
              <Link to="/catalogue" className="btn-primary mt-6">
                Start sourcing <ArrowUpRight size={16} />
              </Link>
            </div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-5"
            >
              {steps.map((s, i) => (
                <motion.div key={s.title} variants={fadeUp} className="relative text-center">
                  {i < steps.length - 1 && (
                    <span className="absolute left-1/2 top-7 hidden h-px w-full border-t-2 border-dashed border-lime-400/60 lg:block" />
                  )}
                  <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ink text-lime-400 shadow-soft">
                    <Icon name={s.icon} size={24} />
                  </div>
                  <h4 className="mt-3 font-display text-base font-semibold text-ink dark:text-cream">{s.title}</h4>
                  <p className="mt-1 text-xs text-ink/50 dark:text-cream/50">{s.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
