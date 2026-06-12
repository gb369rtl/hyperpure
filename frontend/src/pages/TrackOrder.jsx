import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package } from 'lucide-react';
import { api } from '../lib/api.js';
import { inr } from '../lib/constants.js';

const statusStyle = {
  placed: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10',
  confirmed: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10',
  packed: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10',
  shipped: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10',
  delivered: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15',
  cancelled: 'bg-red-50 text-red-500 dark:bg-red-500/10',
};

export default function TrackOrder() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const isId = /^SM/i.test(query.trim());
      const res = await api.trackOrders(isId ? { id: query.trim() } : { phone: query.trim() });
      setResults(res);
    } catch {
      setError('Unable to fetch orders. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16">
      <div className="bg-ink py-10 text-white">
        <div className="container-x">
          <h1 className="font-display text-2xl font-extrabold md:text-3xl">Track Your Order</h1>
          <p className="mt-1 text-sm text-white/70">Enter your Order ID or registered phone number.</p>
          <form onSubmit={search} className="mt-5 flex max-w-xl gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg bg-white px-3 py-2.5 text-ink dark:bg-ink-800 dark:text-cream">
              <Search size={18} className="text-ink/40 dark:text-cream/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. SM4K2X9B or 9876512345"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/40 dark:text-cream dark:placeholder:text-cream/40"
              />
            </div>
            <button className="btn-primary">Track</button>
          </form>
        </div>
      </div>

      <div className="container-x py-10">
        {loading && <p className="text-center text-ink/50 dark:text-cream/50">Searching…</p>}

        {error && (
          <div className="mx-auto max-w-3xl rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        {results && !loading && results.length === 0 && !error && (
          <div className="py-16 text-center text-ink/50 dark:text-cream/50">
            <Package className="mx-auto" size={48} />
            <p className="mt-3 text-lg font-semibold">No orders found</p>
            <p className="mt-1 text-sm">Check your Order ID or phone number and try again.</p>
          </div>
        )}

        {results && results.length > 0 && (
          <div className="mx-auto max-w-3xl space-y-3">
            {results.map((o) => (
              <Link
                key={o.id}
                to={`/order/${o.id}`}
                className="card flex flex-wrap items-center justify-between gap-3 p-5 transition-all hover:-translate-y-0.5 hover:shadow-card"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold nums">{o.id}</span>
                    <span className={`chip capitalize ${statusStyle[o.status] || 'bg-gray-100'}`}>{o.status}</span>
                  </div>
                  <div className="mt-1 text-sm text-ink/55 dark:text-cream/55 nums">
                    {o.itemCount} items · {new Date(o.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg font-extrabold nums">{inr(o.total)}</div>
                  <div className="text-xs text-brand-600">View details →</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
