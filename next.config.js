/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // Allow cross-origin requests from local network
  allowedDevOrigins: ['192.168.100.7', '192.168.100.*', 'localhost'],

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'MarketInStrategy',
    NEXT_PUBLIC_APP_VERSION: '2.1.0',
  },

  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp'],
  },
}

module.exports = nextConfig
