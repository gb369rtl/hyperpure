import { useMemo, useState } from 'react';
import { CheckCircle2, Sparkles, Bot } from 'lucide-react';
import SmartImage from '../SmartImage.jsx';
import Reveal from '../Reveal.jsx';

const AI_ITEMS = [
  { name: 'Milk', unit: 'Litres', per: 0.11 },
  { name: 'Coffee Beans', unit: 'Kg', per: 0.0125 },
  { name: 'Sugar', unit: 'Kg', per: 0.025 },
  { name: 'Cooking Oil', unit: 'Litres', per: 0.02 },
  { name: 'Packaging', unit: 'Pcs', per: 1 },
];
const TYPE_FACTOR = { Restaurant: 1, Cafe: 0.85, Hotel: 1.3, 'Cloud Kitchen': 1.1, Caterer: 1.5 };
const round = (n) => (n >= 10 ? Math.round(n) : Math.round(n * 10) / 10);

export default function IndustrySolutions({ industries = [] }) {
  const [active, setActive] = useState(0);
  const current = industries[active] || {};
  const [bizType, setBizType] = useState('Restaurant');
  const [customers, setCustomers] = useState(200);

  const recommendation = useMemo(() => {
    const f = TYPE_FACTOR[bizType] ?? 1;
    return AI_ITEMS.map((it) => ({ name: it.name, qty: round(it.per * customers * f), unit: it.unit }));
  }, [bizType, customers]);

  return (
    <section id="solutions" className="section">
      <div className="container-x">
        <div className="mb-8 max-w-2xl">
          <span className="eyebrow">Tailored to you</span>
          <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-ink dark:text-cream md:text-5xl">
            Solutions for your <span className="italic text-brand-700 dark:text-lime-400">industry</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* LEFT */}
          <Reveal>
            <div className="flex flex-wrap gap-2">
              {industries.map((ind, i) => (
                <button
                  key={ind.id}
                  onClick={() => setActive(i)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                    i === active ? 'bg-ink text-cream' : 'bg-white text-ink/70 hover:text-ink dark:bg-cream/10 dark:text-cream/70'
                  }`}
                >
                  {ind.name}
                </button>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="overflow-hidden rounded-3xl">
                <SmartImage src={current.image} keyword={current.id} alt={current.name} className="h-48 w-full object-cover sm:h-full" />
              </div>
              <ul className="space-y-3">
                {(current.points || []).map((pt) => (
                  <li key={pt} className="flex gap-2.5 text-sm text-ink/75 dark:text-cream/75">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-lime-600 dark:text-lime-400" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* RIGHT — AI assistant */}
          <Reveal delay={120} className="grain relative overflow-hidden rounded-[2rem] bg-ink p-7 text-cream md:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-lime-400/15 blur-3xl" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-2xl font-medium">AI Purchase Assistant</h3>
                  <span className="chip bg-lime-400 text-ink">New</span>
                </div>
                <p className="mt-1 max-w-sm text-sm text-cream/70">
                  Tell us about your business and AI suggests your weekly quantities.
                </p>
              </div>
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-lime-400 text-ink"><Bot size={24} /></div>
            </div>

            <div className="relative mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-semibold text-cream/80">Business Type</span>
                <select value={bizType} onChange={(e) => setBizType(e.target.value)} className="mt-1.5 w-full rounded-xl border border-cream/15 bg-cream/5 px-3 py-2.5 text-sm text-cream outline-none focus:border-lime-400">
                  {Object.keys(TYPE_FACTOR).map((t) => <option key={t} className="text-ink">{t}</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-cream/80">Customers / day</span>
                <input type="number" min="1" value={customers} onChange={(e) => setCustomers(Math.max(1, Number(e.target.value) || 0))} className="mt-1.5 w-full rounded-xl border border-cream/15 bg-cream/5 px-3 py-2.5 text-sm text-cream outline-none focus:border-lime-400 nums" />
              </label>
            </div>

            <div className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-lime-400 px-4 py-2 text-sm font-bold text-ink">
              <Sparkles size={16} /> AI Recommendation
            </div>

            <div className="relative mt-5 overflow-hidden rounded-2xl border border-cream/10 bg-cream/5">
              {recommendation.map((r) => (
                <div key={r.name} className="flex items-center justify-between border-b border-cream/5 px-4 py-3 text-sm last:border-0">
                  <span className="text-cream/80">{r.name}</span>
                  <span className="font-bold text-lime-400 nums">{r.qty} {r.unit}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
