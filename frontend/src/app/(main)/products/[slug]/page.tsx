'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Heart, ShoppingBag, Eye, ShieldCheck, Truck,
  RotateCcw, MapPin, ChevronRight, Share2, Info, CheckCircle2
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatPrice } from '@/utils/formatPrice';
import { toast } from 'sonner';

/* ── Mock Product Data ────────────────────────────────────── */
const MOCK_PRODUCT_DETAILS = {
  name: 'Embellished Silk Anarkali Suit Set',
  brand: 'Royal Weaves',
  price: 12999,
  salePrice: 7799,
  rating: 4.8,
  reviewCount: 142,
  description:
    'Indulge in absolute luxury with our Embellished Silk Anarkali Suit Set. Tailored from premium Banarasi silk, this exquisite set features intricate zari embroidery, elegant paneling, and a soft chiffon dupatta. Designed to elevate your elegance at festivals, weddings, and formal occasions.',
  images: [
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
    'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800&q=80',
  ],
  colors: [
    { label: 'Royal Red', value: '#8b0000' },
    { label: 'Mustard Gold', value: '#ffd700' },
    { label: 'Emerald Green', value: '#006400' },
  ],
  sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  specs: [
    { name: 'Fabric', value: '100% Pure Banarasi Silk' },
    { name: 'Embroidery', value: 'Handcrafted Zari & Gota Patti' },
    { name: 'Lining', value: 'Comfortable Cotton Shantoon' },
    { name: 'Occasion', value: 'Festive & Bridal Wear' },
    { name: 'Care', value: 'Dry Clean Only' },
  ],
  faqs: [
    { q: 'Is the lining fabric stitched inside?', a: 'Yes, the Anarkali kurta comes fully lined with premium cotton shantoon fabric for top-tier comfort.' },
    { q: 'Does it include the dupatta and pants?', a: 'Yes, this is a complete 3-piece set containing the stitched Anarkali kurta, trousers, and a coordinating dupatta.' },
  ],
};

/**
 * ProductDetailPage — Rich PDP with interactive gallery, zoom hover,
 * color & size selection, pincode validation check, accordion specs, and reviews.
 */
export default function ProductDetailPage() {
  const { slug } = useParams() as { slug: string };
  const p = MOCK_PRODUCT_DETAILS;

  const [activeImage, setActiveImage] = useState(p.images[0]);
  const [selectedColor, setSelectedColor] = useState(p.colors[0].label);
  const [selectedSize, setSelectedSize] = useState(p.sizes[1]); // M default
  const [pincode, setPincode] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(slug));

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    addItem({
      id: slug,
      productId: slug,
      name: p.name,
      image: p.images[0],
      price: p.price,
      salePrice: p.salePrice,
      quantity: 1,
      size: selectedSize,
      color: selectedColor,
      sku: slug,
      stock: 10,
    });
    toast.success('Added to cart!', {
      description: `${p.name} (${selectedSize} · ${selectedColor})`,
    });
    setTimeout(() => setIsAddingToCart(false), 800);
  };

  const checkDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{6}$/.test(pincode)) {
      setDeliveryStatus('🚀 Available! Expected delivery in 2-4 business days.');
    } else {
      setDeliveryStatus('❌ Please enter a valid 6-digit pincode.');
    }
  };

  const discountPct = Math.round(((p.price - p.salePrice) / p.price) * 100);

  return (
    <div className="container-main py-10">
      <div className="grid lg:grid-cols-2 gap-10">

        {/* ── Left Image Gallery ──────────────────────────────── */}
        <div className="space-y-4">
          <div className="aspect-product rounded-3xl overflow-hidden bg-muted relative border border-border/50">
            <img
              src={activeImage}
              alt={p.name}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105 cursor-zoom-in"
            />
            <span className="sale-badge">-{discountPct}%</span>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {p.images.map((img) => (
              <button
                key={img}
                onClick={() => setActiveImage(img)}
                className={`h-24 w-20 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border-2 transition-all
                  ${activeImage === img ? 'border-accent scale-95' : 'border-transparent opacity-80 hover:opacity-100'}`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Right Product Information ───────────────────────── */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-widest">{p.brand}</span>
            <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-foreground mt-1">
              {p.name}
            </h1>

            {/* Rating summary */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.round(p.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {p.rating} ({p.reviewCount} customer reviews)
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-foreground">{formatPrice(p.salePrice)}</span>
            <span className="text-lg text-muted-foreground line-through">{formatPrice(p.price)}</span>
            <span className="text-sm font-bold text-accent">({discountPct}% OFF)</span>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>

          {/* Color Selector */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Color: <span className="text-foreground font-semibold">{selectedColor}</span>
            </h3>
            <div className="flex gap-3">
              {p.colors.map((c) => (
                <button
                  key={c.label}
                  onClick={() => setSelectedColor(c.label)}
                  className={`h-8 w-8 rounded-full border-2 transition-all flex items-center justify-center
                    ${selectedColor === c.label ? 'border-accent scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c.value }}
                  aria-label={`Color option ${c.label}`}
                >
                  {selectedColor === c.label && (
                    <span className="h-2 w-2 rounded-full bg-accent" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Size: <span className="text-foreground font-semibold">{selectedSize}</span>
              </h3>
              <button className="text-xs text-accent font-semibold hover:underline">Size Guide</button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {p.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`h-10 min-w-10 px-3 rounded-xl text-xs font-bold border transition-all
                    ${selectedSize === s
                      ? 'bg-accent text-white border-accent'
                      : 'border-border text-foreground hover:bg-muted'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="btn btn-accent flex-1 justify-center py-3.5 text-sm"
            >
              <ShoppingBag size={18} /> Add to Cart
            </button>
            <button
              onClick={() => toggleItem({ id: slug, productId: slug, name: p.name, image: p.images[0], price: p.price, salePrice: p.salePrice })}
              className={`btn btn-outline border-border p-3.5 hover:text-accent hover:border-accent hover:bg-transparent ${isWishlisted ? 'text-accent border-accent' : ''}`}
              aria-label="Wishlist toggle"
            >
              <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Delivery pincode check */}
          <div className="p-4 bg-muted/30 border border-border/50 rounded-2xl">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <MapPin size={14} className="text-accent" /> Delivery Options
            </h3>
            <form onSubmit={checkDelivery} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                maxLength={6}
                className="input-base py-2.5 text-xs flex-1"
              />
              <button type="submit" className="btn btn-sm btn-primary">Check</button>
            </form>
            {deliveryStatus && (
              <p className="text-xs font-semibold mt-2.5">{deliveryStatus}</p>
            )}
          </div>

          {/* Trust points */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="flex flex-col items-center text-center">
              <ShieldCheck size={20} className="text-success mb-1" />
              <span className="text-[10px] font-bold">100% Original</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <RotateCcw size={20} className="text-accent mb-1" />
              <span className="text-[10px] font-bold">30 Days Returns</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Truck size={20} className="text-blue-500 mb-1" />
              <span className="text-[10px] font-bold">Free Shipping</span>
            </div>
          </div>

          {/* Specifications Table */}
          <div className="border-t border-border pt-4">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3">Specifications</h3>
            <div className="grid grid-cols-2 gap-y-2.5 text-xs border border-border/50 p-4 rounded-2xl bg-muted/10">
              {p.specs.map((spec) => (
                <div key={spec.name} className="contents">
                  <span className="text-muted-foreground font-medium">{spec.name}</span>
                  <span className="text-foreground font-semibold">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
