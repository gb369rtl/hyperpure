import { useEffect, useState } from 'react';
import { Star, Check, X, Trash2, Search } from 'lucide-react';
import { api } from '../../lib/api.js';

const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  approved: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400',
  rejected: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState('pending');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.adminReviews({ status, search, page, limit: 15 })
      .then((r) => { setReviews(r.items || []); setTotal(r.total || 0); setPages(r.pages || 1); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status, search, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (productId, reviewId, newStatus) => {
    await api.updateReview(productId, reviewId, { status: newStatus });
    load();
  };
  const del = async (productId, reviewId) => {
    if (!confirm('Delete this review permanently?')) return;
    await api.deleteReview(productId, reviewId);
    load();
  };

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Reviews</h1>
          <p className="text-sm text-ink/55 dark:text-cream/55">{total} {status === 'all' ? 'total' : status} review{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* filters */}
      <div className="mt-4 flex flex-wrap gap-3">
        {['pending', 'approved', 'rejected', 'all'].map((s) => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${status === s ? 'bg-brand-600 text-white' : 'border border-ink/10 text-ink/70 hover:border-ink/30 dark:border-cream/15 dark:text-cream/70'}`}>
            {s}
          </button>
        ))}
        <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }}
          className="ml-auto flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-1.5 dark:border-cream/15 dark:bg-ink-700">
          <Search size={15} className="text-ink/40 dark:text-cream/40" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search reviews…" className="w-44 bg-transparent text-sm outline-none dark:text-cream" />
        </form>
      </div>

      {/* table */}
      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="py-10 text-center text-sm text-gray-400">Loading…</p>
        ) : reviews.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">No reviews found.</p>
        ) : reviews.map((r) => (
          <div key={r.id} className="rounded-2xl border border-ink/[0.07] bg-white p-4 dark:border-cream/10 dark:bg-ink-800">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-sm">{r.name}</span>
                  <span className={`chip text-xs ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                  <div className="flex gap-0.5 text-amber-400">
                    {[1,2,3,4,5].map((n) => <Star key={n} size={12} fill={r.rating >= n ? 'currentColor' : 'none'} />)}
                  </div>
                </div>
                <p className="mt-0.5 text-xs text-ink/50 dark:text-cream/50">
                  on <span className="font-medium text-ink/70 dark:text-cream/70">{r.productName}</span>
                  {' · '}{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink/75 dark:text-cream/75">{r.text}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                {r.status !== 'approved' && (
                  <button onClick={() => act(r.productId, r.id, 'approved')}
                    className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400"
                    title="Approve">
                    <Check size={15} />
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button onClick={() => act(r.productId, r.id, 'rejected')}
                    className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400"
                    title="Reject">
                    <X size={15} />
                  </button>
                )}
                <button onClick={() => del(r.productId, r.id)}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10"
                  title="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* pagination */}
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="rounded-lg border border-ink/10 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-cream/15">Prev</button>
          <span className="text-sm text-ink/60 dark:text-cream/60">{page} / {pages}</span>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
            className="rounded-lg border border-ink/10 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-cream/15">Next</button>
        </div>
      )}
    </div>
  );
}
