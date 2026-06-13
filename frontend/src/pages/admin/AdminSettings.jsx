import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { useSettings } from '../../context/SettingsContext.jsx';

const Section = ({ title, children }) => (
  <div className="rounded-2xl bg-white p-6 shadow-card dark:bg-ink-800">
    <h2 className="mb-4 font-display text-lg font-bold text-ink dark:text-cream">{title}</h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const Field = ({ label, hint, ...props }) => (
  <label className="block text-sm">
    <span className="font-semibold text-ink dark:text-cream">{label}</span>
    {hint && <span className="ml-2 text-xs text-ink/45 dark:text-cream/45">{hint}</span>}
    <input
      className="mt-1 w-full rounded-lg border border-ink/10 bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 dark:border-cream/15 dark:text-cream"
      {...props}
    />
  </label>
);

export default function AdminSettings() {
  const { setSettings } = useSettings();
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSettings().then(setData).catch((e) => setError(e.message));
  }, []);

  if (!data) return (
    <div className="flex h-64 items-center justify-center text-ink/45 dark:text-cream/45">
      {error || 'Loading…'}
    </div>
  );

  const patch = (key, value) => setData((d) => ({ ...d, [key]: value }));
  const patchSub = (key, sub, value) => setData((d) => ({ ...d, [key]: { ...d[key], [sub]: value } }));

  const save = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      const result = await api.updateSettings(data);
      setSettings(result);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-ink dark:text-cream">Site Settings</h1>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600 dark:text-green-400">Saved!</span>}
          {error && <span className="max-w-xs truncate text-sm text-red-500">{error}</span>}
          <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? 'Saving…' : 'Save All'}
          </button>
        </div>
      </div>

      <Section title="WhatsApp">
        <Field
          label="WhatsApp Number"
          hint="Country code without + (e.g. 919999999999)"
          value={data.whatsapp || ''}
          onChange={(e) => patch('whatsapp', e.target.value)}
          placeholder="919999999999"
        />
        <label className="flex items-center justify-between rounded-lg border border-ink/10 p-3 dark:border-cream/15">
          <span className="text-sm font-semibold text-ink dark:text-cream">Show WhatsApp button on website</span>
          <button
            type="button"
            onClick={() => patch('whatsappVisible', !(data.whatsappVisible ?? true))}
            className={`relative h-6 w-11 rounded-full transition-colors ${(data.whatsappVisible ?? true) ? 'bg-lime-400' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${(data.whatsappVisible ?? true) ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </label>
      </Section>

      <Section title="Contact Details">
        <Field
          label="Phone"
          value={data.contact?.phone || ''}
          onChange={(e) => patchSub('contact', 'phone', e.target.value)}
          placeholder="+91 98765 43210"
        />
        <Field
          label="Email"
          type="email"
          value={data.contact?.email || ''}
          onChange={(e) => patchSub('contact', 'email', e.target.value)}
          placeholder="hello@samagra.com"
        />
        <Field
          label="Address"
          value={data.contact?.address || ''}
          onChange={(e) => patchSub('contact', 'address', e.target.value)}
          placeholder="Mumbai, Maharashtra, India"
        />
      </Section>

      <Section title="Social Media Links">
        {['facebook', 'instagram', 'linkedin', 'twitter'].map((platform) => {
          const visible = data.socialVisible?.[platform] ?? true;
          return (
            <div key={platform} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink dark:text-cream">{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                <button
                  type="button"
                  onClick={() => patchSub('socialVisible', platform, !visible)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${visible ? 'bg-lime-400' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${visible ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <input
                type="url"
                className="field"
                value={data.social?.[platform] || ''}
                onChange={(e) => patchSub('social', platform, e.target.value)}
                placeholder={`https://${platform}.com/yourpage`}
              />
            </div>
          );
        })}
      </Section>

      <Section title="Legal Links">
        <Field
          label="Privacy Policy URL"
          type="url"
          value={data.legal?.privacyUrl || ''}
          onChange={(e) => patchSub('legal', 'privacyUrl', e.target.value)}
          placeholder="https://yoursite.com/privacy"
        />
        <Field
          label="Terms of Service URL"
          type="url"
          value={data.legal?.termsUrl || ''}
          onChange={(e) => patchSub('legal', 'termsUrl', e.target.value)}
          placeholder="https://yoursite.com/terms"
        />
      </Section>
    </div>
  );
}
