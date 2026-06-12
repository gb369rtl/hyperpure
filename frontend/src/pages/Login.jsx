import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login, isLoggedIn, isAdmin } = useAuth();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect already-logged-in users
  if (isLoggedIn) {
    const next = params.get('next') || (isAdmin ? '/admin' : '/');
    navigate(next, { replace: true });
    return null;
  }

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { token, user } = await api.login({ identifier: form.identifier, password: form.password });
      login(token, user);
      const next = params.get('next') || ((user.permissions || []).length > 0 ? '/admin' : '/');
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-cream px-4 py-16 dark:bg-ink">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center">
          <Logo markSize={38} textClass="text-2xl text-ink dark:text-cream" />
        </Link>
        <h1 className="mt-6 text-center font-display text-2xl font-extrabold text-ink dark:text-cream">Welcome back</h1>
        <p className="mt-1 text-center text-sm text-ink/55 dark:text-cream/55">Sign in to your account</p>

        <div className="mt-8 rounded-2xl bg-white p-8 shadow-card dark:bg-ink-800">
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm">
              <span className="font-semibold text-ink dark:text-cream">Email or Username</span>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-ink/10 px-3 focus-within:border-brand-500 dark:border-cream/15">
                <Mail size={17} className="text-ink/40 dark:text-cream/40" />
                <input
                  value={form.identifier}
                  onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                  placeholder="you@example.com"
                  autoComplete="username"
                  className="w-full bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-ink/40 dark:text-cream dark:placeholder:text-cream/40"
                />
              </div>
            </label>
            <label className="block text-sm">
              <span className="font-semibold text-ink dark:text-cream">Password</span>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-ink/10 px-3 focus-within:border-brand-500 dark:border-cream/15">
                <Lock size={17} className="text-ink/40 dark:text-cream/40" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-ink/40 dark:text-cream dark:placeholder:text-cream/40"
                />
              </div>
            </label>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</p>}
            <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink/55 dark:text-cream/55">
            Don't have an account?{' '}
            <Link to={`/register${params.get('next') ? `?next=${params.get('next')}` : ''}`} className="font-semibold text-brand-600 hover:underline dark:text-lime-400">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
