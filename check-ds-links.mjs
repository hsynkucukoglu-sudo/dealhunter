// Daisycon link checker — node check-ds-links.mjs
// Her program kendi si=program_id & li=link_id (CSV'den doğrulanmış).
import https from 'https'
import http from 'http'

// trackingBase: affiliate.ts / MeerBesparenWidget.tsx ile birebir aynı
// dest: null = dl= parametresi gönderilmez (Rakuten/deeplink-kırıcı programlar — bkz. affiliate.ts wrapAffiliate)
//
// 2026-08-26 güncellemesi: bu liste bayattı — affiliate.ts/MeerBesparenWidget.tsx'te
// çift-URL bug'ı fark edilip dl= kaldırılan ~15 marka burada hâlâ eski (kırık) dl=
// değerleriyle duruyordu, script çalıştırılınca yanlış alarm veriyordu. Üretimle
// birebir eşitlendi + o taraflı doğrulanan 8 marka (CheapTickets..Plaud) eklendi.
const links = [
  // ── Widget — Supermarkt ──────────────────────────────────────────────────
  // Flink: dl= JS/Adjust deeplink zincirinde takılıyor (goflink "STUCK" — ayrı ele alınır),
  // üretimde de dl= gönderilmiyor (affiliate.ts: trackingBase yok → bare link)
  { name: 'Flink',              base: 'https://jf79.net/c/?si=16070&li=1691645&wi=420902',    dest: null },

  // ── Widget — Telecom ─────────────────────────────────────────────────────
  { name: 'Ziggo',              base: 'https://jf79.net/c/?si=17174&li=1742299&wi=420902',    dest: null },
  { name: 'hollandsnieuwe',     base: 'https://glp8.net/c/?si=21994&li=1927639&wi=420902',    dest: null },
  { name: 'Lycamobile',         base: 'https://bdt9.net/c/?si=19078&li=1819944&wi=420902',    dest: 'https://www.lycamobile.nl/nl/' },

  // ── Widget — Reizen ──────────────────────────────────────────────────────
  { name: 'Smartbox & Bongo',   base: 'https://glp8.net/c/?si=21185&li=1902306&wi=420902',    dest: null },
  { name: 'Leukstetickets',     base: 'https://lt45.net/c/?si=15805&li=1684191&wi=420902',    dest: null },
  { name: 'CheapTickets',       base: 'https://ds1.nl/c/?si=16070&li=70202&wi=420902',        dest: 'https://www.cheaptickets.nl/vluchten' },
  { name: 'Prijsvrij',          base: 'https://ds1.nl/c/?si=16070&li=168050&wi=420902',       dest: 'https://www.prijsvrij.nl/last-minute' },
  { name: 'Oad',                base: 'https://ds1.nl/c/?si=16070&li=1352504&wi=420902',      dest: 'https://www.oad.nl/aanbiedingen' },
  { name: 'Kiwi.com',           base: 'https://glp8.net/c/?si=20714&li=1878051&wi=420902',    dest: 'https://www.kiwi.com/nl/' },

  // ── Widget — Wonen ───────────────────────────────────────────────────────
  { name: '999Games',           base: 'https://lt45.net/c/?si=13450&li=1593002&wi=420902',    dest: null },
  { name: 'Tuinmeubelwereld',   base: 'https://bdt9.net/c/?si=19167&li=1822967&wi=420902',    dest: null },
  { name: 'Miss Towels',        base: 'https://glp8.net/c/?si=21226&li=1904846&wi=420902',    dest: null },
  { name: 'Florafy',            base: 'https://d.florafy.eu/c/?si=21211&li=1903580&wi=420902', dest: null },
  { name: 'Petgamma',           base: 'https://fr135.net/c/?si=20686&li=1877039&wi=420902',    dest: null },

  // ── Widget — Sport & Mode ────────────────────────────────────────────────
  { name: 'Happy Mammoth',      base: 'https://glp8.net/c/?si=19600&li=1839644&wi=420902',    dest: null },
  { name: 'Plein.nl',           base: 'https://fr135.net/c/?si=3366&li=1161224&wi=420902',    dest: null },
  // Levi's: dl= yok — Rakuten/LinkShare tek-slash redirect → SSR crash
  { name: "Levi's",             base: 'https://glp8.net/c/?si=19949&li=1850890&wi=420902',    dest: null },
  // Dr. Martens/Foreo: dl= çift-URL 404/503 veriyordu, 2026-08-26'da dl= kaldırıldı (bkz. MeerBesparenWidget.tsx)
  { name: 'Dr. Martens',        base: 'https://fr135.net/c/?si=15138&li=1656908&wi=420902',   dest: null },
  { name: 'Foreo',              base: 'https://jf79.net/c/?si=16254&li=1697784&wi=420902',    dest: null },
  // Eastpak: curl'de 403 veriyordu ama bu script'in kendi Node https modülüyle OK —
  // curl'e özgü bot-tespitiymiş, gerçek sorun degil (2026-08-26 doğrulandı)
  { name: 'Eastpak',            base: 'https://glp8.net/c/?si=20076&li=1857675&wi=420902',    dest: 'https://www.eastpak.com/nl-nl/' },

  // ── Widget — Auto Lease ──────────────────────────────────────────────────
  { name: 'XLLease',            base: 'https://fr135.net/c/?si=20255&li=1864272&wi=420902',   dest: null },
  { name: 'DutchLease',         base: 'https://fr135.net/c/?si=20456&li=1868213&wi=420902',   dest: null },
  { name: 'XLEasy',             base: 'https://fr135.net/c/?si=15775&li=1682823&wi=420902',   dest: null },

  // ── Widget — Tech & Software ─────────────────────────────────────────────
  { name: 'Plaud',              base: 'https://glp8.net/c/?si=21213&li=1903643&wi=420902',    dest: 'https://www.plaud.ai/' },

  // ── affiliate.ts — widget'ta yok ama tracking aktif ─────────────────────
  { name: 'AD Webwinkel',         base: 'https://lt45.net/c/?si=13048&li=1574297&wi=420902',  dest: null },
  { name: 'Volkskrant Webwinkel', base: 'https://lt45.net/c/?si=15810&li=1684197&wi=420902',  dest: null },
  // Libelle Shop: destinationUrl winkelen.libelle.nl'e taşındı (eski shop.libelle.nl değil) — affiliate.ts
  { name: 'Libelle Shop',         base: 'https://lt45.net/c/?si=15819&li=1684336&wi=420902',  dest: 'https://winkelen.libelle.nl/' },
]

