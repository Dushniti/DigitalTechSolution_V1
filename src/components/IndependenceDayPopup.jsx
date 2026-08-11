import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const IndependenceDayPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Stop showing the popup after 15th August 2026, 11:59:59 PM (IST)
    const cutoffDate = new Date('2026-08-15T23:59:59+05:30');
    if (new Date() > cutoffDate) {
      return;
    }

    // Only show once per session so we don't annoy the user on every page load
    const hasSeenPopup = sessionStorage.getItem('independence_day_popup_seen');

    if (!hasSeenPopup) {
      // Small delay for better UX (let the site load first)
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('independence_day_popup_seen', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800"
          >
            {/* Decorative Top Background */}
            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-orange-500 via-white to-green-500 opacity-20 dark:opacity-30" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white to-green-500" />

            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/60 hover:bg-gray-100 dark:bg-slate-800/60 dark:hover:bg-slate-700 rounded-full backdrop-blur-md transition-colors text-gray-500 dark:text-gray-400"
            >
              <X size={20} />
            </button>

            <div className="relative p-8 pt-12 text-center">
              {/* Spinning Chakra Inspired Ring / Flag Icon */}
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-green-100 dark:from-orange-900/30 dark:to-green-900/30 rounded-full flex items-center justify-center p-1 shadow-inner relative">
                <div className="absolute inset-0 rounded-full border border-dashed border-blue-500/50 animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-0 rounded-full border-2 border-orange-500 border-t-transparent border-l-transparent border-r-green-500 animate-[spin_4s_linear_infinite]" />
                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center flex-col shadow-sm text-4xl select-none">
                  🇮🇳
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                Happy <br className="sm:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-blue-600 to-green-600">Independence</span> Day!
              </h2>

              <p className="text-gray-600 dark:text-gray-300 mb-8 font-medium leading-relaxed">
                Wishing you a joyous Independence Day from the team at <strong className="text-gray-900 dark:text-white">Digital Tech Solution</strong>. Let's continue to build a brighter, digital future together!
              </p>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-orange-500 via-blue-500 to-green-500 hover:from-orange-600 hover:via-blue-600 hover:to-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 tracking-wide"
              >
                Jai Hind
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default IndependenceDayPopup;
