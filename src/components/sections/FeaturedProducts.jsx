import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../ProductCard.jsx';
import Reveal from '../Reveal.jsx';

export default function FeaturedProducts({ products = [], title = 'Best Sellers', subtitle }) {
  if (!products.length) return null;
  return (
    <section className="section pt-0">
      <div className="container-x">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <span className="eyebrow">Popular picks</span>
            <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-ink dark:text-cream md:text-5xl">{title}</h2>
            {subtitle && <p className="mt-2 text-ink/70 dark:text-cream/70">{subtitle}</p>}
          </div>
          <Link to="/catalogue" className="btn-outline">
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={(i % 5) * 60}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
