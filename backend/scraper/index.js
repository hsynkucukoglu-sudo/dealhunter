/**
 * Fetch-only scraper — Puppeteer/Chromium yok.
 * Render free tier (512MB) ile uyumlu.
 */
import * as cheerio from 'cheerio'

const EXPIRES_AT = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const HEADERS = {
  'User-Agent': UA,
  'Accept-Language': 'nl-NL,nl;q=0.9',
  'Accept': 'text/html,application/xhtml+xml',
}

// ─── DIRK — JSON-LD ──────────────────────────────────────────────────────────
async function scrapeDirk() {
  console.log('🏪 [Dirk] dirk.nl/aanbiedingen...')
  try {
    const res = await fetch('https://www.dirk.nl/aanbiedingen', { headers: HEADERS })
    const html = await res.text()
    const jsonLdBlock = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]
    if (!jsonLdBlock) return []

    const data = JSON.parse(jsonLdBlock)
    const items = data['@graph']?.[0]?.itemListElement || []

    const results = items.map(item => {
      const p = item.item
      if (!p?.name || !p.offers?.price) return null
      const discountedPrice = parseFloat(p.offers.price)
      if (!discountedPrice) return null
      const imgSrc = Array.isArray(p.image) ? p.image[0] : (p.image || null)
      return {
        name: p.name,
        market: 'Dirk',
        originalPrice: parseFloat((discountedPrice * 1.35).toFixed(2)),
        discountedPrice,
        imageUrl: imgSrc,
        isCampaign: true,
        source: 'dirk.nl/aanbiedingen',
        expiresAt: EXPIRES_AT,
      }
    }).filter(Boolean)

    console.log(`  ✅ Dirk: ${results.length} ürün`)
    return results
  } catch (e) {
    console.error('  ❌ Dirk:', e.message)
    return []
  }
}

// ─── JUMBO — SSR cheerio ─────────────────────────────────────────────────────
async function scrapeJumbo() {
  console.log('🏪 [Jumbo] jumbo.com/aanbiedingen...')
  try {
    const res = await fetch('https://www.jumbo.com/aanbiedingen/nu', { headers: HEADERS })
    const html = await res.text()
    const $ = cheerio.load(html)
    const results = []

    $('li.jum-card.card-promotion').each((_, el) => {
      const card = $(el)
      const img = card.find('img').first()
      const imgSrc = img.attr('src') || img.attr('data-src') || null
      const text = card.text()
      const titleEl = card.find('h3, [data-testid="jum-heading"] a, .title').first()
      const name = titleEl.text().trim() || card.find('a[href*="/aanbied"]').first().text().trim()
      if (!name || name.length < 3) return

      // Fiyat: "voor X,XX" veya "€X,XX" veya herhangi bir fiyat
      const priceMatch = text.match(/voor\s+(\d+[,.]\d+)/i) || text.match(/€\s*(\d+[,.]\d+)/)
      const discountedPrice = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : 0

      // 1+1 gratis gibi kampanyalarda fiyat olmayabilir — yine de ekle
      const promoMatch = text.match(/(1\+1|2\+1|\d+\+\d+)\s*gratis/i)
      if (!discountedPrice && !promoMatch) return

      results.push({
        name: promoMatch && !discountedPrice ? `${promoMatch[0].toUpperCase()} — ${name}` : name,
        market: 'Jumbo',
        originalPrice: discountedPrice ? parseFloat((discountedPrice * 1.35).toFixed(2)) : 0,
        discountedPrice,
        imageUrl: imgSrc && !imgSrc.includes('logo') ? imgSrc : null,
        isCampaign: true,
        source: 'jumbo.com/aanbiedingen',
        expiresAt: EXPIRES_AT,
      })
    })

    console.log(`  ✅ Jumbo: ${results.length} ürün`)
    return results
  } catch (e) {
    console.error('  ❌ Jumbo:', e.message)
    return []
  }
}

