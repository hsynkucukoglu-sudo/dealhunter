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
  Flink: { destinationUrl: 'https://jf79.net/c/?si=16070&li=1691645&wi=420902', network: 'daisycon', rel: REL },
  // Holland & Barrett NL — Awin onaylı (merchant ID 8108)
  // /aanbiedingen gaf 404 (gemeten 2026-08-15, ook via de Awin-redirect: die geeft
  // de ued-parameter gewoon door en de bezoeker landt op de 404). De juiste pad is
  // /shop/aanbiedingen/ — dat was in MeerBesparenWidget.tsx al correct, alleen deze
  // kopie liep achter. Let op: dit merk staat op twee plekken (hier + de DEALS-lijst
  // in dat widget); die twee zijn geen gedeelde bron en kunnen dus uit elkaar lopen.
  'Holland & Barrett': { destinationUrl: 'https://www.hollandandbarrett.nl/shop/aanbiedingen/', network: 'awin', programId: '8108', rel: REL },
  // Bol.com — kendi partner ağı (site ID 1527078)
  // /nl/nl/ i.p.v. / — bol.com stuurt / tóch daarheen, dit scheelt een redirect.
  // (Was al de waarde in MeerBesparenWidget; hier gelijkgetrokken bij het
  // samenvoegen van de twee lijsten tot één bron.)
  'Bol.com': { destinationUrl: 'https://www.bol.com/nl/nl/', network: 'bol', rel: REL },

  // ── Awin — onaylı ─────────────────────────────────────────────────────────
  // .com serveerde een certificaat voor *.your-server.de (hostname mismatch) —
  // elke browser toonde een volledige beveiligingswaarschuwing i.p.v. de winkel
  // (gemeten 2026-08-15; met -k wél 200, dus de server draait, het cert klopt niet).
  // .be is geen gok: cread.php zónder ued-parameter laat zien welke landingspagina
  // Awin zelf voor programma 22561 heeft geregistreerd, en dat is bioprophyl.be.
  // Geldig cert (CN=bioprophyl.be), Nederlandstalig (lang="nl"), dus ook voor NL
  // bezoekers de juiste taal — en tracking loopt gegarandeerd, want het is Awins
  // eigen bestemming voor dit programma.
  BioProphyl:       { destinationUrl: 'https://www.bioprophyl.be/',       network: 'awin', programId: '22561',  rel: REL },
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
  'Plein.nl':           { destinationUrl: 'https://fr135.net/c/?si=3366&li=1161224&wi=420902',                 network: 'daisycon',  rel: REL },
  'Plein.be':           { destinationUrl: 'https://www.plein.be/',                 network: 'direct',   rel: REL },
  Petgamma:             { destinationUrl: 'https://fr135.net/c/?si=20686&li=1877039&wi=420902',             network: 'daisycon', rel: REL },
  Leukstetickets:       { destinationUrl: 'https://lt45.net/c/?si=15805&li=1684191&wi=420902',        network: 'daisycon',  rel: REL },
  'AD Webwinkel':       { destinationUrl: 'https://lt45.net/c/?si=13048&li=1574297&wi=420902',               network: 'daisycon',  rel: REL },
  'Volkskrant Webwinkel': { destinationUrl: 'https://lt45.net/c/?si=15810&li=1684197&wi=420902',    network: 'daisycon',  rel: REL },
  // shop.libelle.nl bestaat niet meer (DNS lost niet op, gemeten 2026-08-15). De
  // winkel draaide door onder winkelen.libelle.nl — bevestigd door de tracking-link
  // zónder dl-parameter aan te roepen: Daisycon stuurt dan naar de bestemming die
  // het zelf voor dit programma kent, en dat is winkelen.libelle.nl (200, geldig
  // cert, titel "Libelle Shop").
  'Libelle Shop':       { destinationUrl: 'https://winkelen.libelle.nl/',          network: 'daisycon', trackingBase: 'https://lt45.net/c/?si=15819&li=1684336&wi=420902',  rel: REL },
  XLLease:              { destinationUrl: 'https://fr135.net/c/?si=20255&li=1864272&wi=420902',               network: 'daisycon', rel: REL },
  DutchLease:           { destinationUrl: 'https://fr135.net/c/?si=20456&li=1868213&wi=420902',            network: 'daisycon', rel: REL },
  XLEasy:               { destinationUrl: 'https://fr135.net/c/?si=15775&li=1682823&wi=420902',               network: 'daisycon', rel: REL },
  // Alle vijf goedgekeurd maar nooit aangesloten; li's uit Daisycon-export 2026-07-26
  'Lease.auto':         { destinationUrl: 'https://glp8.net/c/?si=21513&li=1912084&wi=420902',               network: 'daisycon', rel: REL }, // €85/sale · 100g
  'Wittebrug Lease':    { destinationUrl: 'https://lt45.net/c/?si=15724&li=1681173&wi=420902',               network: 'daisycon', rel: REL }, // €350/sale · 100g
  Carvendo:             { destinationUrl: 'https://d.carvendo.nl/c/?si=21437&li=1910810&wi=420902',          network: 'daisycon', rel: REL }, // €350/sale · 100g
  'IkRij.nl':           { destinationUrl: 'https://lt45.net/c/?si=13144&li=1577821&wi=420902',               network: 'daisycon', rel: REL }, // €175/sale · 100g
  MeerMetZiggo:         { destinationUrl: 'https://glp8.net/c/?si=21173&li=1901598&wi=420902',               network: 'daisycon', rel: REL }, // €50/sale · 100g
  'I-KOOK':             { destinationUrl: 'https://lt45.net/c/?si=11558&li=1513186&wi=420902',               network: 'daisycon', rel: REL }, // €50/sale · 100g
  Ziggo:                { destinationUrl: 'https://jf79.net/c/?si=17174&li=1742299&wi=420902',          network: 'daisycon',  rel: REL },
  // KPN is marktleider in NL-telecom en ontbrak; programma stond al op "joined".
  KPN:                  { destinationUrl: 'https://glp8.net/c/?si=19864&li=1846235&wi=420902',         network: 'daisycon',  rel: REL }, // €100 per lead
  // 2026-08-19: stond op network 'direct' — een kale link zonder tracking, dus
  // elke klik ging weg zonder commissie terwijl het Daisycon-programma al op
  // "joined" stond. Nu de trackinglink (€96 per lead).
  Vattenfall:           { destinationUrl: 'https://lt45.net/c/?si=2036&li=119986&wi=420902', network: 'daisycon', rel: REL },
  hollandsnieuwe:       { destinationUrl: 'https://glp8.net/c/?si=21994&li=1927639&wi=420902',        network: 'daisycon',  rel: REL },

  // ── Daisycon — 2026-06-26 onaylı, trackingBase Daisycon'dan alınacak ───────
  // Daisycon > Campagnes > [program] > Link ophalen → si/li/domain al, network: 'daisycon' + trackingBase ekle
  'Verfuitverkoop.nl':  { destinationUrl: 'https://glp8.net/c/?si=21219&li=1904818&wi=420902',  network: 'daisycon', rel: REL },
  'Wixx Coatings':      { destinationUrl: 'https://glp8.net/c/?si=21467&li=1913625&wi=420902',    network: 'daisycon', rel: REL },
  'Weightworld.nl':     { destinationUrl: 'https://fr135.net/c/?si=15441&li=1670530&wi=420902',     network: 'daisycon', rel: REL },
  'Oakley':             { destinationUrl: 'https://bdt9.net/c/?si=18433&li=1819889&wi=420902',   network: 'daisycon', rel: REL },

  // ── Daisycon — 2026-07-02 onaylı ────────────────────────────────────────────
  // Housefinan/Kredanta: bu programlar deeplink desteklemiyor (Daisycon "Advertisements"
  // bölümündeki tek link "Landing Page" reklam materyali) — Levi's/Rakuten ile aynı durum,
  // destinationUrl doğrudan tam tracking linki, trackingBase KULLANILMIYOR ki wrapAffiliate()
  // &dl= eklemesin (eklerse redirect zinciri bozulabilir).
  'Housefinan (DE)':     { destinationUrl: 'https://glp8.net/c/?si=21988&li=1926905&wi=420902', network: 'daisycon', rel: REL },
  'Kredanta (DACH)':     { destinationUrl: 'https://glp8.net/c/?si=21987&li=1926881&wi=420902', network: 'daisycon', rel: REL },
  Hermie:                { destinationUrl: 'https://glp8.net/c/?si=20097&li=1858135&wi=420902',              network: 'daisycon', rel: REL },
  'Minisforum (FR)':     { destinationUrl: 'https://glp8.net/c/?si=20763&li=1880752&wi=420902', network: 'daisycon', rel: REL },
  'VVVCadeaukaarten.nl': { destinationUrl: 'https://fr135.net/c/?si=15261&li=1660848&wi=420902', network: 'daisycon', rel: REL },
  // 2026-07-03 onaylı — ayrı program, Minisforum (FR)'den farklı si
  'Minisforum (EU)':     { destinationUrl: 'https://glp8.net/c/?si=20771&li=1880782&wi=420902', network: 'daisycon', rel: REL },
  Jwverzekeringen:       { destinationUrl: 'https://partners.jwverzekeringen.nl/c/?si=21167&li=1901301&wi=420902', network: 'daisycon', rel: REL },
  // 2026-07-07 onaylı — li 2026-07-16 campaigns export'undan doğrulandı (ikisi de approved),
  // tracking aktif. Hedef zaten ana sayfa olduğu için dl= eklenmiyor (Foodello deseni).
  Westwing: { destinationUrl: 'https://jdt8.net/c/?si=17294&li=1747070&wi=420902', network: 'daisycon', rel: REL }, // %4,90 · 30g
  Sembo:    { destinationUrl: 'https://glp8.net/c/?si=20811&li=1881767&wi=420902', network: 'daisycon', rel: REL }, // %8,00 · 30g

  // ── Daisycon/Awin — 2026-07-13 onaylı, deeplink panelden alındı ──
  // Zwemshop + Degrootmeesters: dl= çift-URL 404'ü veriyor (canlı test) —
  // ENGIE/Kwantum deseni: tam tracking linki, trackingBase yok.
  'Zwemshop.com':    { destinationUrl: 'https://rkn3.net/c/?si=14485&li=1622288&wi=420902', network: 'daisycon', rel: REL },
  Degrootmeesters:   { destinationUrl: 'https://rkn3.net/c/?si=14804&li=1639024&wi=420902', network: 'daisycon', rel: REL },
  'Sneakids NL':     { destinationUrl: 'https://sneakids.nl/',             network: 'awin', programId: '103061', rel: REL },

  // ── Daisycon — 2026-07-12 onaylı, deeplink Daisycon panelinden (Materialen > Deeplinks) alındı ──
  Vandebron:             { destinationUrl: 'https://lt45.net/c/?si=12134&li=1535052&wi=420902',               network: 'daisycon', rel: REL },
  'Beddengoeddirect.nl': { destinationUrl: 'https://rkn3.net/c/?si=14527&li=1624333&wi=420902',     network: 'daisycon', rel: REL },
  'Kameo Sleep (NL)':    { destinationUrl: 'https://glp8.net/c/?si=21324&li=1907610&wi=420902',           network: 'daisycon', rel: REL },
  'LEDshop Groenovatie': { destinationUrl: 'https://lt45.net/c/?si=10385&li=1459831&wi=420902', network: 'daisycon', rel: REL },
  'Sif Jakobs':          { destinationUrl: 'https://glp8.net/c/?si=21808&li=1918860&wi=420902',              network: 'daisycon', rel: REL },
  'Freewear.nl':         { destinationUrl: 'https://lt45.net/c/?si=13066&li=1574630&wi=420902',            network: 'daisycon', rel: REL },

  // ── Energie — widget'tan (MeerBesparenWidget) taşındı, /energie pilot sayfası için tek kaynak ──
  // ENGIE/Oxxio/Pure Energie: dl= (deeplink) parametresi bu 3 programın kendi redirect'inde
  // çift URL'e yol açıp 404/hata sayfasına düşürüyordu (Kwantum/Levi's ile aynı bug, canlı
  // test edildi 2026-07-06) — destinationUrl doğrudan tam tracking linki, trackingBase KULLANILMIYOR.
  ENGIE:          { destinationUrl: 'https://ds1.nl/c/?si=16070&li=20757&wi=420902',   network: 'daisycon', rel: REL },
  Oxxio:          { destinationUrl: 'https://ds1.nl/c/?si=16070&li=119834&wi=420902',  network: 'daisycon', rel: REL },
  // 2026-07-13: Pure Energie'nin KENDİ programı (9321) onaylandı — legacy toplu
  // linkten (si=16070) yükseltildi. dl= hâlâ çift-URL 404'ü veriyor (canlı test
  // edildi), o yüzden ENGIE/Oxxio deseni: tam tracking linki, trackingBase yok.
  'Pure Energie': { destinationUrl: 'https://jdt8.net/c/?si=9321&li=1420973&wi=420902', network: 'daisycon', rel: REL },
  noSun:          { destinationUrl: 'https://dt51.net/c/?si=19142&li=1877489&wi=420902',      network: 'daisycon', rel: REL },
  Renogy:         { destinationUrl: 'https://glp8.net/c/?si=21168&li=1901324&wi=420902', network: 'daisycon', rel: REL },

  // ── Energie — 2026-07-02/05 onaylı, trackingBase 2026-07-06 CSV export'undan doğrulandı ──
  Essent:              { destinationUrl: 'https://lt45.net/c/?si=9787&li=1437653&wi=420902',         network: 'daisycon', rel: REL },
  // 2026-08-19: we hadden Essent (top-3) maar niet Eneco en Vattenfall, de twee
  // andere grote Nederlandse leveranciers — precies de namen waar iemand die wil
  // overstappen als eerste naar zoekt. Beide programma's stonden al op "joined"
  // in Daisycon, dus geen aanvraag nodig; alleen de link ontbrak.
  // Trackinglink één keer live gecontroleerd: 200 op eneco.nl met utm_term=420902.
  Eneco:               { destinationUrl: 'https://lt45.net/c/?si=12392&li=1544210&wi=420902',        network: 'daisycon', rel: REL }, // €102 per lead
  'Essent Zakelijk':   { destinationUrl: 'https://lt45.net/c/?si=13190&li=1579477&wi=420902', network: 'daisycon', rel: REL },
  energiedirect:       { destinationUrl: 'https://lt45.net/c/?si=924&li=55221&wi=420902', network: 'daisycon', rel: REL },
  'Frank Energie':     { destinationUrl: 'https://jf79.net/c/?si=16978&li=1731992&wi=420902',  network: 'daisycon', rel: REL },
  'Gewoon Energie':    { destinationUrl: 'https://partners.gewoonenergie.nl/c/?si=16832&li=1724962&wi=420902', network: 'daisycon', rel: REL },
  Powerpeers:          { destinationUrl: 'https://lt45.net/c/?si=12400&li=1544330&wi=420902',    network: 'daisycon', rel: REL },
  // EnergyZero (si=943) verwijderd 2026-07-26: abonnement is nooit doorgekomen en we
  // vragen het niet opnieuw aan. Frank Energie dekt hetzelfde dynamische segment mét tracking.

  // ── Daisycon — 2026-07-15 onaylı ──
  // Foodello (NL): li Daisycon'un 2026-07-16 campaigns export'undan doğrulandı, tracking aktif.
  Foodello: { destinationUrl: 'https://partners.foodello.nl/c/?si=17066&li=1737047&wi=420902', network: 'daisycon', rel: REL },
  // Foodello (BE) si=17574: onay mailinde vardı ama 2026-07-16 VE 2026-07-24 export'larında
  // çıkmadı (ikisi de yalnızca approved listeler) — abonelik geçmemiş olabilir, panelden kontrol et.
  'Foodello (BE)': { destinationUrl: 'https://foodello.be/', network: 'daisycon', rel: REL },

  // ── Daisycon — 2026-07-20 onaylı ────────────────────────────────────────────
  // 2026-07-22 onaylı — li 2026-07-24 campaigns export'undan doğrulandı, tracking aktif.
  'Canal+': { destinationUrl: 'https://rkn3.net/c/?si=18863&li=1812253&wi=420902', network: 'daisycon', rel: REL }, // €20/sale · 100g

  // li 2026-07-24 campaigns export'undan doğrulandı (üçü de approved), tracking aktif.
  Huisdierenbazaar:        { destinationUrl: 'https://partner.huisdierenbazaar.nl/c/?si=19217&li=1824499&wi=420902', network: 'daisycon', rel: REL }, // %10 · 35g
  Skikk:                   { destinationUrl: 'https://jdt8.net/c/?si=17677&li=1765151&wi=420902',                    network: 'daisycon', rel: REL }, // %5 · 30g (INT)
  'De Goedkoopste Outlet': { destinationUrl: 'https://glp8.net/c/?si=19859&li=1846103&wi=420902',                    network: 'daisycon', rel: REL }, // %10 · 100g
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
