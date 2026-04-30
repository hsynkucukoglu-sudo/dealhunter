import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://dealhunter-production-d900.up.railway.app'
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
    ]
  },
};

export default nextConfig;
