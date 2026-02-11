import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import AuthModal from './AuthModal';

const navLinks = [
  { label: 'Home', href: '#hero' },
  { label: 'Markets', href: '#markets' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Company', href: '#company' },
  { label: 'Support', href: '#support' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [scrolled, setScrolled] = useState(false);
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' });

  useEffect(() => {
    const sectionIds = navLinks.map((l) => l.href.slice(1));

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const scrollPos = window.scrollY + 100;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = useCallback((e, href) => {
    e.preventDefault();
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (el) {
      const offset = 64;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setMobileOpen(false);
  }, []);

  return (
    <>
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 left-0 w-full z-50 backdrop-blur-xl border-b transition-colors duration-300 ${
        scrolled ? 'bg-dark/90 border-border-subtle' : 'bg-transparent border-transparent'
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a
            href="#hero"
            onClick={(e) => scrollTo(e, '#hero')}
            className="flex items-center gap-2 shrink-0"
          >
            <img src="/logo_edited.png" alt="VEDIEX" className="h-14 w-auto" />
          </a>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.slice(1);
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => scrollTo(e, link.href)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-white/10'
                      : 'text-gray-text hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <button onClick={() => setAuthModal({ open: true, mode: 'login' })} className="px-4 py-2 text-sm font-medium text-white hover:text-primary-light transition-colors">
              Log In
            </button>
            <button onClick={() => setAuthModal({ open: true, mode: 'signup' })} className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-light rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all duration-300">
              Sign Up
            </button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-gray-text hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-dark-card/95 backdrop-blur-xl border-t border-border-subtle overflow-hidden"
          >
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-1">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.slice(1);
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => scrollTo(e, link.href)}
                    className={`block px-4 py-3 text-sm rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'text-white bg-white/10 font-medium'
                        : 'text-gray-text hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
              <div className="pt-4 flex flex-col gap-2 border-t border-border-subtle mt-2">
                <button onClick={() => { setMobileOpen(false); setAuthModal({ open: true, mode: 'login' }); }} className="px-4 py-3 text-sm text-center text-white hover:bg-white/5 rounded-lg transition-colors">
                  Log In
                </button>
                <button onClick={() => { setMobileOpen(false); setAuthModal({ open: true, mode: 'signup' }); }} className="px-4 py-3 text-sm text-center font-semibold text-white bg-gradient-to-r from-primary to-primary-light rounded-lg">
                  Sign Up
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>

      <AuthModal
        isOpen={authModal.open}
        onClose={() => setAuthModal({ ...authModal, open: false })}
        initialMode={authModal.mode}
      />
    </>
  );
}
