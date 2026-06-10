import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

function Item({ faq, open, onToggle }) {
  return (
    <div className={`overflow-hidden rounded-2xl border transition-colors ${open ? 'border-lime-400 bg-white dark:bg-ink-800' : 'border-ink/[0.07] bg-white dark:border-cream/10 dark:bg-ink-800'}`}>
      <button onClick={onToggle} className="flex w-full items-center justify-between gap-3 px-6 py-5 text-left font-display text-base font-semibold text-ink dark:text-cream">
        {faq.q}
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition-colors ${open ? 'bg-lime-400 text-ink' : 'bg-ink/5 text-ink dark:bg-cream/10 dark:text-cream'}`}>
          {open ? <Minus size={15} /> : <Plus size={15} />}
        </span>
      </button>
      {open && <p className="px-6 pb-5 text-sm leading-relaxed text-ink/70 dark:text-cream/70">{faq.a}</p>}
    </div>
  );
}

export default function FAQ({ faqs = [] }) {
  const [open, setOpen] = useState(0);
  const mid = Math.ceil(faqs.length / 2);
  const cols = [faqs.slice(0, mid), faqs.slice(mid)];

  return (
    <section id="faq" className="section bg-cream-100 dark:bg-ink-800/40">
      <div className="container-x">
        <div className="mb-8 text-center">
          <span className="eyebrow mx-auto w-fit">Good to know</span>
          <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-ink dark:text-cream md:text-5xl">
            Frequently asked <span className="italic text-brand-700 dark:text-lime-400">questions</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {cols.map((col, ci) => (
            <div key={ci} className="space-y-3">
              {col.map((faq, i) => {
                const idx = ci * mid + i;
                return <Item key={faq.q} faq={faq} open={open === idx} onToggle={() => setOpen(open === idx ? -1 : idx)} />;
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
