import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Building2, Search } from 'lucide-react';
import { api } from '../../lib/api.js';
import Pagination from '../../components/Pagination.jsx';

const STATUSES = ['new', 'contacted', 'closed'];
const statusStyle = {
  new: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10',
  contacted: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10',
  closed: 'bg-gray-100 text-gray-500 dark:bg-white/10',
};

export default function AdminLeads() {
  const navigate = useNavigate();
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [term, setTerm] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setSearch(term); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [term]);

  const load = () => {
    setLoading(true);
    api
      .leads({ page, limit: 10, search, status })
      .then(setData)
      .catch((e) => { if (e.status === 401) navigate('/login'); })
      .finally(() => setLoading(false));
  };
  useEffect(load, [page, search, status]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id, s) => {
    setActionError('');
    try {
      await api.updateLead(id, { status: s });
      setData((d) => ({ ...d, items: d.items.map((l) => (l.id === id ? { ...l, status: s } : l)) }));
    } catch (err) {
      setActionError(`Failed to update lead: ${err.message}`);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">Leads & Enquiries</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 nums">{data.total} total enquiries</p>

      {actionError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{actionError}</p>}

      <div className="mt-5 flex flex-wrap gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 dark:border-white/15 dark:bg-ink-800">
          <Search size={18} className="text-gray-400" />
          <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search by name, phone or business" className="w-full bg-transparent py-2.5 text-sm outline-none" />
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
          <div className="card border-dashed py-16 text-center text-gray-400">
            <p className="text-lg font-semibold">No enquiries found</p>
            <p className="mt-1 text-sm">Callback and quote requests will appear here.</p>
          </div>
        ) : (
          data.items.map((l) => (
            <div key={l.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-bold">{l.name}</h3>
                    <span className="chip bg-gray-100 capitalize text-gray-500 dark:bg-white/10 dark:text-gray-300">{l.type}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5"><Phone size={14} /> {l.phone}</span>
                    {l.business && <span className="flex items-center gap-1.5"><Building2 size={14} /> {l.business}</span>}
                  </div>
                  {l.message && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{l.message}</p>}
                  <p className="mt-2 text-xs text-gray-400">{new Date(l.createdAt).toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-1 rounded-lg bg-gray-50 p-1 dark:bg-white/5">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(l.id, s)}
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                        l.status === s ? statusStyle[s] : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination page={page} pages={data.pages} total={data.total} onChange={setPage} />
    </div>
  );
}
