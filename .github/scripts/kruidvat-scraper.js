/**
 * Kruidvat scraper → Railway bulk-replace
 * Strategy:
 *   1. Fetch /aanbiedingen/dezeweek HTML (bypass Cloudflare via browser headers)
 *   2. Parse spartacus-app-state → promo-tab-dezeweek
 *   3. For /p/ tiles: batch-fetch product pages to extract exact prices
 *   4. For /a/ tiles: parse campaign type from URL slug
 */

const BACKEND_URL = process.env.BACKEND_URL || 'https://dealhunter-production-d900.up.railway.app'
const ADMIN_TOKEN = process.env.ADMIN_TOKEN

if (!ADMIN_TOKEN) { console.error('❌ ADMIN_TOKEN eksik'); process.exit(1) }

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'

const htmlH = {
  'User-Agent': UA,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'Upgrade-Insecure-Requests': '1',
}

function decodeAppState(html) {
  const m = html.match(/<script id="spartacus-app-state" type="application\/json">([\s\S]*?)<\/script>/)
  if (!m) return null
  const decoded = m[1]
    .replace(/&quot;/g, '"').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))
  return JSON.parse(decoded)
}

function findInState(obj, key) {
  if (!obj || typeof obj !== 'object') return null
  if (key in obj) return obj[key]
  for (const k of Object.keys(obj)) {
    const found = findInState(obj[k], key)
    if (found) return found
  }
  return null
}

function toCampaignType(url, title) {
  const s = (url + ' ' + title).toLowerCase()
  if (/1\s*\+\s*1|11-gratis|1-1-gratis|\bgratis\b.*\bex(tra)?\b/.test(s)) return '1+1'
  if (/2e-halve-prijs|2e-helft|tweede.*halve/.test(s)) return '2e-halve-prijs'
  if (/3-halen-2-betalen|3-voor-2/.test(s)) return '3-halen-2-betalen'
  if (/combi(natie)?/.test(s)) return 'combinatie'
  if (/tijdelijk|dagactie/.test(s)) return 'tijdelijk'
  return null
}

async function fetchHtml(url, timeout = 20000) {
  const res = await fetch(url, { headers: htmlH, signal: AbortSignal.timeout(timeout) })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

async function getProductPrice(path) {
  try {
    const html = await fetchHtml('https://www.kruidvat.nl' + path, 12000)
    const state = decodeAppState(html)
    if (!state) return null
    const entities = state['cx-state']?.product?.details?.entities || {}
    const code = Object.keys(entities)[0]
    if (!code) return null
    // Price lives in entities[code].list.value (Spartacus NgRx store shape)
    const p = entities[code]?.list?.value
    if (!p) return null
    const discountedPrice = p.price?.value ?? null
    if (!discountedPrice) return null
    const originalPrice = p.price?.oldValue ?? discountedPrice
    const imgs = entities[code]?.details?.value?.images || p.images || []
    const imageUrl = imgs.find?.(i => i.imageType === 'PRIMARY' && i.format === 'product')?.url
      || imgs[0]?.url || null
    return {
      name: p.name,
      discountedPrice,
      originalPrice,
      imageUrl: imageUrl ? (imageUrl.startsWith('http') ? imageUrl : 'https://media.kruidvat.nl' + imageUrl) : null,
      url: 'https://www.kruidvat.nl' + path,
    }
  } catch {
    return null
  }
}

async function batchFetch(items, fn, concurrency = 8) {
  const results = []
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    const batchResults = await Promise.all(batch.map(fn))
    results.push(...batchResults)
    process.stdout.write(`\r  Fetched ${Math.min(i + concurrency, items.length)}/${items.length}`)
  }
  console.log()
  return results
}

