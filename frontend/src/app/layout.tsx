import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Toaster } from 'sonner';

/* ── Google Fonts ─────────────────────────────────────────────── */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

/* ── SEO Metadata ─────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: 'LuxeMarket — Premium Fashion eCommerce',
    template: '%s | LuxeMarket',
  },
  description:
    'Discover the finest fashion brands and luxury collections. Shop the latest trends in clothing, shoes, accessories and more at LuxeMarket.',
  keywords: [
    'fashion',
    'ecommerce',
    'luxury',
    'clothing',
    'shoes',
    'accessories',
    'brands',
    'online shopping',
    'premium fashion',
  ],
  authors: [{ name: 'LuxeMarket' }],
  creator: 'LuxeMarket',
  publisher: 'LuxeMarket',
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://luxemarket.com'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: 'LuxeMarket',
    title: 'LuxeMarket — Premium Fashion eCommerce',
    description:
      'Discover the finest fashion brands and luxury collections. Shop the latest trends.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'LuxeMarket — Premium Fashion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LuxeMarket — Premium Fashion eCommerce',
    description: 'Discover premium fashion brands and luxury collections.',
    images: ['/og-image.jpg'],
    creator: '@luxemarket',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0d0d' },
  ],
};

/* ── Root Layout ──────────────────────────────────────────────── */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <QueryProvider>
              {children}
              {/* Toast notifications */}
              <Toaster
                position="top-right"
                richColors
                closeButton
                toastOptions={{
                  duration: 4000,
                  classNames: {
                    toast: 'font-sans',
                  },
                }}
              />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
