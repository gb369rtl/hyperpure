import Marquee from '../Marquee.jsx';

const FALLBACK = ['Farm-Fresh Produce', 'Wholesale Pricing', 'Next-Day Delivery', 'Quality Assured'];

export default function MarqueeStrip({ words }) {
  const list = words && words.length ? words : FALLBACK;
  return (
    <section className="border-y border-ink/10 bg-ink py-5 text-cream dark:border-cream/10 dark:bg-ink-800">
      <Marquee>
        {list.map((w) => (
          <span key={w} className="flex items-center gap-10 whitespace-nowrap">
            <span className="font-display text-2xl font-medium italic md:text-3xl">{w}</span>
            <span className="text-2xl text-lime-400">✦</span>
          </span>
        ))}
      </Marquee>
    </section>
  );
}
