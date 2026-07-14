import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import {
  LayoutDashboard, ShoppingBag, FolderTree, Tag, PackageOpen,
  Users, Ticket, Image, MessageSquare, Settings, LogOut,
  Menu, Bell, Sun, Moon, ChevronLeft, ChevronRight, X, Info, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAllRead, activeToast } = useSocket();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: ShoppingBag },
    { name: 'Categories', path: '/categories', icon: FolderTree },
    { name: 'Brands', path: '/brands', icon: Tag },
    { name: 'Orders', path: '/orders', icon: PackageOpen },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Coupons', path: '/coupons', icon: Ticket },
    { name: 'Banners', path: '/banners', icon: Image },
    { name: 'Reviews', path: '/reviews', icon: MessageSquare },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // Breadcrumbs builder
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      
      {/* ── Collapsible Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 bg-card border-r border-border transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Logo and collapse button */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white font-heading font-black text-xl shadow-[0_4px_12px_rgba(139,0,0,0.3)]">
                  L
                </div>
                {!sidebarCollapsed && (
                  <span className="font-heading font-bold text-lg tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">LuxeMarket</span>
                )}
              </Link>
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1 rounded-lg hover:bg-muted/15 border border-border">
                {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>

            {/* Navigation links */}
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive 
                        ? 'bg-primary text-white shadow-[0_4px_12px_rgba(139,0,0,0.2)]' 
                        : 'text-muted hover:bg-muted/10 hover:text-foreground'
                    }`}
                  >
                    <Icon size={18} />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Signout Footer */}
          <div className="p-4 border-t border-border">
            <button onClick={handleLogout} className="flex items-center gap-4 w-full px-4 py-3 text-red-500 rounded-xl hover:bg-red-500/10 text-sm font-semibold transition-all">
              <LogOut size={18} />
              {!sidebarCollapsed && <span>Log Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Layout Wrapper ── */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'pl-20' : 'pl-64'}`}>
        
        {/* ── Top Navbar ── */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-card/80 backdrop-blur-md border-b border-border shadow-premium">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-muted">
            <Link to="/dashboard" className="hover:text-primary">Admin</Link>
            {pathnames.map((name, index) => {
              const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
              const isLast = index === pathnames.length - 1;
              return (
                <span key={name} className="flex items-center gap-2 capitalize">
                  <span>/</span>
                  {isLast ? (
                    <span className="text-foreground font-bold">{name}</span>
                  ) : (
                    <Link to={routeTo} className="hover:text-primary">{name}</Link>
                  )}
                </span>
              );
            })}
          </div>

          {/* Actions: Theme, Notifications, Profile */}
          <div className="flex items-center gap-4">

            {/* Quick Create Button */}
            <div className="relative">
              <button
                id="quick-create-btn"
                onClick={() => { setShowQuickCreate(!showQuickCreate); setShowNotifications(false); setShowProfileDropdown(false); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-[0_4px_12px_rgba(139,0,0,0.25)] hover:opacity-90 transition-all"
              >
                <Plus size={14} /> Create New
              </button>

              <AnimatePresence>
                {showQuickCreate && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.97 }}
                    className="absolute right-0 mt-3 w-52 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden py-1"
                  >
                    <p className="text-[10px] font-extrabold text-muted uppercase tracking-wider px-4 pt-3 pb-1">Quick Create</p>
                    {[
                      { label: 'New Product', path: '/products', icon: ShoppingBag },
                      { label: 'New Category', path: '/categories', icon: FolderTree },
                      { label: 'New Brand', path: '/brands', icon: Tag },
                      { label: 'New Coupon', path: '/coupons', icon: Ticket },
                      { label: 'New Banner', path: '/banners', icon: Image },
                    ].map(({ label, path, icon: Icon }) => (
                      <button
                        key={label}
                        onClick={() => {
                          setShowQuickCreate(false);
                          navigate(path);
                          // Dispatch custom event so pages can open their create modal
                          window.dispatchEvent(new CustomEvent('quickCreate', { detail: { path } }));
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-semibold hover:bg-muted/10 transition-colors"
                      >
                        <Icon size={14} className="text-primary" />
                        {label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 rounded-xl border border-border hover:bg-muted/10 transition-colors">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setShowProfileDropdown(false); }}
                className="p-2 rounded-xl border border-border hover:bg-muted/10 transition-colors relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-4 border-b border-border bg-muted/10">
                      <span className="font-bold text-sm">Real-time Activity</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-primary font-semibold hover:underline">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted">No recent notifications.</div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n._id} className={`p-4 border-b border-border/50 text-xs transition-colors hover:bg-muted/5 ${!n.isRead ? 'bg-primary/5 font-semibold' : ''}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-primary uppercase tracking-wider text-[10px] font-extrabold">{n.type.replace('_', ' ')}</span>
                              <span className="text-[10px] text-muted">{new Date(n.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-foreground">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Trigger */}
            <div className="relative">
              <button 
                onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowNotifications(false); }}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-border hover:bg-muted/10 transition-colors"
              >
                <div className="h-7 w-7 rounded-lg bg-primary text-white font-bold flex items-center justify-center text-xs">
                  {user?.name.charAt(0) || 'A'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold leading-tight">{user?.name}</p>
                  <p className="text-[9px] text-muted capitalize">{user?.role.toLowerCase()}</p>
                </div>
              </button>

              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-48 bg-card border border-border rounded-xl shadow-xl z-50 py-1"
                  >
                    <Link to="/settings" onClick={() => setShowProfileDropdown(false)} className="flex items-center gap-3 px-4 py-2 text-xs font-semibold hover:bg-muted/10">
                      <Settings size={14} /> Account Settings
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10">
                      <LogOut size={14} /> Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* ── Content View ── */}
        <main className="flex-grow p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ── Floating Real-time Toast Popup ── */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50 max-w-sm w-full bg-card border-l-4 border-l-primary border border-border rounded-xl shadow-2xl p-4 flex gap-4 items-start"
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground mb-0.5">{activeToast.title}</h4>
              <p className="text-xs text-muted leading-relaxed">{activeToast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
export { LayoutDashboard, ShoppingBag, FolderTree, Tag, PackageOpen, Users, Ticket, Image, MessageSquare, Settings };
