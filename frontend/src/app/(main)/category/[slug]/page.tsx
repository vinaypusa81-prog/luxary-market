'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  Grid,
  List,
  ChevronDown,
  X,
  Star,
  RefreshCw,
} from 'lucide-react';
import { ProductCard, ProductCardData } from '@/features/products/components/ProductCard';
import { formatPrice } from '@/utils/formatPrice';

/* ── Mock Category Products ────────────────────────────────── */
const MOCK_PRODUCTS: Record<string, ProductCardData[]> = {
  women: [
    { id: 'w-1', name: 'Embellished Silk Anarkali Suit', brand: 'Royal Weaves', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&q=80', price: 12999, salePrice: 7799, discount: 40, rating: 4.8, reviewCount: 142, slug: 'embellished-silk-anarkali-suit', colors: ['#8b0000', '#ffd700'], sizes: ['S', 'M', 'L', 'XL'], stock: 15 },
    { id: 'w-2', name: 'Bohemian Floral Maxi Dress', brand: 'EarthTones', image: 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400&q=80', price: 4299, salePrice: 2579, discount: 40, rating: 4.5, reviewCount: 88, slug: 'bohemian-floral-maxi-dress', colors: ['#f4a261', '#2a9d8f'], sizes: ['XS', 'S', 'M', 'L'], stock: 20 },
    { id: 'w-3', name: 'Handcrafted Chikankari Kurta', brand: 'Avadh Artisans', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80', price: 3499, salePrice: 2099, discount: 40, rating: 4.7, reviewCount: 204, slug: 'handcrafted-chikankari-kurta', colors: ['#ffffff', '#add8e6'], sizes: ['M', 'L', 'XL', 'XXL'], stock: 8 },
    { id: 'w-4', name: 'High-Rise Straight Leg Jeans', brand: 'DenimHouse', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80', price: 3999, salePrice: 2399, discount: 40, rating: 4.4, reviewCount: 312, slug: 'high-rise-straight-leg-jeans', colors: ['#4a7ba7', '#1a1a1a'], sizes: ['28', '30', '32', '34'], stock: 12 },
  ],
  men: [
    { id: 'm-1', name: 'Slim Fit Knit Polo Shirt', brand: 'ClassicWear', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80', price: 1899, salePrice: 1139, discount: 40, rating: 4.4, reviewCount: 734, slug: 'slim-fit-knit-polo-shirt', colors: ['#ffffff', '#1a1a1a', '#4169e1'], sizes: ['S', 'M', 'L', 'XL'], stock: 30 },
    { id: 'm-2', name: 'Vintage Wash Denim Jacket', brand: 'DenimCo', image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400&q=80', price: 4999, salePrice: 2999, discount: 40, rating: 4.5, reviewCount: 287, slug: 'vintage-wash-denim-jacket', colors: ['#4a7ba7'], sizes: ['M', 'L', 'XL'], stock: 10 },
    { id: 'm-3', name: 'Classic Leather Chelsea Boots', brand: 'SoleCraft', image: 'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=400&q=80', price: 5999, salePrice: 3599, discount: 40, rating: 4.7, reviewCount: 228, slug: 'classic-leather-chelsea-boots', colors: ['#3e2723', '#1a1a1a'], sizes: ['7', '8', '9', '10'], stock: 5 },
  ],
};

/* ── Filter Options ───────────────────────────────────────── */
const BRANDS = ['Royal Weaves', 'EarthTones', 'Avadh Artisans', 'DenimHouse', 'ClassicWear', 'DenimCo', 'SoleCraft'];
const COLORS = ['#8b0000', '#ffd700', '#f4a261', '#2a9d8f', '#ffffff', '#add8e6', '#4a7ba7', '#1a1a1a', '#3e2723', '#4169e1'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '7', '8', '9', '10'];

/**
 * CategoryPage — Interactive PLP showcasing product lists with
 * rich filters sidebar, sorting options, search filtering, and grid/list view.
 */
export default function CategoryPage() {
  const { slug } = useParams() as { slug: string };
  const products = MOCK_PRODUCTS[slug] || [...MOCK_PRODUCTS.women, ...MOCK_PRODUCTS.men];

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(15000);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Toggle filter handlers
  const toggleBrand = (brand: string) =>
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );

  const toggleColor = (color: string) =>
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );

  const toggleSize = (size: string) =>
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );

  const resetFilters = () => {
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceRange(15000);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Brand
    if (selectedBrands.length > 0) {
      result = result.filter((p) => p.brand && selectedBrands.includes(p.brand));
    }

    // Filter by Color
    if (selectedColors.length > 0) {
      result = result.filter((p) => p.colors?.some((c) => selectedColors.includes(c)));
    }

    // Filter by Size
    if (selectedSizes.length > 0) {
      result = result.filter((p) => p.sizes?.some((s) => selectedSizes.includes(s)));
    }

    // Filter by Price
    result = result.filter((p) => (p.salePrice || p.price) <= priceRange);

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [products, selectedBrands, selectedColors, selectedSizes, priceRange, sortBy]);

  return (
    <div className="container-main py-8">
      {/* Category title */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-black uppercase tracking-tight text-foreground">
          {slug}&apos;s Collection
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Showing {filteredProducts.length} premium fashion items
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* ── Left Sidebar Filters (Desktop) ────────────────────── */}
        <aside className="hidden lg:block space-y-6 border-r border-border/50 pr-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2">
              <SlidersHorizontal size={16} /> Filters
            </h2>
            <button
              onClick={resetFilters}
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              <RefreshCw size={12} /> Reset All
            </button>
          </div>

          {/* Price filter */}
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold mb-3">Price Range</h3>
            <input
              type="range"
              min="500"
              max="15000"
              step="500"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-accent bg-muted h-1 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{formatPrice(500)}</span>
              <span className="font-semibold text-foreground">{formatPrice(priceRange)}</span>
            </div>
          </div>

          {/* Brands Filter */}
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold mb-3">Brands</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {BRANDS.map((brand) => (
                <label key={brand} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                    className="rounded text-accent focus:ring-accent border-border cursor-pointer"
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Colors Filter */}
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold mb-3">Colors</h3>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => toggleColor(color)}
                  className={`h-7 w-7 rounded-full border-2 transition-all flex items-center justify-center
                    ${selectedColors.includes(color) ? 'border-accent scale-110' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Filter by color ${color}`}
                >
                  {selectedColors.includes(color) && (
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes Filter */}
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold mb-3">Sizes</h3>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`h-9 min-w-9 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center transition-colors
                    ${selectedSizes.includes(size)
                      ? 'bg-accent text-white border-accent'
                      : 'border-border text-foreground hover:bg-muted'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Right Product Feed & Controls ─────────────────────── */}
        <section className="lg:col-span-3 space-y-6">
          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-4 p-3 bg-muted/40 rounded-2xl border border-border/30">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden btn btn-sm btn-outline flex items-center gap-2"
            >
              <SlidersHorizontal size={14} /> Filters
            </button>

            {/* Grid/List Toggle */}
            <div className="hidden sm:flex items-center gap-1 border border-border rounded-xl p-1 bg-background">
              <button
                onClick={() => setView('grid')}
                className={`p-1.5 rounded-lg transition-colors ${view === 'grid' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label="Grid view"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-1.5 rounded-lg transition-colors ${view === 'list' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-muted-foreground hidden sm:inline">Sort By:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-background border border-border text-sm font-semibold px-4 py-2 pr-8 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Best Rated</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Product Feed */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 border border-dashed border-border rounded-3xl">
              <SlidersHorizontal size={40} className="mx-auto text-muted-foreground opacity-30 mb-4 animate-bounce-subtle" />
              <h3 className="font-semibold text-lg mb-1">No products match your filters</h3>
              <p className="text-muted-foreground text-sm mb-4">Try clearing some of your selection options.</p>
              <button onClick={resetFilters} className="btn btn-primary btn-sm">Clear All Filters</button>
            </div>
          ) : (
            <div className={view === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-4' : 'space-y-4'}>
              {filteredProducts.map((product) => (
                <motion.div key={product.id} layout>
                  {view === 'grid' ? (
                    <ProductCard product={product} />
                  ) : (
                    /* Simple List View Card */
                    <div className="card-hover p-4 flex gap-4 overflow-hidden rounded-2xl">
                      <div className="h-28 w-24 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {product.brand && <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{product.brand}</p>}
                        <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-2">{product.name}</h3>
                        {product.rating && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                            <Star size={12} className="star-filled" /> {product.rating} ({product.reviewCount})
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="price-current">{formatPrice(product.salePrice || product.price)}</span>
                          {product.salePrice && <span className="price-original text-xs">{formatPrice(product.price)}</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Mobile Filters Drawer ─────────────────────────────── */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] bg-black/50"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[300px] bg-background z-[130] p-5 overflow-y-auto flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black flex items-center gap-2">
                  <SlidersHorizontal size={18} /> Filters
                </h2>
                <button onClick={() => setShowMobileFilters(false)} className="btn-icon">
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Filter Options */}
              <div className="flex-1 space-y-6">
                {/* Price range */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Price Range</h3>
                  <input
                    type="range"
                    min="500"
                    max="15000"
                    step="500"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-accent bg-muted h-1"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{formatPrice(500)}</span>
                    <span className="font-semibold text-foreground">{formatPrice(priceRange)}</span>
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Brands</h3>
                  <div className="space-y-2">
                    {BRANDS.map((brand) => (
                      <label key={brand} className="flex items-center gap-2 text-sm text-foreground">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="rounded text-accent focus:ring-accent"
                        />
                        <span>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reset/Apply in footer */}
              <div className="border-t border-border pt-4 flex gap-3">
                <button onClick={resetFilters} className="btn btn-outline flex-1 py-2 text-xs">Reset</button>
                <button onClick={() => setShowMobileFilters(false)} className="btn btn-primary flex-1 py-2 text-xs">Apply</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
