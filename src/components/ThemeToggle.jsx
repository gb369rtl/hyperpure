import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className={`grid h-10 w-10 place-items-center rounded-lg border border-transparent transition-colors hover:border-ink/10 hover:bg-ink/5 dark:hover:border-cream/10 dark:hover:bg-cream/10 ${className}`}
    >
      {dark
        ? <Sun size={19} className="text-lime-400" />
        : <Moon size={19} className="text-ink/70" />}
    </button>
  );
}
