/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Environment variables are automatically available via process.env
  // No need to explicitly list them in env: {} for Next.js 13+

  // Using Next.js App Router (app/) for routing
  // All pages are in src/app/ directory with proper Next.js routing
  // Trigger rebuild for Tailwind config updates

  // Image optimization configuration
  images: {
    qualities: [75, 90], // Support both default (75) and high quality (90)
  },

  // Production optimization: Remove console statements in production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Keep console.error and console.warn
    } : false,
  },

  // Rewrite favicon.ico to use the logo image
  async rewrites() {
    return [
      {
        source: '/favicon.ico',
        destination: '/images/zenlink logo.png',
      },
    ];
  },
};

export default nextConfig;

