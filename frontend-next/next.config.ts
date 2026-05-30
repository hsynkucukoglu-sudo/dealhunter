import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/supermarkt/plus',
        destination: '/',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://dealhunter-production-d900.up.railway.app'
    return {
      beforeFiles: [
        {
          source: '/ads.txt',
          destination: '/api/ads-txt',
        },
      ],
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
