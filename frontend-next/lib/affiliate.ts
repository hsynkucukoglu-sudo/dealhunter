// ============================================================
// AFFILIATE CONFIG — onay gelince tek hamlede aç
// ============================================================
// AKTİF ETME (bir market kampanyası onaylanınca):
//   1. Aşağıya publisher kimliğini gir (DAISYCON_MEDIA_ID veya AWIN_PUBLISHER_ID)
//   2. Onaylanan market için `network` ('daisycon' | 'awin') + `programId` ata
//   3. Deploy et. Linkler otomatik tracking'e sarılır; başka değişiklik gerekmez.
// O ana kadar her market düz (tracking'siz) link olarak çalışır.

// --- Publisher kimlikleri ---
const AWIN_PUBLISHER_ID = '2932569' // Awin "awinaffid"
const BOL_SITE_ID       = '1527078' // Bol.com partner "s" — site id

export type AffiliateNetwork = 'daisycon' | 'awin' | 'bol' | 'direct'

interface MarketAffiliate {
  /** Kullanıcının indiği nihai sayfa (aanbiedingen). */
  destinationUrl: string
  /** Bu marketi hangi ağ yönetiyor. 'direct' = henüz tracking yok. */
  network: AffiliateNetwork
  /**
   * Daisycon: CSV'den alınan tam tracking base URL (si=program_id, li=link_id, wi=420902).
   * Awin: merchant id (awinmid).
   */
  programId?: string
  /** Daisycon CSV tracking base URL — si/li/domain per-program. wrapAffiliate bunu kullanır. */
  trackingBase?: string
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
  // Flink App (NL) — Daisycon onaylı (si=16070=program ID, li=1691645, jf79.net)
  Flink: { destinationUrl: 'https://www.goflink.com/', network: 'daisycon', trackingBase: 'https://jf79.net/c/?si=16070&li=1691645&wi=420902', rel: REL },
  // Holland & Barrett NL — Awin onaylı (merchant ID 8108)
  'Holland & Barrett': { destinationUrl: 'https://www.hollandandbarrett.nl/aanbiedingen', network: 'awin', programId: '8108', rel: REL },
  // Bol.com — kendi partner ağı (site ID 1527078)
  'Bol.com': { destinationUrl: 'https://www.bol.com/', network: 'bol', rel: REL },

  // ── Awin — onaylı ─────────────────────────────────────────────────────────
  BioProphyl:       { destinationUrl: 'https://www.bioprophyl.com/',      network: 'awin', programId: '22561',  rel: REL },
  Eonon:            { destinationUrl: 'https://www.eonon.com/',           network: 'awin', programId: '2471',   rel: REL },
  'Vitaepro NL':    { destinationUrl: 'https://www.vitaepro.nl/',         network: 'awin', programId: '18520',  rel: REL },
  'Direct Running': { destinationUrl: 'https://www.direct-running.nl/',   network: 'awin', programId: '71531',  rel: REL },
  'Direct Volley':  { destinationUrl: 'https://www.direct-volley.nl/',    network: 'awin', programId: '103041', rel: REL },
  // 2026-06-26 onaylı — aid mailine bakarak alındı
  'Wolfswinkel NL': { destinationUrl: 'https://www.wolfswinkel.nl/',      network: 'awin', programId: '119653', rel: REL },
  // Pending — onay gelince aktif olur (mid=31671)
  'OfficeCity NL':  { destinationUrl: 'https://www.officecity.nl/',       network: 'awin', programId: '31671',  rel: REL },
  '123watches':     { destinationUrl: 'https://www.123watches.nl/',       network: 'awin', programId: '120982', rel: REL },
  // 2026-07-02 onaylı
  'buttinette NL':  { destinationUrl: 'https://creatief-nl.buttinette.com/', network: 'awin', programId: '122862', rel: REL },
  Pulsetto:         { destinationUrl: 'https://pulsetto.tech/',              network: 'awin', programId: '81357',  rel: REL },
  // 2026-07-03 onaylı — davet kabul edildi
  'Erverte Paris':  { destinationUrl: 'https://erverte.com/',                network: 'awin', programId: '87255',  rel: REL },

