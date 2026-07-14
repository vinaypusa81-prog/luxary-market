import type { Metadata } from 'next';
import { HeroBanner } from '@/features/home/components/HeroBanner';
import { AnnouncementTicker } from '@/features/home/components/AnnouncementTicker';
import { FeaturedCategories } from '@/features/home/components/FeaturedCategories';
import { TrendingProducts } from '@/features/home/components/TrendingProducts';
import { FlashSaleSection } from '@/features/home/components/FlashSaleSection';
import { NewArrivals } from '@/features/home/components/NewArrivals';
import { FeaturedBrands } from '@/features/home/components/FeaturedBrands';
import { LuxuryCollections } from '@/features/home/components/LuxuryCollections';
import { TodaysDeals } from '@/features/home/components/TodaysDeals';
import { AiRecommendations } from '@/features/home/components/AiRecommendations';
import { TopSelling } from '@/features/home/components/TopSelling';
import { CustomerReviews } from '@/features/home/components/CustomerReviews';
import { PremiumMembershipBanner } from '@/features/home/components/PremiumMembershipBanner';
import { FeaturedDesigners } from '@/features/home/components/FeaturedDesigners';
import { FashionBlog } from '@/features/home/components/FashionBlog';
import { NewsletterSection } from '@/features/home/components/NewsletterSection';

export const metadata: Metadata = {
  title: 'LuxeMarket — Premium Fashion eCommerce | Shop Latest Trends',
  description:
    'Shop the latest fashion trends at LuxeMarket. Discover premium brands, luxury collections, exclusive deals and free shipping on orders above ₹999.',
};

/**
 * Homepage — Server component orchestrating all landing page sections.
 * Each section is independently loaded for optimal performance.
 */
export default function HomePage() {
  return (
    <>
      {/* 1. Hero Banner — Full-width animated hero */}
      <HeroBanner />

      {/* 2. Announcement ticker strip */}
      <AnnouncementTicker />

      {/* 3. Flash Sale with countdown timer */}
      <FlashSaleSection />

      {/* 4. Featured Categories grid */}
      <FeaturedCategories />

      {/* 5. Today's Deals — curated discounts */}
      <TodaysDeals />

      {/* 6. Trending Products carousel */}
      <TrendingProducts />

      {/* 7. Luxury Collections editorial layout */}
      <LuxuryCollections />

      {/* 8. New Arrivals */}
      <NewArrivals />

      {/* 9. AI Recommendations (personalized) */}
      <AiRecommendations />

      {/* 10. Featured Brands */}
      <FeaturedBrands />

      {/* 11. Featured Designers */}
      <FeaturedDesigners />

      {/* 12. Top Selling */}
      <TopSelling />

      {/* 13. Premium Membership Banner */}
      <PremiumMembershipBanner />

      {/* 14. Customer Reviews */}
      <CustomerReviews />

      {/* 15. Fashion Blog */}
      <FashionBlog />

      {/* 16. Newsletter signup */}
      <NewsletterSection />
    </>
  );
}
