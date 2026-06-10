import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { api } from '../lib/api.js';
import ProductCard from '../components/ProductCard.jsx';
import QuoteBar from '../components/QuoteBar.jsx';
import { inr } from '../lib/constants.js';

const PAGE_SIZE = 15;

function useDebounced(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function Catalogue() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || 'all';
  const sort = params.get('sort') || '';
  const minRating = params.get('minRating') || '';
  const inStock = params.get('inStock') === 'true';
  const badge = params.get('badge') === 'true';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const page = Number(params.get('page') || 1);

  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ items: [], total: 0, pages: 1, facets: { minPrice: 0, maxPrice: 0 } });
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState(params.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const debouncedTerm = useDebounced(term, 450);
  const gridTop = useRef(null);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  // keep the URL search param in sync with the debounced input
  useEffect(() => {
    const current = params.get('search') || '';
    if (debouncedTerm !== current) {
      const next = new URLSearchParams(params);
      if (debouncedTerm) next.set('search', debouncedTerm);
      else next.delete('search');
      next.delete('page');
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTerm]);

  const search = params.get('search') || '';

  useEffect(() => {
    setLoading(true);
    api
      .getProducts({ category, search, sort, minRating, inStock: inStock || undefined, badge: badge || undefined, minPrice, maxPrice, page, limit: PAGE_SIZE })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, search, sort, minRating, inStock, badge, minPrice, maxPrice, page]);

  const update = (patch, { resetPage = true } = {}) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined || v === false) next.delete(k);
      else next.set(k, v);
    });
    if (resetPage) next.delete('page');
    setParams(next);
  };

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (category !== 'all') next.set('category', category);
    if (search) next.set('search', search);
    setParams(next);
  };

  const goPage = (p) => {
    update({ page: p }, { resetPage: false });
    gridTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const activeCat = categories.find((c) => c.id === category);
  const activeFilterCount =
    (minRating ? 1 : 0) + (inStock ? 1 : 0) + (badge ? 1 : 0) + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);

  const pageNumbers = useMemo(() => {
    const total = data.pages;
    const arr = [];
    const start = Math.max(1, Math.min(page - 2, total - 4));
    for (let i = start; i <= Math.min(total, start + 4); i++) arr.push(i);
    return arr;
  }, [data.pages, page]);

  const Filters = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold">Filters</h3>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-xs font-semibold text-brand-600 dark:text-brand-400">
            Clear all
          </button>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink/50 dark:text-cream/50">Category</p>
        <div className="space-y-1">
          {[{ id: 'all', name: 'All Products' }, ...categories].map((c) => (
            <button
              key={c.id}
              onClick={() => update({ category: c.id === 'all' ? '' : c.id })}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                category === c.id || (c.id === 'all' && category === 'all')
                  ? 'bg-brand-50 font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400'
                  : 'hover:bg-ink/5 dark:hover:bg-cream/5'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink/50 dark:text-cream/50">
          Price (₹{data.facets.minPrice}–₹{data.facets.maxPrice})
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={minPrice}
            key={`min-${minPrice}`}
            onBlur={(e) => update({ minPrice: e.target.value })}
            className="field nums w-full"
          />
          <span className="text-ink/40 dark:text-cream/40">–</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={maxPrice}
            key={`max-${maxPrice}`}
            onBlur={(e) => update({ maxPrice: e.target.value })}
            className="field nums w-full"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink/50 dark:text-cream/50">Rating</p>
        <div className="flex flex-wrap gap-2">
          {[4.5, 4, 3.5].map((r) => (
            <button
              key={r}
              onClick={() => update({ minRating: minRating === String(r) ? '' : r })}
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                minRating === String(r)
                  ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400'
                  : 'border-ink/10 dark:border-cream/15'
              }`}
            >
              <Star size={12} className="text-amber-400" fill="currentColor" /> {r}+
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={inStock} onChange={(e) => update({ inStock: e.target.checked })} className="h-4 w-4 accent-brand-600" />
          In stock only
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={badge} onChange={(e) => update({ badge: e.target.checked })} className="h-4 w-4 accent-brand-600" />
          Best rate offers
        </label>
      </div>
    </div>
  );

  return (
    <div className="pt-16">
      {/* header band */}
      <div className="bg-ink py-10 text-white">
        <div className="container-x">
          <p className="text-sm text-white/60">Catalogue {activeCat ? `/ ${activeCat.name}` : ''}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold">{activeCat ? activeCat.name : 'All Products'}</h1>
          <p className="mt-1 text-sm text-white/70">{activeCat?.tagline || 'Wholesale rates, quality-checked, delivered next-day.'}</p>

          <div className="mt-5 flex max-w-xl items-center gap-2 rounded-lg bg-white px-3 py-2.5 text-ink dark:bg-ink-800 dark:text-cream">
            <Search size={18} className="text-ink/40 dark:text-cream/40" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search items or categories"
              className="w-full bg-transparent text-sm outline-none"
            />
            {term && (
              <button onClick={() => setTerm('')} className="text-ink/40 hover:text-ink dark:text-cream/40 dark:hover:text-cream">
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* toolbar */}
      <div ref={gridTop} className="sticky top-16 z-30 border-b border-ink/10 bg-white/95 backdrop-blur dark:border-cream/10 dark:bg-ink-800/95">
        <div className="container-x flex items-center justify-between gap-3 py-3">
          <button
            onClick={() => setShowFilters(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-ink/10 px-3 py-2 text-sm font-semibold dark:border-cream/15 lg:hidden"
          >
            <SlidersHorizontal size={16} /> Filters
            {activeFilterCount > 0 && <span className="chip bg-brand-600 text-white nums">{activeFilterCount}</span>}
          </button>
          <p className="hidden text-sm text-ink/60 dark:text-cream/60 lg:block nums">
            {loading ? 'Loading…' : `${data.total} products`}
          </p>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="hidden text-ink/40 dark:text-cream/40 sm:block" />
            <select value={sort} onChange={(e) => update({ sort: e.target.value })} className="field w-auto">
              <option value="">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* body */}
      <div className="container-x grid grid-cols-1 gap-8 py-8 pb-28 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-32">{Filters}</div>
        </aside>

        <div>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5" />
              ))}
            </div>
          ) : data.items.length === 0 ? (
            <div className="py-20 text-center text-ink/50 dark:text-cream/50">
              <p className="text-lg font-semibold">No products found</p>
              <p className="mt-1 text-sm">Try a different category, search term, or clear filters.</p>
              <button onClick={clearFilters} className="btn-outline mt-4">Clear filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {data.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {data.pages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => goPage(page - 1)}
                    disabled={page <= 1}
                    className="grid h-10 w-10 place-items-center rounded-lg border border-ink/10 disabled:opacity-40 dark:border-cream/15"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {pageNumbers[0] > 1 && <span className="px-2 text-ink/40 dark:text-cream/40">…</span>}
                  {pageNumbers.map((p) => (
                    <button
                      key={p}
                      onClick={() => goPage(p)}
                      className={`h-10 w-10 rounded-lg text-sm font-semibold nums ${
                        p === page ? 'bg-brand-600 text-white' : 'border border-ink/10 dark:border-cream/15'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  {pageNumbers[pageNumbers.length - 1] < data.pages && <span className="px-2 text-ink/40 dark:text-cream/40">…</span>}
                  <button
                    onClick={() => goPage(page + 1)}
                    disabled={page >= data.pages}
                    className="grid h-10 w-10 place-items-center rounded-lg border border-ink/10 disabled:opacity-40 dark:border-cream/15"
                    aria-label="Next page"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setShowFilters(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85%] overflow-y-auto bg-white p-5 dark:bg-ink-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-extrabold text-ink dark:text-cream">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5 dark:hover:bg-cream/10">
                <X size={18} />
              </button>
            </div>
            {Filters}
            <button onClick={() => setShowFilters(false)} className="btn-primary mt-6 w-full">
              Show {data.total} results
            </button>
          </div>
        </div>
      )}

      <QuoteBar />
    </div>
  );
}
