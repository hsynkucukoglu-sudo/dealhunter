/**
 * Kruidvat scraper → Railway bulk-replace
 * node kruidvat-scraper-post.js
 */

const BACKEND_URL = process.env.BACKEND_URL || 'https://dealhunter-production-d900.up.railway.app'
const ADMIN_TOKEN = process.env.ADMIN_TOKEN

if (!ADMIN_TOKEN) { console.error('❌ ADMIN_TOKEN eksik'); process.exit(1) }

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
const OCC  = 'https://api.kruidvat.nl/api/v2/kvn-spa'
const kvH  = {
  'User-Agent': UA,
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'nl-NL,nl;q=0.9',
  'Referer': 'https://www.kruidvat.nl/',
  'Origin': 'https://www.kruidvat.nl',
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

// Fetch all promotion products directly from the OCC search API (bypasses Cloudflare HTML page)
async function fetchPromoProducts() {
  const allProducts = []
  let page = 0
  const pageSize = 100

  while (true) {
    const url = `${OCC}/products/search?query=%3Arelevance%3AisPromoted%3Atrue&lang=nl&curr=EUR&currentPage=${page}&pageSize=${pageSize}&fields=products(code,name,price(value,oldValue),listImage(url),thumbnailImage(url),topPromotion(description,endDate),url),pagination`
    const res = await fetch(url, { headers: kvH, signal: AbortSignal.timeout(20000) })
    if (!res.ok) throw new Error(`OCC search HTTP ${res.status}`)
    const data = await res.json()

    const items = data.products ?? []
    allProducts.push(...items)
    process.stdout.write(`\r  Sayfa ${page + 1}: ${allProducts.length} ürün`)

    const total = data.pagination?.totalPages ?? 1
    if (page + 1 >= total || items.length === 0) break
    page++
  }

  console.log(`\n  Toplam: ${allProducts.length} promo ürün`)
  return allProducts
}

;(async () => {
  try {
    console.log('🏪 Kruidvat OCC API sorgulanıyor...')
    const raw = await fetchPromoProducts()

    const seenCodes = new Set()
    const products = raw
      .filter(p => {
        if (!p.code || seenCodes.has(p.code)) return false
        seenCodes.add(p.code)
        return true
      })
      .map(p => {
        const discountedPrice = p.price?.value
        if (!discountedPrice || discountedPrice <= 0) return null
        const originalPrice = p.price?.oldValue ?? discountedPrice
        const rawImg = p.listImage?.url || p.thumbnailImage?.url || null
        const imageUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `https://media.kruidvat.nl${rawImg}`) : null
        const endDate = p.topPromotion?.endDate || null
        const promoText = p.topPromotion?.description || ''
        return {
          name: p.name,
          discountedPrice,
          originalPrice: originalPrice > discountedPrice ? originalPrice : discountedPrice,
          imageUrl,
          url: p.url ? `https://www.kruidvat.nl${p.url}` : null,
          expiresAt: endDate ? new Date(endDate).toISOString().split('T')[0] : null,
          campaignType: toCampaignType(promoText),
          isCampaign: true,
        }
      })
      .filter(Boolean)

    // Name-based dedup
    const seenNames = new Set()
    const unique = products.filter(p => {
      const key = p.name?.toLowerCase().trim()
      if (!key || seenNames.has(key)) return false
      seenNames.add(key)
      return true
    })
    console.log(`  ✅ ${products.length} ürün → ${unique.length} uniek na naam-dedup`)

    console.log(`\n📤 Railway'e gönderiliyor...`)
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
