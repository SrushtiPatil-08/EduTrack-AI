import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Analytics', href: '#analytics' },
  { label: 'About', href: '#about' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { user } = useAuth();
  const navigate = useNavigate();

  const scrollToSection = useCallback((href: string) => {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);

      const sections = navLinks.map((l) => l.href.replace('#', ''));
      const offset = window.scrollY + 120;
      let current = 'home';

      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= offset) {
          current = id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    scrollToSection(href);
    setMobileOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-5 px-4">
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300',
          scrolled
            ? 'glass-strong shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
            : 'glass',
        )}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 px-2 mr-1" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-sm text-text hidden sm:block">EduTrack</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const id = link.href.replace('#', '');
            const isActive = activeSection === id;
            return (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  'relative px-3 py-1.5 text-sm transition-colors duration-200 group cursor-pointer',
                  isActive ? 'text-primary-light' : 'text-text-muted hover:text-text',
                )}
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.label}
                <span
                  className={cn(
                    'absolute inset-x-3 bottom-0 h-px bg-primary transition-transform duration-200 origin-left',
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                  )}
                />
              </a>
            );
          })}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-2 ml-2">
          {user ? (
            <Button size="sm" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="hidden sm:inline-flex text-xs h-9 px-3">
                Sign in
              </Button>
              <Button size="sm" onClick={() => navigate('/signup')} className="text-xs h-9 px-4 rounded-full">
                Get started
              </Button>
            </>
          )}
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center text-text-muted"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-20 left-4 right-4 glass-strong rounded-2xl p-4 md:hidden"
          >
            {navLinks.map((link) => {
              const id = link.href.replace('#', '');
              const isActive = activeSection === id;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={cn(
                    'block py-3 px-2 text-sm border-b border-border last:border-0 transition-colors cursor-pointer',
                    isActive ? 'text-primary-light font-semibold' : 'text-text-secondary',
                  )}
                  onClick={(e) => handleNavClick(e, link.href)}
                >
                  {link.label}
                </a>
              );
            })}
            <div className="flex gap-2 mt-3">
              <Button variant="secondary" size="sm" fullWidth onClick={() => { navigate('/login'); setMobileOpen(false); }}>
                Sign in
              </Button>
              <Button size="sm" fullWidth onClick={() => { navigate('/signup'); setMobileOpen(false); }}>
                Get started
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
