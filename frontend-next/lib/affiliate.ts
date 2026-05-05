// Affiliate link configuration per supermarket.
// Direct deal-page URLs are used now. Once approved on Daisycon or Awin,
// replace the `url` values with your tracked affiliate deep-links, e.g.:
//   Daisycon: https://ds1.nl/c/?wi=PUBLISHER_ID&wm=WEBSITE_ID&dl=https://www.ah.nl/bonus
//   Awin:     https://www.awin1.com/cread.php?awinmid=MERCHANT_ID&awinaffid=PUBLISHER_ID&ued=https://www.ah.nl/bonus

interface AffiliateEntry {
  url: string
  rel: string
}

const AFFILIATE_MAP: Record<string, AffiliateEntry> = {
  'Albert Heijn': {
    url: 'https://www.ah.nl/bonus',
    rel: 'noopener noreferrer sponsored',
  },
  Jumbo: {
    url: 'https://www.jumbo.com/aanbiedingen',
    rel: 'noopener noreferrer sponsored',
  },
  Lidl: {
    url: 'https://www.lidl.nl/aanbiedingen',
    rel: 'noopener noreferrer sponsored',
  },
  Dirk: {
    url: 'https://www.dirk.nl/aanbiedingen',
    rel: 'noopener noreferrer sponsored',
  },
  Aldi: {
    url: 'https://www.aldi.nl/aanbiedingen.html',
    rel: 'noopener noreferrer sponsored',
  },
  Plus: {
    url: 'https://www.plus.nl/aanbiedingen',
    rel: 'noopener noreferrer sponsored',
  },
  Hoogvliet: {
    url: 'https://www.hoogvliet.com/aanbiedingen',
    rel: 'noopener noreferrer sponsored',
  },
  Vomar: {
    url: 'https://www.vomar.nl/aanbiedingen',
    rel: 'noopener noreferrer sponsored',
  },
}

export function getAffiliateLink(market: string): AffiliateEntry | null {
  return AFFILIATE_MAP[market] ?? null
}
