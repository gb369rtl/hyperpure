import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { api, clearToken } from '../../lib/api.js';

function CategoryForm({ category, onClose, onSaved }) {
  const [form, setForm] = useState(category || { name: '', tagline: '', keyword: '', image: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (category) await api.updateCategory(category.id, form);
      else await api.createCategory(form);
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <form onSubmit={save} className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-card dark:bg-ink-800">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-extrabold">{category ? 'Edit Category' : 'Add Category'}</h3>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10"><X size={18} /></button>
        </div>
        <div className="mt-4 space-y-3">
          <label className="block text-sm"><span className="font-semibold">Name *</span>
            <input required value={form.name} onChange={set('name')} className="field mt-1" /></label>
          <label className="block text-sm"><span className="font-semibold">Tagline</span>
            <input value={form.tagline} onChange={set('tagline')} className="field mt-1" /></label>
          <label className="block text-sm"><span className="font-semibold">Image keyword</span>
            <input value={form.keyword} onChange={set('keyword')} placeholder="vegetables" className="field mt-1" /></label>
          <label className="block text-sm"><span className="font-semibold">Image URL (optional)</span>
            <input value={form.image} onChange={set('image')} placeholder="https://…" className="field mt-1" /></label>
        </div>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          <button disabled={saving} className="btn-primary disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}

export default function AdminCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.getCategories().then(setCategories)
      .catch((e) => { if (e.status === 401) { clearToken(); navigate('/admin/login'); } })
      .finally(() => setLoading(false));
  };
  useEffect(load, [navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const del = async (c) => {
    if (!confirm(`Delete category "${c.name}"? Products keep their category id.`)) return;
    await api.deleteCategory(c.id);
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Categories</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 nums">{categories.length} categories</p>
        </div>
        <button onClick={() => setEditing('new')} className="btn-primary"><Plus size={16} /> Add Category</button>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-gray-400">Loading…</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.id} className="card overflow-hidden">
              <img src={c.image} alt={c.name} className="h-32 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold">{c.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{c.tagline}</p>
                  </div>
                  <span className="chip bg-brand-50 text-brand-600 dark:bg-brand-500/15 nums">{c.count} items</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setEditing(c)} className="btn-outline flex-1 py-2"><Pencil size={14} /> Edit</button>
                  <button onClick={() => del(c)} className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 dark:border-white/15"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <CategoryForm
          category={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}
