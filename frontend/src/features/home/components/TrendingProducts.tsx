'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, TrendingUp } from 'lucide-react';
import { ProductCard, ProductCardData } from '@/features/products/components/ProductCard';

const TRENDING_PRODUCTS: ProductCardData[] = [
  {
    id: 'tr-1',
    name: 'Oversized Linen Blazer',
    brand: 'UrbanEdge',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80',
    price: 6499,
    salePrice: 3899,
    discount: 40,
    rating: 4.7,
    reviewCount: 423,
    isNew: false,
    isTrending: true,
    slug: 'oversized-linen-blazer',
    colors: ['#d4a96a', '#2c2c2c', '#ffffff'],
  },
  {
    id: 'tr-2',
    name: 'Vintage Wash Denim Jacket',
    brand: 'DenimCo',
    image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400&q=80',
    price: 4999,
    salePrice: 2999,
    discount: 40,
    rating: 4.5,
    reviewCount: 287,
    isNew: true,
    isTrending: true,
    slug: 'vintage-wash-denim-jacket',
    colors: ['#4a7ba7', '#7b6e58', '#2c2c2c'],
  },
  {
    id: 'tr-3',
    name: 'Handloom Cotton Kurta',
    brand: 'Khadi Luxe',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80',
    price: 2799,
    salePrice: 1679,
    discount: 40,
    rating: 4.8,
    reviewCount: 561,
    isNew: false,
    isTrending: true,
    slug: 'handloom-cotton-kurta',
    colors: ['#f5f0e8', '#d4b896', '#8b6914'],
  },
  {
    id: 'tr-4',
    name: 'Structured Leather Tote',
    brand: 'Moda Luxe',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
    price: 7999,
    salePrice: 4799,
    discount: 40,
    rating: 4.9,
    reviewCount: 198,
    isNew: false,
    isTrending: true,
    slug: 'structured-leather-tote',
    colors: ['#8b4513', '#2c2c2c', '#c4a882'],
  },
  {
    id: 'tr-5',
    name: 'Knit Polo T-Shirt',
    brand: 'ClassicWear',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
    price: 1899,
    salePrice: 1139,
    discount: 40,
    rating: 4.4,
    reviewCount: 734,
    isNew: true,
    isTrending: false,
    slug: 'knit-polo-tshirt',
    colors: ['#ffffff', '#1a1a1a', '#4169e1', '#228b22'],
  },
  {
    id: 'tr-6',
    name: 'High-Rise Straight Jeans',
    brand: 'DenimHouse',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80',
    price: 3499,
    salePrice: 2099,
    discount: 40,
    rating: 4.6,
    reviewCount: 389,
    isNew: false,
    isTrending: true,
    slug: 'high-rise-straight-jeans',
    colors: ['#4a5568', '#1a202c', '#718096'],
  },
];

/**
 * TrendingProducts — Horizontal scrollable carousel with navigation arrows.
 * Features stagger animation and smooth scroll snapping.
 */
export function TrendingProducts() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  return (
    <section className="py-14 bg-muted/30" aria-label="Trending products">
      <div className="container-main">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={20} className="text-accent" />
              <span className="text-xs font-bold uppercase tracking-widest text-accent">Trending Now</span>
            </div>
            <h2 className="section-title">What Everyone's Wearing</h2>
          </motion.div>

          <div className="flex items-center gap-3">
            {/* Arrow controls */}
            <div className="hidden sm:flex gap-2">
              <button
                onClick={() => scroll('left')}
                className="h-10 w-10 rounded-xl border border-border bg-background flex items-center justify-center
                  hover:bg-primary hover:text-white hover:border-primary transition-all"
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="h-10 w-10 rounded-xl border border-border bg-background flex items-center justify-center
                  hover:bg-primary hover:text-white hover:border-primary transition-all"
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <Link href="/category/trending" className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
              View All <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Scrollable Product Row */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth snap-x snap-mandatory"
        >
          {TRENDING_PRODUCTS.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex-none w-52 sm:w-60 snap-start"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
