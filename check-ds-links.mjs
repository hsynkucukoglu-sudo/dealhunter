// Daisycon link checker — node check-ds-links.mjs
// Her program kendi si=program_id & li=link_id (CSV'den doğrulanmış).
import https from 'https'
import http from 'http'

// trackingBase: affiliate.ts / MeerBesparenWidget.tsx ile birebir aynı
// dest: null = dl= parametresi gönderilmez (Levi's / Rakuten özel durumu)
const links = [
  // ── Widget — Supermarkt ──────────────────────────────────────────────────
  { name: 'Flink',              base: 'https://jf79.net/c/?si=16070&li=1691645&wi=420902',    dest: 'https://www.goflink.com/' },

  // ── Widget — Telecom ─────────────────────────────────────────────────────
  { name: 'Ziggo',              base: 'https://jf79.net/c/?si=17174&li=1742299&wi=420902',    dest: 'https://www.meervoordeel.nl/providers/ziggo/' },
  { name: 'hollandsnieuwe',     base: 'https://glp8.net/c/?si=21994&li=1927639&wi=420902',    dest: 'https://www.hollandsnieuwe.nl/abonnementen/' },
  { name: 'Lycamobile',         base: 'https://bdt9.net/c/?si=19078&li=1819944&wi=420902',    dest: 'https://www.lycamobile.nl/nl/' },

  // ── Widget — Reizen ──────────────────────────────────────────────────────
  { name: 'Smartbox & Bongo',   base: 'https://glp8.net/c/?si=21185&li=1902306&wi=420902',    dest: 'https://www.smartbox.com/nl-nl/' },
  { name: 'Leukstetickets',     base: 'https://lt45.net/c/?si=15805&li=1684191&wi=420902',    dest: 'https://www.leukstetickets.nl/' },

  // ── Widget — Wonen ───────────────────────────────────────────────────────
  { name: '999Games',           base: 'https://lt45.net/c/?si=13450&li=1593002&wi=420902',    dest: 'https://www.999games.nl/' },
  { name: 'Tuinmeubelwereld',   base: 'https://bdt9.net/c/?si=19167&li=1822967&wi=420902',    dest: 'https://www.tuinmeubelwereld.nl/' },
  { name: 'Miss Towels',        base: 'https://glp8.net/c/?si=21226&li=1904846&wi=420902',    dest: 'https://www.misstowels.nl/' },
  { name: 'Florafy',            base: 'https://d.florafy.eu/c/?si=21211&li=1903580&wi=420902', dest: 'https://www.florafy.eu/nl/' },
  { name: 'Petgamma',           base: 'https://fr135.net/c/?si=20686&li=1877039&wi=420902',    dest: 'https://www.petgamma.com/' },

  // ── Widget — Sport & Mode ────────────────────────────────────────────────
  { name: 'Happy Mammoth',      base: 'https://glp8.net/c/?si=19600&li=1839644&wi=420902',    dest: 'https://eu.happymammoth.com/' },
  { name: 'Plein.nl',           base: 'https://fr135.net/c/?si=3366&li=1161224&wi=420902',    dest: 'https://www.plein.nl/' },
  // Levi's: dl= yok — Rakuten/LinkShare tek-slash redirect → SSR crash
  { name: "Levi's",             base: 'https://glp8.net/c/?si=19949&li=1850890&wi=420902',    dest: null },

  // ── Widget — Auto Lease ──────────────────────────────────────────────────
  { name: 'XLLease',            base: 'https://fr135.net/c/?si=20255&li=1864272&wi=420902',   dest: 'https://www.xllease.nl/' },
  { name: 'DutchLease',         base: 'https://fr135.net/c/?si=20456&li=1868213&wi=420902',   dest: 'https://www.dutchlease.nl/' },
  { name: 'XLEasy',             base: 'https://fr135.net/c/?si=15775&li=1682823&wi=420902',   dest: 'https://www.xleasy.nl/' },

  // ── affiliate.ts — widget'ta yok ama tracking aktif ─────────────────────
  { name: 'AD Webwinkel',         base: 'https://lt45.net/c/?si=13048&li=1574297&wi=420902',  dest: 'https://adwebwinkel.nl/' },
  { name: 'Volkskrant Webwinkel', base: 'https://lt45.net/c/?si=15810&li=1684197&wi=420902',  dest: 'https://webwinkel.volkskrant.nl/' },
  { name: 'Nu.nl Shop',           base: 'https://lt45.net/c/?si=15818&li=1684335&wi=420902',  dest: 'https://shop.nu.nl/' },
  { name: 'Libelle Shop',         base: 'https://lt45.net/c/?si=15819&li=1684336&wi=420902',  dest: 'https://shop.libelle.nl/' },
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
    const note = dest ? finalDomain : 'no dl= (Rakuten fix)'
    console.log(`✅ [OK]       ${name.padEnd(22)} ${tag} → ${note}`)
    ok++
  }
}

console.log(`\n📊 ${ok} OK · ${warn} warnings · ${err} errors\n`)
