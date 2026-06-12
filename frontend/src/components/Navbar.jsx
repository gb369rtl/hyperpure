import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, MessageCircle, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useQuote } from '../context/QuoteContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import Logo from './Logo.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const links = [
  { label: 'Catalogue', to: '/catalogue' },
  { label: 'Solutions', to: '/#solutions' },
  { label: 'Why Us', to: '/#why' },
  { label: 'Track Order', to: '/track' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { count } = useQuote();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const { waLink } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/catalogue?search=${encodeURIComponent(q)}`);
    setOpen(false);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-ink/10 bg-cream/85 backdrop-blur-md dark:border-cream/10 dark:bg-ink/85'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between gap-4 md:h-20">
        <Link to="/" className="flex items-center" aria-label="Samagra home">
          <Logo markSize={36} textClass="text-ink dark:text-cream" />
        </Link>

        <ul className="hidden items-center gap-8 text-sm font-semibold lg:flex">
          {links.map((l) => (
            <li key={l.label}>
              <Link to={l.to} className="text-ink/70 transition-colors hover:text-ink dark:text-cream/70 dark:hover:text-cream">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <form onSubmit={submitSearch} className="hidden md:block">
            <div className="flex items-center gap-2 rounded-full border border-ink/10 bg-white/60 px-4 py-2 dark:border-cream/10 dark:bg-cream/5">
              <Search size={15} className="text-ink/50 dark:text-cream/50" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search"
                className="w-20 bg-transparent text-sm text-ink outline-none placeholder:text-ink/40 dark:text-cream dark:placeholder:text-cream/40 xl:w-32"
              />
            </div>
          </form>

          <ThemeToggle />

          <Link to="/checkout" className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5 dark:hover:bg-cream/10" aria-label="Cart">
            <ShoppingCart size={19} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-lime-400 px-1 text-[11px] font-bold text-ink nums">
                {count}
              </span>
            )}
          </Link>

          {isLoggedIn ? (
            <div className="relative hidden sm:block" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-ink/15 px-3 py-2 text-sm font-bold text-ink hover:border-ink dark:border-cream/20 dark:text-cream dark:hover:border-cream"
              >
                <User size={16} />
                <span className="max-w-[100px] truncate">{user?.name || user?.username}</span>
                <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-ink/10 bg-white py-2 shadow-card dark:border-cream/15 dark:bg-ink-800">
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-ink/5 dark:text-cream dark:hover:bg-cream/5">
                      <LayoutDashboard size={16} /> Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hidden rounded-full border border-ink/15 px-4 py-2 text-sm font-bold text-ink hover:border-ink dark:border-cream/20 dark:text-cream dark:hover:border-cream sm:inline-flex">
              Login
            </Link>
          )}

          <a href={waLink()} target="_blank" rel="noreferrer" className="hidden rounded-full bg-ink px-4 py-2 text-sm font-bold text-cream hover:bg-ink-700 dark:bg-lime-400 dark:text-ink dark:hover:bg-lime-300 md:inline-flex md:items-center md:gap-2">
            <MessageCircle size={15} /> WhatsApp
          </a>

          <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5 dark:hover:bg-cream/10 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-ink/10 bg-cream dark:border-cream/10 dark:bg-ink-800 lg:hidden">
          <div className="container-x flex flex-col gap-1 py-3">
            <form onSubmit={submitSearch} className="mb-2 flex items-center gap-2 rounded-full bg-white px-4 py-2.5 dark:bg-cream/10">
              <Search size={16} className="text-ink/50 dark:text-cream/50" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/40 dark:text-cream dark:placeholder:text-cream/40" />
            </form>
            {links.map((l) => (
              <Link key={l.label} to={l.to} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 text-sm font-semibold text-ink hover:bg-ink/5 dark:text-cream dark:hover:bg-cream/5">
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              {isLoggedIn ? (
                <>
                  {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="btn-outline flex-1">Admin</Link>}
                  <button onClick={() => { logout(); setOpen(false); navigate('/'); }} className="btn-outline flex-1 text-red-500">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-outline flex-1">Login</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="btn-outline flex-1">Register</Link>
                </>
              )}
              <a href={waLink()} target="_blank" rel="noreferrer" className="btn-primary flex-1">WhatsApp</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
