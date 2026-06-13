import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ShieldCheck, ArrowRight } from 'lucide-react';
import { useQuote } from '../context/QuoteContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { inr } from '../lib/constants.js';

const MIN_ORDER = 1000;
const PAYMENTS = [
  { id: 'upi', label: 'UPI', note: 'Pay via any UPI app' },
  { id: 'cod', label: 'Cash on Delivery', note: 'Pay when you receive' },
  { id: 'bank', label: 'Bank Transfer / Credit', note: 'For eligible businesses' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, setQty, remove, clear } = useQuote();
  const { isLoggedIn, user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    business: '',
    address: '',
    city: '',
    pincode: '',
  });
  const [payment, setPayment] = useState('upi');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const effectivePrice = (item) => item.discount > 0 ? Math.round(item.price * (1 - item.discount / 100)) : item.price;
  const effectiveTotal = items.reduce((s, i) => s + effectivePrice(i) * i.qty, 0);

  const belowMin = effectiveTotal < MIN_ORDER;

  const applyCode = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true); setCouponError(''); setCoupon(null);
    try {
      const productIds = items.map((i) => i.id);
      const categoryIds = [...new Set(items.map((i) => i.category).filter(Boolean))];
      const res = await api.validateCoupon({ code: couponCode.trim(), cartTotal: effectiveTotal, productIds, categoryIds });
      setCoupon(res);
    } catch (err) {
      setCouponError(err.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setError('');
    if (belowMin) {
      setError(`Minimum order value is ${inr(MIN_ORDER)}. Add ${inr(MIN_ORDER - effectiveTotal)} more.`);
      return;
    }
    if (!/^[\d\s+\-()+]{7,15}$/.test(form.phone.trim())) {
      setError('Enter a valid phone number (7–15 digits).');
      return;
    }
    if (!/^\d{6}$/.test(form.pincode.trim())) {
      setError('Pincode must be exactly 6 digits.');
      return;
    }
    setSubmitting(true);
    try {
      const order = await api.createOrder({
        customer: form,
        items: items.map((i) => ({ id: i.id, qty: i.qty })),
        notes: `Payment: ${PAYMENTS.find((p) => p.id === payment)?.label}. ${notes}`.trim(),
        couponCode: coupon?.coupon?.code,
      });
      clear();
      navigate(`/order/${order.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    navigate('/login?next=/checkout', { replace: true });
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="grid min-h-[70vh] place-items-center pt-16 text-center">
        <div>
          <ShoppingCart className="mx-auto text-gray-300" size={56} />
          <h1 className="mt-4 font-display text-2xl font-extrabold">Your quote is empty</h1>
          <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">Add products to place a bulk order.</p>
          <Link to="/catalogue" className="btn-primary mt-5">Browse Catalogue</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      <div className="bg-ink py-8 text-white">
        <div className="container-x">
          <h1 className="font-display text-2xl font-extrabold md:text-3xl">Checkout</h1>
          <p className="mt-1 text-sm text-white/70">Place your bulk order — next-day delivery in 50+ cities.</p>
        </div>
      </div>

      <form onSubmit={placeOrder} className="container-x grid grid-cols-1 gap-8 py-8 lg:grid-cols-[1fr_380px]">
        {/* details */}
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="font-display text-lg font-bold">Business & Delivery Details</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="font-semibold">Contact name *</span>
                <input required value={form.name} onChange={set('name')} className="field mt-1" />
              </label>
              <label className="text-sm">
                <span className="font-semibold">Phone *</span>
                <input required value={form.phone} onChange={set('phone')} inputMode="tel" className="field mt-1" />
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="font-semibold">Business name</span>
                <input value={form.business} onChange={set('business')} className="field mt-1" />
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="font-semibold">Delivery address *</span>
                <textarea required value={form.address} onChange={set('address')} rows={2} className="field mt-1" />
              </label>
              <label className="text-sm">
                <span className="font-semibold">City *</span>
                <input required value={form.city} onChange={set('city')} className="field mt-1" />
              </label>
              <label className="text-sm">
                <span className="font-semibold">Pincode *</span>
                <input required value={form.pincode} onChange={set('pincode')} inputMode="numeric" className="field mt-1 nums" />
              </label>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-lg font-bold">Payment Method</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {PAYMENTS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPayment(p.id)}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    payment === p.id
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                      : 'border-ink/10 dark:border-cream/15'
                  }`}
                >
                  <div className="text-sm font-bold text-ink dark:text-cream">{p.label}</div>
                  <div className="mt-0.5 text-xs text-ink/55 dark:text-cream/55">{p.note}</div>
                </button>
              ))}
            </div>
            <label className="mt-4 block text-sm">
              <span className="font-semibold">Order notes (optional)</span>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Delivery instructions, GST number, etc." className="field mt-1" />
            </label>
            <div className="mt-3">
              <span className="text-sm font-semibold">Coupon Code</span>
              <div className="mt-1 flex gap-2">
                <input
                  className="field flex-1"
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCoupon(null); setCouponError(''); }}
                  placeholder="ENTER CODE"
                />
                <button type="button" onClick={applyCode} disabled={couponLoading} className="btn-outline shrink-0">
                  {couponLoading ? '…' : 'Apply'}
                </button>
              </div>
              {couponError && <p className="mt-1 text-xs text-red-500">{couponError}</p>}
              {coupon && <p className="mt-1 text-xs text-green-600">&#10003; {coupon.coupon.code} applied &mdash; saving {inr(coupon.discount)}</p>}
            </div>
          </section>
        </div>

        {/* summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold">Order Summary</h2>
            <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
              {items.map((i) => {
                const ep = effectivePrice(i);
                return (
                  <div key={i.id} className="flex gap-3">
                    <img src={i.image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                    <div className="flex-1">
                      <div className="line-clamp-1 text-sm font-semibold">{i.name}</div>
                      <div className="text-xs text-ink/55 dark:text-cream/55">{i.unit} · {inr(ep)}{i.discount > 0 && <span className="ml-1 text-green-600">{i.discount}% off</span>}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-md border border-ink/10 px-1 dark:border-cream/15">
                          <button type="button" onClick={() => setQty(i.id, i.qty - 1)} className="px-1 leading-none"><Minus size={12} /></button>
                          <span className="min-w-4 text-center text-xs font-bold nums">{i.qty}</span>
                          <button type="button" onClick={() => setQty(i.id, i.qty + 1)} className="px-1 leading-none"><Plus size={12} /></button>
                        </div>
                        <button type="button" onClick={() => remove(i.id)} className="text-ink/30 hover:text-red-500 dark:text-cream/30 dark:hover:text-red-400"><Trash2 size={14} /></button>
                        <span className="ml-auto text-sm font-bold nums">{inr(ep * i.qty)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 space-y-2 border-t border-ink/[0.07] pt-4 text-sm dark:border-cream/10">
              <div className="flex justify-between text-ink/60 dark:text-cream/60">
                <span>Subtotal</span><span className="nums">{inr(effectiveTotal)}</span>
              </div>
              <div className="flex justify-between text-ink/60 dark:text-cream/60">
                <span>Delivery</span><span className="font-semibold text-brand-600">FREE</span>
              </div>
              {coupon && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon ({coupon.coupon.code})</span><span className="nums">-{inr(coupon.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-display text-lg font-extrabold">
                <span>Total</span><span className="nums">{inr(coupon ? coupon.finalTotal : effectiveTotal)}</span>
              </div>
            </div>

            {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10" role="alert">{error}</p>}
            {belowMin && !error && (
              <p className="mt-3 text-xs text-amber-600">Minimum order value is {inr(MIN_ORDER)}. Add {inr(MIN_ORDER - effectiveTotal)} more.</p>
            )}

            <button disabled={submitting} className="btn-primary mt-4 w-full disabled:opacity-60">
              {submitting ? 'Placing order…' : <>Place Order <ArrowRight size={18} /></>}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink/45 dark:text-cream/45">
              <ShieldCheck size={14} /> Secure checkout • No advance payment for COD
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
