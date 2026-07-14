'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Eye, Star, Zap, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatPrice } from '@/utils/formatPrice';

/* ── Types ────────────────────────────────────────────────── */
export interface ProductCardData {
  id: string;
  name: string;
  brand?: string;
  image: string;
  images?: string[];
  price: number;
  salePrice?: number;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isTrending?: boolean;
  slug: string;
  colors?: string[];
  sizes?: string[];
  stock?: number;
}

interface ProductCardProps {
  product: ProductCardData;
  variant?: 'default' | 'flash-sale' | 'compact' | 'featured';
}

/**
 * ProductCard — Versatile product card with hover effects, quick add to cart,
 * wishlist toggle, image swap on hover, and color swatches.
 * Supports multiple display variants for different page contexts.
 */
export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageIdx, setImageIdx] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id));

  const effectivePrice = product.salePrice || product.price;
  const discountPct = product.discount ||
    (product.salePrice && product.price
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : null);

  // Swap to second image on hover
  const displayImage =
    isHovered && product.images && product.images.length > 1
      ? product.images[1]
      : product.image;

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isAddingToCart) return;

      setIsAddingToCart(true);
      addItem({
        id: product.id,
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        salePrice: product.salePrice,
        quantity: 1,
        sku: product.id,
        stock: product.stock || 10,
      });
      toast.success('Added to cart!', {
        description: product.name,
        action: {
          label: 'View Cart',
          onClick: () => (window.location.href = '/cart'),
        },
      });
      setTimeout(() => setIsAddingToCart(false), 800);
    },
    [product, addItem, isAddingToCart]
  );

  const handleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleItem({
        id: product.id,
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        salePrice: product.salePrice,
        brand: product.brand,
        rating: product.rating,
        discount: discountPct || undefined,
      });
      toast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!', {
        icon: isWishlisted ? '💔' : '❤️',
      });
    },
    [product, toggleItem, isWishlisted, discountPct]
  );

  return (
    <Link href={`/products/${product.slug}`} className="block group outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-2xl">
      <div
        className="card-product"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ── Image Container ─────────────────────────────── */}
        <div className="relative aspect-product overflow-hidden bg-muted">

          {/* Product Image */}
          <motion.div
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-full w-full"
          >
            <img
              src={displayImage}
              alt={product.name}
              className="h-full w-full object-cover transition-all duration-400"
              loading="lazy"
            />
          </motion.div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {discountPct && (
              <span className="badge bg-accent text-white font-bold text-[11px]">
                {discountPct}% OFF
              </span>
            )}
            {product.isNew && !discountPct && (
              <span className="badge bg-primary text-white font-bold text-[11px]">
                NEW
              </span>
            )}
            {product.isTrending && (
              <span className="badge bg-orange-500 text-white font-bold text-[11px] flex items-center gap-1">
                <Zap size={10} fill="currentColor" /> HOT
              </span>
            )}
            {variant === 'flash-sale' && (
              <span className="badge bg-accent text-white font-bold text-[11px] animate-pulse">
                ⚡ FLASH
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-3 right-3 flex flex-col gap-2 z-10"
              >
                {/* Wishlist */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleWishlist}
                  className={`h-9 w-9 rounded-xl flex items-center justify-center shadow-md transition-colors
                    ${isWishlisted
                      ? 'bg-accent text-white'
                      : 'bg-background/90 backdrop-blur-sm text-foreground hover:bg-accent hover:text-white'
                    }`}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                </motion.button>

                {/* Quick View */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="h-9 w-9 rounded-xl bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-md
                    text-foreground hover:bg-primary hover:text-white transition-colors"
                  aria-label="Quick view"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                >
                  <Eye size={16} />
                </motion.button>

                {/* Share */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="h-9 w-9 rounded-xl bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-md
                    text-foreground hover:bg-primary hover:text-white transition-colors"
                  aria-label="Share product"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigator.share?.({ title: product.name, url: `/products/${product.slug}` });
                  }}
                >
                  <Share2 size={16} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add to Cart — slides up on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="absolute bottom-0 left-0 right-0 p-3 z-10"
              >
                <motion.button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  whileTap={{ scale: 0.97 }}
                  className="btn btn-accent w-full justify-center py-2.5 rounded-xl text-sm
                    shadow-[var(--shadow-accent)] disabled:opacity-70"
                  aria-label={`Add ${product.name} to cart`}
                >
                  <AnimatePresence mode="wait">
                    {isAddingToCart ? (
                      <motion.span
                        key="adding"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Adding...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <ShoppingBag size={16} />
                        Add to Cart
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Image dots (if multiple images) */}
          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {product.images.slice(0, 4).map((_, i) => (
                <button
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === imageIdx ? 'w-4 bg-white' : 'w-1 bg-white/50'
                  }`}
                  onClick={(e) => { e.preventDefault(); setImageIdx(i); }}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ─────────────────────────────────── */}
        <div className="p-3.5">
          {/* Brand */}
          {product.brand && (
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {product.brand}
            </p>
          )}

          {/* Name */}
          <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug mb-2 group-hover:text-accent transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={11}
                    className={star <= Math.round(product.rating!) ? 'star-filled' : 'star-empty'}
                  />
                ))}
              </div>
              <span className="text-[11px] text-muted-foreground">
                ({product.reviewCount?.toLocaleString()})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="price-current">
              {formatPrice(effectivePrice)}
            </span>
            {product.salePrice && product.price > product.salePrice && (
              <span className="price-original text-xs">
                {formatPrice(product.price)}
              </span>
            )}
            {discountPct && (
              <span className="price-discount text-xs">
                {discountPct}% off
              </span>
            )}
          </div>

          {/* Color swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              {product.colors.slice(0, 5).map((color) => (
                <button
                  key={color}
                  className="h-4 w-4 rounded-full border-2 border-transparent hover:border-foreground/30 transition-all ring-1 ring-border"
                  style={{ backgroundColor: color }}
                  aria-label={`Color ${color}`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                />
              ))}
              {product.colors.length > 5 && (
                <span className="text-[10px] text-muted-foreground">+{product.colors.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
