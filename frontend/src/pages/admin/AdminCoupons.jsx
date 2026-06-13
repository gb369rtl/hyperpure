import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { api } from '../../lib/api.js';
import { inr } from '../../lib/constants.js';

function CouponModal({ coupon, categories, onSave, onCancel }) {
  const isEdit = !!coupon;
  const [form, setForm] = useState({
    code: coupon?.code || '',
    type: coupon?.type || 'percent',
    value: coupon?.value ?? 10,
    minOrder: coupon?.minOrder ?? 0,
    maxUses: coupon?.maxUses ?? '',
    expiresAt: coupon?.expiresAt ? coupon.expiresAt.slice(0, 10) : '',
    active: coupon?.active ?? true,
    scope: coupon?.scope || 'all',
    categoryIds: coupon?.categoryIds || [],
    productIds: coupon?.productIds || [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const body = {
        ...form,
        code: form.code.toUpperCase().trim(),
        value: Number(form.value),
        minOrder: Number(form.minOrder),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      };
      await onSave(body);
    } catch (err) {
      setError(err.message); setSaving(false);
    }
  };

  const toggleCategory = (id) => {
    const ids = form.categoryIds.includes(id) ? form.categoryIds.filter((x) => x !== id) : [...form.categoryIds, id];
    setForm({ ...form, categoryIds: ids });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-ink-800">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-extrabold">{isEdit ? 'Edit Coupon' : 'Create Coupon'}</h2>
          <button type="button" onClick={onCancel} className="rounded-lg p-1 text-ink/40 hover:bg-ink/5"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {!isEdit && (
            <label className="block text-sm">
              <span className="font-semibold">Code *</span>
              <input required className="field mt-1 uppercase" value={form.code} onChange={set('code')} placeholder="SAVE10" maxLength={30} />
            </label>
          )}
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="font-semibold">Type</span>
              <select className="field mt-1" value={form.type} onChange={set('type')}>
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat amount (&#8377;)</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="font-semibold">Value {form.type === 'percent' ? '(%)' : '(&#8377;)'}</span>
              <input type="number" required min="0" max={form.type === 'percent' ? 100 : undefined} className="field mt-1 nums" value={form.value} onChange={set('value')} />
            </label>
            <label className="text-sm">
              <span className="font-semibold">Min Order (&#8377;)</span>
              <input type="number" min="0" className="field mt-1 nums" value={form.minOrder} onChange={set('minOrder')} placeholder="0" />
            </label>
            <label className="text-sm">
              <span className="font-semibold">Max Uses (blank=&infin;)</span>
              <input type="number" min="1" className="field mt-1 nums" value={form.maxUses} onChange={set('maxUses')} placeholder="Unlimited" />
            </label>
            <label className="text-sm">
              <span className="font-semibold">Expires on</span>
              <input type="date" className="field mt-1" value={form.expiresAt} onChange={set('expiresAt')} />
            </label>
            <label className="text-sm">
              <span className="font-semibold">Scope</span>
              <select className="field mt-1" value={form.scope} onChange={set('scope')}>
                <option value="all">All products</option>
                <option value="categories">Specific categories</option>
              </select>
            </label>
          </div>
          {form.scope === 'categories' && (
            <div>
              <span className="text-sm font-semibold">Categories</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button key={c.id} type="button" onClick={() => toggleCategory(c.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${form.categoryIds.includes(c.id) ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400' : 'border-ink/15 dark:border-cream/15'}`}>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={form.active} onChange={set('active')} className="h-4 w-4 accent-brand-600" />
            <span className="font-semibold">Active</span>
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              <Save size={16} /> {saving ? 'Saving…' : 'Save Coupon'}
            </button>
            <button type="button" onClick={onCancel} className="btn-outline"><X size={16} /> Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([api.getCoupons(), api.getCategories()])
      .then(([c, cats]) => { setCoupons(c); setCategories(cats); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const save = async (data) => {
    if (modal.target) await api.updateCoupon(modal.target.id, data);
    else await api.createCoupon(data);
    setModal(null); load();
  };

  const del = async (c) => {
    if (!confirm(`Delete coupon "${c.code}"?`)) return;
    setDeleteError('');
    try { await api.deleteCoupon(c.id); load(); }
    catch (err) { setDeleteError(err.message); }
  };

  const now = new Date();

  return (
    <>
      {modal && <CouponModal coupon={modal.target || null} categories={categories} products={[]} onSave={save} onCancel={() => setModal(null)} />}

      <div className="max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold">Coupons</h1>
            <p className="text-sm text-ink/55 dark:text-cream/55">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setModal({ target: null })} className="btn-primary"><Plus size={17} /> New Coupon</button>
        </div>

        {deleteError && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{deleteError}</p>}

        <div className="mt-5 overflow-hidden rounded-2xl border border-ink/[0.07] dark:border-cream/10">
          {loading ? (
            <p className="py-12 text-center text-sm text-gray-400">Loading&hellip;</p>
          ) : coupons.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">No coupons yet. Create one above.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-ink/[0.07] bg-ink/[0.02] dark:border-cream/10 dark:bg-cream/[0.02]">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-ink/60 dark:text-cream/60">Code</th>
                  <th className="hidden px-5 py-3 text-left font-semibold text-ink/60 dark:text-cream/60 sm:table-cell">Discount</th>
                  <th className="hidden px-5 py-3 text-left font-semibold text-ink/60 dark:text-cream/60 md:table-cell">Usage</th>
                  <th className="hidden px-5 py-3 text-left font-semibold text-ink/60 dark:text-cream/60 lg:table-cell">Expires</th>
                  <th className="px-5 py-3 text-left font-semibold text-ink/60 dark:text-cream/60">Status</th>
                  <th className="px-5 py-3 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/[0.05] dark:divide-cream/[0.05]">
                {coupons.map((c) => {
                  const expired = c.expiresAt && new Date(c.expiresAt) < now;
                  return (
                    <tr key={c.id} className="bg-white dark:bg-transparent hover:bg-ink/[0.015] dark:hover:bg-cream/[0.02]">
                      <td className="px-5 py-3">
                        <span className="font-mono font-bold tracking-wide">{c.code}</span>
                        {c.minOrder > 0 && <div className="text-xs text-ink/45 dark:text-cream/45">Min: {inr(c.minOrder)}</div>}
                      </td>
                      <td className="hidden px-5 py-3 sm:table-cell">
                        <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                          {c.type === 'percent' ? `${c.value}% off` : `${inr(c.value)} off`}
                        </span>
                      </td>
                      <td className="hidden px-5 py-3 text-ink/60 dark:text-cream/60 md:table-cell nums">
                        {c.usedCount} / {c.maxUses ?? '∞'}
                      </td>
                      <td className="hidden px-5 py-3 text-ink/60 dark:text-cream/60 lg:table-cell">
                        {c.expiresAt ? <span className={expired ? 'text-red-500' : ''}>{new Date(c.expiresAt).toLocaleDateString()}</span> : '∞'}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.active && !expired ? 'bg-lime-100 text-lime-800 dark:bg-lime-500/15 dark:text-lime-400' : 'bg-gray-100 text-gray-500 dark:bg-white/10'}`}>
                          {!c.active ? 'Inactive' : expired ? 'Expired' : 'Active'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setModal({ target: c })} className="grid h-8 w-8 place-items-center rounded-lg border border-ink/10 hover:bg-ink/5 dark:border-cream/15">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => del(c)} className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
