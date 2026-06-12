import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, PhoneCall, ArrowUpRight } from 'lucide-react';
import CallbackModal from '../CallbackModal.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { EASE } from '../../lib/motion.js';

export default function CTA({ cta = {} }) {
  const { waLink } = useSettings();
  const [open, setOpen] = useState(false);
  const eyebrow = cta.eyebrow || 'Ready when you are';
  const title = cta.title || 'Upgrade your';
  const highlight = cta.titleHighlight || 'procurement';
  const suffix = cta.titleSuffix || 'today.';
  const subtitle = cta.subtitle || 'Join hundreds of restaurants, cafes and hotels that trust us for fresher supply, better prices and on-time delivery.';

  return (
    <section className="section">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="grain relative overflow-hidden rounded-[2.5rem] bg-ink px-6 py-12 text-center text-cream md:px-16 md:py-16"
        >
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-lime-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />

          <div className="relative">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-lime-400">{eyebrow}</span>
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.05] md:text-6xl">
              {title} <span className="italic text-lime-400">{highlight}</span> {suffix}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-cream/70">{subtitle}</p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link to="/catalogue" className="btn-lime text-base">
                Start Ordering <ArrowUpRight size={18} />
              </Link>
              <a href={waLink()} target="_blank" rel="noreferrer" className="btn-ghost-light text-base">
                <MessageCircle size={18} /> Talk on WhatsApp
              </a>
              <button onClick={() => setOpen(true)} className="btn-ghost-light text-base">
                <PhoneCall size={18} /> Request Callback
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <CallbackModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
