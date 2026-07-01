/**
 * Dirk.nl scraper — GitHub Actions'ta çalışır (Cloudflare'ı bypass eder)
 * Sonuçları Railway backend'e POST eder.
 */

const BACKEND_URL = process.env.BACKEND_URL || 'https://dealhunter-production-d900.up.railway.app'
const ADMIN_TOKEN = process.env.ADMIN_TOKEN

if (!ADMIN_TOKEN) {
  console.error('❌ ADMIN_TOKEN eksik')
  process.exit(1)
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'nl-NL,nl;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
}

function toCampaignType(text) {
  if (!text) return null
  const s = text.toLowerCase()
  if (/1\s*\+\s*1|\bgratis\b.*\bex(tra)?\b/.test(s)) return '1+1'
  if (/2e\s*(halve|helft|50%)|tweede.*(halve|gratis)/.test(s)) return '2e-halve-prijs'
  if (/3\s*(halen|voor)\s*2|3\s*halen.*2\s*betalen/.test(s)) return '3-halen-2-betalen'
  if (/combi(natie)?|samen\s*goedkoper/.test(s)) return 'combinatie'
  if (/tijdelijk|op\s*=\s*op/.test(s)) return 'tijdelijk'
  return null
}

function resolveNuxt(raw, idx, depth = 0, cache = new Map()) {
  if (depth > 20) return raw[idx]
  if (cache.has(idx)) return cache.get(idx)
  const val = raw[idx]
  if (val === null || val === undefined || typeof val !== 'object') { cache.set(idx, val); return val }
  if (Array.isArray(val)) {
    if (val.length === 2 && typeof val[0] === 'string' && typeof val[1] === 'number') return resolveNuxt(raw, val[1], depth + 1, cache)
    const result = val.map(i => typeof i === 'number' ? resolveNuxt(raw, i, depth + 1, cache) : i)
    cache.set(idx, result); return result
  }
  const result = {}
  for (const [k, v] of Object.entries(val)) result[k] = typeof v === 'number' ? resolveNuxt(raw, v, depth + 1, cache) : v
  cache.set(idx, result); return result
}

function getExpiry() {
  const now = new Date()
  const sunday = new Date(now)
  const daysUntilSunday = now.getDay() === 0 ? 7 : (7 - now.getDay()) % 7
  sunday.setDate(now.getDate() + daysUntilSunday)
  return sunday.toISOString().split('T')[0]
}

async function scrapeDirk() {
  console.log('🏪 Dirk.nl scraper başlıyor...')
  const EXPIRES_AT = getExpiry()

  const res = await fetch('https://www.dirk.nl/aanbiedingen', {
    headers: HEADERS,
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()

  const nd = html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (!nd) throw new Error('__NUXT_DATA__ bulunamadı')
  const raw = JSON.parse(nd[1])

  const stateObjIdx = raw.findIndex(item =>
    item !== null && typeof item === 'object' && !Array.isArray(item) && 'offers-currentOffers' in item
  )
  if (stateObjIdx === -1) throw new Error('offers-currentOffers key bulunamadı')

  const catPointersIdx = raw[stateObjIdx]['offers-currentOffers']
  const catPointers = raw[catPointersIdx]
  if (!Array.isArray(catPointers)) throw new Error('Kategori pointer listesi bekleniyordu')

  const cache = new Map()
  const seen = new Set()
  const results = []

  for (const catPtr of catPointers) {
    const cat = resolveNuxt(raw, catPtr, 0, cache)
    const offers = cat?.currentOffers
    if (!Array.isArray(offers)) continue

    for (const offer of offers) {
      if (!offer?.headerText) continue
      const key = String(offer.offerId || offer.headerText)
      if (seen.has(key)) continue
      seen.add(key)

      const offerPrice = typeof offer.offerPrice === 'number' ? offer.offerPrice : null
      if (!offerPrice) continue

      const normalPrice = typeof offer.normalPrice === 'number' && offer.normalPrice > 0 ? offer.normalPrice : null
      const name = offer.packaging ? `${offer.headerText} ${offer.packaging}` : offer.headerText
      const imageUrl = offer.image
        ? `https://web-fileserver.dirk.nl/offers/${encodeURIComponent(offer.image)}?width=190`
        : null
      const expiresAt = offer.endDate ? offer.endDate.split('T')[0] : EXPIRES_AT

      results.push({
        name,
        discountedPrice: offerPrice,
        originalPrice: normalPrice && normalPrice > offerPrice ? normalPrice : offerPrice,
        imageUrl,
        url: `https://www.dirk.nl/aanbiedingen`,
        expiresAt,
        category: null,
        campaignType: toCampaignType(offer.textPriceSign || '') || toCampaignType(name),
        isCampaign: true,
        source: 'dirk.nl/aanbiedingen',
      })
    }
  }

  console.log(`  ✅ ${results.length} ürün toplandı`)
  return results
}

async function postToBackend(products) {
  console.log(`\n📤 ${products.length} ürün Railway'e gönderiliyor...`)
  const res = await fetch(`${BACKEND_URL}/api/products/bulk-replace`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify({ market: 'Dirk', products }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`Backend hata: ${JSON.stringify(json)}`)
  console.log(`✅ Backend: ${json.count} ürün eklendi`)
}

;(async () => {
  try {
    const products = await scrapeDirk()
    if (products.length === 0) {
      console.error('❌ Hiç ürün bulunamadı')
      process.exit(1)
    }
    await postToBackend(products)
  } catch (e) {
    console.error('❌ Hata:', e.message)
    process.exit(1)
  }
})()
