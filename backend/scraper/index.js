/**
 * Fetch-only scraper — Puppeteer/Chromium yok.
 * Render free tier (512MB) ile uyumlu.
 */
import * as cheerio from 'cheerio'

let EXPIRES_AT = ''

// Promo label or text → normalized campaignType string
function toCampaignType(text) {
  if (!text) return null
  const s = text.toLowerCase()
  if (/1\s*\+\s*1|one.plus.one|bogo|buy\s*one\s*get\s*one|1\s*plus\s*1|\bgratis\b.*\bex(tra)?\b/.test(s)) return '1+1'
  if (/2e\s*(halve|helft|50%|gratis)|tweede.*(halve|gratis)|2de\s*(halve|gratis)|half\s*price/.test(s)) return '2e-halve-prijs'
  if (/3\s*(halen|voor)\s*2|3\s*halen.*2\s*betalen|buy\s*3.*get\s*(1|one)\s*free/.test(s)) return '3-halen-2-betalen'
  if (/2\s*\+\s*1|3\s*voor\s*2/.test(s)) return '3-halen-2-betalen'
  if (/combi(natie(voordeel)?)?|combi\s*deal|samen\s*goedkoper/.test(s)) return 'combinatie'
  if (/tijdelijk(\s*lager)?|limited\s*time|op\s*=\s*op/.test(s)) return 'tijdelijk'
  if (/\bactie\b|\bspecial\b|\bpromo\b/.test(s)) return 'actie'
  return null
}
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const HEADERS = {
  'User-Agent': UA,
  'Accept-Language': 'nl-NL,nl;q=0.9',
  'Accept': 'text/html,application/xhtml+xml',
}

// ─── DIRK — __NUXT_DATA__ (Nuxt 3 SSR payload, covers all 100+ offers) ────────
function resolveNuxt(raw, idx, depth = 0, cache = new Map()) {
  if (depth > 20) return raw[idx]
  if (cache.has(idx)) return cache.get(idx)
  const val = raw[idx]
  if (val === null || val === undefined || typeof val !== 'object') { cache.set(idx, val); return val }
  if (Array.isArray(val)) {
    // Nuxt type annotations: ["ShallowReactive", N] → resolve N
    if (val.length === 2 && typeof val[0] === 'string' && typeof val[1] === 'number') return resolveNuxt(raw, val[1], depth + 1, cache)
    const result = val.map(i => typeof i === 'number' ? resolveNuxt(raw, i, depth + 1, cache) : i)
    cache.set(idx, result); return result
  }
  const result = {}
  for (const [k, v] of Object.entries(val)) result[k] = typeof v === 'number' ? resolveNuxt(raw, v, depth + 1, cache) : v
  cache.set(idx, result); return result
}

async function scrapeDirk() {
  console.log('🏪 [Dirk] dirk.nl/aanbiedingen (__NUXT_DATA__)...')
  try {
    const res = await fetch('https://www.dirk.nl/aanbiedingen', { headers: HEADERS, signal: AbortSignal.timeout(20000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()

    const nd = html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
    if (!nd) throw new Error('__NUXT_DATA__ bulunamadı — JSON-LD fallback gerekli')
    const raw = JSON.parse(nd[1])

    // Find the object containing "offers-currentOffers" key (robust, not index-hardcoded)
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
          market: 'Dirk',
          originalPrice: normalPrice && normalPrice > offerPrice ? normalPrice : offerPrice,
          discountedPrice: offerPrice,
          imageUrl,
          isCampaign: true,
          source: 'dirk.nl/aanbiedingen',
          expiresAt,
          campaignType: toCampaignType(offer.textPriceSign || '') || toCampaignType(name),
          affiliateUrl: null,
        })
      }
    }

    const withSavings = results.filter(r => r.originalPrice > r.discountedPrice)
    console.log(`  ✅ Dirk: ${results.length} ürün (${withSavings.length} met besparing)`)
    return results
  } catch (e) {
    console.error('  ❌ Dirk:', e.message)
    return []
  }
}

// ─── JUMBO — GraphQL (promotions + images) + Intershop REST (prices) ─────────
const JUMBO_REST_HEADERS = {
  'Accept': 'application/json, text/plain, */*',
  'User-Agent': UA,
  'Accept-Language': 'nl-NL,nl;q=0.9',
  'Referer': 'https://www.jumbo.com/aanbiedingen',
  'X-Requested-With': 'XMLHttpRequest',
}
const JUMBO_GQL_URL = 'https://www.jumbo.com/api/graphql'
const JUMBO_GQL_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': UA,
  'apollographql-client-name': 'web',
  'apollographql-client-version': '1.0.0',
}

// Parse deal price from Jumbo promotion description text
function parseJumboPromoPrice(desc, title) {
  const text = `${desc} ${title}`.trim()

  // "3 voor 6,00" / "2 stuks voor 4,00" / "2 v 4,00 euro"
  const xVoor = text.match(/(\d+)\s+(?:stuks?\s+)?v(?:oor)?\s+[€]?\s*(\d+[,.]\d+)/i)
  if (xVoor) {
    const count = parseInt(xVoor[1])
    const total = parseFloat(xVoor[2].replace(',', '.'))
    return { type: 'explicit', discountedPrice: parseFloat((total / count).toFixed(2)), promoLabel: `${count} voor €${total.toFixed(2)}` }
  }

  // "voor 1,00" / "stuk voor 1,00" / "Heineken voor 19,99"
  const voor = desc.match(/voor\s+[€]?\s*(\d+[,.]\d+)/i)
  if (voor) {
    const price = parseFloat(voor[1].replace(',', '.'))
    return { type: 'explicit', discountedPrice: price, promoLabel: `voor €${price.toFixed(2)}` }
  }

  // "50% korting" / "30% korting"
  const pct = desc.match(/(\d+)%\s*korting/i)
  if (pct) {
    return { type: 'relative', multiplier: 1 - parseInt(pct[1]) / 100, promoLabel: `${pct[1]}% korting` }
  }

  // "2e halve prijs" (second at half price → effective 75%)
  if (/2e\s+halve\s+prijs/i.test(text)) {
    return { type: 'relative', multiplier: 0.75, promoLabel: '2e halve prijs' }
  }

  // "2+1 gratis", "1+1 gratis", "5+1 gratis"
  const bogo = desc.match(/(\d+)\+(\d+)\s+gratis/i)
  if (bogo) {
    const buy = parseInt(bogo[1]), free = parseInt(bogo[2])
    return { type: 'relative', multiplier: buy / (buy + free), promoLabel: `${buy}+${free} gratis` }
  }

  return { type: 'none' }
}

