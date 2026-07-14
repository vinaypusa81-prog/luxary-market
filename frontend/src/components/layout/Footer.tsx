import Link from 'next/link';
import {
  Instagram, Twitter, Facebook, Youtube, Mail,
  Phone, MapPin, CreditCard, Shield, Truck, RotateCcw
} from 'lucide-react';

/* ── Footer Link Data ─────────────────────────────────────── */
const FOOTER_LINKS = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Blog', href: '/blog' },
    { label: 'Sustainability', href: '/sustainability' },
  ],
  help: [
    { label: 'Help Center', href: '/help' },
    { label: 'Track Order', href: '/track-order' },
    { label: 'Returns & Exchanges', href: '/returns' },
    { label: 'Shipping Policy', href: '/shipping' },
    { label: 'Size Guide', href: '/size-guide' },
    { label: 'Contact Us', href: '/contact' },
  ],
  policies: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Refund Policy', href: '/refunds' },
    { label: 'Seller Policy', href: '/seller-policy' },
  ],
  selling: [
    { label: 'Sell on LuxeMarket', href: '/seller/register' },
    { label: 'Seller Dashboard', href: '/seller' },
    { label: 'Seller Help', href: '/seller/help' },
    { label: 'Affiliate Program', href: '/affiliate' },
    { label: 'Advertise', href: '/advertise' },
  ],
};

const SOCIAL_LINKS = [
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
];

const TRUST_BADGES = [
  { icon: Truck, label: 'Free Shipping', desc: 'On orders over ₹999' },
  { icon: RotateCcw, label: 'Easy Returns', desc: '30-day return policy' },
  { icon: Shield, label: '100% Authentic', desc: 'Genuine products only' },
  { icon: CreditCard, label: 'Secure Payment', desc: 'SSL encrypted checkout' },
];

const PAYMENT_METHODS = [
  'Visa', 'Mastercard', 'UPI', 'PayPal', 'Stripe', 'Razorpay'
];

/**
 * Footer — Comprehensive multi-column footer with trust badges,
 * social links, newsletter, payment icons, and legal links.
 */
export function Footer() {
  return (
    <footer className="bg-primary text-white" role="contentinfo">

      {/* ── Trust Badges ──────────────────────────────────────── */}
      <div className="border-b border-white/10">
        <div className="container-main py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_BADGES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-white/50">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Footer Content ─────────────────────────────── */}
      <div className="container-main py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">

          {/* Brand Column */}
          <div className="col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center">
                <span className="font-heading text-lg font-black text-white">L</span>
              </div>
              <span className="font-heading text-xl font-black">
                Luxe<span className="text-accent">Market</span>
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
              India&apos;s premium fashion marketplace. Discover luxury brands, latest trends,
              and exclusive collections curated just for you.
            </p>

            {/* Contact info */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Mail size={14} className="text-accent" />
                <span>support@luxemarket.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Phone size={14} className="text-accent" />
                <span>1800-123-4567 (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <MapPin size={14} className="text-accent" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center
                    hover:bg-accent transition-colors duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Company</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Help</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.help.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Policies</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.policies.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Sell</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.selling.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Newsletter mini */}
            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Newsletter</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 min-w-0 rounded-xl bg-white/10 border border-white/10 px-3 py-2
                    text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-1
                    focus:ring-accent"
                  aria-label="Email for newsletter"
                />
                <button className="btn btn-accent btn-sm flex-shrink-0">
                  <Mail size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ─────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="container-main py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} LuxeMarket. All rights reserved.
          </p>

          {/* Payment icons */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 rounded-md bg-white/10 text-[11px] text-white/50 font-medium border border-white/10"
              >
                {method}
              </span>
            ))}
          </div>

          <p className="text-xs text-white/40">
            Made with ❤️ in India
          </p>
        </div>
      </div>
    </footer>
  );
}
