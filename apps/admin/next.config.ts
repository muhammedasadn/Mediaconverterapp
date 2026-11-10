import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  transpilePackages: [
    '@universal/ui',
    '@universal/job-contracts',
    '@universal/config-tailwind',
  ],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
