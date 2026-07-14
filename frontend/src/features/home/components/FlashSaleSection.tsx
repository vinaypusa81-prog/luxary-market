'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock, Zap, ArrowRight } from 'lucide-react';
import { ProductCard } from '@/features/products/components/ProductCard';

/* ── Mock flash sale products ─────────────────────────────── */
const FLASH_SALE_PRODUCTS = [
  {
    id: 'fs-1',
    name: 'Premium Leather Jacket',
    brand: 'ForceStyle',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80',
    price: 8999,
    salePrice: 3599,
    discount: 60,
    rating: 4.5,
    reviewCount: 234,
    isNew: false,
    slug: 'premium-leather-jacket',
  },
  {
    id: 'fs-2',
    name: 'Designer Silk Kurta Set',
    brand: 'Zara Luxe',
    image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400&q=80',
    price: 5499,
    salePrice: 2199,
    discount: 60,
    rating: 4.7,
    reviewCount: 189,
    isNew: true,
    slug: 'designer-silk-kurta-set',
  },
  {
    id: 'fs-3',
    name: 'Classic Trench Coat',
    brand: 'Heritage Co.',
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80',
    price: 12499,
    salePrice: 4999,
    discount: 60,
    rating: 4.8,
    reviewCount: 312,
    isNew: false,
    slug: 'classic-trench-coat',
  },
  {
    id: 'fs-4',
    name: 'Boho Floral Maxi Dress',
    brand: 'EarthTones',
    image: 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400&q=80',
    price: 4299,
    salePrice: 1719,
    discount: 60,
    rating: 4.6,
    reviewCount: 156,
    isNew: true,
    slug: 'boho-floral-maxi-dress',
  },
];

/* ── Countdown Timer Hook ─────────────────────────────────── */
function useCountdown(targetHours: number) {
  const [timeLeft, setTimeLeft] = useState({
    hours: targetHours,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const endTime = Date.now() + targetHours * 60 * 60 * 1000;
    const tick = () => {
      const diff = Math.max(0, endTime - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ hours: h, minutes: m, seconds: s });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetHours]);

  return timeLeft;
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  const str = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-0.5">
        {str.split('').map((d, i) => (
          <motion.div
            key={`${d}-${i}`}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            className="h-10 w-8 rounded-lg bg-primary flex items-center justify-center
              text-white font-heading font-black text-lg shadow-md"
          >
            {d}
          </motion.div>
        ))}
      </div>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{label}</span>
    </div>
  );
}

/**
 * FlashSaleSection — Time-limited deals with live countdown timer,
 * product carousel, and animated stock indicators.
 */
export function FlashSaleSection() {
  const { hours, minutes, seconds } = useCountdown(5);

  return (
    <section className="py-12 bg-gradient-to-r from-primary via-primary/95 to-primary/90 relative overflow-hidden" aria-label="Flash sale">
      {/* Background shimmer */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 11px)',
        }}
      />

      <div className="container-main relative z-10">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center animate-pulse-glow">
              <Zap size={20} className="text-white" fill="currentColor" />
            </div>
            <div>
              <h2 className="section-title text-white">Flash Sale</h2>
              <p className="text-white/50 text-sm">Up to 70% off — Limited time only</p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-white/60 text-sm">
              <Clock size={14} />
              <span>Ends in:</span>
            </div>
            <div className="flex items-center gap-2">
              <TimeBlock value={hours} label="Hrs" />
              <span className="text-white font-black text-xl mb-4">:</span>
              <TimeBlock value={minutes} label="Min" />
              <span className="text-white font-black text-xl mb-4">:</span>
              <TimeBlock value={seconds} label="Sec" />
            </div>
          </div>

          <Link
            href="/sale"
            className="flex items-center gap-1.5 text-accent text-sm font-semibold hover:underline whitespace-nowrap"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {FLASH_SALE_PRODUCTS.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <ProductCard product={product} variant="flash-sale" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
