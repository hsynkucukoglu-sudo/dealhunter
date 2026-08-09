import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16.2.11 (patch bump 2026-07-25) started enforcing this for same-origin
    // URLs with a query string — /api/img-proxy?u=<dynamic> — causing homepage
    // 500s. No `search` field = matches any query string for this pathname
    // (an exact `search` string would only match one hardcoded query, which
    // doesn't work here since ?u= differs per product).
    localPatterns: [
      { pathname: '/api/img-proxy' },
      { pathname: '/api/ah-image/**' },
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // Albert Heijn
      { protocol: 'https', hostname: 'static.ah.nl' },
      { protocol: 'https', hostname: 'api.ah.nl' },
      // Jumbo — dam-images CDN (www.jumbo.com zelf, niet cloudinary — die stond
      // hier ongebruikt; scraper is ooit van CDN gewisseld, config niet bijgewerkt.
      // Alle Jumbo-productafbeeldingen kregen hierdoor stil een 400 via /_next/image
      // en vielen terug op het placeholder-icoon, ontdekt 2026-07-26.
      { protocol: 'https', hostname: 'www.jumbo.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Lidl
      { protocol: 'https', hostname: 'cn-s3-cdn.lidl.nl' },
      { protocol: 'https', hostname: 'assets.lidl-statics.com' },
      // Lidl Nord (Schwarz Group imgproxy — zelfde 2026-07-26 bug als Jumbo)
      { protocol: 'https', hostname: 'imgproxy-retcat.assets.schwarz' },
      // Dirk
      { protocol: 'https', hostname: 'web-fileserver.dirk.nl' },
      // Hoogvliet
      { protocol: 'https', hostname: 'www.hoogvliet.com' },
      // Aldi Nord — productafbeeldingen komen via Scene7, www.aldi.nl is voor
      // andere assets (zelfde 2026-07-26 bug)
      { protocol: 'https', hostname: 'www.aldi.nl' },
      { protocol: 'https', hostname: 's7g10.scene7.com' },
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
      {
        // /contact-us bestaat niet en gaf 404, maar kreeg in Clarity (7 dagen,
        // 2026-08-09) 8 sessies — meer dan de meeste échte pagina's. Er staat
        // nergens in onze code een link naartoe, dus het komt van buiten:
        // affiliate-netwerken controleren standaard /contact-us en /privacy op
        // hun compliance-crawl (admin.affilired.com stond ook in de referrers).
        // Een 404 daar kan een programma-afkeuring opleveren.
        source: '/contact-us',
        destination: '/contact',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
