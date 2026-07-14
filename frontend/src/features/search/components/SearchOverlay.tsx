'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Search, X, Clock, TrendingUp, ArrowRight, Mic, Camera } from 'lucide-react';

const TRENDING_SEARCHES = [
  'Kurta sets', 'Oversized hoodies', 'Floral dresses', 'Leather bags',
  'White sneakers', 'Silk sarees', 'Denim jackets', 'Wedding lehenga',
];

const RECENT_SEARCHES = ['Blue jeans women', 'Running shoes', 'Polo t-shirts'];

const QUICK_CATEGORIES = [
  { label: 'Women', href: '/category/women' },
  { label: 'Men', href: '/category/men' },
  { label: 'Footwear', href: '/category/footwear' },
  { label: 'Accessories', href: '/category/accessories' },
  { label: 'Ethnic Wear', href: '/category/ethnic' },
  { label: 'Sale', href: '/sale' },
];

interface SearchOverlayProps {
  onClose: () => void;
}

/**
 * SearchOverlay — Full-screen search with instant suggestions,
 * trending searches, recent history, voice search, and image search buttons.
 */
export function SearchOverlay({ onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-start justify-center pt-[10vh]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <motion.div
        initial={{ scale: 0.95, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: -20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-2xl mx-4 bg-background rounded-3xl shadow-[var(--shadow-xl)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <form onSubmit={handleSearch} className="flex items-center gap-3 p-4 border-b border-border">
          <Search size={20} className="text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products, brands, categories..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-base focus:outline-none"
            aria-label="Search"
          />
          {/* Voice & Image search */}
          <button type="button" className="btn-icon text-muted-foreground hover:text-accent" aria-label="Voice search">
            <Mic size={18} />
          </button>
          <button type="button" className="btn-icon text-muted-foreground hover:text-accent" aria-label="Image search">
            <Camera size={18} />
          </button>
          <button type="button" onClick={onClose} className="btn-icon text-muted-foreground hover:text-foreground" aria-label="Close search">
            <X size={20} />
          </button>
        </form>

        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {query.length === 0 ? (
            <>
              {/* Quick categories */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Browse Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {QUICK_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.label}
                      href={cat.href}
                      onClick={onClose}
                      className="badge badge-muted hover:bg-accent/10 hover:text-accent transition-colors cursor-pointer py-1.5 px-3"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent searches */}
              {RECENT_SEARCHES.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    Recent Searches
                  </h3>
                  <ul className="space-y-1">
                    {RECENT_SEARCHES.map((term) => (
                      <li key={term}>
                        <button
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-muted text-sm text-foreground text-left transition-colors"
                          onClick={() => setQuery(term)}
                        >
                          <Clock size={14} className="text-muted-foreground" />
                          {term}
                          <ArrowRight size={14} className="ml-auto text-muted-foreground/50" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Trending searches */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <TrendingUp size={12} /> Trending
                </h3>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((term) => (
                    <button
                      key={term}
                      className="px-3 py-1.5 rounded-xl bg-muted text-sm text-foreground hover:bg-accent/10 hover:text-accent transition-colors"
                      onClick={() => setQuery(term)}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Live suggestions placeholder */
            <div className="space-y-1">
              {[query, `${query} dress`, `${query} men`, `${query} sale`].slice(0, 4).map((suggestion) => (
                <button
                  key={suggestion}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-muted text-sm text-foreground text-left transition-colors"
                  onClick={() => {
                    setQuery(suggestion);
                    onClose();
                    window.location.href = `/search?q=${encodeURIComponent(suggestion.trim())}`;
                  }}
                >
                  <Search size={14} className="text-muted-foreground" />
                  <span>
                    <span className="font-medium">{query}</span>
                    {suggestion.slice(query.length)}
                  </span>
                </button>
              ))}
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted text-sm font-semibold text-accent text-left transition-colors"
              >
                <Search size={14} />
                Search for &ldquo;{query}&rdquo;
                <ArrowRight size={14} className="ml-auto" />
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
