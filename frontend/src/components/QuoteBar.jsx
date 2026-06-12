import { Link } from 'react-router-dom';
import { ShoppingCart, MessageCircle, ArrowRight } from 'lucide-react';
import { useQuote } from '../context/QuoteContext.jsx';
import { inr, WHATSAPP_NUMBER } from '../lib/constants.js';

export default function QuoteBar() {
  const { items, count, total } = useQuote();

  if (count === 0) return null;

  const waMessage = () => {
    const lines = items.map((i) => `• ${i.name} (${i.unit}) x ${i.qty} — ${inr(i.price * i.qty)}`);
    const text = `Hi Samagra, I'd like to order:\n${lines.join('\n')}\n\nTotal: ${inr(total)}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 shadow-[0_-4px_20px_-4px_rgba(16,24,40,0.1)] backdrop-blur dark:border-cream/10 dark:bg-ink-800/95">
      <div className="container-x flex items-center justify-between gap-3 py-3">
        <Link to="/catalogue" className="flex items-center gap-3">
          <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white">
            <ShoppingCart size={20} />
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] font-bold text-white dark:bg-lime-400 dark:text-ink nums">
              {count}
            </span>
          </span>
          <span className="text-left">
            <span className="block text-xs text-ink/50 dark:text-cream/50 nums">{count} items in quote</span>
            <span className="block font-display text-lg font-extrabold leading-tight text-ink dark:text-cream nums">{inr(total)}</span>
          </span>
        </Link>
        <div className="flex gap-2">
          <a href={waMessage()} target="_blank" rel="noreferrer" className="btn-outline hidden sm:inline-flex">
            <MessageCircle size={16} /> Enquire
          </a>
          <Link to="/checkout" className="btn-primary">
            Checkout <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
