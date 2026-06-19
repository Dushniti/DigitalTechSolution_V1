import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, LogIn, LayoutDashboard, LogOut, UserCircle2 } from 'lucide-react';
import LoginModal from './LoginModal';

const logoSrc =
  'https://lh3.googleusercontent.com/p/AF1QipNgb3rNsf-wTFuX8iOk_T3vsGKySB2VGSUb3o-D=s1360-w1360-h1020-rw';

const navItems = [
  { name: 'Home', href: '#home' },
  { name: 'About Us', href: '#about' },
  { name: 'Services', href: '#services' },
  { name: 'Portfolio', href: '#portfolio' },
  { name: 'Contact', href: '#contact' },
  // { name: 'Pricing',   href: '#/pricing' },
];

/* Slide-in mobile menu variants */
const mobileMenuVariants = {
  hidden: { opacity: 0, x: '100%' },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'tween', duration: 0.32, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: { type: 'tween', duration: 0.24, ease: 'easeIn' },
  },
};

const mobileItemVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.07 + 0.1, duration: 0.3, ease: 'easeOut' },
  }),
};

const Navbar = ({ theme, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('adminToken'));
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Keep login state in sync with localStorage changes
  useEffect(() => {
    const sync = () => setIsLoggedIn(!!localStorage.getItem('adminToken'));
    window.addEventListener('storage', sync);
    // Also poll on focus (same-tab logout/login)
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('_dashRedirected');
    setIsLoggedIn(false);
    setProfileOpen(false);
    window.location.hash = '';
  };

  /* ── Scroll detection ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Lock body scroll when mobile menu is open ── */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogoClick = (event) => {
    event.preventDefault();
    setIsOpen(false);
    if (window.location.pathname !== '/' || window.location.hash) {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (name) => {
    setActive(name);
    setIsOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-[0_2px_16px_rgba(0,0,0,0.08)] dark:bg-slate-950/95 dark:border-slate-800'
            : 'bg-transparent border-b border-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[70px]">

            {/* ── Logo ── */}
            <motion.a
              href="/"
              onClick={handleLogoClick}
              whileHover={{ scale: 1.04 }}
              className="flex items-center gap-2.5 shrink-0"
            >
              <img
                src={logoSrc}
                alt="DigitalTechSolution logo"
                className="w-10 h-10 rounded-lg object-cover bg-white ring-1 ring-white/15"
                referrerPolicy="no-referrer"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/vite.svg'; }}
              />
              <span className={`text-base sm:text-lg font-extrabold tracking-tight transition-colors duration-300 ${scrolled
                  ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent'
                }`}>
                DigitalTechSolution
              </span>
            </motion.a>

            {/* ── Desktop nav ── */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => handleNavClick(item.name)}
                  className={`group relative px-4 py-2 text-sm font-medium transition-colors duration-200 ${scrolled ? 'text-gray-600 hover:text-blue-600' : 'text-gray-300 hover:text-white'
                    }`}
                >
                  {item.name}
                  {/* Animated underline */}
                  <span className="absolute bottom-1 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  {/* Active dot */}
                  {active === item.name && (
                    <motion.span
                      layoutId="nav-active-dot"
                      className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400"
                    />
                  )}
                </a>
              ))}
            </div>

            {/* ── Desktop CTA + theme toggle ── */}
            <div className="hidden md:flex items-center gap-3">
              <motion.a
                href="#contact"
                onClick={() => handleNavClick('Contact')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-md shadow-blue-600/25 transition-all duration-200"
              >
                Get Free Consultation
              </motion.a>

              {/* ── Auth: Profile avatar OR Login button ── */}
              {isLoggedIn ? (
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => setProfileOpen((v) => !v)}
                    className="hidden lg:flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30 hover:scale-110 transition-transform duration-200"
                  >
                    <UserCircle2 size={19} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50"
                      >
                        <a
                          href="#dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <LayoutDashboard size={15} /> Dashboard
                        </a>
                        <div className="border-t border-gray-100 dark:border-slate-800" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut size={15} /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="hidden lg:flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  <LogIn size={16} />
                  Login
                </button>
              )}

              <button
                type="button"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                onClick={toggleTheme}
                className="grid place-items-center w-11 h-11 rounded-full border border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>

            {/* ── Hamburger ── */}
            <button
              onClick={() => setIsOpen((v) => !v)}
              aria-label="Toggle menu"
              className={`md:hidden relative z-50 w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none ${scrolled
                  ? 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={22} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={22} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile menu overlay + drawer ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 bottom-0 z-40 w-72 bg-gray-950 border-l border-white/10 shadow-2xl md:hidden flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 h-16 border-b border-white/8">
                <span className="text-base font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Menu
                </span>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                {navItems.map((item, i) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    custom={i}
                    variants={mobileItemVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => handleNavClick(item.name)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active === item.name
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-white/8'
                      }`}
                  >
                    {item.name}
                    {active === item.name && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                    )}
                  </motion.a>
                ))}
              </nav>

              {/* Drawer CTA */}
              <div className="px-4 pb-8 pt-4 border-t border-white/8">
                <button
                  type="button"
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  onClick={toggleTheme}
                  className="mb-3 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  <span className="sr-only">{theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}</span>
                </button>
                {/* Mobile: Auth button */}
                {isLoggedIn ? (
                  <>
                    <a
                      href="#dashboard"
                      onClick={() => setIsOpen(false)}
                      className="mb-3 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-sm font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all"
                    >
                      <LayoutDashboard size={17} /> Dashboard
                    </a>
                    <button
                      type="button"
                      onClick={() => { setIsOpen(false); handleLogout(); }}
                      className="mb-3 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                    >
                      <LogOut size={17} /> Logout
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setIsLoginModalOpen(true);
                    }}
                    className="mb-3 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    <LogIn size={18} />
                    Login
                  </button>
                )}
                <motion.a
                  href="#contact"
                  custom={navItems.length}
                  variants={mobileItemVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => handleNavClick('Contact')}
                  className="block w-full text-center py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 hover:from-blue-500 hover:to-cyan-400 transition-all duration-200"
                >
                  Get Free Consultation
                </motion.a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
