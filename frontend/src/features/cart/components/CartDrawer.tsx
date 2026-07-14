'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag } from 'lucide-react';
import { useCartStore, useCartTotal } from '@/store/cartStore';
import { formatPrice } from '@/utils/formatPrice';

/**
 * CartDrawer — Slide-over cart panel with item management,
 * quantity controls, coupon input, order summary, and checkout CTA.
 */
export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();
  const { subtotal, discount, shipping, tax, total } = useCartTotal();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
            onClick={closeCart}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-background shadow-[var(--shadow-xl)] z-[100] flex flex-col"
            role="dialog"
            aria-label="Shopping cart"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} />
                <h2 className="font-semibold text-base">
                  My Cart{' '}
                  <span className="text-muted-foreground font-normal text-sm">({items.length} items)</span>
                </h2>
              </div>
              <button onClick={closeCart} className="btn-icon" aria-label="Close cart">
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                  <ShoppingBag size={36} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-lg mb-1">Your cart is empty</p>
                  <p className="text-muted-foreground text-sm">Add items to get started!</p>
                </div>
                <Link href="/" onClick={closeCart} className="btn btn-accent">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-3"
                      >
                        {/* Product Image */}
                        <Link href={`/products/${item.productId}`} onClick={closeCart}>
                          <div className="h-20 w-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                          </div>
                        </Link>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug mb-1">
                            {item.name}
                          </p>
                          {(item.size || item.color) && (
                            <p className="text-xs text-muted-foreground mb-2">
                              {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(' · ')}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            {/* Quantity controls */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                                className="h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                                aria-label="Increase quantity"
                              >
                                <Plus size={13} />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="text-sm font-bold">
                                {formatPrice((item.salePrice || item.price) * item.quantity)}
                              </p>
                              {item.salePrice && (
                                <p className="text-[11px] text-muted-foreground line-through">
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="self-start p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Order Summary */}
                <div className="px-5 py-4 border-t border-border space-y-3 flex-shrink-0">
                  {/* Coupon */}
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 input-base py-2.5">
                      <Tag size={14} className="text-muted-foreground" />
                      <input placeholder="Enter coupon code" className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground" />
                    </div>
                    <button className="btn btn-sm btn-outline">Apply</button>
                  </div>

                  {/* Price breakdown */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-success">
                        <span>Discount</span><span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? <span className="text-success font-medium">FREE</span> : formatPrice(shipping)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax (18%)</span><span>{formatPrice(tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base border-t border-border pt-2">
                      <span>Total</span><span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  {shipping > 0 && (
                    <p className="text-xs text-accent text-center">
                      Add {formatPrice(999 - subtotal)} more for FREE shipping!
                    </p>
                  )}

                  {/* CTA Buttons */}
                  <div className="space-y-2 pt-1">
                    <Link
                      href="/checkout"
                      onClick={closeCart}
                      className="btn btn-accent w-full justify-center text-sm"
                    >
                      Proceed to Checkout <ArrowRight size={16} />
                    </Link>
                    <Link
                      href="/cart"
                      onClick={closeCart}
                      className="btn btn-outline w-full justify-center text-sm"
                    >
                      View Full Cart
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