function buildUrl(base, dest) {
  if (!dest) return base
  return `${base}&dl=${encodeURIComponent(dest)}`
}

function getRedirect(url, maxRedirects = 5) {
  return new Promise((resolve) => {
    if (maxRedirects === 0) return resolve({ final: url, hops: [] })

    const mod = url.startsWith('https') ? https : http
    const req = mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 }, (res) => {
      const loc = res.headers['location']
      if (loc && res.statusCode >= 300 && res.statusCode < 400) {
        const next = loc.startsWith('http') ? loc : new URL(loc, url).href
        getRedirect(next, maxRedirects - 1).then(({ final, hops }) =>
          resolve({ final, hops: [url, ...hops] })
        )
      } else {
        resolve({ final: url, hops: [] })
      }
      res.resume()
    })
    req.on('error', () => resolve({ final: 'ERROR', hops: [] }))
    req.on('timeout', () => { req.destroy(); resolve({ final: 'TIMEOUT', hops: [] }) })
  })
}

function domainOf(url) {
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}

function expectedDomain(dest) {
  try { return new URL(dest).hostname.replace('www.', '') } catch { return '' }
}

console.log('\n🔍 Daisycon link checker (DC format) — ' + links.length + ' links...\n')

let ok = 0, warn = 0, err = 0

for (const { name, base, dest } of links) {
  const url = buildUrl(base, dest)
  const params = new URL(base).searchParams
  const tag = `si=${params.get('si')} li=${params.get('li')}`
  const { final } = await getRedirect(url)

  const finalDomain = domainOf(final)
  const expectDomain = dest ? expectedDomain(dest) : null

  const isGoflink = finalDomain.includes('goflink')
  const isError = final === 'ERROR' || final === 'TIMEOUT'
  const isRakuten = finalDomain.includes('rakuten') || finalDomain.includes('linksynergy')
  const isMismatch = !isError && !isGoflink && !isRakuten && expectDomain &&
    !finalDomain.includes(expectDomain.split('.')[0])

  if (isError) {
    console.log(`❌ [ERROR]    ${name.padEnd(22)} ${tag} → ${final}`)
    err++
  } else if (isGoflink) {
    console.log(`⚠️  [STUCK]    ${name.padEnd(22)} ${tag} → goflink (JS redirect, verifiable in browser)`)
    warn++
  } else if (isRakuten) {
    console.log(`⚠️  [RAKUTEN]  ${name.padEnd(22)} ${tag} → ${finalDomain} (Rakuten middleman, check manually)`)
    warn++
  } else if (isMismatch) {
    console.log(`⚠️  [MISMATCH] ${name.padEnd(22)} ${tag} → expected ${expectDomain}, got ${finalDomain}`)
    warn++
  } else {
    const note = dest ? finalDomain : `no dl= → ${finalDomain}`
    console.log(`✅ [OK]       ${name.padEnd(22)} ${tag} → ${note}`)
    ok++
  }
}

console.log(`\n📊 ${ok} OK · ${warn} warnings · ${err} errors\n`)
