'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { SearchOverlay } from '@/features/search/components/SearchOverlay';
import { MegaMenu } from './MegaMenu';
import { UserMenu } from './UserMenu';
import { NotificationCenter } from './NotificationCenter';

/* ── Navigation Links ─────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Women', href: '/category/women', hasMega: true },
  { label: 'Men', href: '/category/men', hasMega: true },
  { label: 'Kids', href: '/category/kids', hasMega: true },
  { label: 'Home & Living', href: '/category/home', hasMega: true },
  { label: 'Beauty', href: '/category/beauty', hasMega: false },
  { label: 'Brands', href: '/brands', hasMega: false },
  { label: 'Sale', href: '/sale', hasMega: false, accent: true },
];

/**
 * Header — Sticky navbar with mega menu, animated search,
 * cart preview, wishlist, profile menu, dark mode toggle,
 * language selector, and notification center.
 */
export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.items);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const megaTimeout = useRef<NodeJS.Timeout | null>(null);

  // Track scroll for transparent → solid transition
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileOpen(false);
    setActiveMega(null);
  }, [pathname]);

  // Keyboard shortcut: Cmd/Ctrl+K → open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setActiveMega(null);
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleMegaEnter = (label: string) => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    setActiveMega(label);
  };

  const handleMegaLeave = () => {
    megaTimeout.current = setTimeout(() => setActiveMega(null), 150);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  return (
    <>
      {/* ── Main Header ─────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-xl shadow-[var(--shadow-md)] border-b border-border/50'
            : 'bg-background border-b border-border'
        }`}
        role="banner"
      >
        <div className="container-main">
          <div className="flex h-[var(--header-height)] items-center gap-4">

            {/* Mobile Menu Toggle */}
            <button
              className="btn-icon lg:hidden text-foreground"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* ── Logo ─────────────────────────────────────────── */}
            <Link href="/" className="flex-shrink-0 mr-4" aria-label="LuxeMarket Home">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                  <span className="font-heading text-lg font-black">L</span>
                </div>
                <span className="hidden font-heading text-xl font-black text-foreground sm:block tracking-tight">
                  Luxe<span className="text-accent">Market</span>
                </span>
              </motion.div>
            </Link>

            {/* ── Desktop Navigation ────────────────────────────── */}
            <nav
              className="hidden lg:flex items-center gap-1 flex-1"
              role="navigation"
              aria-label="Main navigation"
            >
              {NAV_LINKS.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.hasMega && handleMegaEnter(link.label)}
                  onMouseLeave={handleMegaLeave}
                >
                  <Link
                    href={link.href}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
                      transition-colors duration-200 whitespace-nowrap
                      ${pathname.startsWith(link.href) ? 'text-accent' : 'text-foreground'}
                      ${link.accent ? 'text-accent font-semibold' : 'hover:text-accent hover:bg-accent/5'}
                    `}
                    aria-current={pathname.startsWith(link.href) ? 'page' : undefined}
                  >
                    {link.label}
                    {link.hasMega && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                          activeMega === link.label ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </Link>
                </div>
              ))}
            </nav>

            {/* ── Right Actions ─────────────────────────────────── */}
            <div className="flex items-center gap-1 ml-auto">

              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-icon text-foreground hover:bg-muted hidden sm:flex items-center gap-2"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search (Ctrl+K)"
              >
                <Search size={20} />
                <span className="hidden xl:flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-md px-2 py-1">
                  Search<kbd className="bg-muted rounded px-1 font-mono">⌘K</kbd>
                </span>
              </motion.button>

              {/* Dark Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-icon text-foreground hover:bg-muted"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle dark mode"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {theme === 'dark' ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun size={20} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon size={20} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Notifications */}
              {session && (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-icon text-foreground hover:bg-muted relative"
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    aria-label="Notifications"
                  >
                    <Bell size={20} />
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                      3
                    </span>
                  </motion.button>
                  <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
                </div>
              )}

              {/* Wishlist */}
              <Link href="/wishlist" aria-label={`Wishlist (${wishlistCount} items)`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-icon text-foreground hover:bg-muted relative"
                >
                  <Heart size={20} />
                  {wishlistCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center"
                    >
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </motion.span>
                  )}
                </motion.div>
              </Link>

              {/* Cart */}
              <Link href="/cart" aria-label={`Shopping cart (${cartCount} items)`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-icon text-foreground hover:bg-muted relative"
                >
                  <ShoppingBag size={20} />
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center"
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </motion.span>
                  )}
                </motion.div>
              </Link>

              {/* User Menu */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-icon text-foreground hover:bg-muted"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-label="User account"
                >
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="h-7 w-7 rounded-full object-cover ring-2 ring-accent/20"
                    />
                  ) : (
                    <User size={20} />
                  )}
                </motion.button>
                <UserMenu isOpen={isUserMenuOpen} onClose={() => setIsUserMenuOpen(false)} />
              </div>

            </div>
          </div>
        </div>

        {/* ── Mega Menu ─────────────────────────────────────────── */}
        <AnimatePresence>
          {activeMega && (
            <div
              onMouseEnter={() => {
                if (megaTimeout.current) clearTimeout(megaTimeout.current);
                setActiveMega(activeMega);
              }}
              onMouseLeave={handleMegaLeave}
            >
              <MegaMenu category={activeMega} onClose={() => setActiveMega(null)} />
            </div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Search Overlay ─────────────────────────────────────── */}
      <AnimatePresence>
        {isSearchOpen && <SearchOverlay onClose={() => setIsSearchOpen(false)} />}
      </AnimatePresence>

      {/* ── Mobile Menu ────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-[var(--sidebar-width)] bg-background z-50 overflow-y-auto shadow-[var(--shadow-xl)]"
              role="navigation"
              aria-label="Mobile navigation"
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="font-heading font-black text-lg">
                  Luxe<span className="text-accent">Market</span>
                </span>
                <button
                  className="btn-icon"
                  onClick={() => setIsMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="p-4 border-b border-border">
                <button
                  className="input-base text-left flex items-center gap-3 text-muted-foreground"
                  onClick={() => { setIsMobileOpen(false); setIsSearchOpen(true); }}
                >
                  <Search size={16} />
                  Search products...
                </button>
              </div>

              {/* Mobile Nav Links */}
              <div className="p-4 space-y-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium
                        transition-colors ${link.accent ? 'text-accent' : 'text-foreground hover:bg-muted hover:text-accent'}`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Mobile User Actions */}
              <div className="p-4 border-t border-border mt-4">
                {session ? (
                  <div className="space-y-2">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-sm font-medium">
                      <User size={16} /> My Account
                    </Link>
                    <Link href="/wishlist" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-sm font-medium">
                      <Heart size={16} /> Wishlist
                    </Link>
                    <Link href="/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-sm font-medium">
                      <ShoppingBag size={16} /> Orders
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" className="btn btn-primary w-full justify-center">
                      Sign In
                    </Link>
                    <Link href="/register" className="btn btn-outline w-full justify-center">
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