async function scrapeJumbo() {
  console.log('🏪 [Jumbo] GraphQL + Intershop REST API...')
  try {
    // Step 1: All promotions + product images via GraphQL (single call)
    const gqlRes = await fetch(JUMBO_GQL_URL, {
      method: 'POST',
      headers: JUMBO_GQL_HEADERS,
      body: JSON.stringify({ query: '{ promotions { id title subtitle products { id title sku image } } }' }),
      signal: AbortSignal.timeout(15000),
    })
    if (!gqlRes.ok) throw new Error(`GraphQL HTTP ${gqlRes.status}`)
    const gqlData = await gqlRes.json()
    const promotions = gqlData.data?.promotions || []
    if (!promotions.length) throw new Error('GraphQL returned 0 promotions')

    // Filter out internal/gift promotions
    const realPromos = promotions.filter(p =>
      !/repricing|DO NOT DELETE|gratis.*bij\s+aankoop|ontvang een|GRATIS\s+[A-Z]/i.test(p.title)
    )

    // Step 2: Fetch promotion details (description with price text) in batches
    const BATCH = 3
    const detailMap = {}
    for (let i = 0; i < realPromos.length; i += BATCH) {
      if (i > 0) await new Promise(r => setTimeout(r, 600))
      await Promise.all(realPromos.slice(i, i + BATCH).map(async p => {
        try {
          const r = await fetch(
            `https://www.jumbo.com/INTERSHOP/rest/WFS/Jumbo-Grocery-Site/-/promotions/${p.id}`,
            { headers: JUMBO_REST_HEADERS, signal: AbortSignal.timeout(10000) }
          )
          if (r.ok) detailMap[p.id] = await r.json()
        } catch {}
      }))
    }
    console.log(`  [Jumbo] ${Object.keys(detailMap).length}/${realPromos.length} promo details fetched`)

    // Step 3: Build deal list, identify which need product prices
    const deals = []
    const seen = new Set()

    for (const promo of realPromos) {
      const detail = detailMap[promo.id]
      if (!detail) continue
      const name = promo.title || detail.name || ''
      if (!name || name.length < 3 || seen.has(name)) continue

      const parsed = parseJumboPromoPrice(detail.description || '', name)
      if (parsed.type === 'none') continue

      seen.add(name)
      const product = promo.products?.[0]
      deals.push({
        name,
        imageUrl: product?.image || null,
        sku: product?.sku || null,
        parsed,
        promoLabel: parsed.promoLabel,
        campaignType: toCampaignType(parsed.promoLabel),
      })
    }

    const explicitDeals = deals.filter(d => d.parsed.type === 'explicit')
    const relativeDeals = deals.filter(d => d.parsed.type === 'relative')
    console.log(`  [Jumbo] deals: ${deals.length} total (${explicitDeals.length} explicit, ${relativeDeals.length} relative)`)

    // Step 4: Fetch regular prices via GraphQL batch aliases (20 per request)
    const skuDeals = deals.filter(d => d.sku)
    const GQL_BATCH = 20
    for (let i = 0; i < skuDeals.length; i += GQL_BATCH) {
      const batch = skuDeals.slice(i, i + GQL_BATCH)
      const aliases = batch.map((d, j) => `p${j}: product(sku: "${d.sku}") { price { price } }`).join(' ')
      try {
        const r = await fetch(JUMBO_GQL_URL, {
          method: 'POST',
          headers: JUMBO_GQL_HEADERS,
          body: JSON.stringify({ query: `{ ${aliases} }` }),
          signal: AbortSignal.timeout(12000),
        })
        if (!r.ok) continue
        const data = await r.json()
        batch.forEach((d, j) => {
          const cents = data.data?.[`p${j}`]?.price?.price
          if (cents && cents > 0) d.regularPrice = cents / 100
        })
      } catch {}
    }

    // Step 4b: Retry relative deals still missing regularPrice (individual GraphQL fetch)
    const missingRelative = deals.filter(d => d.parsed.type === 'relative' && !d.regularPrice && d.sku)
    if (missingRelative.length > 0) {
      console.log(`  [Jumbo] ${missingRelative.length} relative deal fiyat retry...`)
      for (const deal of missingRelative) {
        try {
          await new Promise(r => setTimeout(r, 300))
          const r = await fetch(JUMBO_GQL_URL, {
            method: 'POST',
            headers: JUMBO_GQL_HEADERS,
            body: JSON.stringify({ query: `{ product(sku: "${deal.sku}") { price { price } } }` }),
            signal: AbortSignal.timeout(8000),
          })
          if (!r.ok) continue
          const data = await r.json()
          const cents = data.data?.product?.price?.price
          if (cents && cents > 0) deal.regularPrice = cents / 100
        } catch {}
      }
    }

    // Step 5: Compute final prices
    const results = []
    for (const deal of deals) {
      let discountedPrice, originalPrice

      if (deal.parsed.type === 'explicit') {
        discountedPrice = deal.parsed.discountedPrice
        originalPrice = (deal.regularPrice && deal.regularPrice > discountedPrice)
          ? deal.regularPrice
          : discountedPrice
      } else {
        // relative: need regular price
        if (!deal.regularPrice) continue
        originalPrice = deal.regularPrice
        discountedPrice = parseFloat((originalPrice * deal.parsed.multiplier).toFixed(2))
        if (discountedPrice <= 0) continue
      }

      results.push({
        name: deal.name,
        market: 'Jumbo',
        originalPrice,
        discountedPrice,
        imageUrl: deal.imageUrl,
        isCampaign: true,
        source: `jumbo.com - ${deal.promoLabel.replace(/[€]/g, 'EUR')}`,
        expiresAt: EXPIRES_AT,
        campaignType: deal.campaignType,
        affiliateUrl: null, // Daisycon/Awin linkleri buraya gelecek
      })
    }

    console.log(`  ✅ Jumbo: ${results.length} ürün`)
    return results
  } catch (e) {
    console.error('  ❌ Jumbo:', e.message)
    return []
  }
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
}

