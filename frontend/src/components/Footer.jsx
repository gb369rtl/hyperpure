import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import Logo from './Logo.jsx';
import { useSettings } from '../context/SettingsContext.jsx';

const cols = [
  {
    title: 'Categories',
    links: [
      ['Fresh Produce', '/catalogue?category=fresh-produce'],
      ['Dairy & Eggs', '/catalogue?category=dairy-eggs'],
      ['Staples & Grains', '/catalogue?category=staples-grains'],
      ['Beverages', '/catalogue?category=beverages'],
      ['Packaging', '/catalogue?category=packaging'],
    ],
  },
  {
    title: 'Solutions',
    links: [
      ['Restaurants', '/#solutions'],
      ['Cafes', '/#solutions'],
      ['Hotels', '/#solutions'],
      ['Cloud Kitchens', '/#solutions'],
      ['Caterers', '/#solutions'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About Us', '/#footer'],
      ['Why Samagra', '/#why'],
      ['Success Stories', '/#why'],
      ['Blog', '/#faq'],
      ['Contact Us', '/#footer'],
    ],
  },
];

export default function Footer() {
  const { settings } = useSettings();
  const social = settings.social || {};
  const socialVisible = settings.socialVisible || {};
  const legal = settings.legal || {};
  const contact = settings.contact || {};
  const SOCIALS = [
    { Icon: Facebook, key: 'facebook' },
    { Icon: Instagram, key: 'instagram' },
    { Icon: Linkedin, key: 'linkedin' },
    { Icon: Twitter, key: 'twitter' },
  ];
  return (
    <footer id="footer" className="bg-ink text-white/80">
      <div className="container-x grid grid-cols-2 gap-8 py-14 md:grid-cols-3 lg:grid-cols-5">
        <div className="col-span-2 lg:col-span-2">
          <Link to="/" className="flex items-center" aria-label="Samagra home">
            <Logo markSize={36} textClass="text-white" />
          </Link>
          <p className="mt-4 max-w-xs text-sm text-white/60">
            Simplifying procurement for businesses with quality, reliability and transparency.
          </p>
          <div className="mt-5 flex gap-2">
            {SOCIALS.map(({ Icon, key }) => {
              const visible = social[key] && (socialVisible[key] ?? true);
              return visible ? (
                <a
                  key={key}
                  href={social[key]}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 hover:bg-lime-400 hover:text-ink"
                >
                  <Icon size={16} />
                </a>
              ) : null;
            })}
          </div>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="font-display text-sm font-bold text-white">{c.title}</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {c.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-white/60 transition-colors hover:text-lime-400">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="font-display text-sm font-bold text-white">Contact Us</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/60">
            <li className="flex items-center gap-2">
              <Phone size={14} className="text-lime-400" /> {contact.phone}
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} className="text-lime-400" /> {contact.email}
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={14} className="text-lime-400" /> {contact.address}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Samagra. All rights reserved.</p>
          <div className="flex gap-5">
            {legal.privacyUrl
              ? <a href={legal.privacyUrl} target="_blank" rel="noreferrer" className="hover:text-white">Privacy Policy</a>
              : <span className="opacity-50">Privacy Policy</span>}
            {legal.termsUrl
              ? <a href={legal.termsUrl} target="_blank" rel="noreferrer" className="hover:text-white">Terms & Conditions</a>
              : <span className="opacity-50">Terms & Conditions</span>}
          </div>
        </div>
      </div>
    </footer>
  );
}
