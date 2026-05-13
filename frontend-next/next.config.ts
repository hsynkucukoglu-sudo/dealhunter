import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://dealhunter-production-d900.up.railway.app'
    return {
      fallback: [
        {
          source: '/api/:path*',
          destination: `${apiBase}/api/:path*`,
        },
      ],
    }
  },
};

export default nextConfig;
