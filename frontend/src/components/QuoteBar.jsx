import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, X, Trash2, MessageCircle, ArrowRight } from 'lucide-react';
import { useQuote } from '../context/QuoteContext.jsx';
import { inr, WHATSAPP_NUMBER } from '../lib/constants.js';

export default function QuoteBar() {
  const { items, count, total, setQty, remove, clear } = useQuote();
  const [open, setOpen] = useState(false);

  if (count === 0) return null;

  const waMessage = () => {
    const lines = items.map((i) => `• ${i.name} (${i.unit}) x ${i.qty} — ${inr(i.price * i.qty)}`);
    const text = `Hi Samagra, I'd like to order:\n${lines.join('\n')}\n\nTotal: ${inr(total)}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  return (
    <>
      {/* sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 shadow-[0_-4px_20px_-4px_rgba(16,24,40,0.1)] backdrop-blur dark:border-cream/10 dark:bg-ink-800/95">
        <div className="container-x flex items-center justify-between gap-3 py-3">
          <button onClick={() => setOpen(true)} className="flex items-center gap-3">
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
          </button>
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

      {/* drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-card dark:bg-ink-800">
            <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4 dark:border-cream/10">
              <h3 className="font-display text-lg font-extrabold text-ink dark:text-cream">Your Quote ({count})</h3>
              <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5 dark:hover:bg-cream/10">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {items.map((i) => (
                <div key={i.id} className="flex gap-3 rounded-xl border border-ink/[0.07] p-3 dark:border-cream/10">
                  <img src={i.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-ink dark:text-cream">{i.name}</div>
                    <div className="text-xs text-ink/50 dark:text-cream/50">{i.unit}</div>
                    <div className="mt-1 text-sm font-bold text-brand-700 dark:text-brand-400 nums">{inr(i.price)}</div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => remove(i.id)} className="text-ink/30 hover:text-red-500 dark:text-cream/30 dark:hover:text-red-400" aria-label="Remove">
                      <Trash2 size={16} />
                    </button>
                    <div className="flex items-center gap-2 rounded-lg border border-ink/10 px-1 dark:border-cream/15">
                      <button onClick={() => setQty(i.id, i.qty - 1)} className="px-1 text-lg leading-none">−</button>
                      <span className="min-w-5 text-center text-sm font-bold text-ink dark:text-cream nums">{i.qty}</span>
                      <button onClick={() => setQty(i.id, i.qty + 1)} className="px-1 text-lg leading-none">+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-ink/10 p-5 dark:border-cream/10">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-ink/60 dark:text-cream/60">Estimated total</span>
                <span className="font-display text-xl font-extrabold text-ink dark:text-cream nums">{inr(total)}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={clear} className="btn-outline">Clear</button>
                <Link to="/checkout" onClick={() => setOpen(false)} className="btn-primary flex-1">
                  Proceed to Checkout <ArrowRight size={16} />
                </Link>
              </div>
              <p className="mt-3 text-center text-xs text-ink/40 dark:text-cream/40 nums">
                Minimum order value ₹1,000 • Next-day delivery in 50+ cities
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
