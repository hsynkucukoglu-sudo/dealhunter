// ============================================================
// AFFILIATE CONFIG — onay gelince tek hamlede aç
// ============================================================
// AKTİF ETME (bir market kampanyası onaylanınca):
//   1. Aşağıya publisher kimliğini gir (DAISYCON_MEDIA_ID veya AWIN_PUBLISHER_ID)
//   2. Onaylanan market için `network` ('daisycon' | 'awin') + `programId` ata
//   3. Deploy et. Linkler otomatik tracking'e sarılır; başka değişiklik gerekmez.
// O ana kadar her market düz (tracking'siz) link olarak çalışır.

// --- Publisher kimlikleri (onaydan sonra bir kez doldur) ---
const DAISYCON_MEDIA_ID   = '16070'   // Daisycon "si" — publisher id
const DAISYCON_WEBSITE_ID = '420902'  // Daisycon "wi" — website id
const AWIN_PUBLISHER_ID   = '2932569' // Awin "awinaffid"
const BOL_SITE_ID         = '1527078' // Bol.com partner "s" — site id

export type AffiliateNetwork = 'daisycon' | 'awin' | 'bol' | 'direct'

interface MarketAffiliate {
  /** Kullanıcının indiği nihai sayfa (aanbiedingen). */
  destinationUrl: string
  /** Bu marketi hangi ağ yönetiyor. 'direct' = henüz tracking yok. */
  network: AffiliateNetwork
  /** Daisycon "li" (program id) veya Awin "awinmid" (merchant id). Onaya kadar boş. */
  programId?: string
  rel: string
}

export interface AffiliateEntry {
  url: string
  rel: string
}

const REL = 'noopener noreferrer sponsored'

// Tek doğruluk kaynağı — hem ProductCard hem /go buradan beslenir.
const AFFILIATE_MAP: Record<string, MarketAffiliate> = {
  'Albert Heijn': { destinationUrl: 'https://www.ah.nl/bonus', network: 'direct', rel: REL },
  Jumbo: { destinationUrl: 'https://www.jumbo.com/aanbiedingen', network: 'direct', rel: REL },
  Lidl: { destinationUrl: 'https://www.lidl.nl/aanbiedingen', network: 'direct', rel: REL },
  Dirk: { destinationUrl: 'https://www.dirk.nl/aanbiedingen', network: 'direct', rel: REL },
  Aldi: { destinationUrl: 'https://www.aldi.nl/aanbiedingen.html', network: 'direct', rel: REL },
  Hoogvliet: { destinationUrl: 'https://www.hoogvliet.com/aanbiedingen', network: 'direct', rel: REL },
  Vomar: { destinationUrl: 'https://www.vomar.nl/aanbiedingen', network: 'direct', rel: REL },
  DekaMarkt: { destinationUrl: 'https://www.dekamarkt.nl/aanbiedingen', network: 'direct', rel: REL },
  Coop: { destinationUrl: 'https://www.coop.nl/aanbiedingen', network: 'direct', rel: REL },
  Plus: { destinationUrl: 'https://www.plus.nl/aanbiedingen', network: 'direct', rel: REL },
  Kruidvat: { destinationUrl: 'https://www.kruidvat.nl/aanbiedingen', network: 'direct', rel: REL },
  // Flink App (NL) — Daisycon onaylı, deeplink ad ID 1691645 (program si=16070, tracking: jf79.net)
  Flink: { destinationUrl: 'https://www.goflink.com/', network: 'daisycon', programId: '1691645', rel: REL },
  // Holland & Barrett NL — Awin onaylı 2026-06-22 (merchant ID 8108)
  'Holland & Barrett': { destinationUrl: 'https://www.hollandandbarrett.nl/aanbiedingen', network: 'awin', programId: '8108', rel: REL },
  // Bol.com — kendi partner ağı, site ID 1527078 (dealhunter4u.nl)
  'Bol.com': { destinationUrl: 'https://www.bol.com/', network: 'bol', rel: REL },

  // ── Awin — 2026-06-25 onaylı ──────────────────────────────────────────────
  // BioProphyl NL-BE (aid: 22561) — sağlık takviyeleri
  BioProphyl: { destinationUrl: 'https://www.bioprophyl.com/', network: 'awin', programId: '22561', rel: REL },
  // Eonon (awinmid: 2471) — araç içi elektronik, %3 komisyon, 30 gün cookie
  Eonon: { destinationUrl: 'https://www.eonon.com/', network: 'awin', programId: '2471', rel: REL },

  // ── Daisycon — 2026-06-25 onaylı ──────────────────────────────────────────
  // Plein.nl (li: 3366) — online eczane / sağlık & güzellik
  'Plein.nl': { destinationUrl: 'https://www.plein.nl/', network: 'daisycon', programId: '3366', rel: REL },
  // Plein.be (li: 14720) — Belçika versiyonu
  'Plein.be': { destinationUrl: 'https://www.plein.be/', network: 'daisycon', programId: '14720', rel: REL },
  // Petgamma (li: 20686) — online evcil hayvan mağazası
  Petgamma: { destinationUrl: 'https://www.petgamma.com/', network: 'daisycon', programId: '20686', rel: REL },
  // Leukstetickets (li: 15805) — etkinlik biletleri
  Leukstetickets: { destinationUrl: 'https://www.leukstetickets.nl/', network: 'daisycon', programId: '15805', rel: REL },
  // AD Webwinkel (li: 13048) — AD gazete webshop
  'AD Webwinkel': { destinationUrl: 'https://adwebwinkel.nl/', network: 'daisycon', programId: '13048', rel: REL },
  // Volkskrant Webwinkel (li: 15810) — De Volkskrant webshop
  'Volkskrant Webwinkel': { destinationUrl: 'https://webwinkel.volkskrant.nl/', network: 'daisycon', programId: '15810', rel: REL },
  // Nu.nl Shop (li: 15818) — Nu.nl webshop
  'Nu.nl Shop': { destinationUrl: 'https://shop.nu.nl/', network: 'daisycon', programId: '15818', rel: REL },
  // Libelle Shop (li: 15819) — Libelle magazine webshop
  'Libelle Shop': { destinationUrl: 'https://shop.libelle.nl/', network: 'daisycon', programId: '15819', rel: REL },
  // XLLease (li: 20255) — auto lease
  XLLease: { destinationUrl: 'https://www.xllease.nl/', network: 'daisycon', programId: '20255', rel: REL },
  // DutchLease (li: 20456) — auto lease
  DutchLease: { destinationUrl: 'https://www.dutchlease.nl/', network: 'daisycon', programId: '20456', rel: REL },
  // XLEasy (li: 15775) — internet / telecom
  XLEasy: { destinationUrl: 'https://www.xlease.com/', network: 'daisycon', programId: '15775', rel: REL },
  // Ziggo via Meervoordeel (li: 17174) — internet & tv aboneliği
  Ziggo: { destinationUrl: 'https://www.ziggo.nl/', network: 'daisycon', programId: '17174', rel: REL },
  // Vattenfall via Meervoordeel (li: 21044) — energie
  Vattenfall: { destinationUrl: 'https://www.vattenfall.nl/', network: 'daisycon', programId: '21044', rel: REL },
  // hollandsnieuwe via Meervoordeel (li: 21994) — sim-only / telecom
  hollandsnieuwe: { destinationUrl: 'https://www.hollandsnieuwe.nl/', network: 'daisycon', programId: '21994', rel: REL },
}

