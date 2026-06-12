import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-ink/10 bg-cream/85 backdrop-blur-md dark:border-cream/10 dark:bg-ink/85'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="container-x flex h-16 items-center md:h-20">
        <Link to="/" className="flex items-center" aria-label="Samagra home">
          <Logo markSize={36} textClass="text-ink dark:text-cream" />
        </Link>
      </nav>
    </header>
  );
}
