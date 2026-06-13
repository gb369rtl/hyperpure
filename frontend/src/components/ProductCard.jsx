import { Link } from 'react-router-dom';
import { Star, Plus, Minus } from 'lucide-react';
import SmartImage from './SmartImage.jsx';
import { useQuote } from '../context/QuoteContext.jsx';
import { inr } from '../lib/constants.js';

export default function ProductCard({ product }) {
  const { items, add, setQty } = useQuote();
  const inQuote = items.find((i) => i.id === product.id);
  const off = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const discountPct = product.discount > 0 ? product.discount : off;
  const effectivePrice = product.discount > 0 ? Math.round(product.price * (1 - product.discount / 100)) : product.price;

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-ink/[0.07] bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card dark:border-cream/10 dark:bg-ink-800">
      <Link to={`/product/${product.id}`} className="relative block aspect-square overflow-hidden bg-cream-100 dark:bg-white/5">
        <SmartImage src={product.image} keyword={product.keyword} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {product.badge && <span className="absolute left-2.5 top-2.5 chip bg-ink text-lime-400">{product.badge}</span>}
        {discountPct > 0 && <span className="absolute right-2.5 top-2.5 chip bg-lime-400 text-ink nums">{discountPct}% OFF</span>}
        {!product.inStock && (
          <span className="absolute inset-0 grid place-items-center bg-cream/70 text-sm font-bold text-ink dark:bg-ink/70 dark:text-cream">Out of stock</span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-center gap-1 text-xs text-amber-500">
          <Star size={12} fill="currentColor" />
          <span className="font-semibold nums">{product.rating}</span>
          <span className="text-ink/40 dark:text-cream/40 nums">({product.reviews})</span>
        </div>

        <Link to={`/product/${product.id}`} className="mt-1.5 line-clamp-2 font-display text-[15px] font-semibold leading-snug text-ink hover:text-brand-700 dark:text-cream">
          {product.name}
        </Link>
        <p className="mt-0.5 text-xs text-ink/45 dark:text-cream/45">{product.unit}</p>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <div className="font-display text-lg font-semibold text-ink dark:text-cream nums">{inr(effectivePrice)}</div>
            {discountPct > 0 && effectivePrice < product.price && (
              <div className="text-xs text-ink/40 dark:text-cream/40 line-through nums">{inr(product.discount > 0 ? product.price : product.mrp)}</div>
            )}
            {discountPct === 0 && off === 0 && product.mrp > product.price && (
              <div className="text-xs text-ink/40 dark:text-cream/40 line-through nums">{inr(product.mrp)}</div>
            )}
          </div>

          {inQuote ? (
            <div className="flex items-center gap-1 rounded-full bg-ink text-cream">
              <button onClick={() => setQty(product.id, inQuote.qty - 1)} className="grid h-10 w-10 place-items-center rounded-l-full hover:bg-ink-700" aria-label="Decrease quantity"><Minus size={15} /></button>
              <span className="min-w-5 text-center text-sm font-bold nums">{inQuote.qty}</span>
              <button onClick={() => setQty(product.id, inQuote.qty + 1)} className="grid h-10 w-10 place-items-center rounded-r-full hover:bg-ink-700" aria-label="Increase quantity"><Plus size={15} /></button>
            </div>
          ) : (
            <button
              onClick={() => add(product)}
              disabled={!product.inStock}
              className="inline-flex min-h-[40px] items-center gap-1 rounded-full border border-ink/15 px-4 py-2 text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-cream disabled:cursor-not-allowed disabled:opacity-40 dark:border-cream/20 dark:text-cream dark:hover:bg-cream dark:hover:text-ink"
            >
              ADD <Plus size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
