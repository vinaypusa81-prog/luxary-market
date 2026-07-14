'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/* ── Mega Menu Data ───────────────────────────────────────────── */
const MEGA_MENU_DATA: Record<
  string,
  { title: string; columns: { heading: string; links: { label: string; href: string }[] }[] }
> = {
  Women: {
    title: "Women's Fashion",
    columns: [
      {
        heading: 'Clothing',
        links: [
          { label: 'Kurtas & Suits', href: '/category/women/kurtas' },
          { label: 'Sarees', href: '/category/women/sarees' },
          { label: 'Dresses', href: '/category/women/dresses' },
          { label: 'Tops & Tees', href: '/category/women/tops' },
          { label: 'Jeans', href: '/category/women/jeans' },
          { label: 'Co-ord Sets', href: '/category/women/coord-sets' },
          { label: 'Lehengas', href: '/category/women/lehengas' },
          { label: 'Western Wear', href: '/category/women/western' },
        ],
      },
      {
        heading: 'Footwear',
        links: [
          { label: 'Heels', href: '/category/women/heels' },
          { label: 'Flats', href: '/category/women/flats' },
          { label: 'Sneakers', href: '/category/women/sneakers' },
          { label: 'Boots', href: '/category/women/boots' },
          { label: 'Sandals', href: '/category/women/sandals' },
          { label: 'Wedges', href: '/category/women/wedges' },
        ],
      },
      {
        heading: 'Accessories',
        links: [
          { label: 'Bags & Purses', href: '/category/women/bags' },
          { label: 'Jewellery', href: '/category/women/jewellery' },
          { label: 'Sunglasses', href: '/category/women/sunglasses' },
          { label: 'Watches', href: '/category/women/watches' },
          { label: 'Belts', href: '/category/women/belts' },
          { label: 'Scarves', href: '/category/women/scarves' },
        ],
      },
    ],
  },
  Men: {
    title: "Men's Fashion",
    columns: [
      {
        heading: 'Clothing',
        links: [
          { label: 'T-Shirts', href: '/category/men/tshirts' },
          { label: 'Shirts', href: '/category/men/shirts' },
          { label: 'Jeans', href: '/category/men/jeans' },
          { label: 'Trousers', href: '/category/men/trousers' },
          { label: 'Ethnic Wear', href: '/category/men/ethnic' },
          { label: 'Activewear', href: '/category/men/activewear' },
          { label: 'Jackets', href: '/category/men/jackets' },
          { label: 'Suits', href: '/category/men/suits' },
        ],
      },
      {
        heading: 'Footwear',
        links: [
          { label: 'Sneakers', href: '/category/men/sneakers' },
          { label: 'Formal Shoes', href: '/category/men/formal' },
          { label: 'Loafers', href: '/category/men/loafers' },
          { label: 'Sports Shoes', href: '/category/men/sports' },
          { label: 'Sandals', href: '/category/men/sandals' },
          { label: 'Boots', href: '/category/men/boots' },
        ],
      },
      {
        heading: 'Accessories',
        links: [
          { label: 'Wallets', href: '/category/men/wallets' },
          { label: 'Watches', href: '/category/men/watches' },
          { label: 'Sunglasses', href: '/category/men/sunglasses' },
          { label: 'Belts', href: '/category/men/belts' },
          { label: 'Backpacks', href: '/category/men/backpacks' },
          { label: 'Caps & Hats', href: '/category/men/caps' },
        ],
      },
    ],
  },
  Kids: {
    title: "Kids' Fashion",
    columns: [
      {
        heading: 'Boys (2-8 yrs)',
        links: [
          { label: 'T-Shirts', href: '/category/kids/boys-tshirts' },
          { label: 'Shorts', href: '/category/kids/boys-shorts' },
          { label: 'Jeans', href: '/category/kids/boys-jeans' },
          { label: 'Ethnic Wear', href: '/category/kids/boys-ethnic' },
        ],
      },
      {
        heading: 'Girls (2-8 yrs)',
        links: [
          { label: 'Dresses', href: '/category/kids/girls-dresses' },
          { label: 'Tops', href: '/category/kids/girls-tops' },
          { label: 'Lehengas', href: '/category/kids/girls-lehengas' },
          { label: 'Ethnic Wear', href: '/category/kids/girls-ethnic' },
        ],
      },
      {
        heading: 'Footwear & Accessories',
        links: [
          { label: "Kids' Shoes", href: '/category/kids/shoes' },
          { label: 'School Bags', href: '/category/kids/bags' },
          { label: 'Hair Accessories', href: '/category/kids/accessories' },
        ],
      },
    ],
  },
  'Home & Living': {
    title: 'Home & Living',
    columns: [
      {
        heading: 'Bed & Bath',
        links: [
          { label: 'Bedsheets', href: '/category/home/bedsheets' },
          { label: 'Pillows', href: '/category/home/pillows' },
          { label: 'Towels', href: '/category/home/towels' },
          { label: 'Curtains', href: '/category/home/curtains' },
        ],
      },
      {
        heading: 'Kitchen & Dining',
        links: [
          { label: 'Cookware', href: '/category/home/cookware' },
          { label: 'Dinnerware', href: '/category/home/dinnerware' },
          { label: 'Storage', href: '/category/home/storage' },
        ],
      },
      {
        heading: 'Décor',
        links: [
          { label: 'Wall Art', href: '/category/home/wall-art' },
          { label: 'Candles', href: '/category/home/candles' },
          { label: 'Planters', href: '/category/home/planters' },
          { label: 'Cushions', href: '/category/home/cushions' },
        ],
      },
    ],
  },
};

interface MegaMenuProps {
  category: string;
  onClose: () => void;
}

/**
 * MegaMenu — Full-width dropdown with categorized navigation links.
 * Appears on desktop hover of main nav items.
 */
export function MegaMenu({ category, onClose }: MegaMenuProps) {
  const data = MEGA_MENU_DATA[category];
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="mega-menu"
      role="region"
      aria-label={`${category} mega menu`}
    >
      <div className="container-main py-8">
        <div className="grid grid-cols-4 gap-8">
          {/* Category columns */}
          {data.columns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                {col.heading}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="group flex items-center gap-1.5 text-sm text-foreground hover:text-accent transition-colors duration-150"
                    >
                      <ChevronRight
                        size={12}
                        className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-150 text-accent"
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Featured promo panel */}
          <div className="col-span-1">
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-primary/80 p-6 h-full flex flex-col justify-between">
              <div>
                <span className="badge bg-accent text-white text-[11px] mb-3">
                  New Arrivals
                </span>
                <h4 className="font-heading text-white font-bold text-lg leading-tight">
                  {data.title}
                </h4>
                <p className="text-white/60 text-sm mt-2">
                  Discover the latest trends this season
                </p>
              </div>
              <Link
                href={`/category/${category.toLowerCase().replace(/ /g, '-')}`}
                onClick={onClose}
                className="btn btn-sm bg-white text-primary hover:bg-white/90 mt-4 self-start"
              >
                Shop All
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
