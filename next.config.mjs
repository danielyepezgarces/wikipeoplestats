/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    'http://localhost:3030',
    '*.wikipeoplestats.org',
    'https://*.wikipeoplestats.org',
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Remove static CORS headers to allow dynamic handling in middleware and API routes
}

export default nextConfig
