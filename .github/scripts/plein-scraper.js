/**
 * Plein.nl scraper — Daisycon affiliate (li: 3366)
 * Aanbiedingen/sale sayfasından indirimli ürünleri çeker.
 * İlk çalıştırma sonrası sayfa yapısına göre ince ayar gerekebilir.
 *
 * Kullanım: BACKEND_URL=... ADMIN_TOKEN=... node plein-scraper.js
 */

const BACKEND_URL = process.env.BACKEND_URL || 'https://dealhunter-production-d900.up.railway.app'
const ADMIN_TOKEN = process.env.ADMIN_TOKEN

if (!ADMIN_TOKEN) { console.error('❌ ADMIN_TOKEN eksik'); process.exit(1) }

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36'
const BASE_HEADERS = {
  'User-Agent': UA,
  'Accept': 'text/html,application/xhtml+xml,*/*;q=0.9',
  'Accept-Language': 'nl-NL,nl;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
}

// Affiliate tracking link (Daisycon si=16070, li=3366)
const AFFILIATE_BASE = 'https://ds1.nl/c/?si=16070&li=3366&wi=420902&dl='

function affiliateUrl(dest) {
  return AFFILIATE_BASE + encodeURIComponent(dest)
}

function extractNextData(html) {
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)
  if (m) {
    try { return JSON.parse(m[1]) } catch { return null }
  }
  return null
}

function extractNuxtData(html) {
  const m = html.match(/window\.__NUXT__\s*=\s*({[\s\S]*?})<\/script>/)
  if (m) {
    try { return JSON.parse(m[1]) } catch { return null }
  }
  return null
}

function extractEmbeddedJson(html) {
  // Ortak pattern: window.__INITIAL_STATE__ veya window.__STATE__
  const patterns = [
    /window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?})\s*;<\/script>/,
    /window\.__STATE__\s*=\s*({[\s\S]*?})\s*;<\/script>/,
    /window\.APP_STATE\s*=\s*({[\s\S]*?})\s*;<\/script>/,
  ]
  for (const p of patterns) {
    const m = html.match(p)
    if (m) { try { return JSON.parse(m[1]) } catch { /* skip */ } }
  }
  return null
}

function parsePrice(raw) {
  if (!raw && raw !== 0) return 0
  if (typeof raw === 'number') return raw
  return parseFloat(String(raw).replace(/[^\d.,]/g, '').replace(',', '.')) || 0
}

