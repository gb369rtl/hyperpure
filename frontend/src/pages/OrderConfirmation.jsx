import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Package, Truck, Home, Clock, MapPin } from 'lucide-react';
import { api } from '../lib/api.js';
import { inr } from '../lib/constants.js';

const FLOW = ['placed', 'confirmed', 'packed', 'shipped', 'delivered'];
const STEP_ICON = { placed: Clock, confirmed: CheckCircle2, packed: Package, shipped: Truck, delivered: Home };

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    api.getOrder(id).then(setOrder).catch(() => setOrder(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="grid min-h-[60vh] place-items-center pt-16 text-ink/50 dark:text-cream/50">Loading order…</div>;
  if (!order)
    return (
      <div className="grid min-h-[60vh] place-items-center pt-16 text-center">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Order not found</h1>
          <Link to="/track" className="btn-primary mt-4">Track an order</Link>
        </div>
      </div>
    );

  const cancelled = order.status === 'cancelled';
  const activeIdx = FLOW.indexOf(order.status);

  return (
    <div className="pt-16">
      <div className="container-x py-10">
        <div className="card mx-auto max-w-3xl overflow-hidden">
          {/* header */}
          <div className={`p-8 text-center text-white ${cancelled ? 'bg-red-600' : 'bg-brand-600'}`}>
            {cancelled
              ? <Package className="mx-auto" size={56} />
              : <CheckCircle2 className="mx-auto" size={56} />}
            <h1 className="mt-3 font-display text-2xl font-extrabold">
              {cancelled ? 'Order Cancelled' : 'Order Placed Successfully!'}
            </h1>
            <p className="mt-1 text-white/85">
              Order ID: <b className="nums">{order.id}</b>
            </p>
            <p className="mt-1 text-sm text-white/70">
              {cancelled ? 'This order has been cancelled.' : `A confirmation will be sent to ${order.customer.phone}.`}
            </p>
          </div>

          <div className="p-6 md:p-8">
            {/* status timeline */}
            {cancelled ? (
              <div className="rounded-xl bg-red-50 p-4 text-center text-sm font-semibold text-red-600 dark:bg-red-500/10">
                This order was cancelled.
              </div>
            ) : (
              <div className="flex items-center justify-between">
                {FLOW.map((s, i) => {
                  const I = STEP_ICON[s];
                  const done = i <= activeIdx;
                  return (
                    <div key={s} className="flex flex-1 flex-col items-center">
                      <div className="flex w-full items-center">
                        <span className={`h-1 flex-1 ${i === 0 ? 'opacity-0' : done ? 'bg-brand-500' : 'bg-ink/10 dark:bg-cream/15'}`} />
                        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${done ? 'bg-brand-600 text-white' : 'bg-ink/5 text-ink/40 dark:bg-cream/10 dark:text-cream/40'}`}>
                          <I size={16} />
                        </span>
                        <span className={`h-1 flex-1 ${i === FLOW.length - 1 ? 'opacity-0' : i < activeIdx ? 'bg-brand-500' : 'bg-ink/10 dark:bg-cream/15'}`} />
                      </div>
                      <span className={`mt-2 text-[11px] font-semibold capitalize ${done ? 'text-brand-700 dark:text-brand-400' : 'text-ink/40 dark:text-cream/40'}`}>{s}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* items */}
            <div className="mt-8 space-y-3">
              {order.items.map((i) => (
                <div key={i.id} className="flex items-center gap-3">
                  <img src={i.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{i.name}</div>
                    <div className="text-xs text-ink/55 dark:text-cream/55 nums">{i.unit} · Qty {i.qty}</div>
                  </div>
                  <div className="text-sm font-bold nums">{inr(i.lineTotal)}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between border-t border-ink/[0.07] pt-4 font-display text-lg font-extrabold dark:border-cream/10">
              <span>Total ({order.itemCount} items)</span>
              <span className="nums">{inr(order.total)}</span>
            </div>

            {/* delivery */}
            <div className="mt-6 rounded-xl bg-ink/[0.04] p-4 dark:bg-cream/5">
              <div className="flex items-start gap-2 text-sm">
                <MapPin size={16} className="mt-0.5 shrink-0 text-brand-600" />
                <div>
                  <div className="font-semibold">{order.customer.name}{order.customer.business && ` · ${order.customer.business}`}</div>
                  <div className="text-ink/60 dark:text-cream/60">
                    {order.customer.address}, {order.customer.city} {order.customer.pincode}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/track" className="btn-outline flex-1">Track Order</Link>
              <Link to="/catalogue" className="btn-primary flex-1">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
