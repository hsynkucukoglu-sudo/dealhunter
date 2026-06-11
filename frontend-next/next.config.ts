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
      {
        // Oude platte URL-structuur (404'te) → nieuwe geneste route
        // bv. /blog/beste-deals-week-24-2026 → /blog/beste-deals/week-24-2026
        source: '/blog/beste-deals-:week(week-\\d+-\\d{4})',
        destination: '/blog/beste-deals/:week',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
