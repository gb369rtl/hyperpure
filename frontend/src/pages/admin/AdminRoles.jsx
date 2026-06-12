import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ShieldCheck, X, Save, Check } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

// Group permissions for the checkbox UI
const PERM_GROUPS = [
  { label: 'Dashboard',   perms: ['dashboard:view'] },
  { label: 'Products',    perms: ['products:read', 'products:write', 'products:delete'] },
  { label: 'Categories',  perms: ['categories:read', 'categories:write', 'categories:delete'] },
  { label: 'Orders',      perms: ['orders:read', 'orders:write'] },
  { label: 'Leads',       perms: ['leads:read', 'leads:write'] },
  { label: 'Reviews',     perms: ['reviews:read', 'reviews:write', 'reviews:delete'] },
  { label: 'Content',     perms: ['content:read', 'content:write'] },
  { label: 'Users',       perms: ['users:read', 'users:write', 'users:delete'] },
  { label: 'Roles',       perms: ['roles:read', 'roles:write', 'roles:delete'] },
  { label: 'Settings',    perms: ['settings:manage'] },
];

const permLabel = (p) => p.split(':')[1].charAt(0).toUpperCase() + p.split(':')[1].slice(1);

function RoleForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [perms, setPerms] = useState(new Set(initial?.permissions || []));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isSystem = initial?.isSystem;

  const toggle = (p) => setPerms((prev) => { const s = new Set(prev); s.has(p) ? s.delete(p) : s.add(p); return s; });
  const toggleGroup = (groupPerms) => {
    const allOn = groupPerms.every((p) => perms.has(p));
    setPerms((prev) => { const s = new Set(prev); groupPerms.forEach((p) => allOn ? s.delete(p) : s.add(p)); return s; });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Role name is required');
    setSaving(true); setError('');
    try {
      await onSave({ name: name.trim(), description: description.trim(), permissions: [...perms] });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-semibold">Role Name <span className="text-red-500">*</span></span>
          <input className="field mt-1" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
        </label>
        <label className="block text-sm">
          <span className="font-semibold">Description</span>
          <input className="field mt-1" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} />
        </label>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold">Permissions</p>
        {isSystem && <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">System roles always have all permissions and cannot be restricted.</p>}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PERM_GROUPS.map(({ label, perms: groupPerms }) => {
            const allOn = groupPerms.every((p) => perms.has(p));
            const someOn = groupPerms.some((p) => perms.has(p));
            return (
              <div key={label} className="rounded-xl border border-ink/[0.07] p-3 dark:border-cream/10">
                <label className="flex cursor-pointer items-center gap-2 pb-2 text-xs font-bold uppercase tracking-wide text-ink/60 dark:text-cream/60">
                  <input type="checkbox" checked={allOn} ref={(el) => { if (el) el.indeterminate = someOn && !allOn; }}
                    onChange={() => !isSystem && toggleGroup(groupPerms)} disabled={isSystem}
                    className="accent-brand-600" />
                  {label}
                </label>
                {groupPerms.map((p) => (
                  <label key={p} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
                    <input type="checkbox" checked={perms.has(p)} onChange={() => !isSystem && toggle(p)} disabled={isSystem}
                      className="accent-brand-600" />
                    {permLabel(p)}
                  </label>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          <Save size={16} /> {saving ? 'Saving…' : 'Save Role'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline"><X size={16} /> Cancel</button>
      </div>
    </form>
  );
}

export default function AdminRoles() {
  const { can } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | role object
  const [deleted, setDeleted] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.getRoles().then(setRoles).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const save = async (data) => {
    if (editing === 'new') await api.createRole(data);
    else await api.updateRole(editing.id, data);
    setEditing(null);
    load();
  };

  const del = async (role) => {
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
    setError('');
    try { await api.deleteRole(role.id); load(); }
    catch (err) { setError(err.message); }
  };

  if (editing !== null) {
    return (
      <div className="max-w-4xl">
        <h1 className="mb-6 font-display text-2xl font-extrabold">
          {editing === 'new' ? 'Create Role' : `Edit: ${editing.name}`}
        </h1>
        <div className="card p-6">
          <RoleForm initial={editing === 'new' ? null : editing} onSave={save} onCancel={() => setEditing(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Roles</h1>
          <p className="text-sm text-ink/55 dark:text-cream/55">{roles.length} role{roles.length !== 1 ? 's' : ''} defined</p>
        </div>
        {can('roles:write') && (
          <button onClick={() => setEditing('new')} className="btn-primary">
            <Plus size={17} /> New Role
          </button>
        )}
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</p>}

      <div className="mt-6 space-y-3">
        {loading ? <p className="py-10 text-center text-sm text-gray-400">Loading…</p> : roles.map((role) => (
          <div key={role.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <ShieldCheck size={18} className="text-brand-600 dark:text-brand-400" />
                  <h3 className="font-display text-lg font-bold">{role.name}</h3>
                  {role.isSystem && <span className="chip bg-ink/[0.07] text-ink/60 dark:bg-cream/10 dark:text-cream/60">System</span>}
                  <span className="chip bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">{role.userCount || 0} user{role.userCount !== 1 ? 's' : ''}</span>
                </div>
                {role.description && <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">{role.description}</p>}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {role.permissions.map((p) => (
                    <span key={p} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">{p}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-1.5">
                {can('roles:write') && (
                  <button onClick={() => setEditing(role)} className="grid h-8 w-8 place-items-center rounded-lg border border-ink/10 hover:bg-ink/5 dark:border-cream/15 dark:hover:bg-cream/5" title="Edit">
                    <Pencil size={15} />
                  </button>
                )}
                {can('roles:delete') && !role.isSystem && (
                  <button onClick={() => del(role)} className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10" title="Delete">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
