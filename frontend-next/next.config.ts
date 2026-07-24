import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // Albert Heijn
      { protocol: 'https', hostname: 'static.ah.nl' },
      { protocol: 'https', hostname: 'api.ah.nl' },
      // Jumbo
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Lidl
      { protocol: 'https', hostname: 'cn-s3-cdn.lidl.nl' },
      { protocol: 'https', hostname: 'assets.lidl-statics.com' },
      // Dirk
      { protocol: 'https', hostname: 'web-fileserver.dirk.nl' },
      // Hoogvliet
      { protocol: 'https', hostname: 'www.hoogvliet.com' },
      // Aldi
      { protocol: 'https', hostname: 'www.aldi.nl' },
      // Vomar
      { protocol: 'https', hostname: 'd3vricquk1sjgf.cloudfront.net' },
      // DekaMarkt
      { protocol: 'https', hostname: 'web-fileserver.dekamarkt.nl' },
      // Plus (Contentful CDN)
      { protocol: 'https', hostname: 'images.ctfassets.net' },
      // Kruidvat
      { protocol: 'https', hostname: 'media.kruidvat.nl' },
      // Open Food Facts
      { protocol: 'https', hostname: 'images.openfoodfacts.org' },
      { protocol: 'https', hostname: 'static.openfoodfacts.org' },
    ],
  },
  async redirects() {
    return [
      {
        // Oude platte URL-structuur (404'te) → nieuwe geneste route
        // bv. /blog/beste-deals-week-24-2026 → /blog/beste-deals/week-24-2026
        source: '/blog/beste-deals-:week(week-\\d+-\\d{4})',
        destination: '/blog/beste-deals/:week',
        permanent: true,
      },
      {
        // Keyword-kannibalisatie opgelost (2026-07-24): twee posts streden om
        // dezelfde "is jumbo goedkoper dan AH"-cluster en bleven allebei steken
        // op positie ~6,6-7,0. De unieke FAQ's zijn samengevoegd in de sterkere
        // post (18x meer clicks); deze slug redirect permanent daarheen.
        source: '/blog/is-jumbo-goedkoper-dan-albert-heijn',
        destination: '/blog/albert-heijn-vs-jumbo-vs-lidl-wie-is-goedkoper',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