// ─── HOOGVLIET — HTML scraper with LoadMore AJAX fallback ────────────────────
// Hoogvliet typically lists 15-20 deals per week in `product-all-info` blocks on
// the main /aanbiedingen page. The Intershop "LoadMore" AJAX button is only active
// when additional products exist; for most weeks the initial HTML contains all deals.
async function scrapeHoogvliet() {
  console.log('🏪 [Hoogvliet] hoogvliet.com/aanbiedingen (session+PromotionRange)...')
  try {
    const res = await fetch('https://www.hoogvliet.com/aanbiedingen', {
      headers: HEADERS,
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    // Capture session cookies for AJAX calls that must be in the same session
    const rawCookies = res.headers.getSetCookie?.() ?? [res.headers.get('set-cookie') ?? '']
    const sessionCookie = rawCookies
      .flatMap(h => h.split(/,\s*(?=[A-Za-z_][A-Za-z0-9_-]*=)/).map(s => s.split(';')[0].trim()))
      .filter(Boolean)
      .join('; ')

    const html = await res.text()

    const seen = new Set()
    const results = []

    // Shared parser: extract deal cards from any Hoogvliet HTML fragment.
    // Each promo card lives inside a `product-all-info` block; image may be in
    // the preceding chunk (lazy-loaded — only ~15/44 have data-image-src).
    function parseProductChunks(rawHtml) {
      const chunks = rawHtml.split('product-all-info')
      for (let i = 1; i < chunks.length; i++) {
        const card = chunks[i].slice(0, 2500)
        const prev = chunks[i - 1]

        const nameM = card.match(/<h3[^>]*>\s*([^<]+?)\s*<\/h3>/)
        if (!nameM) continue
        let name = decodeHtmlEntities(nameM[1].trim())
        const descM = card.match(/Short-Description"[^>]*>\s*([^<]+?)\s*</)
        if (descM) {
          const d = decodeHtmlEntities(descM[1].trim())
          if (d && !/^alle\b/i.test(d)) name = `${name} ${d}`
        }
        if (!name || seen.has(name.toLowerCase())) continue
        if (/^bij\s/i.test(name)) continue

        const promoM = card.match(/promotion-short-title[^>]*>\s*([^<]+?)\s*</)
        const promoLabel = promoM ? promoM[1].trim() : null
        if (promoLabel && /bezorg/i.test(promoLabel)) continue

        const eurosM = card.match(/price-euros[^>]*>\s*<span[^>]*>([\d]+)<\/span>/)
        const centsM = card.match(/price-cents[^>]*><sup>([\d]+)<\/sup>/)
        let discountedPrice = eurosM ? parseFloat(`${eurosM[1]}.${centsM ? centsM[1] : '00'}`) : null
        if (discountedPrice == null && promoLabel) {
          const pm = promoLabel.match(/(\d+[.,]\d{2})/)
          if (pm) discountedPrice = parseFloat(pm[1].replace(',', '.'))
        }
        if (!discountedPrice) continue

        const strikeM = card.match(/strikethrough"[^>]*>\s*<div>([\d.]+)</)
        const wasPrice = strikeM ? parseFloat(strikeM[1]) : 0
        const originalPrice = (wasPrice && wasPrice > discountedPrice) ? wasPrice : discountedPrice

        const imgs = [...prev.matchAll(/data-image-src="([^"]+\.(?:jpg|png|webp))"/g)]
        const imgRaw = imgs.length ? imgs[imgs.length - 1][1] : null
        const imageUrl = imgRaw ? `https://www.hoogvliet.com${imgRaw.replace(/&#47;/g, '/')}` : null

        seen.add(name.toLowerCase())
        results.push({
          name,
          market: 'Hoogvliet',
          originalPrice,
          discountedPrice,
          imageUrl,
          isCampaign: true,
          source: 'hoogvliet.com/aanbiedingen',
          expiresAt: EXPIRES_AT,
          campaignType: toCampaignType(promoLabel || name),
        })
      }
    }

    // Parse featured products on the main page
    parseProductChunks(html)
    console.log(`  [Hoogvliet] Başlangıç sayfası: ${results.length} ürün`)

    // Intershop embeds a "load more" button with session IDs in the path (pgid/sid).
    // Use the URL verbatim — already correctly encoded. Only fires when more products
    // exist beyond the initial page render (most weeks have ≤ 20 products total).
    const loadMoreM = html.match(
      /href="(https:\/\/www\.hoogvliet\.com\/INTERSHOP[^"]*LoadMoreProducts[^"]+)"/
    )
    if (loadMoreM) {
      const loadMoreUrl = loadMoreM[1]
        .replace(/PageSize=\d+/, 'PageSize=100')
        .replace(/PageNumber=\d+/, 'PageNumber=1')
      try {
        await new Promise(r => setTimeout(r, 400))
        const lmRes = await fetch(loadMoreUrl, {
          headers: {
            ...HEADERS,
            'Accept': 'text/html, */*; q=0.01',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'https://www.hoogvliet.com/aanbiedingen',
          },
          signal: AbortSignal.timeout(12000),
        })
        if (lmRes.ok) {
          const lmHtml = await lmRes.text()
          const before = results.length
          parseProductChunks(lmHtml)
          if (results.length > before) {
            console.log(`  [Hoogvliet] LoadMore: +${results.length - before} extra ürün`)
          }
        }
      } catch {}
    }

    const withSavings = results.filter(r => r.originalPrice > r.discountedPrice)
    console.log(`  ✅ Hoogvliet: ${results.length} ürün (${withSavings.length} met besparing)`)
    return results
  } catch (e) {
    console.error('  ❌ Hoogvliet:', e.message)
    return []
  }
}

// ─── LIDL — data-grid-data attributes from aanbiedingen page ─────────────────
async function scrapeLidl() {
  console.log('🏪 [Lidl] lidl.nl/aanbiedingen...')
  try {
    const res = await fetch('https://www.lidl.nl/aanbiedingen', {
      headers: { ...HEADERS, 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
    })
    const html = await res.text()

    const results = []
    const seen = new Set()

    for (const [, encoded] of html.matchAll(/data-grid-data="([^"]{50,})"/g)) {
      try {
        const obj = JSON.parse(encoded.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&'))
        const name = obj.fullTitle || obj.title
        if (!name || seen.has(name)) continue
        if (!obj.havingPrice && obj.havingPrice !== undefined) continue

        const priceObj = obj.price
        if (!priceObj) continue
        const discountedPrice = parseFloat(priceObj.price)
        if (!discountedPrice || isNaN(discountedPrice)) continue

        seen.add(name)

        const oldPrice = parseFloat(priceObj.oldPrice || 0)
        const originalPrice = (oldPrice && oldPrice > discountedPrice) ? oldPrice : discountedPrice

        const imgObj = obj.image_V1 || obj.image
        const imageUrl = typeof imgObj === 'string' ? imgObj
          : imgObj?.image || (Array.isArray(obj.imageList) ? obj.imageList[0]?.image : null) || null

        const endTs = obj.storeEndDate
        const expiresAt = endTs
          ? new Date(endTs * 1000).toISOString().split('T')[0]
          : EXPIRES_AT

        results.push({
          name,
          market: 'Lidl',
          originalPrice,
          discountedPrice,
          imageUrl,
          isCampaign: true,
          source: 'lidl.nl/aanbiedingen',
          expiresAt,
          campaignType: toCampaignType(name),
        })
      } catch {}
    }

    const withSavings = results.filter(r => r.originalPrice > r.discountedPrice)
    console.log(`  ✅ Lidl: ${results.length} ürün (${withSavings.length} met besparing)`)
    return results
  } catch (e) {
    console.error('  ❌ Lidl:', e.message)
    return []
  }
}

// AH response'dan numeric fiyat çıkar (obje veya number olabilir)
function ahPrice(val) {
  if (!val) return null
  if (typeof val === 'number') return val
  if (typeof val === 'object') return val.amount ?? val.value ?? val.price ?? null
  const n = parseFloat(String(val).replace(',', '.'))
  return isNaN(n) ? null : n
}

// Promosyon mekanizmasından efektif indirim yüzdesi ve fiyatları hesapla
function calcAhPromo(p) {
  const mech = (p.bonusMechanism || p.bonus?.description || p.promotionLabel || '').trim()
  const label = p.discountLabels?.[0] || p.promotions?.[0]
  const beforeP = ahPrice(p.priceBeforeBonus) ?? ahPrice(p.previousPrice) ?? ahPrice(p.originalPrice)
  let currentP = ahPrice(p.currentPrice) ?? ahPrice(p.salesPrice) ?? ahPrice(p.price)

  if (!p.title) return null

  // AH API: currentPrice artık null — discountLabels veya bonusMechanism'den türet
  if (!currentP && (label || mech)) {
    const code = label?.code || ''

    // 1+1 gratis (eski ve yeni kod)
    if (code === 'DISCOUNT_ONE_PLUS_ONE_FREE' || /^1\s*\+\s*1\s*gratis$/i.test(mech)) {
      if (beforeP) return { discountedPrice: +(beforeP * 0.5).toFixed(2), originalPrice: beforeP, promoLabel: '1+1 gratis' }
    }
    // X+Y gratis (DISCOUNT_X_PLUS_Y_FREE): count=kac alınacak, freeCount=kaç bedava
    if (code === 'DISCOUNT_X_PLUS_Y_FREE' && beforeP) {
      const buyCount = label?.count ?? 1
      const freeCount = label?.freeCount ?? 1
      const eff = +(beforeP * buyCount / (buyCount + freeCount)).toFixed(2)
      const promoLabel = freeCount === 1 && buyCount === 1 ? '1+1 gratis' : `${buyCount}+${freeCount} gratis`
      return { discountedPrice: eff, originalPrice: beforeP, promoLabel }
    }
    if (code === 'DISCOUNT_SECOND_HALF_PRICE' || /2e\s*halve\s*prijs/i.test(mech)) {
      if (beforeP) return { discountedPrice: +(beforeP * 0.75).toFixed(2), originalPrice: beforeP, promoLabel: '2e halve prijs' }
    }
    if (/^2\s*\+\s*1\s*gratis$/i.test(mech)) {
      if (beforeP) return { discountedPrice: +(beforeP * 0.667).toFixed(2), originalPrice: beforeP, promoLabel: '2+1 gratis' }
    }
    if (/^2\s*\+\s*2\s*gratis$/i.test(mech)) {
      if (beforeP) return { discountedPrice: +(beforeP * 0.5).toFixed(2), originalPrice: beforeP, promoLabel: '2+2 gratis' }
    }
    // Sabit fiyat promosyonu (DISCOUNT_FIXED_PRICE veya VOOR X.XX)
    if (code === 'DISCOUNT_FIXED_PRICE' && label?.price && beforeP && label.price < beforeP) {
      return { discountedPrice: label.price, originalPrice: beforeP, promoLabel: label.defaultDescription || mech }
    }
    const voorPrice = mech.match(/^(?:\d+\s+)?VOOR\s+([\d.,]+)/i)
    if (voorPrice && beforeP) {
      const promo = parseFloat(voorPrice[1].replace(',', '.'))
      if (promo < beforeP) return { discountedPrice: promo, originalPrice: beforeP, promoLabel: mech }
    }
    // X voor Y.YY
    if ((code === 'DISCOUNT_X_FOR_Y' || /^\d+\s+voor\s+/i.test(mech)) && label?.count && label?.price) {
      const eff = +(label.price / label.count).toFixed(2)
      if (beforeP && eff < beforeP) return { discountedPrice: eff, originalPrice: beforeP, promoLabel: label.defaultDescription || mech }
    }
    const xForY = mech.match(/^(\d+)\s+voor\s+([\d.,]+)/i)
    if (xForY && beforeP) {
      const eff = +(parseFloat(xForY[2].replace(',', '.')) / parseInt(xForY[1])).toFixed(2)
      if (eff < beforeP) return { discountedPrice: eff, originalPrice: beforeP, promoLabel: mech }
    }
    if ((code === 'DISCOUNT_PERCENTAGE') && label?.percentage && beforeP) {
      return { discountedPrice: +(beforeP * (1 - label.percentage / 100)).toFixed(2), originalPrice: beforeP, promoLabel: label.defaultDescription }
    }
    if ((code === 'DISCOUNT_PRECISE_PERCENTAGE') && label?.precisePercentage && beforeP) {
      return { discountedPrice: +(beforeP * (1 - label.precisePercentage / 100)).toFixed(2), originalPrice: beforeP, promoLabel: label.defaultDescription }
    }
    const pctMatch = mech.match(/^(\d+)%\s*(korting|volume\s*voordeel)/i)
    if (pctMatch && beforeP) {
      return { discountedPrice: +(beforeP * (1 - parseInt(pctMatch[1]) / 100)).toFixed(2), originalPrice: beforeP, promoLabel: mech }
    }
    // label'da doğrudan fiyat varsa
    if (label?.price && !label?.count && beforeP && label.price < beforeP) {
      return { discountedPrice: label.price, originalPrice: beforeP, promoLabel: label.defaultDescription || mech }
    }
  }

  // currentP mevcut — klasik kontroller
  if (!currentP) return null
  const unitPrice = beforeP ?? currentP

  if (currentP && beforeP && currentP < beforeP) {
    return { discountedPrice: currentP, originalPrice: beforeP, promoLabel: mech || label?.defaultDescription || null }
  }
  if (/^1\s*\+\s*1\s*gratis$/i.test(mech) || label?.code === 'DISCOUNT_ONE_PLUS_ONE_FREE') {
    return { discountedPrice: +(unitPrice * 0.5).toFixed(2), originalPrice: unitPrice, promoLabel: '1+1 gratis' }
  }
  if (/^2\s*\+\s*1\s*gratis$/i.test(mech)) {
    return { discountedPrice: +(unitPrice * 0.667).toFixed(2), originalPrice: unitPrice, promoLabel: '2+1 gratis' }
  }
  if (/^2\s*\+\s*2\s*gratis$/i.test(mech)) {
    return { discountedPrice: +(unitPrice * 0.5).toFixed(2), originalPrice: unitPrice, promoLabel: '2+2 gratis' }
  }
  if (/2e\s*halve\s*prijs/i.test(mech) || label?.code === 'DISCOUNT_SECOND_HALF_PRICE') {
    return { discountedPrice: +(unitPrice * 0.75).toFixed(2), originalPrice: unitPrice, promoLabel: '2e halve prijs' }
  }
  const xForY2 = mech.match(/^(\d+)\s+voor\s+([\d.,]+)/i)
  if (xForY2) {
    const eff = +(parseFloat(xForY2[2].replace(',', '.')) / parseInt(xForY2[1])).toFixed(2)
    if (eff < unitPrice) return { discountedPrice: eff, originalPrice: unitPrice, promoLabel: mech }
  }
  if (label?.code === 'DISCOUNT_X_FOR_Y' && label.count && label.price) {
    const eff = +(label.price / label.count).toFixed(2)
    if (eff < unitPrice) return { discountedPrice: eff, originalPrice: unitPrice, promoLabel: label.defaultDescription }
  }
  const voorPrice2 = mech.match(/^(?:\d+\s+)?VOOR\s+([\d.,]+)/i)
  if (voorPrice2) {
    const promo = parseFloat(voorPrice2[1].replace(',', '.'))
    if (promo < unitPrice) return { discountedPrice: promo, originalPrice: unitPrice, promoLabel: mech }
  }
  if (label?.code === 'DISCOUNT_PERCENTAGE' && label.percentage) {
    return { discountedPrice: +(unitPrice * (1 - label.percentage / 100)).toFixed(2), originalPrice: unitPrice, promoLabel: label.defaultDescription }
  }
  const pctMatch2 = mech.match(/^(\d+)%\s*(korting|volume\s*voordeel)/i)
  if (pctMatch2) {
    return { discountedPrice: +(unitPrice * (1 - parseInt(pctMatch2[1]) / 100)).toFixed(2), originalPrice: unitPrice, promoLabel: mech }
  }

  return null
}

// ─── AH Unit-size parser — API fields take priority over regex ───────────────
function parseAhUnitInfo(p, discountedPrice) {
  // 1. price.unitSizeDescription: "750g", "40 wasbeurten", "1.5 l", "24 stuks"
  const desc = (p.price?.unitSizeDescription || p.unitSizeDescription || '').trim()
  if (desc) {
    const m = desc.match(/^([\d,.]+)\s*(g|gram|kg|kilo|ml|cl|dl|l|liter|stuks?|stuk|wasbeurten?|tabs?|capsu?les?|pieces?|pak)\b/i)
    if (m) {
      const amount = parseFloat(m[1].replace(',', '.'))
      const raw = m[2].toLowerCase()
      let unitSize, unitType

      if (/^(g|gram)$/.test(raw))       { unitSize = amount;        unitType = 'g'     }
      else if (/^(kg|kilo)$/.test(raw)) { unitSize = amount * 1000; unitType = 'g'     }
      else if (/^ml$/.test(raw))        { unitSize = amount;        unitType = 'ml'    }
      else if (/^cl$/.test(raw))        { unitSize = amount * 10;   unitType = 'ml'    }
      else if (/^dl$/.test(raw))        { unitSize = amount * 100;  unitType = 'ml'    }
      else if (/^(l|liter)$/.test(raw)) { unitSize = amount * 1000; unitType = 'ml'    }
      else                              { unitSize = amount;        unitType = 'stuks' }

      let unitPrice = null
      if (discountedPrice > 0 && unitSize > 0) {
        if (unitType === 'g')  unitPrice = unitSize >= 500 ? discountedPrice / (unitSize / 1000) : discountedPrice / (unitSize / 100)
        else if (unitType === 'ml') unitPrice = unitSize >= 1000 ? discountedPrice / (unitSize / 1000) : discountedPrice / (unitSize / 100)
        else unitPrice = discountedPrice / unitSize
        unitPrice = parseFloat(unitPrice.toFixed(4))
      }

      return { unitSize, unitType, fullSizeLabel: desc, unitPrice }
    }
  }

  // 2. Numeric unitSize field alone → treat as count (stuks)
  const rawCount = p.unitSize
  if (rawCount && typeof rawCount === 'number' && rawCount > 0 && rawCount <= 500) {
    const label = `${rawCount} stuks`
    const unitPrice = discountedPrice > 0 ? parseFloat((discountedPrice / rawCount).toFixed(4)) : null
    return { unitSize: rawCount, unitType: 'stuks', fullSizeLabel: label, unitPrice }
  }

  return {}
}

// ─── ALBERT HEIJN — Tüm promosyon tipleri (1+1, halve prijs, X voor Y, %) ───
async function scrapeAlbertHeijn() {
  console.log('🏪 [Albert Heijn] bonus API taranıyor...')
  try {
    const tokenRes = await fetch('https://api.ah.nl/mobile-auth/v1/auth/token/anonymous', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: 'appie' }),
      signal: AbortSignal.timeout(10000),
    })
    const tokenData = await tokenRes.json()
    const access_token = tokenData.access_token
    if (!access_token) { console.log('  [AH] token alınamadı:', JSON.stringify(tokenData)); return [] }

    // Akamai Bot Manager: bm_sz cookie'yi token response'dan al ve search'lere geçir
    const rawCookies = tokenRes.headers.getSetCookie?.() ?? [tokenRes.headers.get('set-cookie') ?? '']
    const bmCookies = rawCookies.flatMap(c => c.split(',').map(s => s.trim().split(';')[0])).filter(c => c.includes('='))
    const cookieStr = bmCookies.join('; ')

    const h = {
      'Authorization': `Bearer ${access_token}`,
      'x-application': 'AHWEBSHOP',
      'Accept': 'application/json',
      ...(cookieStr ? { 'Cookie': cookieStr } : {}),
    }

    const seenIds = new Set()
    const candidates = []

    // Strateji 1: bonus=true — tüm bonus ürünleri çek
    for (let page = 0; page < 30; page++) {
      const r = await fetch(
        `https://api.ah.nl/mobile-services/product/search/v2?bonus=true&page=${page}&size=50`,
        { headers: h, signal: AbortSignal.timeout(12000) }
      )
      if (!r.ok) { console.log(`  [AH] S1 p${page} HTTP ${r.status}`); break }
      const json = await r.json()
      const prods = json.products || []
      if (!prods.length) break

      if (process.env.DEBUG_SCRAPER && page === 0 && prods[0]) {
        const s = prods[0]
        console.log('  [AH] İlk ürün alanları:', Object.keys(s).join(', '))
        console.log('  [AH] İlk ürün örneği:', JSON.stringify({
          title: s.title, currentPrice: s.currentPrice, priceBeforeBonus: s.priceBeforeBonus,
          bonusMechanism: s.bonusMechanism, discountLabels: s.discountLabels?.slice(0, 1),
          unitSize: s.unitSize, price: s.price,
        }))
      }

      for (const p of prods) {
        if (seenIds.has(p.webshopId) || !p.title) continue
        seenIds.add(p.webshopId)
        const promo = calcAhPromo(p)
        if (!promo) continue
        const imageUrl = p.images?.find(i => i.width === 400)?.url ?? p.images?.[0]?.url ?? null
        const unitInfo = parseAhUnitInfo(p, promo.discountedPrice)

        let expiresAt = EXPIRES_AT
        if (p.bonus?.endDate) expiresAt = p.bonus.endDate

        candidates.push({ ...promo, name: p.title, imageUrl, ...unitInfo, expiresAt })
      }

      // Tüm ürünleri gördüysek dur
      const totalPages = json.page?.totalPages ?? 999
      if (page + 1 >= totalPages) break
    }

    console.log(`  [AH] S1 (bonus=true): ${seenIds.size} tarandı, ${candidates.length} promosyon`)

    // Strateji 3: AH mobile API — farklı category ile retry (IP bloğu varsa farklı path dene)
    if (candidates.length < 10) {
      try {
        // AH /bonus sayfası artık Next.js App Router kullanıyor (__NEXT_DATA__ yok)
        // Alternatif: /zoeken?bonus=true endpoint'inden JSON-LD dene
        const htmlRes = await fetch('https://www.ah.nl/zoeken?bonus=true&page=0', { headers: HEADERS })
        const html = await htmlRes.text()
        // JSON-LD structured data
        for (const [, block] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
          try {
            const data = JSON.parse(block)
            const items = data.itemListElement || (Array.isArray(data) ? data : [])
            for (const item of items) {
              const p = item.item || item
              if (!p.name || !p.offers?.price) continue
              const discountedPrice = parseFloat(p.offers.price)
              const originalPrice = parseFloat(p.offers.highPrice || p.offers.price)
              if (isNaN(discountedPrice) || discountedPrice <= 0) continue
              if (seenIds.has(p.name)) continue
              seenIds.add(p.name)
              candidates.push({
                discountedPrice,
                originalPrice: originalPrice > discountedPrice ? originalPrice : discountedPrice,
                name: p.name,
                imageUrl: p.image || null,
                promoLabel: null,
              })
            }
          } catch {}
        }
        console.log(`  [AH] S3 (JSON-LD fallback) sonrası toplam: ${candidates.length}`)
      } catch (e3) {
        console.log(`  [AH] S3 hata: ${e3.message}`)
      }
    }

    if (!candidates.length) {
      console.log('  [AH] 3 strateji de 0 ürün döndürdü')
      return []
    }

    candidates.sort((a, b) => (a.discountedPrice / a.originalPrice) - (b.discountedPrice / b.originalPrice))
    const ahWithDiscount = candidates.filter(p => p.originalPrice > p.discountedPrice)
    const ahTotalSaving = ahWithDiscount.reduce((s, p) => s + (p.originalPrice - p.discountedPrice), 0)
    console.log(`  ✅ Albert Heijn: ${candidates.length} ürün (${candidates.filter(p => p.imageUrl).length} görsel)`)
    console.log(`  [AH] 💰 ${ahWithDiscount.length}/${candidates.length} met korting, totaal €${ahTotalSaving.toFixed(2)} besparing`)

    return candidates.map(p => ({
      name: p.name,
      market: 'Albert Heijn',
      originalPrice: p.originalPrice,
      discountedPrice: p.discountedPrice,
      imageUrl: p.imageUrl,
      isCampaign: true,
      source: p.promoLabel ? `ah.nl/bonus - ${p.promoLabel}` : 'ah.nl/bonus',
      expiresAt: EXPIRES_AT,
      campaignType: toCampaignType(p.promoLabel),
      // Unit info — from API fields (parseAhUnitInfo), never null if API provided them
      unitSize: p.unitSize ?? null,
      unitType: p.unitType ?? null,
      unitPrice: p.unitPrice ?? null,
      fullSizeLabel: p.fullSizeLabel ?? null,
    }))
  } catch (e) {
    console.error('  ❌ Albert Heijn:', e.message)
    return []
  }
}

// ─── ALDI — /api/offer/nl/{week} JSON API ────────────────────────────────────
async function scrapeAldi() {
  console.log('🏪 [Aldi] aldi.nl offer API...')
  try {
    // Aldi offers switch on Monday. Try 'current' first, fall back to 'next'
    // because on Monday the new week is served as 'next' until midnight rollover
    let data = null
    for (const week of ['current', 'next']) {
      const res = await fetch(`https://www.aldi.nl/api/offer/nl/${week}`, {
        headers: { ...HEADERS, 'Accept': 'application/json', 'Referer': 'https://www.aldi.nl/aanbiedingen-deze-week.html' },
      })
      if (!res.ok) continue
      const json = await res.json()
      if (Object.keys(json.algoliaDataMap || {}).length > 0) { data = json; break }
    }
    if (!data) throw new Error('Offer data boş döndü')

    const algoliaMap = data.algoliaDataMap
    const seen = new Set()
    const results = []

    const allProds = Object.values(algoliaMap)
    if (process.env.DEBUG_SCRAPER && allProds[0]) {
      console.log('  [Aldi] tüm alanlar:', Object.keys(allProds[0]).join(', '))
      console.log('  [Aldi] currentPrice alanları:', Object.keys(allProds[0].currentPrice || {}).join(', '))
      console.log('  [Aldi] ilk ürün tam:', JSON.stringify(allProds[0], null, 0).slice(0, 800))
    }

    let aldiDiagDone = false
    for (const p of allProds) {
      if (!p.name || !p.currentPrice?.priceValue) continue
      if (seen.has(p.name)) continue
      seen.add(p.name)

      const discountedPrice = p.currentPrice.priceValue
      const strikePrice = p.currentPrice.strikePrice?.strikePriceValue ?? null

      if (process.env.DEBUG_SCRAPER && !aldiDiagDone && results.length < 3) {
        console.log(`  [Aldi] sample: ${p.name} | strike=${strikePrice} | labels=`, JSON.stringify(p.currentPrice?.priceTagLabels))
        if (results.length === 2) aldiDiagDone = true
      }

      const promoText = [
        p.currentPrice?.priceTagLabels?.promoText1,
        p.currentPrice?.priceTagLabels?.promoText2,
        p.currentPrice?.priceTagLabels?.label,
      ].filter(Boolean).join(' ')

      // Try to derive originalPrice from strikePrice or percentage label
      let originalPrice = (strikePrice && strikePrice > discountedPrice) ? strikePrice : discountedPrice
      if (!strikePrice && promoText) {
        const pctMatch = promoText.match(/(\d+)\s*%/i)
        if (pctMatch) {
          const pct = parseInt(pctMatch[1])
          if (pct > 0 && pct < 90) {
            originalPrice = parseFloat((discountedPrice / (1 - pct / 100)).toFixed(2))
          }
        }
      }

      // Skip explicit "OP=OP" clearance items (stock clearance at regular price, not a deal)
      const isOpIsOp = /\bop\s*[=is]+\s*op\b/i.test(p.name)
      if (isOpIsOp && originalPrice <= discountedPrice) continue

      const primary = p.assets?.find(a => a.type === 'primary')
      const expiresAt = p.currentPrice.validUntil
        ? new Date(p.currentPrice.validUntil * 1000).toISOString().split('T')[0]
        : EXPIRES_AT

      results.push({
        name: p.name,
        market: 'Aldi',
        originalPrice,
        discountedPrice,
        imageUrl: primary?.url || null,
        isCampaign: true,
        source: 'aldi.nl/api/offer',
        expiresAt,
        campaignType: toCampaignType(p.currentPrice?.priceTagLabels?.promoText1) || toCampaignType(p.name),
      })
    }

    console.log(`  ✅ Aldi: ${results.length} ürün`)
    return results
  } catch (e) {
    console.error('  ❌ Aldi:', e.message)
    return []
  }
}

// ─── VOMAR — Publitas weekfolder scraper ────────────────────────────────────
const VOMAR_PUBLITAS_GROUP = 'folder-deze-week'
const VOMAR_PUBLITAS_BASE = 'https://view.publitas.com'

// Parse discounted products from Publitas OCR page text.
// Format in PDF pages: "ORIG_PRICE DISC_CENTS . Product name ..."
// where DISC_CENTS is 3-4 digits without decimal (399 = €3.99, 1499 = €14.99)
const VOMAR_NAME_STOP = /\b(?:OP=OP|GRATIS|GIGA|GIGAGANTISCH|GIGAPACK|VOUCHER|BONUS|Prijsvoorbeeld)\b/i
const VOMAR_LEADING_JUNK = /^(?:(?:Prijsvoorbeeld:|[A-Z0-9%]+)\s+){0,5}/

function vomarCleanName(raw) {
  let name = raw.replace(/\s+/g, ' ').trim()
  name = name.replace(VOMAR_LEADING_JUNK, '').trim()
  const stopIdx = name.search(VOMAR_NAME_STOP)
  if (stopIdx >= 0) name = name.slice(0, stopIdx).trim()
  name = name.replace(/\s+\d+[.,]\d{2}\s*[-–]?\s*$/, '').trim()
  return name.slice(0, 70).trim()
}

function parseVomarPageText(text) {
  const results = []

  // Pattern 1: ORIG_PRICE [OP=OP] DISC_CENTS . product_name
  // Example: "6.99 499 . G'woon Pindakaas" → orig=6.99 disc=4.99
  const RE1 = /(\d{1,2}[.,]\d{2})\s+(?:OP=OP\s+)?(\d{3,4})\s*\.\s*((?:(?!\d{1,2}[.,]\d{2}\s+(?:OP=OP\s+)?\d{3}).)+)/g
  let m
  while ((m = RE1.exec(text)) !== null) {
    const orig = parseFloat(m[1].replace(',', '.'))
    const disc = parseInt(m[2], 10) / 100
    const name = vomarCleanName(m[3])
    if (!name || name.length < 5 || !/[a-z]/.test(name)) continue
    if (disc >= orig || orig > 50 || disc > 50 || orig < 0.2 || disc < 0.1) continue
    results.push({ name, orig, disc })
  }

  // Pattern 2: N+M GRATIS TOTAL product Per stuk van LOW tot HIGH
  // Example: "1+1 GRATIS 3.46 Zuivelhoeve... Per stuk van 1.73 tot 2.99"
  // Example: "2+3 GRATIS 14.95 Dove... Per stuk van 2.99 tot 6.79"
  const RE2 = /(\d)\+(\d)\s+GRATIS\s+(\d+[.,]\d{2})\s+([\w][^\d]*?)Per\s+stuk\s+van\s+(\d+[.,]\d{2})\s+tot\s+(\d+[.,]\d{2})/g
  while ((m = RE2.exec(text)) !== null) {
    const buy = parseInt(m[1], 10)
    const free = parseInt(m[2], 10)
    const total = parseFloat(m[3].replace(',', '.'))
    const rawName = m[4]
    const priceLow = parseFloat(m[5].replace(',', '.'))
    const priceHigh = parseFloat(m[6].replace(',', '.'))
    const disc = Math.round((total / (buy + free)) * 100) / 100
    const orig = priceHigh
    const name = vomarCleanName(rawName)
    if (!name || name.length < 5 || !/[a-z]/.test(name)) continue
    if (disc >= orig || orig > 50 || disc > 50 || orig < 0.2 || disc < 0.1) continue
    results.push({ name, orig, disc })
  }

  return results
}

async function scrapeVomar() {
  console.log('🏪 [Vomar] Publitas weekfolder...')
  try {
    // Follow redirect to get current publication slug
    const redirectRes = await fetch(`${VOMAR_PUBLITAS_BASE}/${VOMAR_PUBLITAS_GROUP}`, {
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
    })
    const location = redirectRes.headers.get('location') || ''
    const parts = location.replace(/\/+$/, '').split('/')
    const pubSlug = parts[parts.length - 1]
    if (!pubSlug) throw new Error('Could not resolve current Publitas publication')
    const pubBase = `${VOMAR_PUBLITAS_BASE}/${VOMAR_PUBLITAS_GROUP}/${pubSlug}`
    console.log(`  📖 Vomar folder: ${pubSlug}`)

    // Collect page text via search (multiple queries to maximize coverage)
    const SEARCH_QUERIES = ['OP', 'de', 'van', 'gram', 'kilo', 'GRATIS', 'prijs', 'liter', 'stuks']
    const pageTexts = {}
    for (const q of SEARCH_QUERIES) {
      const sRes = await fetch(
        `${pubBase}/search?q=${encodeURIComponent(q)}&format=json&per_page=50`,
        { headers: HEADERS, signal: AbortSignal.timeout(10000) }
      )
      if (!sRes.ok) continue
      const sData = await sRes.json()
      for (const hit of sData.hits || []) {
        const pg = hit.fields?.page_number
        if (pg && !pageTexts[pg]) pageTexts[pg] = hit.fields.contents || ''
      }
    }
    const pageCount = Object.keys(pageTexts).length
    console.log(`  📄 ${pageCount} pagina's gevonden`)

    // Parse products from all pages
    const seen = new Set()
    const results = []
    for (const text of Object.values(pageTexts)) {
      for (const { name, orig, disc } of parseVomarPageText(text)) {
        const key = name.toLowerCase().slice(0, 30)
        if (seen.has(key)) continue
        seen.add(key)
        results.push({
          name,
          market: 'Vomar',
          originalPrice: orig,
          discountedPrice: disc,
          imageUrl: null,
          isCampaign: true,
          source: `vomar.nl/weekfolder`,
          expiresAt: EXPIRES_AT,
          campaignType: toCampaignType(name),
          brand: null,
        })
      }
    }

    // Open Food Facts — product images by name (max 1 req/sec)
    for (const p of results) {
      try {
        await new Promise(r => setTimeout(r, 600))
        const q = p.name.replace(/[^a-zA-Z\s]/g, ' ').split(/\s+/).filter(w => w.length > 2).slice(0, 3).join(' ')
        if (!q) continue
        const offRes = await fetch(
          `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=3`,
          { headers: { 'User-Agent': 'DealHunter4U/1.0 (hsyn.kucukoglu@gmail.com)', 'Accept': 'application/json' }, signal: AbortSignal.timeout(8000) }
        )
        if (!offRes.ok) continue
        const offData = await offRes.json()
        const img = offData.products?.[0]?.image_front_small_url || offData.products?.[0]?.image_small_url || null
        if (img) p.imageUrl = img
      } catch { /* geen afbeelding, geen probleem */ }
    }

    const withSavings = results.filter(r => r.originalPrice > r.discountedPrice)
    console.log(`  ✅ Vomar: ${results.length} ürün (${withSavings.length} met besparing)`)
    return results
  } catch (e) {
    console.error('  ❌ Vomar:', e.message)
    return []
  }
}

// ─── UNIT-PRICE META EXTRACTION ──────────────────────────────────────────────
const SIZE_RE = /\b\d+[,.]\d+\b|\b\d+(g|gr|ml|cl|dl|l|kg|kilo|x|stuks?|stuk|pack|pak|pck)\b/gi

function _parseNum(s) { return parseFloat(s.replace(',', '.')) }

function _extractVolumeMl(name) {
  const m = name.match(/(\d+[,.]\d+|\d+)\s*(cl|dl|ml|l|liter|litre)\b/i)
  if (!m) return null
  const a = _parseNum(m[1])
  const u = m[2].toLowerCase()
  const ml = u === 'ml' ? a : u === 'cl' ? a * 10 : u === 'dl' ? a * 100 : a * 1000
  return { amount: ml, label: `${m[1]} ${m[2]}` }
}

function _extractWeightG(name) {
  const m = name.match(/(\d+[,.]\d+|\d+)\s*(kg|kilo|kilogram|gram|g)\b/i)
  if (!m) return null
  const a = _parseNum(m[1])
  const u = m[2].toLowerCase()
  const g = (u === 'g' || u === 'gram') ? a : a * 1000
  return { amount: g, label: `${m[1]} ${m[2]}` }
}

function _extractCount(name) {
  for (const re of [/(\d+)\s*[-]?\s*(?:pack|pak|pck|stuks?|stuk|pieces?)\b/i, /\b(\d+)\s*x\s*(?:\d)/i]) {
    const m = name.match(re)
    if (m) { const n = parseInt(m[1]); if (n > 1 && n <= 200) return { count: n, label: m[0] } }
  }
  return null
}

const KNOWN_BRANDS = new Set([
  'ariel','persil','bold','dash','dreft','fairy','glorix','dettol',
  'coca','pepsi','fanta','sprite','heineken','amstel','grolsch',
  'activia','danone','milka','kinder','ferrero','haribo',
  'lays','pringles','duyvis','remia','calve','calvé',
  'knorr','maggi','conimex','honig','unox','campina','friso',
  'becel','flora','benecol','lurpak','president','philadelphia',
  'bonduelle','iglo','mora','simba','sensodyne','colgate',
  'oral','gillette','dove','nivea','head','pantene','axe','rexona',
])

function _extractBrand(name) {
  const fw = name.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '')
  if (fw && KNOWN_BRANDS.has(fw)) return name.split(/\s+/)[0]
  const m = name.match(/^([A-Z][a-zA-Z]{2,})(?:\s|$)/)
  return m ? m[1] : null
}

function enrichProductMeta(name, price) {
  if (!price || price <= 0) return {}
  const vol = _extractVolumeMl(name)
  const weight = _extractWeightG(name)
  const countInfo = _extractCount(name)

  let unitSize = null, unitType = null, fullSizeLabel = null, unitPrice = null

  if (vol) {
    const totalMl = vol.amount * (countInfo?.count ?? 1)
    if (totalMl > 0) {
      unitSize = totalMl; unitType = 'ml'
      fullSizeLabel = countInfo ? `${countInfo.label} ${vol.label}` : vol.label
      unitPrice = totalMl >= 1000 ? price / (totalMl / 1000) : price / (totalMl / 100)
      unitPrice = parseFloat(unitPrice.toFixed(4))
    }
  } else if (weight) {
    const totalG = weight.amount * (countInfo?.count ?? 1)
    if (totalG > 0) {
      unitSize = totalG; unitType = 'g'
      fullSizeLabel = countInfo ? `${countInfo.label} ${weight.label}` : weight.label
      unitPrice = totalG >= 500 ? price / (totalG / 1000) : price / (totalG / 100)
      unitPrice = parseFloat(unitPrice.toFixed(4))
    }
  } else if (countInfo) {
    unitSize = countInfo.count; unitType = 'stuks'; fullSizeLabel = countInfo.label
    unitPrice = parseFloat((price / countInfo.count).toFixed(4))
  }

  return { brand: _extractBrand(name), unitSize, unitType, unitPrice, fullSizeLabel }
}

// ─── DEKAMARKT — GraphQL API (more reliable than HTML scraping on server IPs) ──
async function scrapeDekaMarkt() {
  console.log('🏪 [DekaMarkt] GraphQL API...')
  try {
    const GQL = 'https://web-deka-gateway.dekamarkt.nl/graphql'
    const FILES = 'https://web-fileserver.dekamarkt.nl/offers/'
    const seen = new Set()
    const results = []

    for (let section = 1; section <= 30; section++) {
      const res = await fetch(GQL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://www.dekamarkt.nl',
          'Referer': 'https://www.dekamarkt.nl/aanbiedingen',
          'User-Agent': UA,
          'Accept-Language': 'nl-NL,nl;q=0.9',
        },
        body: JSON.stringify({
          query: `{ listOffersBySection(section: ${section}) { currentOffers { offerId headerText subText packaging promotionText offerPrice normalPrice image type } } }`,
        }),
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) break
      const data = await res.json()
      const offers = data?.data?.listOffersBySection?.currentOffers ?? []

      for (const o of offers) {
        if (seen.has(o.offerId)) continue
        seen.add(o.offerId)

        const discountedPrice = parseFloat(o.offerPrice) || 0
        if (!discountedPrice) continue

        const originalPrice = parseFloat(o.normalPrice) || discountedPrice
        const name = (o.headerText || '').replace(/\s+/g, ' ').trim()
        if (!name) continue

        const promoLabel = o.promotionText || o.subText || ''
        results.push({
          name,
          market: 'DekaMarkt',
          originalPrice: originalPrice > discountedPrice ? originalPrice : discountedPrice,
          discountedPrice,
          imageUrl: o.image ? `${FILES}${o.image}` : null,
          isCampaign: true,
          source: 'dekamarkt.nl/aanbiedingen',
          expiresAt: EXPIRES_AT,
          campaignType: toCampaignType(promoLabel || name),
        })
      }
    }

    const withSavings = results.filter(r => r.originalPrice > r.discountedPrice)
    console.log(`  ✅ DekaMarkt: ${results.length} ürün (${withSavings.length} met besparing)`)
    return results
  } catch (e) {
    console.error('  ❌ DekaMarkt:', e.message)
    return []
  }
}

