'use client';
import { motion } from 'framer-motion';

const ANNOUNCEMENTS = [
  '🎉 Free Shipping on orders above ₹999',
  '⚡ Flash Sale — Up to 70% Off',
  '🏷️ New arrivals added daily',
  '🌟 1 Million+ happy customers',
  '🔒 100% Secure Checkout',
  '📦 Easy 30-day returns',
];

export function AnnouncementTicker() {
  return (
    <div className="bg-accent/5 border-y border-accent/10 py-2.5 overflow-hidden" aria-label="Site announcements">
      <div className="ticker-wrap">
        <div className="ticker-content">
          {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((msg, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
              {msg}
              <span className="mx-4 text-border">|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
