import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Phone, MapPin } from 'lucide-react';
import { api, clearToken } from '../../lib/api.js';
import { inr } from '../../lib/constants.js';
import Pagination from '../../components/Pagination.jsx';

const STATUSES = ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
const statusStyle = {
  placed: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10',
  confirmed: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10',
  packed: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10',
  shipped: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10',
  delivered: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15',
  cancelled: 'bg-red-50 text-red-500 dark:bg-red-500/10',
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [term, setTerm] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setSearch(term); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [term]);

  const load = () => {
    setLoading(true);
    api
      .orders({ page, limit: 10, search, status })
      .then(setData)
      .catch((e) => { if (e.status === 401) { clearToken(); navigate('/admin/login'); } })
      .finally(() => setLoading(false));
  };
  useEffect(load, [page, search, status]); // eslint-disable-line react-hooks/exhaustive-deps

  const changeStatus = async (id, s) => {
    setActionError('');
    try {
      await api.updateOrder(id, { status: s });
      setData((d) => ({ ...d, items: d.items.map((o) => (o.id === id ? { ...o, status: s } : o)) }));
    } catch (err) {
      setActionError(`Failed to update order status: ${err.message}`);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">Orders</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 nums">{data.total} total orders</p>

      {actionError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{actionError}</p>}

      <div className="mt-5 flex flex-wrap gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 dark:border-white/15 dark:bg-ink-800">
          <Search size={18} className="text-gray-400" />
          <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search by order ID, name or phone" className="w-full bg-transparent py-2.5 text-sm outline-none" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="field w-auto capitalize">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="py-10 text-center text-sm text-gray-400">Loading…</p>
        ) : data.items.length === 0 ? (
          <div className="card py-16 text-center text-gray-400">
            <p className="text-lg font-semibold">No orders found</p>
            <p className="mt-1 text-sm">Orders placed on the website will appear here.</p>
          </div>
        ) : (
          data.items.map((o) => (
            <div key={o.id} className="card overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 p-4">
                <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="flex flex-1 items-center gap-3 text-left">
                  <ChevronDown size={18} className={`shrink-0 text-gray-400 transition-transform ${expanded === o.id ? 'rotate-180' : ''}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold nums">{o.id}</span>
                      <span className={`chip capitalize ${statusStyle[o.status]}`}>{o.status}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {o.customer.name}{o.customer.business && ` · ${o.customer.business}`} · {new Date(o.createdAt).toLocaleString()}
                    </div>
                  </div>
                </button>
                <div className="text-right">
                  <div className="font-display text-lg font-extrabold nums">{inr(o.total)}</div>
                  <div className="text-xs text-gray-400 nums">{o.itemCount} items</div>
                </div>
                <select
                  value={o.status}
                  onChange={(e) => changeStatus(o.id, e.target.value)}
                  className="field w-auto capitalize"
                >
                  {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>

              {expanded === o.id && (
                <div className="border-t border-gray-100 bg-gray-50/60 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400">Items</h4>
                      <div className="mt-2 space-y-2">
                        {o.items.map((i) => (
                          <div key={i.id} className="flex items-center gap-2 text-sm">
                            <img src={i.image} alt="" className="h-9 w-9 rounded object-cover" />
                            <span className="flex-1">{i.name} <span className="text-gray-400 nums">× {i.qty}</span></span>
                            <span className="font-semibold nums">{inr(i.lineTotal)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400">Delivery</h4>
                      <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        <p className="flex items-center gap-2"><Phone size={14} className="text-brand-600" /> {o.customer.phone}</p>
                        <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 text-brand-600" /> {o.customer.address}, {o.customer.city} {o.customer.pincode}</p>
                        {o.notes && <p className="text-xs text-gray-400">Notes: {o.notes}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Pagination page={page} pages={data.pages} total={data.total} onChange={setPage} />
    </div>
  );
}
