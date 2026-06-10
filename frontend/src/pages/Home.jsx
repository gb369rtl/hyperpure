import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import Hero from '../components/sections/Hero.jsx';
import MarqueeStrip from '../components/sections/MarqueeStrip.jsx';
import Features from '../components/sections/Features.jsx';
import HowWeWork from '../components/sections/HowWeWork.jsx';
import TopCategories from '../components/sections/TopCategories.jsx';
import FeaturedProducts from '../components/sections/FeaturedProducts.jsx';
import IndustrySolutions from '../components/sections/IndustrySolutions.jsx';
import WhySwitch from '../components/sections/WhySwitch.jsx';
import SuccessStories from '../components/sections/SuccessStories.jsx';
import BigStats from '../components/sections/BigStats.jsx';
import TrustedBy from '../components/sections/TrustedBy.jsx';
import FAQ from '../components/sections/FAQ.jsx';
import CTA from '../components/sections/CTA.jsx';

export default function Home() {
  const [content, setContent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    Promise.all([
      api.getContent(),
      api.getCategories(),
      api.getProducts({ limit: 10, sort: 'rating' }),
    ])
      .then(([c, cats, products]) => {
        setContent(c);
        setCategories(cats);
        setFeatured(products.items || []);
      })
      .catch((e) => console.error('Failed to load home content', e));
  }, []);

  if (!content) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream dark:bg-ink">
        <div className="flex flex-col items-center gap-3 text-ink/40 dark:text-cream/40">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-ink/10 border-t-lime-500 dark:border-cream/10 dark:border-t-lime-400" />
          <p className="text-sm">Loading Hyperpure…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Hero hero={content.hero} />
      <MarqueeStrip words={content.marquee} />
      <Features features={content.features} />
      <HowWeWork steps={content.steps} />
      <TopCategories categories={categories} />
      <FeaturedProducts products={featured} subtitle="Top-rated products loved by businesses." />
      <IndustrySolutions industries={content.industries} />
      <WhySwitch comparison={content.comparison} />
      <SuccessStories stories={content.stories} />
      <BigStats stats={content.bigStats} />
      <TrustedBy trust={content.trust} />
      <FAQ faqs={content.faqs} />
      <CTA />
    </>
  );
}
