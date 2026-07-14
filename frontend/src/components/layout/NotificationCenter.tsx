'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Package, Tag, Star, X } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useRef, useEffect } from 'react';

/* ── Mock notification data (replace with API data) ─────────── */
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'ORDER',
    title: 'Order Shipped',
    body: 'Your order #LM-28391 has been shipped and is on its way!',
    link: '/orders/LM-28391',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    icon: Package,
    iconBg: 'bg-blue-500/10 text-blue-500',
  },
  {
    id: '2',
    type: 'PROMOTION',
    title: 'Flash Sale — 60% Off',
    body: 'Limited time offer on premium brands. Ends in 3 hours!',
    link: '/sale',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    icon: Tag,
    iconBg: 'bg-accent/10 text-accent',
  },
  {
    id: '3',
    type: 'REVIEW',
    title: 'Review Request',
    body: 'How was your recent purchase? Share your experience.',
    link: '/dashboard/orders',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    icon: Star,
    iconBg: 'bg-yellow-500/10 text-yellow-500',
  },
];

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * NotificationCenter — Dropdown notification panel with
 * real-time badge count, read/unread states, and actions.
 */
export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
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
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-background border border-border rounded-2xl shadow-[var(--shadow-xl)] overflow-hidden z-50"
          role="dialog"
          aria-label="Notifications"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-foreground" />
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="badge bg-accent text-white">{unreadCount}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs text-accent hover:underline">Mark all read</button>
              <button onClick={onClose} className="btn-icon btn-sm">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-[400px] overflow-y-auto">
            {MOCK_NOTIFICATIONS.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell size={40} className="mb-3 opacity-20" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div>
                {MOCK_NOTIFICATIONS.map((notif) => {
                  const Icon = notif.icon;
                  return (
                    <Link
                      key={notif.id}
                      href={notif.link}
                      onClick={onClose}
                      className={`flex gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0
                        ${!notif.isRead ? 'bg-accent/[0.03]' : ''}`}
                    >
                      {/* Icon */}
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.iconBg}`}>
                        <Icon size={16} />
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium leading-snug ${!notif.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notif.title}
                          </p>
                          {!notif.isRead && (
                            <span className="h-2 w-2 rounded-full bg-accent flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>
                        <p className="text-[11px] text-muted-foreground/70 mt-1">
                          {formatDistanceToNow(notif.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border text-center">
            <Link
              href="/dashboard/notifications"
              onClick={onClose}
              className="text-xs text-accent hover:underline font-medium"
            >
              View all notifications
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
