/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Optimize for mobile-first and low-bandwidth
  compress: true,
  poweredByHeader: false,
  // Image optimization
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },
}

module.exports = nextConfig
