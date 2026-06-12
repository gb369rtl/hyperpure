import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, Check, ChevronDown } from 'lucide-react';
import { api, clearToken } from '../../lib/api.js';

const ICONS = ['shield', 'truck', 'tag', 'headset', 'sprout', 'check', 'warehouse', 'package', 'star'];

/* ---------- small reusable editors ---------- */
function StringList({ items = [], onChange, placeholder }) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <input
            className="field"
            value={it}
            placeholder={placeholder}
            onChange={(e) => onChange(items.map((v, j) => (j === i ? e.target.value : v)))}
          />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-ink/10 text-gray-400 hover:border-red-300 hover:text-red-500 dark:border-cream/15">
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ''])} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-lime-400">
        <Plus size={14} /> Add
      </button>
    </div>
  );
}

function ObjectList({ items = [], fields, template, onChange, cols = 2 }) {
  const setItem = (i, key, val) => onChange(items.map((it, j) => (j === i ? { ...it, [key]: val } : it)));
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border border-ink/[0.07] p-3 dark:border-cream/10">
          <div className={`grid gap-2 ${cols === 1 ? '' : 'sm:grid-cols-2'}`}>
            {fields.map((f) => (
              <label key={f.key} className={`block text-xs ${f.full ? 'sm:col-span-2' : ''}`}>
                <span className="font-semibold text-ink/60 dark:text-cream/60">{f.label}</span>
                {f.type === 'textarea' ? (
                  <textarea className="field mt-1" rows={2} value={it[f.key] ?? ''} onChange={(e) => setItem(i, f.key, e.target.value)} />
                ) : f.type === 'select' ? (
                  <select className="field mt-1" value={it[f.key] ?? ''} onChange={(e) => setItem(i, f.key, e.target.value)}>
                    {f.options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input className="field mt-1" value={it[f.key] ?? ''} onChange={(e) => setItem(i, f.key, e.target.value)} />
                )}
              </label>
            ))}
          </div>
          <div className="mt-2 text-right">
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="inline-flex items-center gap-1 text-xs font-semibold text-red-500">
              <Trash2 size={13} /> Remove
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { ...template }])} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-lime-400">
        <Plus size={14} /> Add item
      </button>
    </div>
  );
}

