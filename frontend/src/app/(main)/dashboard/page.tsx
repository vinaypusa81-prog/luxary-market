'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User, Package, Heart, MapPin, Wallet, Gift,
  Tag, LifeBuoy, Bell, Power, Shield, Settings,
  ChevronRight, Truck, AlertCircle
} from 'lucide-react';
import { formatPrice } from '@/utils/formatPrice';
import { toast } from 'sonner';

/* ── Dashboard Menu Links ─────────────────────────────────── */
const SIDEBAR_ITEMS = [
  { id: 'profile', icon: User, label: 'Profile Settings', desc: 'Manage your name, email, phone, and avatar' },
  { id: 'orders', icon: Package, label: 'My Orders', desc: 'Track, return, or buy items again' },
  { id: 'wishlist', icon: Heart, label: 'Wishlist', desc: 'Saved items you want to buy later' },
  { id: 'addresses', icon: MapPin, label: 'Saved Addresses', desc: 'Manage delivery addresses' },
  { id: 'wallet', icon: Wallet, label: 'Luxe Wallet', desc: 'Check balance and transaction details' },
  { id: 'coupons', icon: Tag, label: 'My Coupons', desc: 'View collected coupon codes' },
  { id: 'support', icon: LifeBuoy, label: 'Support Tickets', desc: 'Create and check help requests' },
];

const MOCK_ORDERS = [
  { id: 'LM-28391', status: 'Shipped', date: 'July 10, 2026', total: 4799, items: 'Vintage Wash Denim Jacket (M) + Knit Polo' },
  { id: 'LM-27104', status: 'Delivered', date: 'June 28, 2026', total: 2099, items: 'Chikankari Kurta (L)' },
];

/**
 * UserDashboard — Interactive account management panel with tabbed navigation,
 * wallet credit tracking, and detailed order statuses.
 */
