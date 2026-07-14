'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';

/* ── Hero Slide Data ──────────────────────────────────────── */
const HERO_SLIDES = [
  {
    id: 1,
    badge: 'New Season Collection',
    title: 'Redefine Your\nStyle Statement',
    subtitle: 'Discover luxury fashion that speaks to your soul. Premium brands, exclusive collections, unmatched elegance.',
    cta: 'Shop Collection',
    ctaLink: '/category/women',
    secondary: 'View Lookbook',
    secondaryLink: '/blog',
    gradient: 'from-[#0a0a0a] via-[#1a0a1f] to-[#0d0d2b]',
    accentColor: '#ff3f6c',
    imagePrompt: 'luxury fashion model',
    stats: [
      { value: '500+', label: 'Brands' },
      { value: '50K+', label: 'Products' },
      { value: '2M+', label: 'Customers' },
    ],
  },
  {
    id: 2,
    badge: '⚡ Flash Sale — Up to 70% Off',
    title: "Men's Premium\nCollection 2026",
    subtitle: "Elevate your wardrobe with the season's finest menswear. From power suits to casual luxe.",
    cta: 'Shop Men',
    ctaLink: '/category/men',
    secondary: 'View All Deals',
    secondaryLink: '/sale',
    gradient: 'from-[#0a0a1a] via-[#0d1a0a] to-[#0a0a0a]',
    accentColor: '#ff3f6c',
    imagePrompt: 'mens luxury fashion',
    stats: [
      { value: '70%', label: 'Max Discount' },
      { value: '24h', label: 'Flash Sale' },
      { value: 'Free', label: 'Shipping' },
    ],
  },
  {
    id: 3,
    badge: 'Luxury Home Living',
    title: 'Transform Your\nLiving Space',
    subtitle: 'Curated home décor and lifestyle products that blend form with function. Live beautifully.',
    cta: 'Explore Home',
    ctaLink: '/category/home',
    secondary: 'View Lookbook',
    secondaryLink: '/blog',
    gradient: 'from-[#1a0a05] via-[#1a0f0a] to-[#0a0a0a]',
    accentColor: '#ff3f6c',
    imagePrompt: 'luxury interior design',
    stats: [
      { value: '10K+', label: 'Products' },
      { value: '200+', label: 'Brands' },
      { value: '4.9★', label: 'Rating' },
    ],
  },
];

/**
 * HeroBanner — Full-viewport animated hero with auto-sliding carousel,
 * GSAP text animations, stats counter, and premium glass UI elements.
 */
export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const slide = HERO_SLIDES[current];

  // GSAP entrance animation for title
  useEffect(() => {
    if (!titleRef.current) return;
    const chars = titleRef.current.querySelectorAll('.char');
    gsap.fromTo(
      chars,
      { y: 60, opacity: 0, rotateX: -40 },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        stagger: 0.025,
        duration: 0.6,
        ease: 'power3.out',
      }
    );
  }, [current]);

  // Auto-advance slides
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, []);

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const prev = () => goTo((current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const next = () => goTo((current + 1) % HERO_SLIDES.length);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <section
      className="relative overflow-hidden"
      style={{ height: 'min(90vh, 700px)', minHeight: '560px' }}
      aria-label="Hero banner"
      aria-roledescription="carousel"
    >
      {/* ── Slide Background ────────────────────────────────── */}
      <AnimatePresence custom={direction} mode="sync">
        <motion.div
          key={slide.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}
          aria-hidden="true"
        />
      </AnimatePresence>

      {/* Ambient glow overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 70% 50%, ${slide.accentColor}33 0%, transparent 70%)`,
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="container-main h-full relative z-10">
        <div className="h-full flex items-center">
          <div className="max-w-2xl py-16">

            {/* Badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`badge-${slide.id}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 mb-6"
              >
                <span className="flex items-center gap-1.5 bg-accent/20 border border-accent/30 backdrop-blur-sm
                  text-white/90 text-xs font-semibold px-3.5 py-1.5 rounded-full">
                  <Sparkles size={12} className="text-accent" />
                  {slide.badge}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Title */}
            <AnimatePresence mode="wait">
              <motion.h1
                key={`title-${slide.id}`}
                ref={titleRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-heading text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 perspective-1000"
              >
                {slide.title.split('\n').map((line, li) => (
                  <span key={li} className="block overflow-hidden">
                    <motion.span
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      transition={{ delay: li * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="block"
                    >
                      {line.includes('Style') || line.includes('Premium') || line.includes('Transform') ? (
                        <>
                          {line.split(/(Style|Premium|Transform)/)[0]}
                          <span className="gradient-text">{line.match(/(Style|Premium|Transform)/)?.[0]}</span>
                          {line.split(/(Style|Premium|Transform)/)[2]}
                        </>
                      ) : line}
                    </motion.span>
                  </span>
                ))}
              </motion.h1>
            </AnimatePresence>

            {/* Subtitle */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`sub-${slide.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-white/60 text-lg leading-relaxed mb-8 max-w-lg"
              >
                {slide.subtitle}
              </motion.p>
            </AnimatePresence>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-wrap gap-4"
            >
              <Link href={slide.ctaLink} className="btn btn-gradient btn-lg group">
                {slide.cta}
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href={slide.secondaryLink} className="btn btn-lg border border-white/20 text-white hover:bg-white/10">
                {slide.secondary}
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center gap-8 mt-12 pt-8 border-t border-white/10"
            >
              {slide.stats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-heading text-2xl font-black text-white">{stat.value}</p>
                  <p className="text-white/40 text-xs mt-0.5">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Navigation Controls ──────────────────────────────── */}
      <div className="absolute bottom-8 right-8 z-20 flex items-center gap-3">
        {/* Prev/Next */}
        <button
          onClick={prev}
          className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10
            flex items-center justify-center text-white transition-all hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={next}
          className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10
            flex items-center justify-center text-white transition-all hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === current ? 'w-8 bg-accent' : 'w-1.5 bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Slide ${i + 1}`}
            aria-current={i === current ? 'true' : 'false'}
          />
        ))}
      </div>

      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-accent z-20"
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        key={current}
        transition={{ duration: 6, ease: 'linear' }}
      />
    </section>
  );
}
