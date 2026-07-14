import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable standalone output for Docker production builds
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  // Image optimization — allow external image domains
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 's3.amazonaws.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },  // Google avatars
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Silences the custom webpack warning by defining empty turbopack config
  turbopack: {},

  // Experimental features
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
    ],
  },

  // Environment variables exposed to browser
  env: {
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
      { source: '/shop', destination: '/category/all', permanent: false },
    ];
  },
};

export default nextConfig;