export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [userProfile, setUserProfile] = useState({
    name: 'Vinay Kumar',
    email: 'vinay@example.com',
    phone: '9876543210',
    avatar: 'VK',
  });

  return (
    <div className="container-main py-10">
      <div className="grid md:grid-cols-4 gap-8">

        {/* ── Left Sidebar Menu ────────────────────────────────── */}
        <aside className="md:col-span-1 space-y-2 border-r border-border/50 pr-4">
          <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl mb-6">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center text-white font-bold text-lg">
              {userProfile.avatar}
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-sm truncate">{userProfile.name}</h2>
              <p className="text-xs text-muted-foreground truncate">{userProfile.email}</p>
            </div>
          </div>

          <div className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left
                    ${activeTab === item.id
                      ? 'bg-accent text-white shadow-[var(--shadow-accent)]'
                      : 'text-foreground hover:bg-muted hover:text-accent'}`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  <ChevronRight size={14} className="ml-auto opacity-60" />
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── Right Dashboard Content Panels ─────────────────────── */}
        <main className="md:col-span-3">
          <div className="card p-6 min-h-[500px]">

            {activeTab === 'profile' && (
              /* Profile Details Panel */
              <div className="space-y-6">
                <h3 className="text-lg font-bold border-b border-border pb-3">Profile Settings</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-base">Full Name</label>
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="label-base">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={userProfile.email}
                      className="input-base bg-muted/50 cursor-not-allowed opacity-75"
                    />
                  </div>
                  <div>
                    <label className="label-base">Phone Number</label>
                    <input
                      type="tel"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                      className="input-base"
                    />
                  </div>
                </div>
                <button
                  onClick={() => toast.success('Profile settings updated successfully!')}
                  className="btn btn-primary btn-sm mt-4"
                >
                  Save Profile Changes
                </button>
              </div>
            )}

            {activeTab === 'orders' && (
              /* Orders Panel */
              <div className="space-y-6">
                <h3 className="text-lg font-bold border-b border-border pb-3">My Orders</h3>
                <div className="space-y-4">
                  {MOCK_ORDERS.map((order) => (
                    <div key={order.id} className="border border-border p-5 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Order ID: <span className="font-bold text-foreground">{order.id}</span></p>
                        <p className="text-sm font-semibold">{order.items}</p>
                        <p className="text-xs text-muted-foreground">Placed on: {order.date}</p>
                      </div>
                      <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end gap-2">
                        <span className={`badge ${order.status === 'Shipped' ? 'badge-accent' : 'badge-success'}`}>
                          {order.status}
                        </span>
                        <p className="font-bold text-sm">{formatPrice(order.total)}</p>
                        <button className="text-xs text-accent font-semibold hover:underline">Track Order</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'wallet' && (
              /* Wallet Panel */
              <div className="space-y-6">
                <h3 className="text-lg font-bold border-b border-border pb-3">Luxe Wallet</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Balance Card */}
                  <div className="card p-6 bg-gradient-to-br from-accent to-orange-500 text-white flex flex-col justify-between h-40">
                    <div>
                      <p className="text-xs text-white/70 font-semibold uppercase tracking-wider">Available Balance</p>
                      <h4 className="font-heading text-4xl font-black mt-2">{formatPrice(1500)}</h4>
                    </div>
                    <span className="text-xs text-white/80">Premium Credit Account</span>
                  </div>
                  {/* Add balance stub */}
                  <div className="card p-6 flex flex-col justify-between h-40 bg-muted/20 border-dashed">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Top-up Wallet</p>
                      <p className="text-xs text-muted-foreground mt-1">Get instant credit to checkout quickly.</p>
                    </div>
                    <button className="btn btn-primary btn-sm w-full justify-center">Add Funds</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              /* Wishlist Stub Redirect */
              <div className="text-center py-16">
                <Heart size={36} className="mx-auto text-accent mb-4 animate-pulse-glow" />
                <h4 className="font-bold text-lg">My Wishlist</h4>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1 mb-6">
                  You have items saved in your wishlist. Explore and purchase directly.
                </p>
                <Link href="/wishlist" className="btn btn-primary btn-sm">Go to Wishlist</Link>
              </div>
            )}

            {activeTab === 'addresses' && (
              /* Saved Addresses */
              <div className="space-y-6">
                <h3 className="text-lg font-bold border-b border-border pb-3">Saved Addresses</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="border-2 border-accent/20 bg-accent/[0.01] p-5 rounded-2xl relative">
                    <span className="absolute top-4 right-4 badge badge-accent text-[10px]">Default</span>
                    <p className="font-semibold text-sm">{userProfile.name}</p>
                    <p className="text-xs text-muted-foreground mt-2">123, Luxury Building, Bandra West</p>
                    <p className="text-xs text-muted-foreground">Mumbai, Maharashtra - 400050</p>
                    <p className="text-xs text-muted-foreground mt-1">Phone: {userProfile.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'coupons' && (
              /* Coupons */
              <div className="space-y-6">
                <h3 className="text-lg font-bold border-b border-border pb-3">Available Coupons</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="border border-border p-5 rounded-2xl bg-muted/10">
                    <p className="font-bold text-sm text-accent">FREESHIP</p>
                    <p className="text-xs font-semibold mt-1">Free delivery on orders above ₹999</p>
                    <p className="text-[10px] text-muted-foreground mt-3">Valid until: Dec 31, 2026</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'support' && (
              /* Support Tickets */
              <div className="space-y-6">
                <h3 className="text-lg font-bold border-b border-border pb-3">Support Tickets</h3>
                <div className="border border-border p-5 rounded-2xl flex justify-between items-center bg-muted/10">
                  <div>
                    <p className="font-semibold text-sm">Wrong size delivered for #LM-27104</p>
                    <p className="text-xs text-muted-foreground mt-1">Status: <span className="font-bold text-success">Resolved</span></p>
                  </div>
                  <button className="text-xs text-accent font-semibold hover:underline">View Ticket</button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
