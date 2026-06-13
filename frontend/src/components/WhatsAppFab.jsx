import { MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';

export default function WhatsAppFab() {
  const { waLink, settings } = useSettings();
  if (settings.whatsappVisible === false) return null;
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 font-semibold text-white shadow-card transition-transform hover:scale-105"
    >
      <MessageCircle size={20} /> <span className="hidden sm:inline">Order on WhatsApp</span>
    </a>
  );
}