// ─── COOP — JSON-LD + embedded script JSON + HTML fallback ───────────────────
async function scrapeCoop() {
  console.log('🏪 [Coop] coop.nl/aanbiedingen...')
  try {
    const res = await fetch('https://www.coop.nl/aanbiedingen', {
      headers: { ...HEADERS, 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()

    const results = []
    const seen = new Set()

    // Strategy 1: JSON-LD structured data
    for (const [, block] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try {
        const data = JSON.parse(block)
        const items = data.itemListElement
          || (data['@type'] === 'ItemList' ? data.itemListElement : null)
          || (Array.isArray(data) ? data : null)
          || []
        for (const item of items) {
          const p = item.item || item
          if (!p.name || !p.offers?.price) continue
          const discountedPrice = parseFloat(p.offers.price)
          if (!discountedPrice || isNaN(discountedPrice) || seen.has(p.name.toLowerCase())) continue
          seen.add(p.name.toLowerCase())
          const originalPrice = parseFloat(p.offers.highPrice || p.offers.price)
          
          let expiresAt = EXPIRES_AT
          if (p.offers?.priceValidUntil) {
            expiresAt = p.offers.priceValidUntil.split('T')[0]
          }

          const imgRaw = p.image
          const imageUrl = typeof imgRaw === 'string' ? imgRaw
            : Array.isArray(imgRaw) ? imgRaw[0]
            : imgRaw?.url || null
          results.push({
            name: p.name.trim(),
            market: 'Coop',
            originalPrice: originalPrice > discountedPrice ? originalPrice : discountedPrice,
            discountedPrice,
            imageUrl,
            isCampaign: true,
            source: 'coop.nl/aanbiedingen',
            expiresAt: EXPIRES_AT,
            campaignType: toCampaignType(p.name),
          })
        }
      } catch {}
    }

    if (results.length > 0) {
      console.log(`  ✅ Coop: ${results.length} ürün (JSON-LD)`)
      return results
    }

    // Strategy 2: Look for embedded JSON (Next.js __NEXT_DATA__ or window.__INITIAL_STATE__)
    for (const [, raw] of html.matchAll(/<script[^>]*>\s*(?:window\.__(?:INITIAL_STATE|NUXT|STATE)__|var\s+__data__)\s*=\s*(\{[\s\S]*?\})[\s;]*<\/script>/g)) {
      try {
        const state = JSON.parse(raw)
        // Try common paths where products live
        const candidates = [
          state?.products, state?.items, state?.data?.products,
          state?.promotions, state?.offers, state?.aanbiedingen,
          state?.pageData?.products, state?.page?.data?.products,
        ].filter(Array.isArray)
        for (const list of candidates) {
          for (const p of list) {
            const name = (p.name || p.title || p.description || '').trim()
            if (!name || seen.has(name.toLowerCase())) continue
            const discountedPrice = parseFloat(p.price || p.offerPrice || p.salePrice || 0)
            if (!discountedPrice) continue
            const originalPrice = parseFloat(p.originalPrice || p.normalPrice || p.regularPrice || discountedPrice)
            seen.add(name.toLowerCase())
            results.push({
              name,
              market: 'Coop',
              originalPrice: originalPrice > discountedPrice ? originalPrice : discountedPrice,
              discountedPrice,
              imageUrl: p.image || p.imageUrl || p.img || null,
              isCampaign: true,
              source: 'coop.nl/aanbiedingen',
              expiresAt: EXPIRES_AT,
              campaignType: toCampaignType(name),
            })
          }
        }
      } catch {}
    }

    if (results.length > 0) {
      console.log(`  ✅ Coop: ${results.length} ürün (embedded JSON)`)
      return results
    }

    // Strategy 3: Cheerio HTML parsing — product cards
    const $ = cheerio.load(html)
    $('[class*="product"],[class*="offer"],[class*="aanbieding"]').each((_, el) => {
      try {
        const name = $(el).find('[class*="title"],[class*="name"],[class*="heading"],h2,h3').first().text().trim()
        if (!name || name.length < 3 || seen.has(name.toLowerCase())) return

        // Price: look for price-like text in the card
        const priceText = $(el).find('[class*="price"],[class*="prijs"]').first().text()
        const priceMatch = priceText.match(/(\d+)[.,](\d{2})/)
        if (!priceMatch) return
        const discountedPrice = parseFloat(`${priceMatch[1]}.${priceMatch[2]}`)
        if (!discountedPrice) return

        // Original price (strikethrough)
        const origText = $(el).find('s,[class*="was"],[class*="old"],[class*="strike"],[class*="doorgehaald"]').first().text()
        const origMatch = origText.match(/(\d+)[.,](\d{2})/)
        const originalPrice = origMatch
          ? parseFloat(`${origMatch[1]}.${origMatch[2]}`)
          : discountedPrice

        const imageUrl = $(el).find('img').first().attr('src') || $(el).find('img').first().attr('data-src') || null

        seen.add(name.toLowerCase())
        results.push({
          name,
          market: 'Coop',
          originalPrice: originalPrice > discountedPrice ? originalPrice : discountedPrice,
          discountedPrice,
          imageUrl,
          isCampaign: true,
          source: 'coop.nl/aanbiedingen',
          expiresAt: EXPIRES_AT,
          campaignType: toCampaignType(name),
        })
      } catch {}
    })

    const withSavings = results.filter(r => r.originalPrice > r.discountedPrice)
    console.log(`  ✅ Coop: ${results.length} ürün (${withSavings.length} met besparing)`)
    return results
  } catch (e) {
    console.error('  ❌ Coop:', e.message)
    return []
  }
}

// ─── KRUIDVAT — Spartacus SSR (spartacus-app-state) + OCC product API ────────
async function scrapeKruidvat() {
  console.log('🏪 [Kruidvat] kruidvat.nl/aanbiedingen (Spartacus SSR)...')
  try {
    // Step 1: SSR HTML → Spartacus app state
    const res = await fetch('https://www.kruidvat.nl/aanbiedingen', {
      headers: { ...HEADERS, Accept: 'text/html,application/xhtml+xml,*/*' },
      signal: AbortSignal.timeout(25000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()

    const stateMatch = html.match(/<script id="spartacus-app-state" type="application\/json">([\s\S]*?)<\/script>/)
    if (!stateMatch) throw new Error('spartacus-app-state bulunamadı')

    const decoded = stateMatch[1]
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))

    const state = JSON.parse(decoded)
    const promoTab = state['promo-tab-dezeweek']
    if (!promoTab) throw new Error('promo-tab-dezeweek state bulunamadı')

    // Step 2: Extract product tiles (/p/ URLs only — have individual pricing)
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
    console.log(`  [Kruidvat] ${allTiles.length} tile → ${productTiles.length} unieke ürün tile'ı`)

    // Step 3: Fetch product details concurrently (10 at a time)
    const OCC = 'https://api.kruidvat.nl/api/v2/kvn-spa'
    const kvH = {
      'User-Agent': UA,
      Accept: 'application/json',
      'Accept-Language': 'nl-NL,nl;q=0.9',
      Referer: 'https://www.kruidvat.nl/aanbiedingen',
    }
    const CONCURRENCY = 10
    const results = []

    for (let i = 0; i < productTiles.length; i += CONCURRENCY) {
      const batch = productTiles.slice(i, i + CONCURRENCY)
      const batchRes = await Promise.all(batch.map(async (tile) => {
        const code = tile.localizedURLLink.match(/\/p\/(\d+)/)?.[1]
        if (!code) return null
        try {
          const r = await fetch(
            `${OCC}/products/${code}?lang=nl&curr=EUR&fields=FULL`,
            { headers: kvH, signal: AbortSignal.timeout(10000) }
          )
          if (!r.ok) return null
          const p = await r.json()

          const discountedPrice = p.price?.value
          if (!discountedPrice || discountedPrice <= 0) return null

          const originalPrice = p.price?.oldValue ?? discountedPrice

          // Image — prefer product API, fall back to SSR tile image
          const rawImg = p.listImage?.url || p.thumbnailImage?.url || tile.image?.url || null
          const imageUrl = rawImg
            ? (rawImg.startsWith('http') ? rawImg : `https://media.kruidvat.nl${rawImg}`)
            : null

          // Expiry from topPromotion.endDate
          const endDate = p.topPromotion?.endDate || null

          // Campaign type from topPromotion description or URL slug
          const promoText = [
            p.topPromotion?.description || '',
            p.topPromotion?.badge?.altText || '',
            tile.title || '',
            tile.localizedURLLink || '',
          ].join(' ')

          return {
            name: p.name || tile.title,
            discountedPrice,
            originalPrice: originalPrice > discountedPrice ? originalPrice : discountedPrice,
            imageUrl,
            url: `https://www.kruidvat.nl${tile.localizedURLLink}`,
            expiresAt: endDate ? new Date(endDate).toISOString().split('T')[0] : null,
            category: null,
            campaignType: toCampaignType(promoText),
            isCampaign: true,
            source: 'kruidvat.nl/aanbiedingen',
          }
        } catch { return null }
      }))
      results.push(...batchRes.filter(Boolean))
    }

    // Name-based dedup — different codes can resolve to the same product name
    const seenNames = new Set()
    const unique = results.filter(r => {
      const key = r.name?.toLowerCase().trim()
      if (!key || seenNames.has(key)) return false
      seenNames.add(key)
      return true
    })
    console.log(`  [Kruidvat] ✅ ${results.length} ürün → ${unique.length} uniek na naam-dedup`)
    return unique
  } catch (e) {
    console.error('[Kruidvat] Hata:', e.message)
    return []
  }
}

// ─── PLUS — OutSystems SPA (Imperva WAF bypass via Preload endpoint) ─────────
async function scrapePlus() {
  console.log('🏪 [Plus] plus.nl/aanbiedingen (OutSystems API)...')
  try {
    const UA_PLUS = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    const BASE = {
      'User-Agent': UA_PLUS,
      'Accept-Language': 'nl-NL,nl;q=0.9',
      'Origin': 'https://www.plus.nl',
      'Referer': 'https://www.plus.nl/aanbiedingen',
    }

    const jar = {}
    // getSetCookie() Node 18.14+ — daha eski sürümler için raw header fallback
    const getCookieHeaders = (res) => {
      if (typeof res.headers.getSetCookie === 'function') return res.headers.getSetCookie()
      const raw = res.headers.get('set-cookie')
      return raw ? raw.split(/,(?=[^ ])/) : []
    }
    const parseCookies = (hdrs) => {
      for (const hdr of hdrs) {
        const [kv] = hdr.split(';')
        const eq = kv.indexOf('=')
        if (eq === -1) continue
        jar[kv.slice(0, eq).trim()] = kv.slice(eq + 1).trim()
      }
    }
    const cookieStr = () => Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ')
    const extractCsrf = () => {
      const m = decodeURIComponent(jar['nr2Users'] || '').match(/crf=([^;]+)/)
      return m ? m[1] : ''
    }

    // Step 1: Imperva bypass cookies — GetCSS ve Preload ikisini de dene
    const BROWSER_HEADERS = {
      ...BASE,
      'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'upgrade-insecure-requests': '1',
    }
    const r1css = await fetch(
      'https://www.plus.nl/ECOP_HotCache_Eng/rest/ResourceManagement/GetCSS',
      { headers: { ...BROWSER_HEADERS, 'Accept': 'text/plain,*/*' }, signal: AbortSignal.timeout(15000) }
    ).catch(() => null)
    if (r1css) parseCookies(getCookieHeaders(r1css))
    console.log(`  [Plus] GetCSS: ${r1css?.status ?? 'fail'}, cookies: ${Object.keys(jar).length}`)

    const r1 = await fetch(
      'https://www.plus.nl/ECOP_HotCache_Eng/rest/ResourceManagement/Preload?url=https%3A%2F%2Fwww.plus.nl%2Faanbiedingen',
      { headers: { ...BROWSER_HEADERS, 'Accept': 'text/html,application/xhtml+xml,*/*', 'Cookie': cookieStr() }, signal: AbortSignal.timeout(20000) }
    )
    console.log(`  [Plus] Preload: ${r1.status}, cookies: ${Object.keys(jar).length}`)
    if (!r1.ok) throw new Error(`Preload ${r1.status}`)
    parseCookies(getCookieHeaders(r1))

    // Step 2: AppReady → sets nr2Users cookie with CSRF token
    const r2 = await fetch(
      'https://www.plus.nl/screenservices/ECOP/ActionOnApplicationReady_Server',
      {
        method: 'POST',
        headers: { ...BASE, 'Content-Type': 'application/json; charset=UTF-8', 'OutSystems-locale': 'nl-NL', 'Accept': 'application/json', 'Cookie': cookieStr() },
        body: JSON.stringify({ versionInfo: { moduleVersion: 'R7vDI3CkqI68dsNzB22EmQ', apiVersion: 'bN+60jDM7pDC4My+lkJRIQ' }, viewName: 'MainFlow.Promotions', screenData: { variables: {} } }),
        signal: AbortSignal.timeout(15000),
      }
    )
    parseCookies(getCookieHeaders(r2))
    const csrf = extractCsrf()
    console.log(`  [Plus] AppReady: ${r2.status}, CSRF: ${csrf ? 'OK' : 'EKSIK'}, jar keys: ${Object.keys(jar).join(',')}`)
    if (!csrf) throw new Error(`CSRF token alınamadı (AppReady: ${r2.status})`)

    // Step 3: Promotions API
    const r3 = await fetch(
      'https://www.plus.nl/screenservices/ECP_Composition_CW/Promotions/Promotion_LP_Content_TF_Optimization/DataActionGetPromotionList_Optimization',
      {
        method: 'POST',
        headers: { ...BASE, 'Content-Type': 'application/json; charset=UTF-8', 'OutSystems-locale': 'nl-NL', 'Accept': 'application/json', 'Cookie': cookieStr(), 'X-CSRFToken': csrf },
        body: JSON.stringify({
          versionInfo: { moduleVersion: 'R7vDI3CkqI68dsNzB22EmQ', apiVersion: 'bN+60jDM7pDC4My+lkJRIQ' },
          viewName: 'MainFlow.Promotions',
          screenData: {
            variables: {
              IsShowData: false, IsPreloadedHTMLActive: false, StoreNumber: 0, StoreChannel: '',
              PromotionPeriodId: 1, LocalPromotionList: { List: [], EmptyListItem: {} },
              IsUnderAge: false, ClickDelayValue: 0, ProductCategories: '', PromotionCategories: '',
              Priority: 0, IsAppendingRecords: false, StartIndex: 0, MaxRecords: 500,
              IsDesktop: true, IsNextWeekPromotions: false,
            }
          },
        }),
        signal: AbortSignal.timeout(20000),
      }
    )
    if (!r3.ok) throw new Error(`Promotions API ${r3.status}`)

    const json = await r3.json()
    if (json.versionInfo?.hasModuleVersionChanged) {
      console.warn('  ⚠️  Plus: module version değişti — versionInfo güncellenmeli')
    }
    const list = json.data?.PromotionOfferList?.List || []

    const results = []
    const seen = new Set()

    for (const item of list) {
      const cat = item.Category
      if (!cat?.Offers?.List) continue
      const catLabel = cat.CategoryLabel || ''

      for (const offer of cat.Offers.List) {
        if (offer.IsFreeDeliveryOffer) continue

        const name = (offer.Name?.trim() || offer.Brand?.split(',')[0]?.trim() || '').trim()
        if (!name) continue

        const newPrice = parseFloat(offer.NewPrice) || 0
        if (newPrice === 0) continue  // skip bundles/combos without unit price

        const key = `${offer.PromotionID}-${offer.Offer_Id}`
        if (seen.has(key)) continue
        seen.add(key)

        const origPrice = parseFloat(offer.PriceOriginal_Highest) || parseFloat(offer.PriceOriginal_Lowest) || 0
        const label = offer.DisplayInfo_Label || ''
        const promoLabel = offer.DisplayInfo_PromotionBasedLabel || ''
        const campaignType = toCampaignType(label) || toCampaignType(promoLabel) || toCampaignType(name)

        let imgUrl = offer.ImageURL || ''
        if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl

        const slug = offer.Slug || `${offer.PromotionID}-${offer.Offer_Id}`

        results.push({
          name,
          brand: offer.Brand?.split(',')[0]?.trim() || undefined,
          discountedPrice: newPrice,
          originalPrice: origPrice > newPrice ? origPrice : newPrice,
          market: 'Plus',
          imageUrl: imgUrl || null,
          url: `https://www.plus.nl/aanbiedingen/${slug}`,
          expiresAt: (offer.EndDate && offer.EndDate > new Date().toISOString().split('T')[0]) ? offer.EndDate : EXPIRES_AT,
          category: catLabel,
          campaignType,
          isCampaign: true,
          source: 'plus.nl/aanbiedingen',
        })
      }
    }

    // Name-based dedup — önce expiresAt'e göre sırala (en geç tarihli ürün kazanır)
    results.sort((a, b) => (b.expiresAt || '').localeCompare(a.expiresAt || ''))
    const seenNames = new Set()
    const unique = results.filter(r => {
      const key = r.name?.toLowerCase().trim()
      if (!key || seenNames.has(key)) return false
      seenNames.add(key)
      return true
    })
    console.log(`  ✅ Plus: ${unique.length} ürün (${results.length - unique.length} duplicate elendi)`)
    return unique
  } catch (e) {
    console.error('  ❌ Plus:', e.message)
    return []
  }
}

// ─── ANA FONKSİYON ────────────────────────────────────────────────────────────
export async function scrapeFlyerProducts() {
  // Hollanda'da çoğu indirim Pazar günü biter. Varsayılan olarak en yakın Pazar'ı bul.
  const now = new Date()
  const sunday = new Date(now)
  const daysUntilSunday = now.getDay() === 0 ? 7 : (7 - now.getDay()) % 7
  sunday.setDate(now.getDate() + daysUntilSunday)
  EXPIRES_AT = sunday.toISOString().split('T')[0]

  console.log(`🔍 Fetch-only scraper başlatılıyor... (Varsayılan bitiş: ${EXPIRES_AT})`)

  // Run scrapers sequentially to prevent memory/CPU spikes and network bottlenecks on small server tiers
  const dirk = await scrapeDirk()
  const jumbo = await scrapeJumbo()
  const hoogvliet = await scrapeHoogvliet()
  const lidl = await scrapeLidl()
  const ah = await scrapeAlbertHeijn()
  const aldi = await scrapeAldi()
  const vomar = await scrapeVomar()
  const deka = await scrapeDekaMarkt()
  const coop = await scrapeCoop()
  const plus = await scrapePlus()
  const kruidvat = await scrapeKruidvat()

  let all = [...dirk, ...jumbo, ...hoogvliet, ...lidl, ...ah, ...aldi, ...vomar, ...deka, ...coop, ...plus, ...kruidvat]

  // Duplicate temizliği
  const seen = new Set()
  all = all.filter(p => {
    const key = p.name.toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Unit-price meta: use API-provided values when available, regex as fallback
  all = all.map(p => {
    if (p.unitSize != null && p.unitType) {
      // AH API already gave us clean data — only fill brand if missing
      return { ...p, brand: p.brand ?? _extractBrand(p.name) }
    }
    return { ...p, ...enrichProductMeta(p.name, p.discountedPrice) }
  })

  console.log(`\n✅ Toplam ${all.length} ürün (${dirk.length} Dirk, ${jumbo.length} Jumbo, ${hoogvliet.length} Hoogvliet, ${lidl.length} Lidl, ${ah.length} AH, ${aldi.length} Aldi, ${vomar.length} Vomar, ${deka.length} DekaMarkt, ${coop.length} Coop, ${plus.length} Plus, ${kruidvat.length} Kruidvat)`)

  // Besparing diagnostics
  const markets = ['Albert Heijn', 'Aldi', 'Jumbo', 'Lidl', 'Dirk', 'Hoogvliet', 'Vomar', 'DekaMarkt', 'Coop', 'Plus', 'Kruidvat']
  for (const m of markets) {
    const mAll = all.filter(p => p.market === m)
    const mDiscount = mAll.filter(p => p.originalPrice > p.discountedPrice)
    const totalSaving = mDiscount.reduce((s, p) => s + (p.originalPrice - p.discountedPrice), 0)
    console.log(`  💰 ${m}: ${mDiscount.length}/${mAll.length} met korting, totaal €${totalSaving.toFixed(2)} besparing`)
  }

  return all
}
