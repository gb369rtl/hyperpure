import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IndianRupee, ShoppingBag, Package, Bell, Clock, ArrowRight, Star } from 'lucide-react';
import { api } from '../../lib/api.js';
import { inr } from '../../lib/constants.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [orders, setOrders] = useState([]);
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    Promise.all([api.overview(), api.orders({ limit: 5 }), api.leads({ limit: 5 })])
      .then(([o, ord, l]) => {
        setOverview(o);
        setOrders(ord.items || []);
        setLeads(l.items || []);
      })
      .catch((e) => {
        if (e.status === 401) navigate('/login');
      });
  }, [navigate]);

  const cards = [
    { label: 'Revenue', value: overview ? inr(overview.revenue) : '—', icon: IndianRupee, color: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15' },
    { label: 'Orders', value: overview?.orders ?? '—', icon: ShoppingBag, color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15' },
    { label: 'Pending Orders', value: overview?.pendingOrders ?? '—', icon: Clock, color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15' },
    { label: 'Products', value: overview?.products ?? '—', icon: Package, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15' },
    { label: 'New Leads', value: overview?.newLeads ?? '—', icon: Bell, color: 'bg-red-50 text-red-600 dark:bg-red-500/15' },
    { label: 'Pending Reviews', value: overview?.pendingReviews ?? '—', icon: Star, color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15', link: '/admin/reviews' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Overview of your store activity.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => {
          const I = c.icon;
          const inner = (
            <>
              <div className={`grid h-11 w-11 place-items-center rounded-xl ${c.color}`}>
                <I size={22} />
              </div>
              <div className="mt-4 font-display text-2xl font-extrabold nums">{c.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{c.label}</div>
            </>
          );
          return c.link ? (
            <Link key={c.label} to={c.link} className="card p-5 hover:border-brand-300 dark:hover:border-brand-500/50 transition-colors">{inner}</Link>
          ) : (
            <div key={c.label} className="card p-5">{inner}</div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* recent orders */}
        <div className="card">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10">
            <h2 className="font-display text-lg font-bold">Recent Orders</h2>
            <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-400">No orders yet.</p>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-white/5">
              {orders.map((o) => (
                <Link key={o.id} to="/admin/orders" className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50/60 dark:hover:bg-white/5">
                  <div>
                    <div className="text-sm font-semibold nums">{o.id}</div>
                    <div className="text-xs text-gray-400">{o.customer.name} · {o.itemCount} items</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold nums">{inr(o.total)}</div>
                    <span className="chip bg-gray-100 capitalize text-gray-500 dark:bg-white/10">{o.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* recent leads */}
        <div className="card">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10">
            <h2 className="font-display text-lg font-bold">Recent Leads</h2>
            <Link to="/admin/leads" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {leads.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-400">No leads yet.</p>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-white/5">
              {leads.map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <div className="text-sm font-semibold">{l.name}</div>
                    <div className="text-xs text-gray-400">{l.phone} {l.business && `• ${l.business}`}</div>
                  </div>
                  <span className="chip bg-gray-100 capitalize text-gray-600 dark:bg-white/10 dark:text-gray-300">{l.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
