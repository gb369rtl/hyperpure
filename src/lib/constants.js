export const WHATSAPP_NUMBER = '919999999999';
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi Hyperpure, I'd like to place an order for my business.",
)}`;

export const inr = (n) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export const BRAND = {
  name: 'Hyperpure',
  email: 'hello@hyperpure.com',
  phone: '+91 98765 43210',
  address: 'Mumbai, Maharashtra, India',
};
