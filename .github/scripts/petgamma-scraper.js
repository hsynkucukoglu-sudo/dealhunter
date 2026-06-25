/**
 * Petgamma.com scraper — Daisycon affiliate (li: 20686)
 * Sale/actie sayfasından indirimli evcil hayvan ürünlerini çeker.
 *
 * Kullanım: BACKEND_URL=... ADMIN_TOKEN=... node petgamma-scraper.js
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
}

// Affiliate tracking link (Daisycon si=16070, li=20686)
const AFFILIATE_BASE = 'https://ds1.nl/c/?si=16070&li=20686&wi=420902&dl='

function affiliateUrl(dest) {
  return AFFILIATE_BASE + encodeURIComponent(dest)
}

function parsePrice(raw) {
  if (!raw && raw !== 0) return 0
  if (typeof raw === 'number') return raw
  return parseFloat(String(raw).replace(/[^\d.,]/g, '').replace(',', '.')) || 0
}

function extractNextData(html) {
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)
  if (m) { try { return JSON.parse(m[1]) } catch { return null } }
  return null
}

// Petgamma GraphQL API deneyi (Magento pattern yaygın)
async function tryGraphQL() {
  const endpoints = [
    'https://www.petgamma.com/graphql',
    'https://petgamma.com/graphql',
  ]

  const query = JSON.stringify({
    query: `{
      products(filter: { on_sale: { eq: "1" } }, pageSize: 100) {
        items {
          name
          sku
          price_range {
            minimum_price {
              regular_price { value }
              final_price { value }
            }
          }
          small_image { url }
          url_key
        }
      }
    }`
  })

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { ...BASE_HEADERS, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: query,
        signal: AbortSignal.timeout(12000),
      })
      if (!res.ok) continue
      const json = await res.json()
      const items = json?.data?.products?.items
      if (!Array.isArray(items) || items.length === 0) continue

      console.log(`  ✅ GraphQL (${url}): ${items.length} ürün`)
      return items.map(p => {
        const orig = parsePrice(p.price_range?.minimum_price?.regular_price?.value)
        const disc = parsePrice(p.price_range?.minimum_price?.final_price?.value)
        if (!disc) return null
        return {
          name: p.name,
          discountedPrice: disc,
          originalPrice: orig > disc ? orig : disc,
          imageUrl: p.small_image?.url || null,
          url: affiliateUrl(`https://www.petgamma.com/${p.url_key}`),
          market: 'Petgamma',
          category: 'Huisdieren',
          isCampaign: orig > disc,
          source: 'petgamma.com/sale',
        }
      }).filter(Boolean)
    } catch { /* skip */ }
  }
  return null
}

// WooCommerce REST API deneyi
async function tryWooCommerce() {
  const endpoints = [
    'https://www.petgamma.com/wp-json/wc/v3/products?on_sale=true&per_page=100',
    'https://petgamma.com/wp-json/wc/v3/products?on_sale=true&per_page=100',
  ]
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: { ...BASE_HEADERS, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(12000),
      })
      if (!res.ok) continue
      const items = await res.json()
      if (!Array.isArray(items) || items.length === 0) continue

      console.log(`  ✅ WooCommerce (${url}): ${items.length} ürün`)
      return items.map(p => ({
        name: p.name,
        discountedPrice: parsePrice(p.sale_price || p.price),
        originalPrice: parsePrice(p.regular_price || p.price),
        imageUrl: p.images?.[0]?.src || null,
        url: affiliateUrl(p.permalink || `https://www.petgamma.com/`),
        market: 'Petgamma',
        category: p.categories?.[0]?.name ?? 'Huisdieren',
        isCampaign: !!(p.sale_price && p.regular_price && parsePrice(p.sale_price) < parsePrice(p.regular_price)),
        source: 'petgamma.com',
      })).filter(p => p.name && p.discountedPrice > 0)
    } catch { /* skip */ }
  }
  return null
}

