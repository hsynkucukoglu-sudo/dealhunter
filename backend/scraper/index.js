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
      const priceMatch = card.text().match(/voor\s+(\d+[,.]\d+)/i)
      const titleEl = card.find('h3, [data-testid="jum-heading"] a, .title').first()
      const name = titleEl.text().trim() || card.find('a[href*="/aanbied"]').first().text().trim()
      if (!name || name.length < 3) return

      const priceStr = priceMatch?.[1] || ''
      const discountedPrice = parseFloat(priceStr.replace(',', '.')) || 0
      if (!discountedPrice) return

      results.push({
        name,
        market: 'Jumbo',
        originalPrice: parseFloat((discountedPrice * 1.35).toFixed(2)),
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
          imageUrl: null,
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

// ─── ANA FONKSİYON ────────────────────────────────────────────────────────────
export async function scrapeFlyerProducts() {
  console.log('🔍 Fetch-only scraper başlatılıyor...')

  const [dirk, jumbo, hoogvliet, plus] = await Promise.all([
    scrapeDirk(),
    scrapeJumbo(),
    scrapeHoogvliet(),
    scrapePlus(),
  ])

  let all = [...dirk, ...jumbo, ...hoogvliet, ...plus]

  // Duplicate temizliği
  const seen = new Set()
  all = all.filter(p => {
    const key = p.name.toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  console.log(`\n✅ Toplam ${all.length} ürün (${dirk.length} Dirk, ${jumbo.length} Jumbo, ${hoogvliet.length} Hoogvliet, ${plus.length} Plus)`)
  return all
}
