import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { api } from '../lib/api.js';
import SmartImage from './SmartImage.jsx';
import { inr } from '../lib/constants.js';

export default function SearchOverlay({ onClose }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    const timer = setTimeout(() => {
      api.getProducts({ search: q, limit: 8 })
        .then((r) => setResults(r.items || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 280);
    return () => clearTimeout(timer);
  }, [q]);

  const effectivePrice = (p) => p.discount > 0 ? Math.round(p.price * (1 - p.discount / 100)) : p.price;

  return (
    <div className="fixed inset-0 z-[60]" ref={overlayRef}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative mx-auto mt-16 max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-ink-800 md:mt-20">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-ink/10 px-4 py-3 dark:border-cream/10">
          <Search size={20} className="shrink-0 text-ink/50 dark:text-cream/50" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, categories, tags…"
            className="flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink/40 dark:text-cream dark:placeholder:text-cream/40"
          />
          {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink/20 border-t-ink/60 dark:border-cream/20 dark:border-t-cream/60" />}
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-ink/5 dark:hover:bg-cream/10">
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[65vh] overflow-y-auto">
          {q && results.length === 0 && !loading && (
            <p className="py-10 text-center text-sm text-ink/50 dark:text-cream/50">No products found for &ldquo;{q}&rdquo;</p>
          )}
          {!q && (
            <p className="py-10 text-center text-sm text-ink/40 dark:text-cream/40">Start typing to search&hellip;</p>
          )}
          {results.length > 0 && (
            <ul className="divide-y divide-ink/[0.05] dark:divide-cream/[0.05]">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/product/${p.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-ink/[0.03] dark:hover:bg-cream/[0.03]"
                  >
                    <SmartImage src={p.image} keyword={p.keyword} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-semibold text-ink dark:text-cream">{p.name}</div>
                      <div className="text-xs text-ink/50 dark:text-cream/50">{p.unit}</div>
                      {(p.tags || []).length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {p.tags.slice(0, 4).map((t) => (
                            <span key={t} className="rounded-full bg-lime-100 px-2 py-0.5 text-[10px] font-semibold text-lime-800 dark:bg-lime-500/15 dark:text-lime-400">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-semibold text-ink dark:text-cream nums">{inr(effectivePrice(p))}</div>
                      {p.discount > 0 && <div className="text-xs text-green-600">{p.discount}% off</div>}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {results.length > 0 && (
            <div className="border-t border-ink/[0.05] p-3 dark:border-cream/[0.05]">
              <Link
                to={`/catalogue?search=${encodeURIComponent(q)}`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-brand-600 hover:bg-ink/[0.03] dark:text-lime-400 dark:hover:bg-cream/[0.03]"
              >
                See all results for &ldquo;{q}&rdquo; <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
