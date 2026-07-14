'use client';

import { motion } from 'framer-motion';
import { ProductCard, ProductCardData } from '@/features/products/components/ProductCard';
import { Sparkles, Bot } from 'lucide-react';

/* ── Mock AI recommendations ─────────────────────────────── */
const AI_PICKS: ProductCardData[] = [
  {
    id: 'ai-1',
    name: 'Floral Print Midi Dress',
    brand: 'BohoChic',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80',
    price: 3899,
    salePrice: 2339,
    discount: 40,
    rating: 4.6,
    reviewCount: 312,
    isNew: true,
    slug: 'floral-print-midi-dress',
    colors: ['#f4a261', '#e76f51', '#264653'],
  },
  {
    id: 'ai-2',
    name: 'Classic White Linen Shirt',
    brand: 'Minimal Co.',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80',
    price: 2199,
    salePrice: 1319,
    discount: 40,
    rating: 4.8,
    reviewCount: 567,
    isNew: false,
    slug: 'classic-white-linen-shirt',
    colors: ['#ffffff', '#f5f5dc', '#c8d8e4'],
  },
  {
    id: 'ai-3',
    name: 'Embroidered Anarkali Set',
    brand: 'Heritage Weaves',
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&q=80',
    price: 8999,
    salePrice: 5399,
    discount: 40,
    rating: 4.9,
    reviewCount: 143,
    isNew: true,
    slug: 'embroidered-anarkali-set',
    colors: ['#8b0000', '#ffd700', '#006400'],
  },
  {
    id: 'ai-4',
    name: 'Leather Chelsea Boots',
    brand: 'SoleCraft',
    image: 'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=400&q=80',
    price: 5999,
    salePrice: 3599,
    discount: 40,
    rating: 4.7,
    reviewCount: 228,
    isNew: false,
    slug: 'leather-chelsea-boots',
    colors: ['#3e2723', '#1a1a1a', '#8d6e63'],
  },
];

/**
 * AiRecommendations — AI-powered product recommendations personalized
 * for each user, with visual AI branding and animated shimmer loading.
 */
export function AiRecommendations() {
  return (
    <section className="py-14 relative overflow-hidden" aria-label="AI recommendations">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent/3 via-transparent to-accent/3 pointer-events-none" />

      <div className="container-main relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-start justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-orange-500">
                <Bot size={14} className="text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-accent">AI Curated</span>
            </div>
            <h2 className="section-title">Picked Just for You</h2>
            <p className="section-subtitle">
              Our AI has analysed your style preferences to find these perfect matches.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20">
            <Sparkles size={14} className="text-accent" />
            <span className="text-xs font-semibold text-accent">AI Powered</span>
          </div>
        </motion.div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {AI_PICKS.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