  // ── Daisycon — CSV'den doğrulanmış trackingBase (si=program_id, li=link_id) ──
  'Plein.nl':           { destinationUrl: 'https://www.plein.nl/',                 network: 'daisycon', trackingBase: 'https://fr135.net/c/?si=3366&li=1161224&wi=420902',  rel: REL },
  'Plein.be':           { destinationUrl: 'https://www.plein.be/',                 network: 'direct',   rel: REL },
  Petgamma:             { destinationUrl: 'https://www.petgamma.com/',             network: 'daisycon', trackingBase: 'https://fr135.net/c/?si=20686&li=1877039&wi=420902', rel: REL },
  Leukstetickets:       { destinationUrl: 'https://www.leukstetickets.nl/',        network: 'daisycon', trackingBase: 'https://lt45.net/c/?si=15805&li=1684191&wi=420902',  rel: REL },
  'AD Webwinkel':       { destinationUrl: 'https://adwebwinkel.nl/',               network: 'daisycon', trackingBase: 'https://lt45.net/c/?si=13048&li=1574297&wi=420902',  rel: REL },
  'Volkskrant Webwinkel': { destinationUrl: 'https://webwinkel.volkskrant.nl/',    network: 'daisycon', trackingBase: 'https://lt45.net/c/?si=15810&li=1684197&wi=420902',  rel: REL },
  'Nu.nl Shop':         { destinationUrl: 'https://shop.nu.nl/',                   network: 'daisycon', trackingBase: 'https://lt45.net/c/?si=15818&li=1684335&wi=420902',  rel: REL },
  'Libelle Shop':       { destinationUrl: 'https://shop.libelle.nl/',              network: 'daisycon', trackingBase: 'https://lt45.net/c/?si=15819&li=1684336&wi=420902',  rel: REL },
  XLLease:              { destinationUrl: 'https://www.xllease.nl/',               network: 'daisycon', trackingBase: 'https://fr135.net/c/?si=20255&li=1864272&wi=420902', rel: REL },
  DutchLease:           { destinationUrl: 'https://www.dutchlease.nl/',            network: 'daisycon', trackingBase: 'https://fr135.net/c/?si=20456&li=1868213&wi=420902', rel: REL },
  XLEasy:               { destinationUrl: 'https://www.xleasy.nl/',               network: 'daisycon', trackingBase: 'https://fr135.net/c/?si=15775&li=1682823&wi=420902', rel: REL },
  Ziggo:                { destinationUrl: 'https://www.meervoordeel.nl/',          network: 'daisycon', trackingBase: 'https://jf79.net/c/?si=17174&li=1742299&wi=420902',  rel: REL },
  Vattenfall:           { destinationUrl: 'https://www.vattenfall.nl/',            network: 'direct',   rel: REL },
  hollandsnieuwe:       { destinationUrl: 'https://www.hollandsnieuwe.nl/',        network: 'daisycon', trackingBase: 'https://glp8.net/c/?si=21994&li=1927639&wi=420902',  rel: REL },

  // ── Daisycon — 2026-06-26 onaylı, trackingBase Daisycon'dan alınacak ───────
  // Daisycon > Campagnes > [program] > Link ophalen → si/li/domain al, network: 'daisycon' + trackingBase ekle
  'Verfuitverkoop.nl':  { destinationUrl: 'https://www.verfuitverkoop.nl/',  network: 'daisycon', trackingBase: 'https://glp8.net/c/?si=21219&li=1904818&wi=420902', rel: REL },
  'Wixx Coatings':      { destinationUrl: 'https://www.wixxcoatings.nl/',    network: 'daisycon', trackingBase: 'https://glp8.net/c/?si=21467&li=1913625&wi=420902', rel: REL },
  'Weightworld.nl':     { destinationUrl: 'https://www.weightworld.nl/',     network: 'daisycon', trackingBase: 'https://fr135.net/c/?si=15441&li=1670530&wi=420902', rel: REL },
  'Oakley':             { destinationUrl: 'https://www.oakley.com/nl-nl/',   network: 'daisycon', trackingBase: 'https://bdt9.net/c/?si=18433&li=1819889&wi=420902', rel: REL },

  // ── Daisycon — 2026-07-02 onaylı ────────────────────────────────────────────
  // Housefinan/Kredanta: bu programlar deeplink desteklemiyor (Daisycon "Advertisements"
  // bölümündeki tek link "Landing Page" reklam materyali) — Levi's/Rakuten ile aynı durum,
  // destinationUrl doğrudan tam tracking linki, trackingBase KULLANILMIYOR ki wrapAffiliate()
  // &dl= eklemesin (eklerse redirect zinciri bozulabilir).
  'Housefinan (DE)':     { destinationUrl: 'https://glp8.net/c/?si=21988&li=1926905&wi=420902', network: 'daisycon', rel: REL },
  'Kredanta (DACH)':     { destinationUrl: 'https://glp8.net/c/?si=21987&li=1926881&wi=420902', network: 'daisycon', rel: REL },
  Hermie:                { destinationUrl: 'https://hermie.com/',              network: 'daisycon', trackingBase: 'https://glp8.net/c/?si=20097&li=1858135&wi=420902', rel: REL },
  'Minisforum (FR)':     { destinationUrl: 'https://minisforum-store.com/fr/', network: 'daisycon', trackingBase: 'https://glp8.net/c/?si=20763&li=1880752&wi=420902', rel: REL },
  'VVVCadeaukaarten.nl': { destinationUrl: 'https://www.vvvcadeaukaarten.nl/', network: 'daisycon', trackingBase: 'https://fr135.net/c/?si=15261&li=1660848&wi=420902', rel: REL },
  // 2026-07-03 onaylı — ayrı program, Minisforum (FR)'den farklı si
  'Minisforum (EU)':     { destinationUrl: 'https://www.minisforum.com/', network: 'daisycon', trackingBase: 'https://glp8.net/c/?si=20771&li=1880782&wi=420902', rel: REL },
  Jwverzekeringen:       { destinationUrl: 'https://www.jwverzekeringen.nl/', network: 'daisycon', trackingBase: 'https://partners.jwverzekeringen.nl/c/?si=21167&li=1901301&wi=420902', rel: REL },
  // 2026-07-07 onaylı — trackingBase Daisycon CSV export'undan alınacak
  Westwing: { destinationUrl: 'https://www.westwing.nl/', network: 'daisycon', rel: REL }, // si=17294
  Sembo:    { destinationUrl: 'https://www.sembo.nl/',    network: 'daisycon', rel: REL }, // si=20811

