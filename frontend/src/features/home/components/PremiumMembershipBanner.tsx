'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight } from 'lucide-react';

const PREMIUM_BENEFITS = [
  { icon: '🚀', title: 'Priority Delivery', desc: 'Same-day & next-day delivery on all orders' },
  { icon: '💎', title: 'Exclusive Drops', desc: 'First access to limited collections & launches' },
  { icon: '🎁', title: '500 Bonus Points', desc: 'Monthly reward points on every purchase' },
  { icon: '🔄', title: 'Free Returns', desc: 'Hassle-free returns with free pickup service' },
];

/**
 * PremiumMembershipBanner — Full-bleed gradient promotional banner
 * for LuxeMarket's premium membership program.
 */
export function PremiumMembershipBanner() {
  return (
    <section className="py-14 bg-gradient-to-r from-primary via-[#1a0a2e] to-primary" aria-label="Premium membership">
      <div className="container-main">
        <div className="rounded-3xl overflow-hidden relative">
          {/* Glowing orbs */}
          <div className="absolute top-0 right-1/4 h-64 w-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 p-8 sm:p-12">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {/* Left side */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Crown size={20} className="text-amber-400" />
                  <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">LuxeMarket Premium</span>
                </div>
                <h2 className="font-heading text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
                  Unlock Your{' '}
                  <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    Luxury Benefits
                  </span>
                </h2>
                <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-md">
                  Join over 200,000 premium members and enjoy exclusive perks, priority access,
                  and personalised fashion curation.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/membership" className="btn btn-gradient btn-lg group">
                    Get Premium — ₹499/mo
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link href="/membership#benefits" className="btn btn-lg border border-white/20 text-white hover:bg-white/10">
                    Learn More
                  </Link>
                </div>
              </motion.div>

              {/* Right side — Benefits grid */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-2 gap-4"
              >
                {PREMIUM_BENEFITS.map((benefit, i) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="card-glass p-5 rounded-2xl"
                  >
                    <span className="text-2xl mb-3 block">{benefit.icon}</span>
                    <h4 className="text-white font-semibold text-sm mb-1">{benefit.title}</h4>
                    <p className="text-white/50 text-xs leading-snug">{benefit.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
