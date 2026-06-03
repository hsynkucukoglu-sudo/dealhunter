// Direct links to supermarket offer pages.
// Daisycon tracking (ds1.nl) was causing redirects to manymorestores.com
// because the publisher programs are not yet approved. Restore Daisycon
// wrapping once programs are fully approved in the Daisycon dashboard.

interface AffiliateEntry {
  url: string
  rel: string
}

const AFFILIATE_MAP: Record<string, AffiliateEntry> = {
  'Albert Heijn': {
    url: 'https://www.ah.nl/bonus',
    rel: 'noopener noreferrer',
  },
  Jumbo: {
    url: 'https://www.jumbo.com/aanbiedingen',
    rel: 'noopener noreferrer',
  },
  Lidl: {
    url: 'https://www.lidl.nl/aanbiedingen',
    rel: 'noopener noreferrer',
  },
  Dirk: {
    url: 'https://www.dirk.nl/aanbiedingen',
    rel: 'noopener noreferrer',
  },
  Aldi: {
    url: 'https://www.aldi.nl/aanbiedingen.html',
    rel: 'noopener noreferrer',
  },
  Hoogvliet: {
    url: 'https://www.hoogvliet.com/aanbiedingen',
    rel: 'noopener noreferrer',
  },
  Vomar: {
    url: 'https://www.vomar.nl/aanbiedingen',
    rel: 'noopener noreferrer',
  },
  DekaMarkt: {
    url: 'https://www.dekamarkt.nl/aanbiedingen',
    rel: 'noopener noreferrer',
  },
}

export function getAffiliateLink(market: string): AffiliateEntry | null {
  return AFFILIATE_MAP[market] ?? null
}
