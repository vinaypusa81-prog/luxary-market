'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  User, Package, Heart, MapPin, Wallet, Gift, Star,
  Settings, HelpCircle, LogOut, ChevronRight, Shield
} from 'lucide-react';
import { useEffect, useRef } from 'react';

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { icon: User, label: 'My Profile', href: '/dashboard/profile' },
  { icon: Package, label: 'My Orders', href: '/dashboard/orders' },
  { icon: Heart, label: 'Wishlist', href: '/wishlist' },
  { icon: MapPin, label: 'Addresses', href: '/dashboard/addresses' },
  { icon: Wallet, label: 'Wallet', href: '/dashboard/wallet' },
  { icon: Gift, label: 'Gift Cards', href: '/dashboard/gift-cards' },
  { icon: Star, label: 'Reward Points', href: '/dashboard/rewards' },
  { icon: HelpCircle, label: 'Support', href: '/dashboard/support' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

/**
 * UserMenu — Dropdown account menu with profile info, navigation links,
 * and sign-out option. Closes on outside click.
 */
export function UserMenu({ isOpen, onClose }: UserMenuProps) {
  const { data: session } = useSession();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="absolute right-0 top-full mt-2 w-72 bg-background border border-border rounded-2xl shadow-[var(--shadow-xl)] overflow-hidden z-50"
          role="menu"
          aria-label="User account menu"
        >
          {session ? (
            <>
              {/* Profile header */}
              <div className="flex items-center gap-3 p-4 bg-muted/50">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {session.user?.image ? (
                    <img src={session.user.image} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    session.user?.name?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{session.user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-2">
                {MENU_ITEMS.map(({ icon: Icon, label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted hover:text-accent transition-colors group"
                    role="menuitem"
                  >
                    <Icon size={16} className="text-muted-foreground group-hover:text-accent transition-colors" />
                    {label}
                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
                  </Link>
                ))}
              </div>

              {/* Sign out */}
              <div className="p-2 border-t border-border">
                <button
                  onClick={() => { signOut(); onClose(); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/5 transition-colors w-full"
                  role="menuitem"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            /* Not signed in */
            <div className="p-4 space-y-2">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Sign in to access your account
              </p>
              <Link href="/auth/login" onClick={onClose} className="btn btn-primary w-full justify-center">
                Sign In
              </Link>
              <Link href="/auth/register" onClick={onClose} className="btn btn-outline w-full justify-center">
                Create Account
              </Link>
              <div className="flex items-center gap-2 mt-3 px-2 py-2 rounded-xl bg-muted/50 text-xs text-muted-foreground">
                <Shield size={14} className="text-accent flex-shrink-0" />
                Secure & encrypted login
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
