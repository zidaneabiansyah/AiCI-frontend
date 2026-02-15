import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';
import withSerwistInit from "@serwist/next";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  register: false, // We'll register manually in PWARegistration component
});

const nextConfig: NextConfig = {
  // Performance optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  // Turbopack config (empty to suppress warning)
  turbopack: {},
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'aici-umg.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '10.10.227.178',
        port: '8000',
        pathname: '/**',
      },
    ],
  },
  
  // Experimental features for performance
  experimental: {
    optimizePackageImports: ['recharts', 'react-hot-toast', '@dnd-kit/core'],
  },
};

export default withSerwist(bundleAnalyzer(nextConfig));
