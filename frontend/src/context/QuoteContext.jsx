import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const QuoteContext = createContext(null);
const KEY = 'hp_quote';

export function QuoteProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = (product, qty = 1) =>
    setItems((prev) => {
      const found = prev.find((i) => i.id === product.id);
      if (found) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { ...product, qty }];
    });

  const setQty = (id, qty) =>
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: Math.max(0, qty) } : i))
        .filter((i) => i.qty > 0),
    );

  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);

  const value = useMemo(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const total = items.reduce((n, i) => n + i.qty * i.price, 0);
    return { items, add, setQty, remove, clear, count, total };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export const useQuote = () => {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error('useQuote must be used within QuoteProvider');
  return ctx;
};