/** Hedef URL'i yapılandırılmış ağın tracking deeplink'ine sarar. */
export function wrapAffiliate(entry: MarketAffiliate): string {
  const dl = encodeURIComponent(entry.destinationUrl)
  if (entry.network === 'daisycon' && DAISYCON_MEDIA_ID && entry.programId) {
    const wi = DAISYCON_WEBSITE_ID ? `&wi=${DAISYCON_WEBSITE_ID}` : ''
    return `https://ds1.nl/c/?si=${DAISYCON_MEDIA_ID}&li=${entry.programId}${wi}&dl=${dl}`
  }
  if (entry.network === 'awin' && AWIN_PUBLISHER_ID && entry.programId) {
    return `https://www.awin1.com/cread.php?awinmid=${entry.programId}&awinaffid=${AWIN_PUBLISHER_ID}&ued=${dl}`
  }
  if (entry.network === 'bol' && BOL_SITE_ID) {
    return `https://partner.bol.com/click/click?p=2&t=url&s=${BOL_SITE_ID}&url=${dl}`
  }
  return entry.destinationUrl
}

/** ProductCard buton kapısı + link değeri. */
export function getAffiliateLink(market: string): AffiliateEntry | null {
  const entry = AFFILIATE_MAP[market]
  if (!entry) return null
  return { url: wrapAffiliate(entry), rel: entry.rel }
}

/** /go fallback hedefi (özel u parametresi yoksa). */
export function getMarketDestination(market: string): string | null {
  const entry = AFFILIATE_MAP[market]
  return entry ? wrapAffiliate(entry) : null
}

// Open-redirect koruması: `u` parametresi yalnızca güvenilir host'lara izinli.
const ALLOWED_AFFILIATE_HOSTS = [
  'ds1.nl',      // Daisycon tracking
  'lt45.net',    // Daisycon tracking
  'jf79.net',    // Daisycon tracking
  'fr135.net',   // Daisycon tracking
  'jdt8.net',    // Daisycon tracking
  'rkn3.net',    // Daisycon tracking
  'glp8.net',    // Daisycon tracking
  'bdt9.net',    // Daisycon tracking
  'dc.budgetthuis.nl', // Budget Thuis direct
  'awin1.com',
  'www.awin1.com',   // Awin
  'partner.bol.com', // Bol.com
  // Awin onaylı markalar
  'bioprophyl.com',
  'eonon.com',
  // Daisycon onaylı markalar
  'plein.nl',
  'plein.be',
  'petgamma.com',
  'leukstetickets.nl',
  'adwebwinkel.nl',
  'webwinkel.volkskrant.nl',
  'shop.nu.nl',
  'shop.libelle.nl',
  'xllease.nl',
  'dutchlease.nl',
  'xlease.com',
  'ziggo.nl',
  'vattenfall.nl',
  'hollandsnieuwe.nl',
  ...Object.values(AFFILIATE_MAP).map((e) => {
    try {
      return new URL(e.destinationUrl).hostname
    } catch {
      return ''
    }
  }),
].filter(Boolean)

/** `u` parametresinin yalnızca onaylı affiliate/market host'una gittiğini doğrular. */
export function isAllowedAffiliateUrl(rawUrl: string): boolean {
  try {
    const u = new URL(rawUrl)
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false
    const host = u.hostname.replace(/^www\./, '')
    return ALLOWED_AFFILIATE_HOSTS.some((h) => {
      const allowed = h.replace(/^www\./, '')
      return host === allowed || host.endsWith(`.${allowed}`)
    })
  } catch {
    return false
  }
}
