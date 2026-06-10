import { motion } from 'framer-motion';
import Icon from '../../lib/iconMap.jsx';
import { fadeUp, stagger, viewport } from '../../lib/motion.js';

export default function Features({ features = [] }) {
  return (
    <section className="section">
      <div className="container-x">
        <div className="mb-8 max-w-2xl">
          <span className="eyebrow">Why businesses choose us</span>
          <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-ink dark:text-cream md:text-5xl">
            Everything your kitchen needs, <span className="italic text-brand-700 dark:text-lime-400">handled.</span>
          </h2>

        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className="group relative overflow-hidden rounded-3xl border border-ink/[0.07] bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-lime-400 hover:shadow-card dark:border-cream/10 dark:bg-ink-800"
            >
              <span className="font-display text-sm font-semibold text-ink/25 dark:text-cream/20">0{i + 1}</span>
              <div className="mt-5 grid h-14 w-14 place-items-center rounded-2xl bg-lime-400/90 text-ink transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Icon name={f.icon} size={26} />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-ink dark:text-cream">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70 dark:text-cream/70">{f.text}</p>
              <div className="pointer-events-none absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-lime-300/0 blur-2xl transition-all duration-500 group-hover:bg-lime-300/50" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
