import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Star, Plus, Minus, ShoppingCart, ArrowRight, ChevronRight, MessageCircle,
  ShieldCheck, Truck, BadgeIndianRupee, Leaf, ThumbsUp, Send,
} from 'lucide-react';
import { api } from '../lib/api.js';
import SmartImage from '../components/SmartImage.jsx';
import ProductCard from '../components/ProductCard.jsx';
import QuoteBar from '../components/QuoteBar.jsx';
import Reveal from '../components/Reveal.jsx';
import { useQuote } from '../context/QuoteContext.jsx';
import { inr } from '../lib/constants.js';
import { useSettings as useSettingsCtx } from '../context/SettingsContext.jsx';

const trust = [
  { icon: ShieldCheck, title: 'Quality Assured', text: 'Multi-level quality checks' },
  { icon: Truck, title: 'Next-Day Delivery', text: 'Reliable, on-time supply' },
  { icon: BadgeIndianRupee, title: 'Wholesale Pricing', text: 'Best rates, no hidden charges' },
  { icon: Leaf, title: 'Farm Fresh', text: 'Sourced from trusted farms' },
];

function StarRating({ value, onChange, size = 20 }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${n} star`}
          className="text-amber-400 transition-transform hover:scale-110"
        >
          <Star size={size} fill={(hovered || value) >= n ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add, items, setQty } = useQuote();
  const { settings } = useSettingsCtx();
  const [product, setProduct] = useState(null);
  const [qty, setQtyLocal] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 0, text: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    window.scrollTo({ top: 0 });
    api
      .getProduct(id)
      .then((p) => {
        setProduct(p);
        setQtyLocal(1);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    api.getReviews(id, { limit: 10 }).then((r) => {
      setReviews(r.items || []);
      setReviewsTotal(r.total || 0);
    }).catch(() => {});
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    if (!reviewForm.rating) return setReviewError('Please select a star rating.');
    if (!reviewForm.name.trim()) return setReviewError('Please enter your name.');
    if (reviewForm.text.trim().length < 10) return setReviewError('Review must be at least 10 characters.');
    setReviewSubmitting(true);
    try {
      await api.submitReview(id, reviewForm);
      setReviewSuccess(true);
      setReviewForm({ name: '', rating: 0, text: '' });
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-x grid grid-cols-1 gap-8 pt-28 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-3xl bg-gray-100 dark:bg-white/5" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
          <div className="h-24 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="grid min-h-[60vh] place-items-center pt-16 text-center">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Product not found</h1>
          <Link to="/catalogue" className="btn-primary mt-4">Back to catalogue</Link>
        </div>
      </div>
    );
  }

  const off = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const inQuote = items.find((i) => i.id === product.id);
  const lineTotal = product.price * qty;

  const addToQuote = () => {
    if (inQuote) setQty(product.id, inQuote.qty + qty);
    else add(product, qty);
  };
  const buyNow = () => {
    addToQuote();
    navigate('/checkout');
  };
  const waLink = `https://wa.me/${settings.whatsapp || '919999999999'}?text=${encodeURIComponent(
    `Hi Samagra, I'm interested in ${product.name} (${product.unit}). Qty: ${qty}.`,
  )}`;

  return (
    <div className="pt-16">
      <div className="container-x py-8 pb-28">
        {/* breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/" className="hover:text-brand-600">Home</Link>
          <ChevronRight size={14} />
          <Link to="/catalogue" className="hover:text-brand-600">Catalogue</Link>
          <ChevronRight size={14} />
          <Link to={`/catalogue?category=${product.category}`} className="capitalize hover:text-brand-600">
            {product.category.replace(/-/g, ' ')}
          </Link>
          <ChevronRight size={14} />
          <span className="text-ink dark:text-gray-200">{product.name}</span>
        </nav>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* image */}
          <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 dark:border-white/10 dark:bg-white/5">
            <SmartImage
              src={product.image}
              keyword={product.keyword}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
            {product.badge && (
              <span className="absolute left-4 top-4 chip bg-brand-600 text-white">{product.badge}</span>
            )}
            {off > 0 && (
              <span className="absolute right-4 top-4 chip bg-accent-500 text-white nums">{off}% OFF</span>
            )}
          </div>

          {/* info */}
          <div>
            <div className="flex items-center gap-2 text-sm text-amber-500">
              <Star size={16} fill="currentColor" />
              <span className="font-semibold nums">{product.rating}</span>
              <span className="text-ink/40 dark:text-cream/40 nums">({product.reviews} reviews)</span>
              <span className={`ml-2 chip ${product.inStock ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400' : 'bg-red-50 text-red-500'}`}>
                {product.inStock ? 'In stock' : 'Out of stock'}
              </span>
            </div>

            <h1 className="mt-2 font-display text-3xl font-extrabold">{product.name}</h1>
            <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">Pack size: {product.unit}</p>

            <div className="mt-4 flex items-end gap-3">
              <span className="font-display text-4xl font-extrabold nums">{inr(product.price)}</span>
              {off > 0 && <span className="pb-1 text-lg text-ink/40 dark:text-cream/40 line-through nums">{inr(product.mrp)}</span>}
              {off > 0 && <span className="pb-1 text-sm font-bold text-brand-600 nums">Save {off}%</span>}
            </div>
            <p className="mt-1 text-xs text-ink/45 dark:text-cream/45">Inclusive of all taxes • per {product.unit}</p>

            <p className="mt-5 text-sm leading-relaxed text-ink/70 dark:text-cream/70">{product.description}</p>

            {/* quantity + bulk */}
            <div className="mt-6 rounded-2xl border border-ink/[0.07] p-4 dark:border-cream/10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-semibold">Quantity</span>
                <div className="flex items-center gap-2 rounded-lg border border-ink/10 dark:border-cream/15">
                  <button onClick={() => setQtyLocal((q) => Math.max(1, q - 1))} className="grid h-10 w-10 place-items-center" aria-label="Decrease">
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQtyLocal(Math.max(1, Number(e.target.value) || 1))}
                    className="w-14 bg-transparent text-center text-base font-bold outline-none nums"
                  />
                  <button onClick={() => setQtyLocal((q) => q + 1)} className="grid h-10 w-10 place-items-center" aria-label="Increase">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-ink/60 dark:text-cream/60">Bulk:</span>
                {[10, 25, 50, 100].map((b) => (
                  <button
                    key={b}
                    onClick={() => setQtyLocal(b)}
                    className="rounded-lg border border-ink/10 px-3 py-1 text-xs font-semibold hover:border-brand-500 hover:text-brand-600 dark:border-cream/15 nums"
                  >
                    {b} units
                  </button>
                ))}
                <span className="ml-auto text-sm text-ink/60 dark:text-cream/60">
                  Subtotal: <b className="text-ink dark:text-cream nums">{inr(lineTotal)}</b>
                </span>
              </div>
            </div>

            {/* actions */}
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={addToQuote} disabled={!product.inStock} className="btn-outline flex-1 disabled:opacity-50">
                <ShoppingCart size={18} /> Add to Quote
              </button>
              <button onClick={buyNow} disabled={!product.inStock} className="btn-primary flex-1 disabled:opacity-50">
                Buy Now <ArrowRight size={18} />
              </button>
              <a href={waLink} target="_blank" rel="noreferrer" className="btn-outline w-full sm:w-auto">
                <MessageCircle size={18} /> Enquire on WhatsApp
              </a>
            </div>

            {/* trust */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {trust.map((t) => (
                <div key={t.title} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-white/5">
                  <t.icon size={20} className="shrink-0 text-brand-600 dark:text-brand-400" />
                  <div>
                    <div className="text-xs font-bold">{t.title}</div>
                    <div className="text-[11px] text-ink/55 dark:text-cream/55">{t.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* related */}
        {product.related?.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-xl font-extrabold md:text-2xl">You may also like</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {product.related.map((p, i) => (
                <Reveal key={p.id} delay={(i % 5) * 60}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        )}

        {/* reviews */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* list */}
          <div>
            <h2 className="font-display text-xl font-extrabold md:text-2xl">
              Customer Reviews
              {reviewsTotal > 0 && <span className="ml-2 text-sm font-normal text-ink/50 dark:text-cream/50">({reviewsTotal})</span>}
            </h2>
            {reviews.length === 0 ? (
              <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-ink/[0.07] py-10 text-center dark:border-cream/10">
                <ThumbsUp size={32} className="text-ink/20 dark:text-cream/20" />
                <p className="text-sm text-ink/50 dark:text-cream/50">No approved reviews yet. Be the first!</p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-ink/[0.07] p-4 dark:border-cream/10">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold">{r.name}</p>
                        <div className="mt-0.5 flex gap-0.5 text-amber-400">
                          {[1,2,3,4,5].map((n) => (
                            <Star key={n} size={13} fill={r.rating >= n ? 'currentColor' : 'none'} />
                          ))}
                        </div>
                      </div>
                      <span className="shrink-0 text-xs text-ink/40 dark:text-cream/40">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink/70 dark:text-cream/70">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* submit form */}
          <div>
            <h2 className="font-display text-xl font-extrabold md:text-2xl">Write a Review</h2>
            {reviewSuccess ? (
              <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50 p-6 text-center dark:border-brand-500/30 dark:bg-brand-500/10">
                <p className="font-semibold text-brand-700 dark:text-brand-400">Thanks for your review!</p>
                <p className="mt-1 text-sm text-brand-600/70 dark:text-brand-400/70">It will appear once approved by our team.</p>
              </div>
            ) : (
              <form onSubmit={submitReview} className="mt-6 space-y-4 rounded-2xl border border-ink/[0.07] p-5 dark:border-cream/10">
                <label className="block text-sm">
                  <span className="font-semibold">Your rating <span className="text-red-500">*</span></span>
                  <div className="mt-2">
                    <StarRating value={reviewForm.rating} onChange={(v) => setReviewForm((f) => ({ ...f, rating: v }))} />
                  </div>
                </label>
                <label className="block text-sm">
                  <span className="font-semibold">Your name <span className="text-red-500">*</span></span>
                  <input
                    className="field mt-1"
                    placeholder="e.g. Amit Sharma"
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                    maxLength={80}
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-semibold">Your review <span className="text-red-500">*</span></span>
                  <textarea
                    className="field mt-1"
                    rows={4}
                    placeholder="Share your experience with this product…"
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm((f) => ({ ...f, text: e.target.value }))}
                    maxLength={1000}
                  />
                  <span className="mt-0.5 block text-right text-xs text-ink/35 dark:text-cream/35">{reviewForm.text.length}/1000</span>
                </label>
                {reviewError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">{reviewError}</p>}
                <button type="submit" disabled={reviewSubmitting} className="btn-primary w-full disabled:opacity-60">
                  <Send size={16} /> {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
                </button>
                <p className="text-center text-xs text-ink/40 dark:text-cream/40">Reviews are moderated before publishing.</p>
              </form>
            )}
          </div>
        </div>
      </div>

      <QuoteBar />
    </div>
  );
}
