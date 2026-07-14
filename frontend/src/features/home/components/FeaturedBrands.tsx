'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BRANDS = [
  { id: 1, name: 'Nike', logo: '🏃', href: '/brand/nike', color: '#f5f5f5' },
  { id: 2, name: 'Puma', logo: '🐆', href: '/brand/puma', color: '#f5f5f5' },
  { id: 3, name: 'Levi\'s', logo: '👖', href: '/brand/levis', color: '#f5f5f5' },
  { id: 4, name: 'Zara', logo: '👗', href: '/brand/zara', color: '#f5f5f5' },
  { id: 5, name: 'H&M', logo: '🛍️', href: '/brand/hm', color: '#f5f5f5' },
  { id: 6, name: 'Adidas', logo: '⚽', href: '/brand/adidas', color: '#f5f5f5' },
  { id: 7, name: 'Mango', logo: '🥭', href: '/brand/mango', color: '#f5f5f5' },
  { id: 8, name: 'Reebok', logo: '👟', href: '/brand/reebok', color: '#f5f5f5' },
  { id: 9, name: 'Tommy', logo: '🎖️', href: '/brand/tommy', color: '#f5f5f5' },
  { id: 10, name: 'Calvin Klein', logo: '💎', href: '/brand/ck', color: '#f5f5f5' },
];

export function FeaturedBrands() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 300 : -300, behavior: 'smooth' });
  };

  return (
    <section className="py-14 bg-muted/30" aria-label="Featured brands">
      <div className="container-main">
        <div className="flex items-center justify-between mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="section-title">Top Brands</h2>
            <p className="section-subtitle">500+ premium brands, all in one place</p>
          </motion.div>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} className="h-10 w-10 rounded-xl border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all" aria-label="Scroll brands left">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scroll('right')} className="h-10 w-10 rounded-xl border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all" aria-label="Scroll brands right">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {BRANDS.map((brand, i) => (
            <motion.div key={brand.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link href={brand.href} className="flex-none w-32 h-24 card-hover flex flex-col items-center justify-center gap-2 hover:border-accent/30 hover:shadow-accent/10">
                <span className="text-3xl">{brand.logo}</span>
                <span className="text-xs font-semibold text-foreground">{brand.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
