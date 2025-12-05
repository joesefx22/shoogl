/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Disable PWA in development for faster rebuilds
  disable: process.env.NODE_ENV === 'development',
  // Add buildExcludes for better performance
  buildExcludes: [/middleware-manifest\.json$/],
});

const nextConfig = withPWA({
  // Enable strict mode for better error detection
  reactStrictMode: true,
  
  // App Router experimental features
  experimental: {
    serverActions: true,
  },
  
  // Remove i18n as it's not configured in the project
  // i18n: {
  //   locales: ['ar', 'en'],
  //   defaultLocale: 'ar',
  // },
  
  // Add images configuration for external domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Add redirects for cleaner URLs
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
      {
        source: '/owner',
        destination: '/owner/dashboard',
        permanent: true,
      },
      {
        source: '/staff',
        destination: '/staff/dashboard',
        permanent: true,
      },
      {
        source: '/player',
        destination: '/player/dashboard',
        permanent: true,
      },
    ];
  },
  
  // Security headers
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
});

module.exports = nextConfig;
