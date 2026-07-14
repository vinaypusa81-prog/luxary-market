'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ShieldCheck, MapPin, CreditCard, ChevronRight,
  ShoppingBag, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useCartStore, useCartTotal } from '@/store/cartStore';
import { formatPrice } from '@/utils/formatPrice';
import { toast } from 'sonner';

const STEPS = ['Shipping', 'Payment', 'Confirmation'];

/**
 * CheckoutPage — Production-ready multi-step checkout workflow with
 * address inputs, shipping options, mock payment gateways, and invoice summaries.
 */
export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { subtotal, discount, shipping, tax, total } = useCartTotal();

  const [step, setStep] = useState(0); // 0: Shipping, 1: Payment, 2: Confirmation
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(address).some((val) => !val.trim())) {
      toast.error('Please fill in all address fields.');
      return;
    }
    setStep(1);
  };

  const handlePaymentSubmit = async () => {
    setIsProcessing(true);
    // Simulate gateway handoff
    await new Promise((r) => setTimeout(r, 1500));
    setIsProcessing(false);
    setStep(2);
    clearCart();
    toast.success('Order placed successfully!', { description: 'Thank you for shopping at LuxeMarket!' });
  };

  return (
    <div className="container-main py-10 max-w-4xl">
      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-10 max-w-md mx-auto">
        {STEPS.map((s, idx) => (
          <div key={s} className="flex items-center gap-2">
            <span className={`h-8 w-8 rounded-full font-heading font-black text-sm flex items-center justify-center transition-all
              ${idx === step
                ? 'bg-accent text-white scale-110 shadow-[var(--shadow-accent)]'
                : idx < step
                  ? 'bg-success text-white'
                  : 'bg-muted text-muted-foreground'}`}>
              {idx < step ? '✓' : idx + 1}
            </span>
            <span className={`text-xs font-semibold ${idx === step ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
            {idx < STEPS.length - 1 && <ChevronRight size={14} className="text-muted-foreground" />}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        {/* ── Left Side: Steps content ────────────────────────── */}
        <div className="md:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {step === 0 && (
              /* Step 0: Shipping Address */
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="card p-6"
              >
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <MapPin size={18} className="text-accent" /> Shipping Address
                </h2>
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-base">Full Name</label>
                      <input
                        type="text"
                        required
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        className="input-base"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="label-base">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        className="input-base"
                        placeholder="9876543210"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label-base">Street Address</label>
                    <input
                      type="text"
                      required
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="input-base"
                      placeholder="Flat No, Building, Street Name"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="label-base">City</label>
                      <input
                        type="text"
                        required
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="input-base"
                        placeholder="Mumbai"
                      />
                    </div>
                    <div>
                      <label className="label-base">State</label>
                      <input
                        type="text"
                        required
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        className="input-base"
                        placeholder="Maharashtra"
                      />
                    </div>
                    <div>
                      <label className="label-base">Pincode</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={address.pincode}
                        onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                        className="input-base"
                        placeholder="400001"
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary w-full justify-center mt-6">
                    Deliver to this Address
                  </button>
                </form>
              </motion.div>
            )}

            {step === 1 && (
              /* Step 1: Payment Method */
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="card p-6"
              >
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CreditCard size={18} className="text-accent" /> Payment Method
                </h2>
                <div className="space-y-3">
                  {/* Card payment option */}
                  <label className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all
                    ${paymentMethod === 'card' ? 'border-accent bg-accent/[0.02]' : 'border-border hover:bg-muted/50'}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="text-accent focus:ring-accent border-border cursor-pointer"
                      />
                      <div>
                        <p className="font-semibold text-sm">Credit / Debit Card</p>
                        <p className="text-xs text-muted-foreground">Visa, Mastercard, RuPay, Amex</p>
                      </div>
                    </div>
                    <span className="text-xl">💳</span>
                  </label>

                  {/* UPI Option */}
                  <label className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all
                    ${paymentMethod === 'upi' ? 'border-accent bg-accent/[0.02]' : 'border-border hover:bg-muted/50'}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                        className="text-accent focus:ring-accent border-border cursor-pointer"
                      />
                      <div>
                        <p className="font-semibold text-sm">UPI Payment</p>
                        <p className="text-xs text-muted-foreground">Google Pay, PhonePe, Paytm, BHIM</p>
                      </div>
                    </div>
                    <span className="text-xl">📱</span>
                  </label>

                  {/* Cash On Delivery */}
                  <label className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all
                    ${paymentMethod === 'cod' ? 'border-accent bg-accent/[0.02]' : 'border-border hover:bg-muted/50'}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="text-accent focus:ring-accent border-border cursor-pointer"
                      />
                      <div>
                        <p className="font-semibold text-sm">Cash On Delivery (COD)</p>
                        <p className="text-xs text-muted-foreground">Pay in cash or card at the door</p>
                      </div>
                    </div>
                    <span className="text-xl">💵</span>
                  </label>
                </div>

                <div className="flex gap-4 mt-8">
                  <button onClick={() => setStep(0)} className="btn btn-outline border-border flex-1">
                    Back to Shipping
                  </button>
                  <button
                    onClick={handlePaymentSubmit}
                    disabled={isProcessing}
                    className="btn btn-accent flex-1 justify-center"
                  >
                    {isProcessing ? 'Processing Payment...' : `Pay ${formatPrice(total)}`}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              /* Step 2: Order Confirmed */
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card p-8 text-center space-y-4"
              >
                <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto text-success">
                  <CheckCircle2 size={36} />
                </div>
                <h2 className="text-2xl font-black text-foreground">Order Confirmed!</h2>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Your order has been placed successfully and is being processed. An email receipt was sent to your inbox.
                </p>
                <div className="border border-border p-4 rounded-2xl bg-muted/20 text-left text-xs max-w-sm mx-auto space-y-2">
                  <p className="font-bold text-foreground">Delivery Address:</p>
                  <p>{address.fullName} · {address.phone}</p>
                  <p>{address.street}, {address.city}, {address.state} - {address.pincode}</p>
                </div>
                <div className="pt-6">
                  <Link href="/" className="btn btn-primary">
                    Continue Shopping
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right Side: Order summary details ──────────────────── */}
        {step < 2 && (
          <div className="card p-5 space-y-4 flex-shrink-0">
            <h3 className="font-bold text-sm border-b border-border pb-2 flex items-center gap-1.5">
              <ShoppingBag size={15} /> Order Items
            </h3>
            <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-xs">
                  <img src={item.image} alt="" className="h-12 w-10 object-cover rounded-lg bg-muted" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">{item.name}</p>
                    <p className="text-muted-foreground mt-0.5">Qty: {item.quantity} · Size: {item.size || 'M'}</p>
                  </div>
                  <span className="font-bold">{formatPrice((item.salePrice || item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3 space-y-2.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span><span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span><span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between font-black text-sm border-t border-border pt-2.5 text-foreground">
                <span>Grand Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground border-t border-border/50 pt-2.5 justify-center">
              <ShieldCheck size={12} className="text-success" /> Safe & secure checkout check
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
