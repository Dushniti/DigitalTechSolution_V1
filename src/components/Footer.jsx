import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Mail, Phone, MapPin, ArrowRight, ExternalLink } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const logoSrc = 'https://lh3.googleusercontent.com/p/AF1QipNgb3rNsf-wTFuX8iOk_T3vsGKySB2VGSUb3o-D=s1360-w1360-h1020-rw';

  const [currentPath, setCurrentPath] = useState(
    () => window.location.pathname.replace(/^\//, '').replace(/\/$/, '') || window.location.hash.replace(/^#\/?/, '').replace(/\/$/, '')
  );

  useEffect(() => {
    const update = () =>
      setCurrentPath(
        window.location.pathname.replace(/^\//, '').replace(/\/$/, '') ||
        window.location.hash.replace(/^#\/?/, '').replace(/\/$/, '')
      );
    window.addEventListener('hashchange', update);
    window.addEventListener('popstate', update);
    return () => {
      window.removeEventListener('hashchange', update);
      window.removeEventListener('popstate', update);
    };
  }, []);

  const socialLinks = [
    { icon: <Facebook size={20} />, href: 'https://www.facebook.com/profile.php?id=100071101447374', label: 'Facebook', target: '_blank' },
    { icon: <Instagram size={20} />, href: 'https://www.instagram.com/dts838485?igsh=MXkwN21oMXFybjgycg==', label: 'Instagram', target: '_blank' },
  ];

  const quickLinks = [
    { name: 'Home',            href: '#home',        route: '' },
    { name: 'About Us',        href: '#about',       route: '' },
    { name: 'Services',        href: '#services',    route: '' },
    { name: 'Portfolio',       href: '#portfolio',   route: '' },
    { name: 'Contact',         href: '#contact',     route: '' },
    { name: 'Career',          href: '#/career',     route: 'career' },
    // { name: 'Our Team',        href: '/our-team',    route: 'our-team' },
  ];

  const services = [
    'Static Website Development',
    'Dynamic Website Development',
    'SEO Optimization',
    'Mobile App Development',
    'Digital Marketing',
    'UI/UX Design',
  ];

  const navigateToPath = (path) => (event) => {
    event.preventDefault();

    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('routechange'));
    }
  };

  const navigateToSection = (sectionId) => (event) => {
    event.preventDefault();

    const scrollToSection = () => {
      const targetElement = document.getElementById(sectionId);

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    };

    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('routechange'));
      setTimeout(scrollToSection, 0);
      return;
    }

    scrollToSection();
  };

  return (
    <footer className="relative bg-gray-950 text-white overflow-hidden">
      {/* Top gradient border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-64 bg-blue-600 rounded-full opacity-[0.04] blur-3xl pointer-events-none" />

      <div className="container-custom px-4 sm:px-6 lg:px-8 mx-auto relative z-10">

        {/* ── Main grid ── */}
        <div className="py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Brand column — centered on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="lg:col-span-1 flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logoSrc}
                alt="DigitalTechSolution logo"
                className="w-11 h-11 rounded-xl object-cover bg-white ring-2 ring-white/10"
                referrerPolicy="no-referrer"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/vite.svg'; }}
              />
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
                DigitalTechSolution
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-5 max-w-xs">
              We build fast, scalable, and ROI-focused websites, apps &amp; software
              that help businesses across India grow and compete smarter.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target={social.target}
                  rel={social.target === '_blank' ? 'noopener noreferrer' : undefined}
                  whileHover={{ scale: 1.12, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                  className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-all duration-300"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links + Services — 2-col on mobile, unwrapped into parent grid on desktop */}
          <div className="grid grid-cols-2 gap-6 lg:contents">
            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Quick Links</h4>
              <ul className="space-y-2">
                {quickLinks.map((link, index) => {
                  const isActive = link.route ? currentPath === link.route : false;
                  return (
                    <li key={index}>
                      <motion.a
                        href={link.href}
                        onClick={link.route === 'our-team' ? (e) => {
                          e.preventDefault();
                          window.history.pushState({}, '', '/our-team');
                          window.dispatchEvent(new PopStateEvent('popstate'));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } : undefined}
                        whileHover={{ x: 4 }}
                        className={`text-sm flex items-center gap-1.5 transition-colors duration-200 ${
                          isActive ? 'text-blue-400 font-semibold' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <ArrowRight size={12} className="opacity-50 shrink-0" />
                        {link.name}
                      </motion.a>
                    </li>
                  );
                })}
              </ul>
            </motion.div>

            {/* Services */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Services</h4>
              <ul className="space-y-2">
                {services.map((service, index) => (
                  <li key={index}>
                    <motion.a
                      href="#services"
                      whileHover={{ x: 4 }}
                      className="text-sm text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors duration-200"
                    >
                      <ArrowRight size={12} className="opacity-50 shrink-0" />
                      {service}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Contact Us</h4>
            <div className="space-y-3">
              <a href="mailto:dushyant.kumar1719@gmail.com" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-600/40 transition-colors">
                  <Mail size={14} className="text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">Email</p>
                  <p className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">dushyant.kumar1719@gmail.com</p>
                </div>
              </a>
              <a href="tel:+917983614392" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-600/40 transition-colors">
                  <Phone size={14} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                  <p className="text-sm text-gray-300 group-hover:text-white transition-colors">+91 7983614392</p>
                </div>
              </a>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Address</p>
                  <p className="text-sm text-gray-300">Ram Ghat Road, Aligarh (202001)</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Newsletter ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="border-t border-white/5 py-10"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h4 className="text-white font-bold text-lg mb-1">Stay Updated</h4>
              <p className="text-gray-400 text-sm">Subscribe for the latest tips, trends, and project updates.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:min-w-[380px]">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 text-sm transition-all outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-semibold shadow-md shadow-blue-900/40 transition-all duration-300 whitespace-nowrap"
              >
                Subscribe
                <ArrowRight size={15} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Bottom bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="border-t border-white/5 py-6 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-gray-500 text-sm text-center md:text-left">
            © {currentYear} <span className="text-gray-400 font-medium">DigitalTechSolution</span>. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-gray-500">
            <a href="#/privacy-policy" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
            <a href="#/terms-of-service" className="hover:text-white transition-colors duration-200">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Cookie Policy</a>
          </div>
        </motion.div>

      </div>
    </footer>
  );
};

export default Footer; 