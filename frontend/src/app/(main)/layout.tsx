import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/features/cart/components/CartDrawer';

/**
 * Main app layout — wraps all public-facing pages with header, footer,
 * announcement bar, and cart drawer overlay.
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Top announcement/flash sale ticker */}
      <AnnouncementBar />
      {/* Sticky navigation header */}
      <Header />
      {/* Main page content */}
      <main className="flex-1" id="main-content">
        {children}
      </main>
      {/* Footer */}
      <Footer />
      {/* Cart slide-over drawer (rendered outside main for z-index) */}
      <CartDrawer />
    </div>
  );
}
