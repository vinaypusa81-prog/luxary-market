'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ProductCard, ProductCardData } from '@/features/products/components/ProductCard';
import { Trophy } from 'lucide-react';

const TOP_SELLING: ProductCardData[] = [
  { id: 'ts-1', name: 'Classic White Sneakers', brand: 'CleanStep', image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&q=80', price: 4999, salePrice: 3499, discount: 30, rating: 4.8, reviewCount: 2341, slug: 'classic-white-sneakers' },
  { id: 'ts-2', name: 'Basic Black Tee', brand: 'EssentialsHQ', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&q=80', price: 799, salePrice: 559, discount: 30, rating: 4.6, reviewCount: 5678, slug: 'basic-black-tee' },
  { id: 'ts-3', name: 'Ethnic Printed Saree', brand: 'SilkRoutes', image: 'https://images.unsplash.com/photo-1610173827238-c26004e12bd5?w=400&q=80', price: 3299, salePrice: 2309, discount: 30, rating: 4.9, reviewCount: 891, slug: 'ethnic-printed-saree' },
  { id: 'ts-4', name: 'Slim-Fit Chinos', brand: 'GoodFit Co.', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=80', price: 2499, salePrice: 1749, discount: 30, rating: 4.5, reviewCount: 1234, slug: 'slim-fit-chinos' },
];

export function TopSelling() {
  return (
    <section className="py-14 bg-muted/30" aria-label="Top selling products">
      <div className="container-main">
        <div className="flex items-center gap-2 mb-2">
          <Trophy size={18} className="text-amber-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Best Sellers</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Top Selling This Month</h2>
          <Link href="/products?sort=bestsellers" className="text-sm text-accent font-semibold hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TOP_SELLING.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="relative">
                <span className="absolute -top-2 -left-2 z-20 h-6 w-6 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center shadow-md">#{i + 1}</span>
                <ProductCard product={p} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
