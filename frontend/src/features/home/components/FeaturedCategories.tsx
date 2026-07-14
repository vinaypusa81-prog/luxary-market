'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const CATEGORIES = [
  {
    id: 'women',
    name: 'Women',
    subtitle: '2,400+ styles',
    href: '/category/women',
    gradient: 'from-rose-500/80 to-pink-700/80',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80',
    span: 'col-span-2 row-span-2',
  },
  {
    id: 'men',
    name: 'Men',
    subtitle: '1,800+ styles',
    href: '/category/men',
    gradient: 'from-slate-700/80 to-gray-900/80',
    image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400&q=80',
    span: 'col-span-1 row-span-1',
  },
  {
    id: 'kids',
    name: 'Kids',
    subtitle: '900+ styles',
    href: '/category/kids',
    gradient: 'from-amber-400/80 to-orange-500/80',
    image: 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=400&q=80',
    span: 'col-span-1 row-span-1',
  },
  {
    id: 'beauty',
    name: 'Beauty',
    subtitle: '500+ brands',
    href: '/category/beauty',
    gradient: 'from-purple-500/80 to-violet-700/80',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80',
    span: 'col-span-1 row-span-1',
  },
  {
    id: 'home',
    name: 'Home & Living',
    subtitle: '3,200+ items',
    href: '/category/home',
    gradient: 'from-teal-500/80 to-cyan-700/80',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    span: 'col-span-1 row-span-1',
  },
];

/**
 * FeaturedCategories — Asymmetric masonry grid showcasing main categories
 * with parallax image hover and gradient overlays.
 */
export function FeaturedCategories() {
  return (
    <section className="py-14 container-main" aria-label="Featured categories">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <h2 className="section-title">Shop by Category</h2>
        <p className="section-subtitle">Explore our curated collections across every fashion need</p>
      </motion.div>

      <div className="grid grid-cols-3 grid-rows-2 gap-4 h-[520px]">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className={cat.span}
          >
            <Link href={cat.href} className="group relative block h-full overflow-hidden rounded-2xl">
              {/* Background image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient} opacity-60 group-hover:opacity-70 transition-opacity`} />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <motion.div
                  initial={{ y: 10, opacity: 0.8 }}
                  whileHover={{ y: 0, opacity: 1 }}
                >
                  <h3 className="font-heading text-white font-bold text-xl">{cat.name}</h3>
                  <p className="text-white/70 text-sm mt-0.5">{cat.subtitle}</p>
                  <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-white
                    border border-white/30 rounded-full px-3 py-1 opacity-0 group-hover:opacity-100
                    translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    Shop Now →
                  </span>
                </motion.div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
