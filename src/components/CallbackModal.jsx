import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api.js';

export default function CallbackModal({ open, onClose, defaultType = 'callback' }) {
  const [form, setForm] = useState({ name: '', phone: '', business: '', message: '' });
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [error, setError] = useState('');

  if (!open) return null;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setState('loading');
    setError('');
    try {
      await api.createLead({ ...form, type: defaultType });
      setState('done');
    } catch (err) {
      setError(err.message);
      setState('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-card dark:bg-ink-800">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
        >
          <X size={18} />
        </button>

        {state === 'done' ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto text-brand-600" size={48} />
            <h3 className="mt-3 font-display text-xl font-extrabold">Request received!</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Our team will call you back shortly to set up your account.
            </p>
            <button onClick={onClose} className="btn-primary mt-5">
              Done
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-display text-xl font-extrabold">Request a Callback</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Leave your details and we'll get in touch to onboard your business.
            </p>
            <form onSubmit={submit} className="mt-5 space-y-3">
              <input required value={form.name} onChange={set('name')} placeholder="Your name *" className="field" />
              <input required value={form.phone} onChange={set('phone')} placeholder="Phone number *" inputMode="tel" className="field" />
              <input value={form.business} onChange={set('business')} placeholder="Business name" className="field" />
              <textarea value={form.message} onChange={set('message')} placeholder="What do you need? (optional)" rows={3} className="field" />
              {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
              <button disabled={state === 'loading'} className="btn-primary w-full disabled:opacity-60">
                {state === 'loading' ? 'Submitting…' : 'Request Callback'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
