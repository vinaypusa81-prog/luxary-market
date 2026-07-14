'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowRight,
  ShieldCheck, Heart, RefreshCw
} from 'lucide-react';
import { useCartStore, useCartTotal } from '@/store/cartStore';
import { formatPrice } from '@/utils/formatPrice';
import { toast } from 'sonner';

/**
 * CartPage — Comprehensive full-screen shopping cart page with
 * individual item removal, quantity updates, total recalculations,
 * saved coupons, and safe payment highlights.
 */
export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const { subtotal, discount, shipping, tax, total } = useCartTotal();

  const handleRemove = (id: string, name: string) => {
    removeItem(id);
    toast.error('Item removed from cart', { description: name });
  };

  return (
    <div className="container-main py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-heading font-black uppercase tracking-tight">
          Shopping Cart
        </h1>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-accent hover:underline flex items-center gap-1"
          >
            <Trash2 size={12} /> Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 border border-dashed border-border rounded-3xl max-w-xl mx-auto">
          <ShoppingBag size={48} className="mx-auto text-muted-foreground opacity-30 mb-4 animate-bounce-subtle" />
          <h2 className="font-semibold text-lg mb-1">Your cart is empty</h2>
          <p className="text-muted-foreground text-sm mb-6">Explore our curated catalog to add premium styles.</p>
          <Link href="/" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 items-start">

          {/* ── Left Side: Cart Items ────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="card p-4 flex gap-4 overflow-hidden"
                >
                  {/* Image */}
                  <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                    <div className="h-28 w-24 rounded-2xl overflow-hidden bg-muted">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm leading-snug line-clamp-2">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => handleRemove(item.id, item.name)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded-lg transition-colors"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      {(item.size || item.color) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 border border-border rounded-xl p-1 bg-background">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors disabled:opacity-50"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Pricing */}
                      <div className="text-right">
                        <p className="text-base font-bold text-foreground">
                          {formatPrice((item.salePrice || item.price) * item.quantity)}
                        </p>
                        {item.salePrice && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── Right Side: Order Summary ─────────────────────────── */}
          <div className="card p-6 space-y-6">
            <h2 className="text-lg font-bold border-b border-border pb-3">Order Summary</h2>

            {/* Price breakdown */}
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span className="font-semibold">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Charges</span>
                <span className="font-semibold text-foreground">
                  {shipping === 0 ? <span className="text-success font-bold">FREE</span> : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Tax (18%)</span>
                <span className="font-semibold text-foreground">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between font-black text-lg border-t border-border pt-4 text-foreground">
                <span>Total Amount</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <div className="space-y-3 pt-2">
              <Link href="/checkout" className="btn btn-accent w-full justify-center py-3.5 text-sm">
                Proceed to Checkout <ArrowRight size={18} />
              </Link>
              <Link href="/" className="btn btn-outline border-border w-full justify-center py-3 text-sm">
                Continue Shopping
              </Link>
            </div>

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/50">
              <ShieldCheck size={16} className="text-success" />
              <span>SSL Secure Payment Guarantee</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