  // ── Energie — widget'tan (MeerBesparenWidget) taşındı, /energie pilot sayfası için tek kaynak ──
  // ENGIE/Oxxio/Pure Energie: dl= (deeplink) parametresi bu 3 programın kendi redirect'inde
  // çift URL'e yol açıp 404/hata sayfasına düşürüyordu (Kwantum/Levi's ile aynı bug, canlı
  // test edildi 2026-07-06) — destinationUrl doğrudan tam tracking linki, trackingBase KULLANILMIYOR.
  ENGIE:          { destinationUrl: 'https://ds1.nl/c/?si=16070&li=20757&wi=420902',   network: 'daisycon', rel: REL },
  Oxxio:          { destinationUrl: 'https://ds1.nl/c/?si=16070&li=119834&wi=420902',  network: 'daisycon', rel: REL },
  'Pure Energie': { destinationUrl: 'https://ds1.nl/c/?si=16070&li=1420973&wi=420902', network: 'daisycon', rel: REL },
  noSun:          { destinationUrl: 'https://www.nosun.nl/',      network: 'daisycon', trackingBase: 'https://dt51.net/c/?si=19142&li=1877489&wi=420902', rel: REL },
  Renogy:         { destinationUrl: 'https://www.renogy.com/eu/', network: 'daisycon', trackingBase: 'https://glp8.net/c/?si=21168&li=1901324&wi=420902', rel: REL },

  // ── Energie — 2026-07-02/05 onaylı, trackingBase 2026-07-06 CSV export'undan doğrulandı ──
  Essent:              { destinationUrl: 'https://www.essent.nl/',         network: 'daisycon', trackingBase: 'https://lt45.net/c/?si=9787&li=1437653&wi=420902', rel: REL },
  'Essent Zakelijk':   { destinationUrl: 'https://www.essent.nl/zakelijk', network: 'daisycon', trackingBase: 'https://lt45.net/c/?si=13190&li=1579477&wi=420902', rel: REL },
  energiedirect:       { destinationUrl: 'https://www.energiedirect.nl/', network: 'daisycon', trackingBase: 'https://lt45.net/c/?si=924&li=55221&wi=420902', rel: REL },
  'Frank Energie':     { destinationUrl: 'https://www.frankenergie.nl/',  network: 'daisycon', trackingBase: 'https://jf79.net/c/?si=16978&li=1731992&wi=420902', rel: REL },
  'Gewoon Energie':    { destinationUrl: 'https://www.gewoonenergie.nl/', network: 'daisycon', trackingBase: 'https://partners.gewoonenergie.nl/c/?si=16832&li=1724962&wi=420902', rel: REL },
  Powerpeers:          { destinationUrl: 'https://www.powerpeers.nl/',    network: 'daisycon', trackingBase: 'https://lt45.net/c/?si=12400&li=1544330&wi=420902', rel: REL },
}

/** Hedef URL'i yapılandırılmış ağın tracking deeplink'ine sarar. */
export function wrapAffiliate(entry: MarketAffiliate): string {
  const dl = encodeURIComponent(entry.destinationUrl)
  if (entry.network === 'daisycon' && entry.trackingBase) {
    return `${entry.trackingBase}&dl=${dl}`
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
  // Daisycon tracking domains
  'ds1.nl', 'lt45.net', 'jf79.net', 'fr135.net', 'jdt8.net',
  'rkn3.net', 'glp8.net', 'bdt9.net', 'd.florafy.eu',
  // Awin & Bol.com
  'awin1.com', 'www.awin1.com', 'partner.bol.com',
  // trackingBase ve destinationUrl hostları otomatik eklenir
  ...Object.values(AFFILIATE_MAP).flatMap((e) => {
    const hosts: string[] = []
    try { hosts.push(new URL(e.destinationUrl).hostname) } catch {}
    if (e.trackingBase) {
      try { hosts.push(new URL(e.trackingBase).hostname) } catch {}
    }
    return hosts
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
