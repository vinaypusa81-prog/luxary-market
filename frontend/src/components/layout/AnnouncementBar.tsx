'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';

/* ── Announcement Messages ─────────────────────────────────── */
const ANNOUNCEMENTS = [
  { id: 1, text: '🎉 Free Shipping on orders above ₹999 — Use code FREESHIP', link: '/sale', cta: 'Shop Now' },
  { id: 2, text: '⚡ Flash Sale! Up to 60% off on Top Brands — Limited Time', link: '/sale', cta: 'Grab Deal' },
  { id: 3, text: '🛡️ 30-Day Easy Returns | 100% Authentic Products', link: '/about', cta: 'Learn More' },
];

/**
 * AnnouncementBar — Auto-rotating top strip with promotional messages,
 * ticker animation, and dismiss capability.
 */
export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [current, setCurrent] = useState(0);

  // Auto-rotate messages every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const announcement = ANNOUNCEMENTS[current];

  return (
    <div
      className="relative bg-primary text-white text-xs sm:text-sm py-2 px-4 overflow-hidden"
      role="banner"
      aria-label="Announcements"
    >
      <div className="container-main flex items-center justify-center gap-3">
        <Zap size={14} className="text-accent flex-shrink-0" />

        <AnimatePresence mode="wait">
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <span className="text-white/90">{announcement.text}</span>
            <Link
              href={announcement.link}
              className="flex items-center gap-0.5 text-accent font-semibold hover:underline whitespace-nowrap"
            >
              {announcement.cta}
              <ChevronRight size={12} />
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        <div className="hidden sm:flex items-center gap-1 ml-4">
          {ANNOUNCEMENTS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-4 bg-accent' : 'w-1.5 bg-white/30'
              }`}
              aria-label={`Announcement ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/10 transition-colors"
        aria-label="Dismiss announcement"
      >
        <X size={14} className="text-white/70" />
      </button>
    </div>
  );
}
