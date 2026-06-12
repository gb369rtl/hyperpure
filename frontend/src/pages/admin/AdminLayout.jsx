import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Inbox, Layers,
  LayoutTemplate, LogOut, ExternalLink, Star, Users, Shield, Settings,
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Logo from '../../components/Logo.jsx';
import ThemeToggle from '../../components/ThemeToggle.jsx';

const ALL_NAV = [
  { to: '/admin',            label: 'Dashboard', icon: LayoutDashboard, end: true,  perm: 'dashboard:view' },
  { to: '/admin/products',   label: 'Products',  icon: Package,                     perm: 'products:read' },
  { to: '/admin/orders',     label: 'Orders',    icon: ShoppingBag,                 perm: 'orders:read' },
  { to: '/admin/leads',      label: 'Leads',     icon: Inbox,                       perm: 'leads:read' },
  { to: '/admin/categories', label: 'Categories',icon: Layers,                      perm: 'categories:read' },
  { to: '/admin/content',    label: 'Content',   icon: LayoutTemplate,              perm: 'content:read' },
  { to: '/admin/reviews',    label: 'Reviews',   icon: Star,                        perm: 'reviews:read' },
  { to: '/admin/users',      label: 'Users',     icon: Users,                       perm: 'users:read' },
  { to: '/admin/roles',      label: 'Roles',     icon: Shield,                      perm: 'roles:read' },
  { to: '/admin/settings',   label: 'Settings',  icon: Settings,                    perm: 'settings:manage' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, can, logout, refreshUser } = useAuth();

  useEffect(() => {
    api.getMe()
      .then((me) => {
        refreshUser(me);
        if (!(me.permissions || []).length) { logout(); navigate('/'); }
      })
      .catch(() => { logout(); navigate('/login'); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const nav = ALL_NAV.filter((n) => can(n.perm));

  const handleLogout = () => { logout(); navigate('/login'); };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
      isActive ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${
      isActive ? 'bg-brand-600 text-white' : 'text-gray-600 dark:text-gray-300'
    }`;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-ink">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-gray-100 bg-white dark:border-white/10 dark:bg-ink-800 md:flex">
        <Link to="/" className="flex items-center border-b border-gray-100 px-6 py-5 dark:border-white/10" aria-label="Samagra home">
          <Logo markSize={30} textClass="text-xl text-ink dark:text-cream" />
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {nav.map(({ to, label, icon: I, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <I size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-100 p-4 dark:border-white/10">
          {/* Current user chip */}
          {user && (
            <div className="mb-3 rounded-xl border border-ink/[0.07] px-3 py-2.5 dark:border-cream/10">
              <p className="truncate text-sm font-bold text-ink dark:text-cream">{user.username}</p>
              <p className="truncate text-xs text-ink/50 dark:text-cream/50">{user.roleName || user.roleId}</p>
            </div>
          )}
          <div className="mb-1 flex items-center justify-between px-3">
            <span className="text-xs text-gray-400">Theme</span>
            <ThemeToggle />
          </div>
          <a href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">
            <ExternalLink size={18} /> View Site
          </a>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-800 md:hidden">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold">Samagra Admin</span>
            {user && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">{user.roleName}</span>}
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button onClick={handleLogout} className="text-red-500"><LogOut size={20} /></button>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-gray-100 bg-white px-2 py-2 dark:border-white/10 dark:bg-ink-800 no-scrollbar md:hidden">
          {nav.map(({ to, label, icon: I, end }) => (
            <NavLink key={to} to={to} end={end} className={mobileLinkClass}>
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
