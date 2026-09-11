/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output produces a lean self-contained build — smaller image, faster startup
  output: 'standalone',

  // ─── Turbopack (dev only): Rust-based bundler, up to 10x faster HMR ────────
  // Enabled by default when running: next dev --turbo
  // No config needed here; set via dev script in package.json

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
      { protocol: 'https', hostname: 'progemini.academy' },
      { protocol: 'http', hostname: '62.169.25.212' },
      // MinIO server — both HTTP and HTTPS, with explicit port 9000
      { protocol: 'http', hostname: '185.239.208.206' },
      { protocol: 'http', hostname: '185.239.208.206', port: '9000' },
      { protocol: 'https', hostname: '185.239.208.206' },
      { protocol: 'https', hostname: '185.239.208.206', port: '9000' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    formats: ['image/webp'],       // Drop avif — slower to encode, not worth it
    deviceSizes: [640, 828, 1080, 1200, 1920],  // Dropped 750 (rarely matched)
    imageSizes: [64, 128, 256, 384],            // Only sizes actually used in UI
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  reactStrictMode: false,  // Disable double-render in dev — halves render calls locally
  swcMinify: true,

  async rewrites() {
    return [
      {
        source: '/api/files/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/v1/files/:path*`,
      },
    ];
  },

  // Don't emit source maps in production — reduces deploy bundle by ~30%
  productionBrowserSourceMaps: false,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    tsconfigPath: './tsconfig.json',
    // Skip type checking during build — run 'npx tsc --noEmit' manually
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
