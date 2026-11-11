import type { NextConfig } from 'next';

const isStandalone = process.env.BUILD_STANDALONE === 'true';
const isStaticExport = process.env.STATIC_EXPORT === 'true' || process.env.NODE_ENV === 'production' && !isStandalone;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  output: isStandalone ? 'standalone' : 'export',
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    '@universal/ui',
    '@universal/conversion-core',
    '@universal/format-registry',
    '@universal/job-contracts',
    '@universal/config-tailwind',
    '@universal/i18n',
  ],
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@universal/ui'],
  },
  ...(isStaticExport
    ? {}
    : {
        async headers() {
          return [
            {
              source: '/(.*)',
              headers: [
                {
                  key: 'Cross-Origin-Opener-Policy',
                  value: 'same-origin',
                },
                {
                  key: 'Cross-Origin-Embedder-Policy',
                  value: 'require-corp',
                },
                {
                  key: 'X-Content-Type-Options',
                  value: 'nosniff',
                },
                {
                  key: 'X-Frame-Options',
                  value: 'DENY',
                },
                {
                  key: 'Referrer-Policy',
                  value: 'strict-origin-when-cross-origin',
                },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
