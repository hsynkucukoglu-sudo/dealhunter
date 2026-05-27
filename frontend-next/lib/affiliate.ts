// Daisycon tracked deeplinks — Publisher ID: 51adealhu, Media ID: 478402
// Format: https://ds1.nl/c/?wi=51adealhu&wm=478402&dl=DESTINATION

const WI = '51adealhu'
const WM = '478402'
const dc = (dl: string) => `https://ds1.nl/c/?wi=${WI}&wm=${WM}&dl=${encodeURIComponent(dl)}`

interface AffiliateEntry {
  url: string
  rel: string
}

const AFFILIATE_MAP: Record<string, AffiliateEntry> = {
  'Albert Heijn': {
    url: dc('https://www.ah.nl/bonus'),
    rel: 'noopener noreferrer sponsored',
  },
  Jumbo: {
    url: dc('https://www.jumbo.com/aanbiedingen'),
    rel: 'noopener noreferrer sponsored',
  },
  Lidl: {
    url: dc('https://www.lidl.nl/aanbiedingen'),
    rel: 'noopener noreferrer sponsored',
  },
  Dirk: {
    url: dc('https://www.dirk.nl/aanbiedingen'),
    rel: 'noopener noreferrer sponsored',
  },
  Aldi: {
    url: dc('https://www.aldi.nl/aanbiedingen.html'),
    rel: 'noopener noreferrer sponsored',
  },
  Hoogvliet: {
    url: dc('https://www.hoogvliet.com/aanbiedingen'),
    rel: 'noopener noreferrer sponsored',
  },
  Vomar: {
    url: dc('https://www.vomar.nl/aanbiedingen'),
    rel: 'noopener noreferrer sponsored',
  },
  DekaMarkt: {
    url: dc('https://www.dekamarkt.nl/aanbiedingen'),
    rel: 'noopener noreferrer sponsored',
  },
}

export function getAffiliateLink(market: string): AffiliateEntry | null {
  return AFFILIATE_MAP[market] ?? null
}