function Section({ title, desc, sectionKey, draft, onSave, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const [state, setState] = useState('idle');
  const [saveError, setSaveError] = useState('');
  const save = async () => {
    setState('saving');
    setSaveError('');
    try {
      await onSave(sectionKey);
      setState('saved');
      setTimeout(() => setState('idle'), 1800);
    } catch (err) {
      setState('error');
      setSaveError(err.message || 'Save failed. Please try again.');
      setTimeout(() => setState('idle'), 3000);
    }
  };
  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left">
        <div>
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          {desc && <p className="text-xs text-ink/50 dark:text-cream/50">{desc}</p>}
        </div>
        <ChevronDown size={18} className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-ink/[0.07] p-5 dark:border-cream/10">
          {children}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button onClick={save} disabled={state === 'saving'} className="btn-primary disabled:opacity-60">
              {state === 'saved' ? <><Check size={16} /> Saved</> : <><Save size={16} /> {state === 'saving' ? 'Saving…' : 'Save changes'}</>}
            </button>
            {saveError
              ? <span className="text-xs text-red-500">{saveError}</span>
              : <span className="text-xs text-ink/45 dark:text-cream/45">Goes live on the website immediately.</span>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- page ---------- */
export default function AdminContent() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    api.getContent().then(setDraft).catch((e) => { if (e.status === 401) { clearToken(); navigate('/admin/login'); } });
  }, [navigate]);

  if (!draft) return <p className="py-10 text-center text-sm text-gray-400">Loading content…</p>;

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const setHero = (key, value) => setDraft((d) => ({ ...d, hero: { ...d.hero, [key]: value } }));
  const setComparison = (key, value) => setDraft((d) => ({ ...d, comparison: { ...d.comparison, [key]: value } }));
  const save = (key) => api.updateContent({ [key]: draft[key] });

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-extrabold">Content Manager</h1>
      <p className="mt-1 text-sm text-ink/55 dark:text-cream/55">Edit every section of the public website — banners, stats, features, testimonials and more.</p>

      <div className="mt-6 space-y-4">
        {/* HERO / BANNER */}
        <Section title="Hero Banner" desc="Headline, subtitle and the stats strip" sectionKey="hero" draft={draft} onSave={save} defaultOpen>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2"><span className="font-semibold">Eyebrow</span>
              <input className="field mt-1" value={draft.hero.eyebrow || ''} onChange={(e) => setHero('eyebrow', e.target.value)} /></label>
            <label className="block text-sm"><span className="font-semibold">Title (line 1)</span>
              <input className="field mt-1" value={draft.hero.titlePrefix || ''} onChange={(e) => setHero('titlePrefix', e.target.value)} /></label>
            <label className="block text-sm"><span className="font-semibold">Title highlight</span>
              <input className="field mt-1" value={draft.hero.titleHighlight || ''} onChange={(e) => setHero('titleHighlight', e.target.value)} /></label>
            <label className="block text-sm sm:col-span-2"><span className="font-semibold">Subtitle</span>
              <textarea rows={2} className="field mt-1" value={draft.hero.subtitle || ''} onChange={(e) => setHero('subtitle', e.target.value)} /></label>
          </div>
          <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-ink/40">Stats strip</p>
          <ObjectList items={draft.hero.stats} template={{ value: '', label: '' }} onChange={(v) => setHero('stats', v)}
            fields={[{ key: 'value', label: 'Value (e.g. 500+)' }, { key: 'label', label: 'Label' }]} />
        </Section>

        {/* MARQUEE */}
        <Section title="Scrolling Marquee" desc="The moving strip under the hero" sectionKey="marquee" draft={draft} onSave={save}>
          <StringList items={draft.marquee || []} onChange={(v) => set('marquee', v)} placeholder="Phrase" />
        </Section>

        {/* FEATURES */}
        <Section title="Feature Cards" desc="The 'why choose us' grid" sectionKey="features" draft={draft} onSave={save}>
          <ObjectList items={draft.features} template={{ icon: 'star', title: '', text: '' }} onChange={(v) => set('features', v)}
            fields={[{ key: 'icon', label: 'Icon', type: 'select', options: ICONS }, { key: 'title', label: 'Title' }, { key: 'text', label: 'Text', type: 'textarea', full: true }]} />
        </Section>

        {/* STEPS */}
        <Section title="How We Work Steps" sectionKey="steps" draft={draft} onSave={save}>
          <ObjectList items={draft.steps} template={{ icon: 'sprout', title: '', text: '' }} onChange={(v) => set('steps', v)}
            fields={[{ key: 'icon', label: 'Icon', type: 'select', options: ICONS }, { key: 'title', label: 'Title' }, { key: 'text', label: 'Text', full: true }]} />
        </Section>

        {/* COMPARISON */}
        <Section title="Why Switch (Comparison)" sectionKey="comparison" draft={draft} onSave={save}>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink/40">Traditional suppliers</p>
          <StringList items={draft.comparison.traditional} onChange={(v) => setComparison('traditional', v)} placeholder="Drawback" />
          <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-ink/40">Samagra platform</p>
          <StringList items={draft.comparison.platform} onChange={(v) => setComparison('platform', v)} placeholder="Advantage" />
        </Section>

        {/* STORIES */}
        <Section title="Testimonials" desc="Success story cards" sectionKey="stories" draft={draft} onSave={save}>
          <ObjectList items={draft.stories} template={{ id: Date.now(), business: '', location: '', quote: '', author: '', role: '' }} onChange={(v) => set('stories', v)}
            fields={[{ key: 'business', label: 'Business' }, { key: 'location', label: 'Location' }, { key: 'quote', label: 'Quote', type: 'textarea', full: true }, { key: 'author', label: 'Author' }, { key: 'role', label: 'Role' }]} />
        </Section>

        {/* BIG STATS */}
        <Section title="Big Stats Band" sectionKey="bigStats" draft={draft} onSave={save}>
          <ObjectList items={draft.bigStats} template={{ value: '', label: '' }} onChange={(v) => set('bigStats', v)}
            fields={[{ key: 'value', label: 'Value' }, { key: 'label', label: 'Label' }]} />
        </Section>

        {/* TRUST */}
        <Section title="Trust Badges" sectionKey="trust" draft={draft} onSave={save}>
          <ObjectList items={draft.trust} template={{ name: '', sub: '' }} onChange={(v) => set('trust', v)}
            fields={[{ key: 'name', label: 'Name' }, { key: 'sub', label: 'Subtitle' }]} />
        </Section>

        {/* INDUSTRY SOLUTIONS */}
        <Section title="Industry Solutions" desc="Tabs shown in the 'Solutions for your industry' section" sectionKey="industries" draft={draft} onSave={save}>
          <ObjectList
            items={draft.industries || []}
            template={{ id: '', name: '', image: '', points: [] }}
            onChange={(v) => set('industries', v)}
            fields={[
              { key: 'id', label: 'ID (slug, e.g. restaurants)' },
              { key: 'name', label: 'Display Name' },
              { key: 'image', label: 'Image URL', full: true },
            ]}
          />
          <p className="mt-2 text-xs text-ink/40 dark:text-cream/40">Note: bullet points for each industry tab can be edited here by adding a "points" array field — or manage them directly via the JSON reset for now.</p>
        </Section>

        {/* CTA BANNER */}
        <Section title="CTA Banner" desc="The dark call-to-action strip at the bottom of the home page" sectionKey="cta" draft={draft} onSave={save}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm"><span className="font-semibold">Eyebrow</span>
              <input className="field mt-1" value={draft.cta?.eyebrow || ''} onChange={(e) => set('cta', { ...draft.cta, eyebrow: e.target.value })} /></label>
            <label className="block text-sm"><span className="font-semibold">Title prefix</span>
              <input className="field mt-1" value={draft.cta?.title || ''} onChange={(e) => set('cta', { ...draft.cta, title: e.target.value })} /></label>
            <label className="block text-sm"><span className="font-semibold">Highlighted word</span>
              <input className="field mt-1" value={draft.cta?.titleHighlight || ''} onChange={(e) => set('cta', { ...draft.cta, titleHighlight: e.target.value })} /></label>
            <label className="block text-sm"><span className="font-semibold">Title suffix</span>
              <input className="field mt-1" value={draft.cta?.titleSuffix || ''} onChange={(e) => set('cta', { ...draft.cta, titleSuffix: e.target.value })} /></label>
            <label className="block text-sm sm:col-span-2"><span className="font-semibold">Subtitle</span>
              <textarea rows={2} className="field mt-1" value={draft.cta?.subtitle || ''} onChange={(e) => set('cta', { ...draft.cta, subtitle: e.target.value })} /></label>
          </div>
        </Section>

        {/* FAQ */}
        <Section title="FAQs" sectionKey="faqs" draft={draft} onSave={save}>
          <ObjectList items={draft.faqs} cols={1} template={{ q: '', a: '' }} onChange={(v) => set('faqs', v)}
            fields={[{ key: 'q', label: 'Question', full: true }, { key: 'a', label: 'Answer', type: 'textarea', full: true }]} />
        </Section>
      </div>
    </div>
  );
}