// Sale sayfalarını HTML parse et
async function tryHtmlParse() {
  const saleUrls = [
    'https://www.petgamma.com/sale',
    'https://www.petgamma.com/actie',
    'https://www.petgamma.com/aanbiedingen',
    'https://www.petgamma.com/korting',
  ]

  for (const pageUrl of saleUrls) {
    try {
      console.log(`  Deneniyor: ${pageUrl}`)
      const res = await fetch(pageUrl, {
        headers: BASE_HEADERS,
        signal: AbortSignal.timeout(18000),
      })
      if (!res.ok) {
        console.log(`    HTTP ${res.status} — atlanıyor`)
        continue
      }
      const html = await res.text()

      // Next.js data
      const nextData = extractNextData(html)
      if (nextData) {
        console.log('  ✅ __NEXT_DATA__ bulundu')
        const products = extractProductsFromState(nextData, pageUrl)
        if (products.length > 0) return products
      }

      // JSON-LD
      const jsonLdMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      const products = []
      for (const m of jsonLdMatches) {
        try {
          const data = JSON.parse(m[1])
          const items = data['@type'] === 'ItemList'
            ? (data.itemListElement ?? []).map(e => e.item ?? e)
            : data['@type'] === 'Product' ? [data] : []

          for (const item of items) {
            const offer = item.offers
            if (!offer) continue
            const disc = parsePrice(offer.price ?? offer.lowPrice)
            const orig = parsePrice(offer.highPrice ?? offer.price)
            if (!disc) continue
            products.push({
              name: item.name ?? '',
              discountedPrice: disc,
              originalPrice: orig > disc ? orig : disc,
              imageUrl: item.image ?? null,
              url: affiliateUrl(item.url ?? pageUrl),
              market: 'Petgamma',
              category: 'Huisdieren',
              isCampaign: orig > disc,
              source: `petgamma.com${new URL(pageUrl).pathname}`,
            })
          }
        } catch { /* skip */ }
      }

      if (products.length > 0) {
        console.log(`  ✅ JSON-LD (${pageUrl}): ${products.length} ürün`)
        return products
      }

      // Eğer sayfa yüklendiyse ama parse olmadıysa, debug bilgisi ver
      if (html.length > 1000) {
        console.log(`  ⚠️  Sayfa yüklendi (${html.length} bytes) ama ürün parse edilemedi`)
        // Sayfa kaynağının ilk kısmını göster
        const scriptTags = html.match(/<script[^>]*>([\s\S]{0,100})/g) || []
        console.log(`  Script tag sayısı: ${scriptTags.length}`)
        if (html.includes('__NEXT_DATA__')) console.log('  → __NEXT_DATA__ var ama boş')
        if (html.includes('application/ld+json')) console.log('  → JSON-LD var ama ürün yapısı farklı')
      }
    } catch (e) {
      console.log(`  ⚠️  ${pageUrl}: ${e.message}`)
    }
  }

  return []
}

function extractProductsFromState(obj, sourceUrl) {
  const products = []
  const traverse = (node) => {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) { node.forEach(traverse); return }

    if ((node.name || node.title) && node.price !== undefined) {
      const disc = parsePrice(node.salePrice ?? node.sale_price ?? node.discountedPrice ?? node.price)
      const orig = parsePrice(node.originalPrice ?? node.regular_price ?? node.compareAtPrice ?? node.price)
      if (disc > 0) {
        products.push({
          name: String(node.name ?? node.title),
          discountedPrice: disc,
          originalPrice: orig > disc ? orig : disc,
          imageUrl: node.image ?? node.thumbnail ?? node.image_url ?? null,
          url: affiliateUrl(node.url ?? node.permalink
            ? String(node.url ?? node.permalink)
            : sourceUrl),
          market: 'Petgamma',
          category: node.category ?? 'Huisdieren',
          isCampaign: orig > disc,
          source: `petgamma.com${new URL(sourceUrl).pathname}`,
        })
      }
    }
    Object.values(node).forEach(traverse)
  }
  traverse(obj)
  return products
}

async function postToBackend(products) {
  console.log(`\n📤 ${products.length} ürün Railway'e gönderiliyor (market: Petgamma)...`)
  const res = await fetch(`${BACKEND_URL}/api/products/bulk-replace`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify({ market: 'Petgamma', products }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`Backend hata: ${JSON.stringify(json)}`)
  console.log(`✅ Backend: ${json.count ?? json.inserted ?? '?'} ürün eklendi`)
}

;(async () => {
  console.log('🐾 Petgamma scraper başlıyor...')
  try {
    let products = null

    console.log('\n1️⃣  GraphQL deneniyor...')
    products = await tryGraphQL()

    if (!products || products.length === 0) {
      console.log('2️⃣  WooCommerce API deneniyor...')
      products = await tryWooCommerce()
    }

    if (!products || products.length === 0) {
      console.log('3️⃣  HTML parse deneniyor...')
      products = await tryHtmlParse()
    }

    if (!products || products.length === 0) {
      console.error('❌ Hiç ürün bulunamadı.')
      console.error('   Çözüm: Petgamma.com\'u tarayıcıda aç, Network sekmesinde XHR/fetch isteklerine bak.')
      console.error('   Bulunan API endpoint\'ini buraya ekle.')
      process.exit(1)
    }

    const valid = products.filter(p => p.name && p.discountedPrice > 0)
    console.log(`\n✅ ${valid.length} geçerli ürün`)
    await postToBackend(valid)
  } catch (e) {
    console.error('❌ Hata:', e.message)
    process.exit(1)
  }
})()
