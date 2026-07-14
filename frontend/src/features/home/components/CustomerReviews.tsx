'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';

const REVIEWS = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Mumbai',
    avatar: 'PS',
    rating: 5,
    product: 'Silk Embroidered Saree',
    review:
      'Absolutely stunning quality! The saree is exactly as pictured — the embroidery detail is exquisite. Delivery was prompt and packaging was premium. This is my go-to platform for ethnic wear now.',
    date: 'June 2026',
    verified: true,
    avatar_bg: 'from-rose-400 to-pink-600',
  },
  {
    id: 2,
    name: 'Arjun Mehta',
    location: 'Bangalore',
    avatar: 'AM',
    rating: 5,
    product: 'Premium Leather Sneakers',
    review:
      'The sneakers are incredibly comfortable and well-crafted. Worth every rupee. The return process was smooth when I needed to exchange sizes — great customer service overall.',
    date: 'May 2026',
    verified: true,
    avatar_bg: 'from-blue-400 to-indigo-600',
  },
  {
    id: 3,
    name: 'Kavitha Nair',
    location: 'Chennai',
    avatar: 'KN',
    rating: 5,
    product: 'Designer Kurta Set',
    review:
      'I was skeptical about online ethnic wear shopping, but LuxeMarket exceeded all expectations. The fabric quality is superb and the fitting guide was very helpful. Will definitely shop again!',
    date: 'June 2026',
    verified: true,
    avatar_bg: 'from-violet-400 to-purple-600',
  },
  {
    id: 4,
    name: 'Rohit Gupta',
    location: 'Delhi',
    avatar: 'RG',
    rating: 4,
    product: 'Formal Suit Set',
    review:
      'Great quality suit at a competitive price. The tailoring is on point and it arrived in pristine condition. Minus one star only because delivery took a day longer than estimated.',
    date: 'May 2026',
    verified: true,
    avatar_bg: 'from-emerald-400 to-teal-600',
  },
];

const STATS = [
  { value: '4.8', label: 'Avg Rating', sub: 'from 2M+ reviews' },
  { value: '98%', label: 'Happy Customers', sub: 'would recommend us' },
  { value: '30 Days', label: 'Easy Returns', sub: 'no questions asked' },
  { value: '24/7', label: 'Support', sub: 'always here for you' },
];

/**
 * CustomerReviews — Animated testimonial carousel with rating stats panel
 * and verified purchase badges.
 */
export function CustomerReviews() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + REVIEWS.length) % REVIEWS.length);
  const next = () => setCurrent((c) => (c + 1) % REVIEWS.length);

  const review = REVIEWS[current];

  return (
    <section className="py-14 bg-muted/30" aria-label="Customer reviews">
      <div className="container-main">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <MessageSquare size={18} className="text-accent" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Testimonials</span>
          </div>
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle max-w-lg mx-auto mt-2">
            Join millions of happy shoppers who trust LuxeMarket for their fashion needs.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 items-center">
          {/* Stats sidebar */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-5 text-center"
              >
                <p className="font-heading text-3xl font-black text-foreground mb-1">{stat.value}</p>
                <p className="text-sm font-semibold text-foreground">{stat.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Review carousel */}
          <div className="lg:col-span-3">
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.35 }}
                  className="card p-8"
                >
                  {/* Quote icon */}
                  <Quote size={32} className="text-accent/20 mb-4" />

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < review.rating ? 'star-filled' : 'star-empty'}
                      />
                    ))}
                  </div>

                  {/* Review text */}
                  <p className="text-foreground text-base leading-relaxed italic mb-6">
                    "{review.review}"
                  </p>

                  {/* Product tag */}
                  <p className="text-xs text-muted-foreground mb-6">
                    Purchased: <span className="text-accent font-medium">{review.product}</span>
                  </p>

                  {/* Reviewer */}
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${review.avatar_bg} flex items-center justify-center text-white font-bold`}>
                      {review.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{review.name}</p>
                      <p className="text-sm text-muted-foreground">{review.location} · {review.date}</p>
                    </div>
                    {review.verified && (
                      <span className="ml-auto badge badge-success text-[11px]">✓ Verified</span>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex gap-2">
                  <button onClick={prev} className="h-10 w-10 rounded-xl border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all" aria-label="Previous review">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={next} className="h-10 w-10 rounded-xl border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all" aria-label="Next review">
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="flex gap-1.5">
                  {REVIEWS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-accent' : 'w-1.5 bg-border'}`}
                      aria-label={`Review ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
