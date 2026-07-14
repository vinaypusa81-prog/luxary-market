'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, HelpCircle } from 'lucide-react';
import { ProductCard, ProductCardData } from '@/features/products/components/ProductCard';

/* ── Mock Database Search Pool ────────────────────────────── */
const SEARCH_POOL: ProductCardData[] = [
  { id: '1', name: 'Vintage Wash Denim Jacket', brand: 'DenimCo', image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400&q=80', price: 4999, salePrice: 2999, discount: 40, rating: 4.5, reviewCount: 287, slug: 'vintage-wash-denim-jacket' },
  { id: '2', name: 'Slim Fit Knit Polo Shirt', brand: 'ClassicWear', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80', price: 1899, salePrice: 1139, discount: 40, rating: 4.4, reviewCount: 734, slug: 'slim-fit-knit-polo-shirt' },
  { id: '3', name: 'Embellished Silk Anarkali Suit Set', brand: 'Royal Weaves', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&q=80', price: 12999, salePrice: 7799, discount: 40, rating: 4.8, reviewCount: 142, slug: 'embellished-silk-anarkali-suit-set' },
  { id: '4', name: 'Bohemian Floral Maxi Dress', brand: 'EarthTones', image: 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400&q=80', price: 4299, salePrice: 2579, discount: 40, rating: 4.5, reviewCount: 88, slug: 'bohemian-floral-maxi-dress' },
];

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  // Filter pool by query fuzzy matching
  const results = SEARCH_POOL.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.brand?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="container-main py-10">
      {/* Title block */}
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Search size={22} className="text-accent" />
          Search Results for: <span className="text-accent">&ldquo;{query}&rdquo;</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Found {results.length} matched items
        </p>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 border border-dashed border-border rounded-3xl max-w-md mx-auto">
          <HelpCircle size={40} className="mx-auto text-muted-foreground opacity-30 mb-4 animate-bounce-subtle" />
          <h2 className="font-semibold text-base mb-1">No search matches found</h2>
          <p className="text-muted-foreground text-xs mb-6">
            Check the spelling or try searching for generic terms like &ldquo;jeans&rdquo;, &ldquo;shirt&rdquo;, or &ldquo;dress&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((product) => (
            <motion.div key={product.id} layout>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="container-main py-10 text-center text-sm">Loading search results...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
