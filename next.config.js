/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  
  // CRITICAL: Skip middleware completely
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  
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
