import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { api, setToken } from '../../lib/api.js';
import Logo from '../../components/Logo.jsx';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [creds, setCreds] = useState({ username: 'admin', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token } = await api.login(creds);
      setToken(token);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-card">
        <Link to="/" className="flex items-center justify-center" aria-label="Hyperpure home">
          <Logo markSize={38} textClass="text-2xl text-ink" />
        </Link>
        <h1 className="mt-6 text-center font-display text-xl font-extrabold">Admin Panel</h1>
        <p className="mt-1 text-center text-sm text-ink/55">Sign in to manage your catalogue</p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-ink/10 px-3 focus-within:border-brand-500">
            <User size={18} className="text-ink/40" />
            <input
              value={creds.username}
              onChange={(e) => setCreds({ ...creds, username: e.target.value })}
              placeholder="Username"
              className="w-full bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-ink/40"
            />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-ink/10 px-3 focus-within:border-brand-500">
            <Lock size={18} className="text-ink/40" />
            <input
              type="password"
              value={creds.password}
              onChange={(e) => setCreds({ ...creds, password: e.target.value })}
              placeholder="Password"
              className="w-full bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-ink/40"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 rounded-lg bg-ink/[0.04] px-3 py-2 text-center text-xs text-ink/55">
          Demo credentials — <b>admin</b> / <b>admin123</b>
        </p>
      </div>
    </div>
  );
}
