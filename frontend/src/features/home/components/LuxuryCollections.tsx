'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight } from 'lucide-react';

const COLLECTIONS = [
  {
    id: 'royal',
    name: 'Royal Couture',
    subtitle: 'Handcrafted luxury for the discerning few',
    price: 'From ₹24,999',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
    href: '/collections/royal-couture',
    orientation: 'left',
  },
  {
    id: 'minimal',
    name: 'Minimal Luxe',
    subtitle: 'Understated elegance for the modern connoisseur',
    price: 'From ₹9,999',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    href: '/collections/minimal-luxe',
    orientation: 'right',
  },
  {
    id: 'artisan',
    name: 'Artisan Craft',
    subtitle: 'Heritage techniques meet contemporary design',
    price: 'From ₹14,999',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80',
    href: '/collections/artisan-craft',
    orientation: 'left',
  },
];

/**
 * LuxuryCollections — Editorial-style full-width collection showcases
 * with alternating image/text layout and premium typography.
 */
export function LuxuryCollections() {
  return (
    <section className="py-16" aria-label="Luxury collections">
      <div className="container-main">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Crown size={18} className="text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Curated Exclusives</span>
          </div>
          <h2 className="section-title text-3xl sm:text-4xl">Luxury Collections</h2>
          <p className="section-subtitle max-w-lg mx-auto mt-3">
            Discover our most exclusive, handpicked collections from the world&apos;s finest designers.
          </p>
        </motion.div>

        {/* Collection cards */}
        <div className="space-y-6">
          {COLLECTIONS.map((collection, i) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, x: collection.orientation === 'left' ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <Link href={collection.href} className="group relative flex overflow-hidden rounded-3xl h-64 sm:h-80">
                {/* Background image */}
                <div className="absolute inset-0">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                </div>

                {/* Content */}
                <div className={`relative z-10 flex flex-col justify-center p-8 sm:p-12 max-w-lg
                  ${collection.orientation === 'right' ? 'ml-auto text-right items-end' : ''}`}>
                  <span className="badge bg-white/10 text-white border border-white/20 backdrop-blur-sm mb-4 self-start">
                    {collection.price}
                  </span>
                  <h3 className="font-heading text-3xl sm:text-4xl font-black text-white leading-tight">
                    {collection.name}
                  </h3>
                  <p className="text-white/60 mt-3 text-sm sm:text-base leading-relaxed">
                    {collection.subtitle}
                  </p>
                  <div className="flex items-center gap-2 mt-6 text-white font-semibold text-sm
                    opacity-70 group-hover:opacity-100 transition-opacity">
                    Explore Collection
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
