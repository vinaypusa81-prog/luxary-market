'use client';
import { motion } from 'framer-motion';
import { ProductCard, ProductCardData } from '@/features/products/components/ProductCard';
import { Tag } from 'lucide-react';

const DEALS: ProductCardData[] = [
  { id: 'td-1', name: 'Premium Running Shoes', brand: 'SpeedRun', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', price: 7999, salePrice: 2799, discount: 65, rating: 4.7, reviewCount: 892, slug: 'premium-running-shoes' },
  { id: 'td-2', name: 'Formal Blazer', brand: 'SuitUp', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80', price: 6999, salePrice: 2449, discount: 65, rating: 4.5, reviewCount: 234, slug: 'formal-blazer' },
  { id: 'td-3', name: 'Bohemian Maxi Skirt', brand: 'BohoStyle', image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&q=80', price: 3499, salePrice: 1224, discount: 65, rating: 4.6, reviewCount: 178, slug: 'bohemian-maxi-skirt' },
  { id: 'td-4', name: 'Canvas Backpack', brand: 'PackMate', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', price: 4999, salePrice: 1749, discount: 65, rating: 4.4, reviewCount: 421, slug: 'canvas-backpack' },
];

export function TodaysDeals() {
  return (
    <section className="py-14 container-main" aria-label="Today's deals">
      <div className="flex items-center justify-between mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-2 mb-1">
            <Tag size={16} className="text-accent" />
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Limited Time</span>
          </div>
          <h2 className="section-title">Today's Best Deals</h2>
        </motion.div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {DEALS.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <ProductCard product={p} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
