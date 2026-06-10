import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, MessageCircle, Truck, Star, Leaf } from 'lucide-react';
import SmartImage from '../SmartImage.jsx';
import AnimatedCounter from '../AnimatedCounter.jsx';
import { WHATSAPP_LINK } from '../../lib/constants.js';
import { fadeUp, stagger, EASE } from '../../lib/motion.js';

export default function Hero({ hero }) {
  const stats = hero?.stats || [];
  const prefixWords = (hero?.titlePrefix || 'Simplifying Procurement For').split(' ');

  return (
    <section className="grain relative overflow-hidden bg-cream dark:bg-ink">
      {/* decorative atmosphere */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-lime-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -left-32 h-[28rem] w-[28rem] rounded-full bg-brand-300/30 blur-3xl" />

      <div className="container-x relative z-10 grid items-center gap-10 pb-8 pt-28 md:pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:pb-10">
        {/* LEFT */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-700 backdrop-blur dark:border-cream/20 dark:bg-cream/10 dark:text-lime-400"
          >
            <Leaf size={14} className="text-lime-600" /> {hero?.eyebrow || 'Farm to business'}
          </motion.span>

          <motion.h1
            variants={stagger}
            initial="hidden"
            animate="show"
            className="mt-6 font-display text-5xl font-medium leading-[0.98] tracking-tight text-ink dark:text-cream sm:text-6xl lg:text-[5.2rem]"
          >
            {prefixWords.map((w, i) => (
              <motion.span key={i} variants={fadeUp} className="mr-[0.25em] inline-block">
                {w}
              </motion.span>
            ))}
            <motion.span variants={fadeUp} className="relative mt-1 inline-block italic text-brand-700 dark:text-lime-400">
              {hero?.titleHighlight || 'Restaurants, Cafes & Hotels'}
              <svg className="absolute -bottom-3 left-0 h-4 w-full" viewBox="0 0 320 16" fill="none" preserveAspectRatio="none">
                <motion.path
                  d="M3 11C70 4 150 3 317 8"
                  stroke="#c9ef4d"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.8, ease: EASE }}
                />
              </svg>
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
            className="mt-7 max-w-md text-lg leading-relaxed text-ink/70 dark:text-cream/70"
          >
            {hero?.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65, ease: EASE }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Link to="/catalogue" className="btn-primary text-base">
              Explore Catalogue <ArrowUpRight size={18} />
            </Link>
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="btn-outline text-base">
              <MessageCircle size={18} /> Order on WhatsApp
            </a>
          </motion.div>

          {/* trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="mt-9 flex items-center gap-4"
          >
            <div className="flex -space-x-3">
              {['#0a9150', '#16b364', '#0b2a22', '#93bd1f'].map((c, i) => (
                <span key={i} className="grid h-9 w-9 place-items-center rounded-full border-2 border-cream text-xs font-bold text-white" style={{ background: c }}>
                  {['R', 'C', 'H', 'K'][i]}
                </span>
              ))}
            </div>
            <div className="text-sm">
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
              </div>
              <p className="text-ink/70 dark:text-cream/70">Trusted by <b className="text-ink dark:text-cream">500+</b> businesses</p>
            </div>
          </motion.div>
        </div>

        {/* RIGHT — image collage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          {/* rotating dashed ring */}
          <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 animate-spin-slow rounded-full border-2 border-dashed border-lime-500/50" />

          <div className="relative overflow-hidden rounded-[2.2rem] border border-ink/5 shadow-card dark:border-cream/5">
            <SmartImage
              src="https://loremflickr.com/900/1100/vegetables,fresh,market"
              keyword="vegetables,fresh"
              alt="Fresh produce supply"
              className="aspect-[4/5] w-full object-cover"
              loading="eager"
              fetchPriority="high"
              width="900"
              height="1100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent" />
          </div>

          {/* floating card: delivery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1, ease: EASE }}
            className="absolute -left-4 top-10 animate-float rounded-2xl border border-ink/5 bg-white/95 p-3 shadow-card backdrop-blur dark:border-cream/10 dark:bg-ink-800/95 sm:-left-8"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime-400 text-ink"><Truck size={20} /></span>
              <div>
                <div className="font-display text-xl font-semibold leading-none text-ink dark:text-cream">99%</div>
                <div className="text-[11px] text-ink/70 dark:text-cream/70">On-time delivery</div>
              </div>
            </div>
          </motion.div>

          {/* floating card: product */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.15, ease: EASE }}
            className="absolute -bottom-5 -right-3 animate-float rounded-2xl border border-ink/5 bg-white/95 p-3 shadow-card backdrop-blur dark:border-cream/10 dark:bg-ink-800/95 sm:-right-6"
            style={{ animationDelay: '1.2s' }}
          >
            <div className="flex items-center gap-3">
              <SmartImage src="https://loremflickr.com/100/100/tomato" keyword="tomato" alt="" className="h-12 w-12 rounded-xl object-cover" />
              <div>
                <div className="text-xs font-bold text-ink dark:text-cream">Fresh Tomatoes</div>
                <div className="text-[11px] text-ink/50 dark:text-cream/50">10 kg</div>
                <div className="mt-0.5 flex items-center gap-1">
                  <span className="text-sm font-extrabold text-ink dark:text-cream nums">₹240</span>
                  <span className="chip bg-lime-400/90 px-1.5 py-0 text-[10px] text-ink">Best rate</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* stats strip */}
      <div className="container-x relative z-10 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-ink/10 bg-ink/10 dark:border-cream/10 dark:bg-cream/10 md:grid-cols-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="bg-cream px-6 py-7 dark:bg-ink">
              <AnimatedCounter value={s.value} className="font-display text-4xl font-semibold text-ink dark:text-cream" />
              <div className="mt-1 text-sm text-ink/70 dark:text-cream/70">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
