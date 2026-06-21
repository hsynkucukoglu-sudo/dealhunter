/**
 * Kruidvat scraper → Railway bulk-replace
 * node kruidvat-scraper-post.js
 */

const BACKEND_URL = process.env.BACKEND_URL || 'https://dealhunter-production-d900.up.railway.app'
const ADMIN_TOKEN = process.env.ADMIN_TOKEN

if (!ADMIN_TOKEN) { console.error('❌ ADMIN_TOKEN eksik'); process.exit(1) }

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36'

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

;(async () => {
  try {
    console.log('🏪 Kruidvat SSR yükleniyor...')
    const res = await fetch('https://www.kruidvat.nl/aanbiedingen', {
      headers: { 'User-Agent': UA, 'Accept': 'text/html,*/*', 'Accept-Language': 'nl-NL,nl;q=0.9' },
      signal: AbortSignal.timeout(25000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()

    const stateMatch = html.match(/<script id="spartacus-app-state" type="application\/json">([\s\S]*?)<\/script>/)
    if (!stateMatch) throw new Error('spartacus-app-state bulunamadı')

    const decoded = stateMatch[1]
      .replace(/&quot;/g, '"').replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))

    const state = JSON.parse(decoded)
    const promoTab = state['promo-tab-dezeweek']
    if (!promoTab) throw new Error('promo-tab-dezeweek bulunamadı')

    const allTiles = []
    for (const tab of promoTab.tabs || []) {
      for (const cat of tab.categories || []) {
        allTiles.push(...(cat.promotionTiles || []))
      }
    }
    const seenCodes = new Set()
    const productTiles = allTiles.filter(t => {
      if (!t.available || !t.localizedURLLink?.includes('/p/')) return false
      const code = t.localizedURLLink.match(/\/p\/(\d+)/)?.[1]
      if (!code || seenCodes.has(code)) return false
      seenCodes.add(code)
      return true
    })
    console.log(`  ${allTiles.length} tile → ${productTiles.length} unieke ürün tile`)

    const OCC = 'https://api.kruidvat.nl/api/v2/kvn-spa'
    const kvH = { 'User-Agent': UA, Accept: 'application/json', 'Accept-Language': 'nl-NL,nl;q=0.9', Referer: 'https://www.kruidvat.nl/aanbiedingen' }
    const CONCURRENCY = 10
    const products = []

    for (let i = 0; i < productTiles.length; i += CONCURRENCY) {
      const batch = productTiles.slice(i, i + CONCURRENCY)
      const batchRes = await Promise.all(batch.map(async (tile) => {
        const code = tile.localizedURLLink.match(/\/p\/(\d+)/)?.[1]
        if (!code) return null
        try {
          const r = await fetch(`${OCC}/products/${code}?lang=nl&curr=EUR&fields=FULL`, { headers: kvH, signal: AbortSignal.timeout(10000) })
          if (!r.ok) return null
          const p = await r.json()
          const discountedPrice = p.price?.value
          if (!discountedPrice || discountedPrice <= 0) return null
          const originalPrice = p.price?.oldValue ?? discountedPrice
          const rawImg = p.listImage?.url || p.thumbnailImage?.url || tile.image?.url || null
          const imageUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `https://media.kruidvat.nl${rawImg}`) : null
          const endDate = p.topPromotion?.endDate || null
          const promoText = [p.topPromotion?.description || '', tile.title || '', tile.localizedURLLink || ''].join(' ')
          return {
            name: p.name || tile.title,
            discountedPrice,
            originalPrice: originalPrice > discountedPrice ? originalPrice : discountedPrice,
            imageUrl,
            url: `https://www.kruidvat.nl${tile.localizedURLLink}`,
            expiresAt: endDate ? new Date(endDate).toISOString().split('T')[0] : null,
            campaignType: toCampaignType(promoText),
            isCampaign: true,
          }
        } catch { return null }
      }))
      const valid = batchRes.filter(Boolean)
      products.push(...valid)
      process.stdout.write(`\r  Batch ${Math.floor(i/CONCURRENCY)+1}/${Math.ceil(productTiles.length/CONCURRENCY)}: ${products.length} ürün`)
    }
    // Name-based dedup — different codes can resolve to the same product name
    const seenNames = new Set()
    const unique = products.filter(p => {
      const key = p.name?.toLowerCase().trim()
      if (!key || seenNames.has(key)) return false
      seenNames.add(key)
      return true
    })
    console.log(`\n  ✅ ${products.length} ürün → ${unique.length} uniek na naam-dedup`)

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
