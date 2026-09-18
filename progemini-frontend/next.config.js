/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output produces a lean self-contained build — smaller image, faster startup
  output: 'standalone',

  // ─── Tree-shake heavy icon/chart packages — cuts bundle by ~40-60% ──────────
  experimental: {
    optimizePackageImports: [
      'react-icons',
      'lucide-react',
      'recharts',
      '@heroicons/react',
    ],
  },

  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: 'localhost', port: '5000' },
      { protocol: 'http', hostname: 'localhost', port: '3000' },
      { protocol: 'http', hostname: '127.0.0.1' },
      { protocol: 'http', hostname: '127.0.0.1', port: '5000' },
      { protocol: 'http', hostname: '127.0.0.1', port: '3000' },
      { protocol: 'https', hostname: 'progemini.academy' },
      { protocol: 'http', hostname: '62.169.25.212' },
      // MinIO server — both HTTP and HTTPS, with explicit port 9000
      { protocol: 'http', hostname: '185.239.208.206' },
      { protocol: 'http', hostname: '185.239.208.206', port: '9000' },
      { protocol: 'https', hostname: '185.239.208.206' },
      { protocol: 'https', hostname: '185.239.208.206', port: '9000' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    formats: ['image/webp'],
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [64, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  reactStrictMode: false,
  swcMinify: true,

  async rewrites() {
    const rawApiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
    // Remove trailing slashes
    const apiBase = rawApiBase.replace(/\/+$/, '');

    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiBase}/v1/:path*`,
      },
      {
        // Proxy all other /api/* calls (excluding /api/auth) directly to backend
        source: '/api/:path((?!auth).*)',
        destination: `${apiBase}/:path*`,
      },
    ];
  },

  productionBrowserSourceMaps: false,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    tsconfigPath: './tsconfig.json',
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
