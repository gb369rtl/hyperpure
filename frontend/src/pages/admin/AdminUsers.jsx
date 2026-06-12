import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, KeyRound, X, Save, UserCheck, UserX } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

function UserFormModal({ initial, roles, onSave, onCancel }) {
  const [username, setUsername] = useState(initial?.username || '');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState(initial?.roleId || roles[0]?.id || '');
  const [active, setActive] = useState(initial?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!initial;

  const submit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return setError('Username is required');
    if (!isEdit && !password) return setError('Password is required for new user');
    if (!roleId) return setError('Role is required');
    setSaving(true); setError('');
    try {
      const body = { username: username.trim(), roleId, active };
      if (!isEdit) body.password = password;
      await onSave(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-ink-800">
        <div className="mb-5 flex items-start justify-between">
          <h2 className="font-display text-xl font-extrabold">{isEdit ? 'Edit User' : 'Create User'}</h2>
          <button onClick={onCancel} className="rounded-lg p-1 text-ink/40 hover:bg-ink/5"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm">
            <span className="font-semibold">Username <span className="text-red-500">*</span></span>
            <input className="field mt-1" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={80}
              autoComplete="off" autoFocus />
          </label>
          {!isEdit && (
            <label className="block text-sm">
              <span className="font-semibold">Password <span className="text-red-500">*</span></span>
              <input type="password" className="field mt-1" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters" autoComplete="new-password" />
            </label>
          )}
          <label className="block text-sm">
            <span className="font-semibold">Role <span className="text-red-500">*</span></span>
            <select className="field mt-1" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-brand-600 w-4 h-4" />
            <span className="font-semibold">Active</span>
          </label>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              <Save size={16} /> {saving ? 'Saving…' : 'Save User'}
            </button>
            <button type="button" onClick={onCancel} className="btn-outline"><X size={16} /> Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PasswordModal({ user, onSave, onCancel }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return setError('Password must be at least 8 characters');
    if (password !== confirm) return setError('Passwords do not match');
    setSaving(true); setError('');
    try { await onSave(password); }
    catch (err) { setError(err.message); setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-ink-800">
        <div className="mb-5 flex items-start justify-between">
          <h2 className="font-display text-xl font-extrabold">Reset Password</h2>
          <button onClick={onCancel} className="rounded-lg p-1 text-ink/40 hover:bg-ink/5"><X size={20} /></button>
        </div>
        <p className="mb-4 text-sm text-ink/60 dark:text-cream/60">Setting new password for <b>{user.username}</b></p>
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm">
            <span className="font-semibold">New Password</span>
            <input type="password" className="field mt-1" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters" autoFocus autoComplete="new-password" />
          </label>
          <label className="block text-sm">
            <span className="font-semibold">Confirm Password</span>
            <input type="password" className="field mt-1" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password" />
          </label>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              <KeyRound size={16} /> {saving ? 'Saving…' : 'Reset Password'}
            </button>
            <button type="button" onClick={onCancel} className="btn-outline"><X size={16} /> Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { can, user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { type: 'user'|'password', target?: user }
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([api.getUsers(), api.getRoles()])
      .then(([u, r]) => { setUsers(u.items ?? u); setRoles(r); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const roleMap = Object.fromEntries(roles.map((r) => [r.id, r.name]));

  const saveUser = async (data) => {
    if (modal.target) await api.updateUser(modal.target.id, data);
    else await api.createUser(data);
    setModal(null); load();
  };

  const resetPassword = async (password) => {
    await api.resetUserPassword(modal.target.id, { password });
    setModal(null);
  };

  const del = async (user) => {
    if (!confirm(`Delete user "${user.username}"? This cannot be undone.`)) return;
    setError('');
    try { await api.deleteUser(user.id); load(); }
    catch (err) { setError(err.message); }
  };

  const filtered = users.filter((u) => !search || u.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      {modal?.type === 'user' && (
        <UserFormModal initial={modal.target || null} roles={roles} onSave={saveUser} onCancel={() => setModal(null)} />
      )}
      {modal?.type === 'password' && (
        <PasswordModal user={modal.target} onSave={resetPassword} onCancel={() => setModal(null)} />
      )}

      <div className="max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-extrabold">Users</h1>
            <p className="text-sm text-ink/55 dark:text-cream/55">{users.length} admin user{users.length !== 1 ? 's' : ''}</p>
          </div>
          {can('users:write') && (
            <button onClick={() => setModal({ type: 'user' })} className="btn-primary">
              <Plus size={17} /> New User
            </button>
          )}
        </div>

        <input className="field mt-5" placeholder="Search by username…" value={search} onChange={(e) => setSearch(e.target.value)} />

        {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</p>}

        <div className="mt-4 overflow-hidden rounded-2xl border border-ink/[0.07] dark:border-cream/10">
          {loading ? (
            <p className="py-12 text-center text-sm text-gray-400">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">No users found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-ink/[0.07] bg-ink/[0.02] dark:border-cream/10 dark:bg-cream/[0.02]">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-ink/60 dark:text-cream/60">Username</th>
                  <th className="hidden px-5 py-3 text-left font-semibold text-ink/60 dark:text-cream/60 sm:table-cell">Role</th>
                  <th className="hidden px-5 py-3 text-left font-semibold text-ink/60 dark:text-cream/60 md:table-cell">Status</th>
                  <th className="hidden px-5 py-3 text-left font-semibold text-ink/60 dark:text-cream/60 lg:table-cell">Created</th>
                  <th className="px-5 py-3 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/[0.05] dark:divide-cream/[0.05]">
                {filtered.map((u) => {
                  const isSelf = u.id === me?.id;
                  return (
                    <tr key={u.id} className="bg-white dark:bg-transparent hover:bg-ink/[0.015] dark:hover:bg-cream/[0.02]">
                      <td className="px-5 py-3 font-semibold">
                        {u.username}
                        {isSelf && <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">you</span>}
                      </td>
                      <td className="hidden px-5 py-3 sm:table-cell">
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold dark:bg-white/10">
                          {roleMap[u.roleId] || u.roleId}
                        </span>
                      </td>
                      <td className="hidden px-5 py-3 md:table-cell">
                        {u.active
                          ? <span className="flex items-center gap-1.5 text-green-600"><UserCheck size={14} /> Active</span>
                          : <span className="flex items-center gap-1.5 text-gray-400"><UserX size={14} /> Inactive</span>}
                      </td>
                      <td className="hidden px-5 py-3 text-ink/50 dark:text-cream/50 lg:table-cell">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {can('users:write') && (
                            <>
                              <button onClick={() => setModal({ type: 'user', target: u })}
                                className="grid h-8 w-8 place-items-center rounded-lg border border-ink/10 hover:bg-ink/5 dark:border-cream/15 dark:hover:bg-cream/5" title="Edit">
                                <Pencil size={14} />
                              </button>
                              <button onClick={() => setModal({ type: 'password', target: u })}
                                className="grid h-8 w-8 place-items-center rounded-lg border border-ink/10 hover:bg-ink/5 dark:border-cream/15 dark:hover:bg-cream/5" title="Reset password">
                                <KeyRound size={14} />
                              </button>
                            </>
                          )}
                          {can('users:delete') && !isSelf && (
                            <button onClick={() => del(u)}
                              className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          )}
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
