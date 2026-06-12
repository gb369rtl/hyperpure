import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const fallback = {
  whatsapp: '919999999999',
  contact: { phone: '+91 98765 43210', email: 'hello@samagra.com', address: 'Mumbai, Maharashtra, India' },
  social: { facebook: '', instagram: '', linkedin: '', twitter: '' },
  legal: { privacyUrl: '', termsUrl: '' },
};

const SettingsContext = createContext({ settings: fallback, setSettings: () => {} });

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(fallback);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => {});
  }, []);

  const waLink = (customText) => {
    const num = settings.whatsapp || fallback.whatsapp;
    const text = customText || "Hi Samagra, I'd like to place an order for my business.";
    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings, waLink }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
