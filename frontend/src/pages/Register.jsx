import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, Phone, User } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';

export default function Register() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login, isLoggedIn } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (isLoggedIn) {
    navigate(params.get('next') || '/', { replace: true });
    return null;
  }

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (form.phone && !/^[\d\s+\-()+]{7,15}$/.test(form.phone.trim())) e.phone = 'Invalid phone number';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const body = { name: form.name, email: form.email, password: form.password };
      if (form.phone.trim()) body.phone = form.phone.trim();
      const { token, user } = await api.register(body);
      login(token, user);
      navigate(params.get('next') || '/', { replace: true });
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type = 'text', icon, placeholder, autoComplete) => (
    <label className="block text-sm">
      <span className="font-semibold text-ink dark:text-cream">{label}</span>
      <div className={`mt-1 flex items-center gap-2 rounded-lg border px-3 focus-within:border-brand-500 dark:border-cream/15 ${errors[key] ? 'border-red-400' : 'border-ink/10'}`}>
        {icon}
        <input
          type={type}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-ink/40 dark:text-cream dark:placeholder:text-cream/40"
        />
      </div>
      {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
    </label>
  );

  return (
    <div className="grid min-h-screen place-items-center bg-cream px-4 py-16 dark:bg-ink">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center">
          <Logo markSize={38} textClass="text-2xl text-ink dark:text-cream" />
        </Link>
        <h1 className="mt-6 text-center font-display text-2xl font-extrabold text-ink dark:text-cream">Create account</h1>
        <p className="mt-1 text-center text-sm text-ink/55 dark:text-cream/55">Sign up to get started</p>

        <div className="mt-8 rounded-2xl bg-white p-8 shadow-card dark:bg-ink-800">
          <form onSubmit={submit} className="space-y-4">
            {field('name', 'Full Name', 'text', <User size={17} className="text-ink/40 dark:text-cream/40 shrink-0" />, 'Your name', 'name')}
            {field('email', 'Email', 'email', <Mail size={17} className="text-ink/40 dark:text-cream/40 shrink-0" />, 'you@example.com', 'email')}
            {field('phone', 'Phone (optional)', 'tel', <Phone size={17} className="text-ink/40 dark:text-cream/40 shrink-0" />, '+91 98765 43210', 'tel')}
            {field('password', 'Password', 'password', <Lock size={17} className="text-ink/40 dark:text-cream/40 shrink-0" />, '8+ characters', 'new-password')}
            {field('confirm', 'Confirm Password', 'password', <Lock size={17} className="text-ink/40 dark:text-cream/40 shrink-0" />, 'Re-enter password', 'new-password')}
            {errors.form && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{errors.form}</p>}
            <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink/55 dark:text-cream/55">
            Already have an account?{' '}
            <Link to={`/login${params.get('next') ? `?next=${params.get('next')}` : ''}`} className="font-semibold text-brand-600 hover:underline dark:text-lime-400">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