// Plein.nl GraphQL API deneyi (Magento pattern)
async function tryGraphQL() {
  const query = JSON.stringify({
    query: `{
      categoryList(filters: { url_key: { eq: "aanbiedingen" } }) {
        products {
          items {
            name
            sku
            price_range {
              minimum_price {
                regular_price { value currency }
                final_price { value currency }
              }
            }
            small_image { url }
            url_key
          }
        }
      }
    }`
  })

  try {
    const res = await fetch('https://www.plein.nl/graphql', {
      method: 'POST',
      headers: { ...BASE_HEADERS, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: query,
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    const json = await res.json()
    const items = json?.data?.categoryList?.[0]?.products?.items
    if (!Array.isArray(items) || items.length === 0) return null

    console.log(`  ✅ GraphQL: ${items.length} ürün bulundu`)
    return items
      .map(p => {
        const orig = parsePrice(p.price_range?.minimum_price?.regular_price?.value)
        const disc = parsePrice(p.price_range?.minimum_price?.final_price?.value)
        if (!disc || disc <= 0) return null
        return {
          name: p.name,
          discountedPrice: disc,
          originalPrice: orig > disc ? orig : disc,
          imageUrl: p.small_image?.url || null,
          url: affiliateUrl(`https://www.plein.nl/${p.url_key}`),
          market: 'Plein.nl',
          category: 'Gezondheid & Beauty',
          isCampaign: orig > disc,
          source: 'plein.nl/aanbiedingen',
        }
      })
      .filter(Boolean)
  } catch {
    return null
  }
}

// Plein.nl REST API deneyi (custom e-commerce pattern)
async function tryRestApi() {
  const endpoints = [
    'https://www.plein.nl/api/products?category=sale&per_page=100',
    'https://www.plein.nl/api/aanbiedingen',
    'https://www.plein.nl/api/v1/products?filter=sale',
  ]

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: { ...BASE_HEADERS, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) continue
      const json = await res.json()

      const items = json.data ?? json.products ?? json.items ?? (Array.isArray(json) ? json : null)
      if (!Array.isArray(items) || items.length === 0) continue

      console.log(`  ✅ REST API (${url}): ${items.length} ürün`)
      return items.map(p => ({
        name: p.name ?? p.title ?? '',
        discountedPrice: parsePrice(p.sale_price ?? p.discounted_price ?? p.price),
        originalPrice: parsePrice(p.price ?? p.original_price ?? p.regular_price),
        imageUrl: p.image ?? p.image_url ?? p.thumbnail ?? null,
        url: affiliateUrl(p.url ?? p.permalink ?? `https://www.plein.nl/`),
        market: 'Plein.nl',
        category: p.category ?? 'Gezondheid & Beauty',
        isCampaign: true,
        source: 'plein.nl',
      })).filter(p => p.name && p.discountedPrice > 0)
    } catch { /* skip */ }
  }
  return null
}

// HTML parse fallback
async function tryHtmlParse() {
  console.log('  HTML parse deneniyor...')
  const res = await fetch('https://www.plein.nl/aanbiedingen', {
    headers: BASE_HEADERS,
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()

  // Next.js data
  const nextData = extractNextData(html)
  if (nextData) {
    console.log('  ✅ __NEXT_DATA__ bulundu')
    const products = extractFromNextData(nextData)
    if (products.length > 0) return products
  }

  // Nuxt data
  const nuxtData = extractNuxtData(html)
  if (nuxtData) {
    console.log('  ✅ __NUXT__ bulundu')
  }

  // Window state
  const state = extractEmbeddedJson(html)
  if (state) {
    console.log('  ✅ window state bulundu')
  }

  // Son çare: JSON-LD structured data
  const jsonLdMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  const products = []
  for (const m of jsonLdMatches) {
    try {
      const data = JSON.parse(m[1])
      if (data['@type'] === 'Product' || data['@type'] === 'ItemList') {
        const items = data['@type'] === 'ItemList' ? (data.itemListElement ?? []) : [data]
        for (const item of items) {
          const offer = item.offers ?? item.item?.offers
          if (!offer) continue
          const disc = parsePrice(offer.price ?? offer.lowPrice)
          const orig = parsePrice(offer.highPrice ?? offer.price)
          if (!disc) continue
          products.push({
            name: item.name ?? item.item?.name ?? '',
            discountedPrice: disc,
            originalPrice: orig > disc ? orig : disc,
            imageUrl: item.image ?? item.item?.image ?? null,
            url: affiliateUrl(item.url ?? item.item?.url ?? 'https://www.plein.nl/aanbiedingen'),
            market: 'Plein.nl',
            category: 'Gezondheid & Beauty',
            isCampaign: orig > disc,
            source: 'plein.nl/aanbiedingen',
          })
        }
      }
    } catch { /* skip */ }
  }

  if (products.length > 0) {
    console.log(`  ✅ JSON-LD: ${products.length} ürün`)
    return products
  }

  // Debug için ilk 500 karakteri logla
  console.log('  ⚠️  Parse başarısız. Sayfa başlangıcı:')
  console.log(html.substring(0, 500))
  return []
}

function extractFromNextData(data) {
  const products = []
  const traverse = (obj) => {
    if (!obj || typeof obj !== 'object') return
    if (Array.isArray(obj)) { obj.forEach(traverse); return }

    // Yaygın Next.js ürün yapıları
    if (obj.price !== undefined && (obj.name || obj.title)) {
      const disc = parsePrice(obj.salePrice ?? obj.sale_price ?? obj.price)
      const orig = parsePrice(obj.originalPrice ?? obj.regular_price ?? obj.compareAtPrice ?? obj.price)
      if (disc > 0) {
        products.push({
          name: String(obj.name ?? obj.title),
          discountedPrice: disc,
          originalPrice: orig > disc ? orig : disc,
          imageUrl: obj.image ?? obj.thumbnail ?? obj.image_url ?? null,
          url: affiliateUrl(obj.url ?? obj.slug
            ? `https://www.plein.nl/${obj.slug}`
            : 'https://www.plein.nl/aanbiedingen'),
          market: 'Plein.nl',
          category: obj.category ?? 'Gezondheid & Beauty',
          isCampaign: orig > disc,
          source: 'plein.nl/aanbiedingen',
        })
      }
    }
    Object.values(obj).forEach(traverse)
  }
  traverse(data)
  return products
}

async function postToBackend(products) {
  console.log(`\n📤 ${products.length} ürün Railway'e gönderiliyor (market: Plein.nl)...`)
  const res = await fetch(`${BACKEND_URL}/api/products/bulk-replace`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify({ market: 'Plein.nl', products }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`Backend hata: ${JSON.stringify(json)}`)
  console.log(`✅ Backend: ${json.count ?? json.inserted ?? '?'} ürün eklendi`)
}

;(async () => {
  console.log('🏪 Plein.nl scraper başlıyor...')
  try {
    let products = null

    // 1) GraphQL dene
    console.log('\n1️⃣  GraphQL deneniyor...')
    products = await tryGraphQL()

    // 2) REST API dene
    if (!products || products.length === 0) {
      console.log('2️⃣  REST API deneniyor...')
      products = await tryRestApi()
    }

    // 3) HTML parse
    if (!products || products.length === 0) {
      console.log('3️⃣  HTML parse deneniyor...')
      products = await tryHtmlParse()
    }

    if (!products || products.length === 0) {
      console.error('❌ Hiç ürün bulunamadı. Plein.nl sayfa yapısı değişmiş olabilir.')
      console.error('   İpucu: html çıktısını kontrol et, yeni API endpoint ara.')
      process.exit(1)
    }

    // Geçersiz kayıtları temizle
    const valid = products.filter(p => p.name && p.discountedPrice > 0)
    console.log(`\n✅ ${valid.length} geçerli ürün (${products.length - valid.length} atlandı)`)

    await postToBackend(valid)
  } catch (e) {
    console.error('❌ Hata:', e.message)
    process.exit(1)
  }
})()
