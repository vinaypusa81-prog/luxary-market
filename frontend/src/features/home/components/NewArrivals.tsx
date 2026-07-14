'use client';
import { motion } from 'framer-motion';
import { ProductCard, ProductCardData } from '@/features/products/components/ProductCard';
import { Sparkles } from 'lucide-react';

const NEW_ARRIVALS: ProductCardData[] = [
  { id: 'na-1', name: 'Pleated Palazzo Pants', brand: 'ModernMuse', image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80', price: 2299, salePrice: 1609, discount: 30, rating: 4.5, reviewCount: 87, isNew: true, slug: 'pleated-palazzo-pants' },
  { id: 'na-2', name: 'Printed Camp-Collar Shirt', brand: 'SummerVibes', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&q=80', price: 1899, salePrice: 1329, discount: 30, rating: 4.3, reviewCount: 112, isNew: true, slug: 'printed-camp-collar-shirt' },
  { id: 'na-3', name: 'Ruched Mini Skirt', brand: 'TrendForce', image: 'https://images.unsplash.com/photo-1582142306909-195724d33ffc?w=400&q=80', price: 1699, salePrice: 1189, discount: 30, rating: 4.6, reviewCount: 203, isNew: true, slug: 'ruched-mini-skirt' },
  { id: 'na-4', name: 'Bucket Hat', brand: 'UrbanEdge', image: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=400&q=80', price: 899, salePrice: 629, discount: 30, rating: 4.2, reviewCount: 345, isNew: true, slug: 'bucket-hat' },
];

export function NewArrivals() {
  return (
    <section className="py-14 container-main" aria-label="New arrivals">
      <div className="flex items-center justify-between mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-accent" />
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Fresh In</span>
          </div>
          <h2 className="section-title">New Arrivals</h2>
        </motion.div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {NEW_ARRIVALS.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <ProductCard product={p} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
