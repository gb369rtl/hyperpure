import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Inbox, Layers, LayoutTemplate, LogOut, ExternalLink } from 'lucide-react';
import { clearToken } from '../../lib/api.js';
import Logo from '../../components/Logo.jsx';
import ThemeToggle from '../../components/ThemeToggle.jsx';

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/leads', label: 'Leads', icon: Inbox },
  { to: '/admin/categories', label: 'Categories', icon: Layers },
  { to: '/admin/content', label: 'Content', icon: LayoutTemplate },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const logout = () => {
    clearToken();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-ink">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-gray-100 bg-white dark:border-white/10 dark:bg-ink-800 md:flex">
        <Link to="/" className="flex items-center border-b border-gray-100 px-6 py-5 dark:border-white/10" aria-label="Hyperpure home">
          <Logo markSize={30} textClass="text-xl text-ink dark:text-cream" />
        </Link>
        <nav className="flex-1 space-y-1 p-4">
          {nav.map(({ to, label, icon: I, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5'
                }`
              }
            >
              <I size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-gray-100 p-4 dark:border-white/10">
          <div className="mb-1 flex items-center justify-between px-3">
            <span className="text-xs text-gray-400">Theme</span>
            <ThemeToggle />
          </div>
          <a href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">
            <ExternalLink size={18} /> View Site
          </a>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-800 md:hidden">
          <span className="font-display font-extrabold">Hyperpure Admin</span>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button onClick={logout} className="text-red-500"><LogOut size={20} /></button>
          </div>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-gray-100 bg-white px-2 py-2 dark:border-white/10 dark:bg-ink-800 no-scrollbar md:hidden">
          {nav.map(({ to, label, icon: I, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${
                  isActive ? 'bg-brand-600 text-white' : 'text-gray-600 dark:text-gray-300'
                }`
              }
            >
              <I size={16} /> {label}
            </NavLink>
          ))}
        </nav>

        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