;(async () => {
  try {
    console.log('🏪 Kruidvat /aanbiedingen/dezeweek yükleniyor...')
    const html = await fetchHtml('https://www.kruidvat.nl/aanbiedingen/dezeweek')
    const state = decodeAppState(html)
    if (!state) throw new Error('spartacus-app-state bulunamadı')

    const promoData = findInState(state, 'promo-tab-dezeweek')
    if (!promoData) throw new Error('promo-tab-dezeweek bulunamadı')

    const allTiles = []
    for (const tab of promoData.tabs || []) {
      for (const cat of tab.categories || []) {
        allTiles.push(...(cat.promotionTiles || []))
      }
    }

    const available = allTiles.filter(t => t.available && t.localizedURLLink)
    console.log(`  ${allTiles.length} tile → ${available.length} beschikbaar deze week`)

    const productTiles = available.filter(t => t.localizedURLLink.startsWith('/') && t.localizedURLLink.includes('/p/'))
    const promoTiles = available.filter(t => t.localizedURLLink.startsWith('/a/'))

    console.log(`  ${productTiles.length} product pages, ${promoTiles.length} promo category pages`)

    // Fetch prices for /p/ tiles
    console.log(`\n📦 Product sayfaları fetch ediliyor (${productTiles.length} items)...`)
    const productResults = await batchFetch(productTiles, async (tile) => {
      const data = await getProductPrice(tile.localizedURLLink)
      if (!data || !data.discountedPrice) return null
      const imgRaw = tile.image?.url
      const imageUrl = data.imageUrl
        || (imgRaw ? (imgRaw.startsWith('http') ? imgRaw : 'https://media.kruidvat.nl' + imgRaw) : null)
      return {
        name: data.name || tile.title,
        discountedPrice: data.discountedPrice,
        originalPrice: data.originalPrice || data.discountedPrice,
        imageUrl,
        url: data.url,
        campaignType: toCampaignType(tile.localizedURLLink, tile.title || ''),
        isCampaign: true,
        expiresAt: null,
      }
    })

    // Build campaign-only entries for /a/ promo tiles (no price fetch)
    const promoResults = promoTiles.map(tile => {
      const ct = toCampaignType(tile.localizedURLLink, tile.title || '')
      const imgRaw = tile.image?.url
      const imageUrl = imgRaw ? (imgRaw.startsWith('http') ? imgRaw : 'https://media.kruidvat.nl' + imgRaw) : null
      if (!ct) return null // skip if no campaign type can be determined
      return {
        name: tile.title,
        discountedPrice: 0.01, // placeholder — no price available from promo category
        originalPrice: 0.01,
        imageUrl,
        url: 'https://www.kruidvat.nl' + tile.localizedURLLink,
        campaignType: ct,
        isCampaign: true,
        expiresAt: null,
      }
    })

    const allProducts = [...productResults, ...promoResults].filter(Boolean)

    // Dedup by name
    const seenNames = new Set()
    const unique = allProducts.filter(p => {
      const key = p.name?.toLowerCase().trim()
      if (!key || seenNames.has(key)) return false
      seenNames.add(key)
      return true
    })

    console.log(`  ✅ ${allProducts.length} ürün → ${unique.length} uniek na naam-dedup`)
    console.log(`    (${unique.filter(p => p.discountedPrice > 0.01).length} with real price, ${unique.filter(p => p.discountedPrice <= 0.01).length} campaign-only)`)

    if (unique.length === 0) throw new Error('Hiç ürün bulunamadı!')

    console.log('\n📤 Railway\'e gönderiliyor...')
    const postRes = await fetch(`${BACKEND_URL}/api/products/bulk-replace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ADMIN_TOKEN}` },
      body: JSON.stringify({ market: 'Kruidvat', products: unique }),
    })
    const json = await postRes.json()
    if (!postRes.ok) throw new Error(`Backend: ${JSON.stringify(json)}`)
    console.log(`✅ ${json.count} ürün eklendi!`)
  } catch (e) {
    console.error('❌', e.message)
    process.exit(1)
  }
})()
