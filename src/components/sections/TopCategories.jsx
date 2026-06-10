import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import SmartImage from '../SmartImage.jsx';
import { fadeUp, stagger, viewport } from '../../lib/motion.js';

export default function TopCategories({ categories = [] }) {
  return (
    <section className="section bg-cream-100 dark:bg-ink-800/40">
      <div className="container-x">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <span className="eyebrow">The catalogue</span>
            <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-ink dark:text-cream md:text-5xl">
              Source by <span className="italic text-brand-700 dark:text-lime-400">category</span>
            </h2>
          </div>
          <Link to="/catalogue" className="btn-outline">
            View all <ArrowUpRight size={16} />
          </Link>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="grid auto-rows-[180px] grid-cols-2 gap-4 lg:grid-cols-4"
        >
          {categories.map((c, i) => (
            <motion.div key={c.id} variants={fadeUp} className={i === 0 ? 'col-span-2 row-span-2' : ''}>
              <Link to={`/catalogue?category=${c.id}`} className="group relative block h-full w-full overflow-hidden rounded-3xl">
                <SmartImage
                  src={c.image}
                  keyword={c.id.replace(/-/g, ',')}
                  alt={c.name}
                  className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                <div className="absolute right-3 top-3 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-lime-400 text-ink opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowUpRight size={18} />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4 text-cream">
                  <div className={`font-display font-semibold ${i === 0 ? 'text-2xl' : 'text-base'}`}>{c.name}</div>
                  {c.count != null && <div className="text-xs text-cream/70 nums">{c.count} products</div>}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
