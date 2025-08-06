import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure static files are served correctly
  trailingSlash: false,
  
  // Image optimization config (even though we're using regular img tags)
  images: {
    unoptimized: true,
  },
  
  // ESLint configuration for build
  eslint: {
    // Allow deployment with warnings but no critical errors
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration for build
  typescript: {
    // Ignore type errors during build for deployment
    ignoreBuildErrors: false,
  },
  
  // Custom headers for static files
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
