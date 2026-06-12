import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { api, clearToken } from '../../lib/api.js';
import { inr } from '../../lib/constants.js';
import Pagination from '../../components/Pagination.jsx';

const empty = {
  name: '', category: '', unit: '', price: '', mrp: '', rating: 4.5,
  reviews: 0, badge: '', keyword: '', image: '', description: '', inStock: true,
};

function ProductForm({ product, categories, onClose, onSaved }) {
  const [form, setForm] = useState(product ? { ...empty, ...product } : { ...empty, category: categories[0]?.id || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (product) await api.updateProduct(product.id, form);
      else await api.createProduct(form);
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <form onSubmit={save} className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-card dark:bg-ink-800">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-extrabold">{product ? 'Edit Product' : 'Add Product'}</h3>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="col-span-2 text-sm"><span className="font-semibold">Name *</span>
            <input required value={form.name} onChange={set('name')} className="field mt-1" /></label>
          <label className="text-sm"><span className="font-semibold">Category *</span>
            <select required value={form.category} onChange={set('category')} className="field mt-1">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></label>
          <label className="text-sm"><span className="font-semibold">Unit</span>
            <input value={form.unit} onChange={set('unit')} placeholder="10 kg" className="field mt-1" /></label>
          <label className="text-sm"><span className="font-semibold">Price (₹)</span>
            <input type="number" value={form.price} onChange={set('price')} className="field mt-1 nums" /></label>
          <label className="text-sm"><span className="font-semibold">MRP (₹)</span>
            <input type="number" value={form.mrp} onChange={set('mrp')} className="field mt-1 nums" /></label>
          <label className="text-sm"><span className="font-semibold">Rating</span>
            <input type="number" step="0.1" max="5" value={form.rating} onChange={set('rating')} className="field mt-1 nums" /></label>
          <label className="text-sm"><span className="font-semibold">Reviews</span>
            <input type="number" value={form.reviews} onChange={set('reviews')} className="field mt-1 nums" /></label>
          <label className="text-sm"><span className="font-semibold">Badge</span>
            <input value={form.badge} onChange={set('badge')} placeholder="Best Rate" className="field mt-1" /></label>
          <label className="text-sm"><span className="font-semibold">Image keyword</span>
            <input value={form.keyword} onChange={set('keyword')} placeholder="tomato" className="field mt-1" /></label>
          <label className="col-span-2 text-sm"><span className="font-semibold">Image URL (optional)</span>
            <input value={form.image} onChange={set('image')} placeholder="https://…" className="field mt-1" /></label>
          <label className="col-span-2 text-sm"><span className="font-semibold">Description</span>
            <textarea value={form.description} onChange={set('description')} rows={2} className="field mt-1" /></label>
          <label className="col-span-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.inStock} onChange={set('inStock')} className="h-4 w-4 accent-brand-600" />
            <span className="font-semibold">In stock</span></label>
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          <button disabled={saving} className="btn-primary disabled:opacity-60">{saving ? 'Saving…' : 'Save Product'}</button>
        </div>
      </form>
    </div>
  );
}

export default function AdminProducts() {
  const navigate = useNavigate();
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(term); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [term]);

  const load = () => {
    setLoading(true);
    api
      .getProducts({ page, limit: 12, search, category, sort: '' })
      .then(setData)
      .catch((e) => { if (e.status === 401) { clearToken(); navigate('/admin/login'); } })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, search, category]); // eslint-disable-line react-hooks/exhaustive-deps

  const del = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    setDeleteError('');
    try {
      await api.deleteProduct(p.id);
      load();
    } catch (err) {
      setDeleteError(err.message);
    }
  };
  const catName = (id) => categories.find((c) => c.id === id)?.name || id;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Products</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 nums">{data.total} products in catalogue</p>
        </div>
        <button onClick={() => setEditing('new')} className="btn-primary"><Plus size={16} /> Add Product</button>
      </div>

      {deleteError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{deleteError}</p>}

      <div className="mt-5 flex flex-wrap gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 dark:border-white/15 dark:bg-ink-800">
          <Search size={18} className="text-gray-400" />
          <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search products" className="w-full bg-transparent py-2.5 text-sm outline-none" />
        </div>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="field w-auto">
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="card mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-400 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">Loading…</td></tr>
              ) : data.items.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No products found.</td></tr>
              ) : (
                data.items.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/60 dark:hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt="" className="h-11 w-11 rounded-lg object-cover" />
                        <div>
                          <div className="font-semibold">{p.name}</div>
                          {p.badge && <span className="chip bg-brand-50 text-brand-600 dark:bg-brand-500/15">{p.badge}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{catName(p.category)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{p.unit}</td>
                    <td className="px-4 py-3 font-semibold nums">{inr(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`chip ${p.inStock ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/15' : 'bg-red-50 text-red-500 dark:bg-red-500/10'}`}>
                        {p.inStock ? 'In stock' : 'Out'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setEditing(p)} className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-white/10"><Pencil size={15} /></button>
                        <button onClick={() => del(p)} className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-white/10"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} pages={data.pages} total={data.total} onChange={setPage} />

      {editing && (
        <ProductForm
          product={editing === 'new' ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}