// ─── HOOGVLIET — embedded JSON ───────────────────────────────────────────────
async function scrapeHoogvliet() {
  console.log('🏪 [Hoogvliet] hoogvliet.com/aanbiedingen...')
  try {
    const res = await fetch('https://www.hoogvliet.com/aanbiedingen', { headers: HEADERS })
    const html = await res.text()
    // Build ID → image URL map (img srcs fully HTML-encoded: &#47; instead of /)
    const imgMap = {}
    for (const m of html.matchAll(/&#47;INTERSHOP&#47;[^"']*ACT[^"']*&#47;(\d+)\.(?:jpg|png|webp)/g)) {
      const id = m[1]
      const decoded = m[0].replace(/&#47;/g, '/')
      if (!imgMap[id]) imgMap[id] = `https://www.hoogvliet.com${decoded}`
    }

    const jsonBlocks = html.match(/\{[^{}]*"price"\s*:\s*"[\d.]+[^{}]*\}/g) || []
    const seen = new Set()
    const results = []

    for (const block of jsonBlocks) {
      try {
        const obj = JSON.parse(block.replace(/&#47;/g, '/').replace(/&amp;/g, '&'))
        if (!obj.name || !obj.price || seen.has(obj.name)) continue
        seen.add(obj.name)
        const discountedPrice = parseFloat(obj.price)
        if (!discountedPrice) continue
        results.push({
          name: obj.name,
          market: 'Hoogvliet',
          originalPrice: parseFloat((discountedPrice * 1.35).toFixed(2)),
          discountedPrice,
          imageUrl: imgMap[obj.id] || null,
          isCampaign: true,
          source: 'hoogvliet.com/aanbiedingen',
          expiresAt: EXPIRES_AT,
        })
      } catch {}
    }

    console.log(`  ✅ Hoogvliet: ${results.length} ürün`)
    return results
  } catch (e) {
    console.error('  ❌ Hoogvliet:', e.message)
    return []
  }
}

// ─── PLUS — SSR cheerio ──────────────────────────────────────────────────────
async function scrapePlus() {
  console.log('🏪 [Plus] plus.nl/aanbiedingen...')
  try {
    const res = await fetch('https://www.plus.nl/aanbiedingen', { headers: HEADERS })
    const html = await res.text()
    const $ = cheerio.load(html)
    const results = []

    // Plus SSR items (when available)
    $('.plp-item-wrapper, [class*="product-item"], [class*="offer-item"]').each((_, el) => {
      const item = $(el)
      const img = item.find('img').first()
      const imgSrc = img.attr('src') || img.attr('data-src') || null
      const text = item.text().replace(/\s+/g, ' ').trim()
      if (!text || text.length < 10) return

      const reconstructed = text.replace(/(\d+)\. (\d+)/g, '$1.$2')
      const priceMatches = reconstructed.match(/\b\d+\.\d+\b/g)
      if (!priceMatches) return
      const prices = priceMatches.map(s => parseFloat(s)).filter(n => n > 0 && n < 500)
      if (!prices.length) return

      const discountedPrice = Math.min(...prices)
      const originalPrice = prices.length > 1 ? Math.max(...prices) : parseFloat((discountedPrice * 1.35).toFixed(2))
      let name = ''
      const bijvMatch = text.match(/Bijv\.?\s+([^0-9€]{5,60})/i)
      if (bijvMatch) name = bijvMatch[1].trim()
      else {
        const alleMatch = text.match(/Alle\s+([^0-9€]{5,60})/i)
        name = alleMatch ? alleMatch[1].trim() : ''
      }
      if (!name || name.length < 4) return

      results.push({
        name,
        market: 'Plus',
        originalPrice,
        discountedPrice,
        imageUrl: imgSrc && !imgSrc.includes('logo') ? imgSrc : null,
        isCampaign: true,
        source: 'plus.nl/aanbiedingen',
        expiresAt: EXPIRES_AT,
      })
    })

    console.log(`  ✅ Plus: ${results.length} ürün`)
    return results
  } catch (e) {
    console.error('  ❌ Plus:', e.message)
    return []
  }
}

// ─── LIDL — ID'leri HTML'den çek, her ürünü JSON-LD ile fetch et ─────────────
async function scrapeLidl() {
  console.log('🏪 [Lidl] lidl.nl/aanbiedingen...')
  try {
    // Offers sayfasından ürün ID'lerini topla
    const res = await fetch('https://www.lidl.nl/aanbiedingen', { headers: HEADERS })
    const html = await res.text()
    const ids = [...new Set(html.match(/p10\d{6}/g) || [])]
    if (!ids.length) return []

    // Her ürünü JSON-LD ile çek (5'li batch, max 40 ürün)
    const results = []
    const BATCH = 5
    for (let i = 0; i < Math.min(ids.length, 40); i += BATCH) {
      const batch = ids.slice(i, i + BATCH)
      const batchResults = await Promise.all(batch.map(async id => {
        try {
          const pRes = await fetch(`https://www.lidl.nl/p/${id}`, { headers: HEADERS })
          const pHtml = await pRes.text()
          const jsonLd = pHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]
          if (!jsonLd) return null
          const data = JSON.parse(jsonLd)
          if (data['@type'] !== 'Product') return null
          const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers
          const discountedPrice = parseFloat(offer?.price)
          if (!discountedPrice) return null
          const img = Array.isArray(data.image) ? data.image[0] : (data.image || null)
          return {
            name: data.name,
            market: 'Lidl',
            originalPrice: parseFloat((discountedPrice * 1.35).toFixed(2)),
            discountedPrice,
            imageUrl: img || null,
            isCampaign: true,
            source: 'lidl.nl/aanbiedingen',
            expiresAt: EXPIRES_AT,
          }
        } catch { return null }
      }))
      results.push(...batchResults.filter(Boolean))
    }

    console.log(`  ✅ Lidl: ${results.length} ürün`)
    return results
  } catch (e) {
    console.error('  ❌ Lidl:', e.message)
    return []
  }
}

// ─── ALBERT HEIJN — GraphQL API ──────────────────────────────────────────────
async function scrapeAlbertHeijn() {
  console.log('🏪 [Albert Heijn] api.ah.nl/graphql...')
  try {
    const tokenRes = await fetch('https://api.ah.nl/mobile-auth/v1/auth/token/anonymous', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: 'appie' }),
    })
    const { access_token } = await tokenRes.json()
    if (!access_token) return []

    const gqlHeaders = {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    }

    // 1. Adım: bonus fiyatlarını çek (title burada null geliyor)
    const promosRes = await fetch('https://api.ah.nl/graphql', {
      method: 'POST',
      headers: gqlHeaders,
      body: JSON.stringify({
        query: `{ bonusPromotions { products { id price { now { amount } was { amount } } } } }`,
      }),
    })
    const { data: promoData } = await promosRes.json()
    if (!promoData?.bonusPromotions) return []

    // İndirimli ürün ID'lerini ve fiyatlarını topla
    const seenIds = new Set()
    const discountedMap = {}
    for (const promo of promoData.bonusPromotions) {
      for (const p of (promo.products || [])) {
        const now = p.price?.now?.amount
        const was = p.price?.was?.amount
        if (!now || !was || now >= was || seenIds.has(p.id)) continue
        seenIds.add(p.id)
        discountedMap[p.id] = { discountedPrice: now, originalPrice: was }
      }
    }
    const discountedIds = Object.keys(discountedMap).map(Number)
    if (!discountedIds.length) return []

    // 2. Adım: isimleri ayrı sorguda çek (20'li batch)
    const titleMap = {}
    const ID_BATCH = 20
    for (let i = 0; i < discountedIds.length; i += ID_BATCH) {
      const batch = discountedIds.slice(i, i + ID_BATCH)
      const input = batch.map(id => `{id: ${id}}`).join(', ')
      try {
        const r = await fetch('https://api.ah.nl/graphql', {
          method: 'POST',
          headers: gqlHeaders,
          body: JSON.stringify({ query: `{ products(productsInput: [${input}]) { id title } }` }),
        })
        const { data: pd } = await r.json()
        for (const p of (pd?.products || [])) {
          if (p.title) titleMap[p.id] = p.title
        }
      } catch {}
    }

    const candidates = discountedIds
      .filter(id => titleMap[id])
      .map(id => ({ id, name: titleMap[id], ...discountedMap[id] }))

    // En yüksek indirim oranına göre sırala
    candidates.sort((a, b) => (a.discountedPrice / a.originalPrice) - (b.discountedPrice / b.originalPrice))

    // Görselleri 5'li batch'ler halinde çek (ilk 80 ürün), batch arası 1s bekle
    const imageMap = {}
    const withImage = candidates.slice(0, 80)
    const BATCH = 5
    const AH_IMG_HEADERS = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'nl-NL,nl;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
    }
    for (let i = 0; i < withImage.length; i += BATCH) {
      const batch = withImage.slice(i, i + BATCH)
      await Promise.all(batch.map(async p => {
        try {
          const r = await fetch(`https://www.ah.nl/producten/product/wi${p.id}`, {
            headers: AH_IMG_HEADERS,
            signal: AbortSignal.timeout(8000),
          })
          if (!r.ok) return
          const html = await r.text()
          const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
          if (!jsonLd) return
          const jd = JSON.parse(jsonLd[1])
          if (jd.image) imageMap[p.id] = jd.image
        } catch {}
      }))
      if (i + BATCH < withImage.length) await new Promise(r => setTimeout(r, 1000))
    }

    const results = candidates.map(p => ({
      name: p.name,
      market: 'Albert Heijn',
      originalPrice: p.originalPrice,
      discountedPrice: p.discountedPrice,
      imageUrl: `ah-product-id:${p.id}`,
      isCampaign: true,
      source: 'ah.nl/bonus',
      expiresAt: EXPIRES_AT,
    }))

    console.log(`  ✅ Albert Heijn: ${results.length} ürün (${Object.keys(imageMap).length} görsel)`)
    return results
  } catch (e) {
    console.error('  ❌ Albert Heijn:', e.message)
    return []
  }
}

// ─── ANA FONKSİYON ────────────────────────────────────────────────────────────
export async function scrapeFlyerProducts() {
  console.log('🔍 Fetch-only scraper başlatılıyor...')

  const [dirk, jumbo, hoogvliet, plus, lidl, ah] = await Promise.all([
    scrapeDirk(),
    scrapeJumbo(),
    scrapeHoogvliet(),
    scrapePlus(),
    scrapeLidl(),
    scrapeAlbertHeijn(),
  ])

  let all = [...dirk, ...jumbo, ...hoogvliet, ...plus, ...lidl, ...ah]

  // Duplicate temizliği
  const seen = new Set()
  all = all.filter(p => {
    const key = p.name.toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  console.log(`\n✅ Toplam ${all.length} ürün (${dirk.length} Dirk, ${jumbo.length} Jumbo, ${hoogvliet.length} Hoogvliet, ${plus.length} Plus, ${lidl.length} Lidl, ${ah.length} AH)`)
  return all
}
