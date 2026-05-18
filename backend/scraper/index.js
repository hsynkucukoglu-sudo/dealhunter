/**
 * Fetch-only scraper — Puppeteer/Chromium yok.
 * Render free tier (512MB) ile uyumlu.
 */
import * as cheerio from 'cheerio'

const EXPIRES_AT = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

// Promo label or text → normalized campaignType string
function toCampaignType(text) {
  if (!text) return null
  const s = text.toLowerCase()
  if (/1\s*\+\s*1|one.plus.one|bogo/.test(s)) return '1+1'
  if (/2e\s*(halve|helft|50%)|tweede.*(halve|gratis)|2de\s*(halve|gratis)/.test(s)) return '2e-halve-prijs'
  if (/3\s*(halen|voor)\s*2|3\s*halen.*2\s*betalen/.test(s)) return '3-halen-2-betalen'
  if (/2\s*\+\s*1|3\s*voor\s*2/.test(s)) return '3-halen-2-betalen'
  if (/combi(natie)?/.test(s)) return 'combinatie'
  if (/tijdelijk(\s*lager)?/.test(s)) return 'tijdelijk'
  return null
}
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

    const results = []
    const seen = new Set()

    for (const [, block] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try {
        const data = JSON.parse(block)
        const items = data['@graph']?.[0]?.itemListElement
          || (data['@type'] === 'ItemList' ? data.itemListElement : null)
          || []
        for (const item of items) {
          const p = item.item || item
          if (!p?.name || !p.offers?.price) continue
          if (seen.has(p.name)) continue
          seen.add(p.name)
          const discountedPrice = parseFloat(p.offers.price)
          if (!discountedPrice) continue
          const highPrice = parseFloat(p.offers.highPrice || p.offers.priceBeforeDiscount || 0)
          const originalPrice = (highPrice && highPrice > discountedPrice) ? highPrice : discountedPrice
          const imgSrc = Array.isArray(p.image) ? p.image[0] : (p.image || null)
          results.push({
            name: p.name,
            market: 'Dirk',
            originalPrice,
            discountedPrice,
            imageUrl: typeof imgSrc === 'string' ? imgSrc : imgSrc?.url || null,
            isCampaign: true,
            source: 'dirk.nl/aanbiedingen',
            expiresAt: EXPIRES_AT,
            campaignType: toCampaignType(p.name) || toCampaignType(p.offers?.description || ''),
          })
        }
      } catch {}
    }

    console.log(`  ✅ Dirk: ${results.length} ürün`)
    return results
  } catch (e) {
    console.error('  ❌ Dirk:', e.message)
    return []
  }
}

// ─── JUMBO — __NEXT_DATA__ + API + HTML fallback ────────────────────────────
async function scrapeJumbo() {
  console.log('🏪 [Jumbo] aanbiedingen taranıyor...')
  try {
    const res = await fetch('https://www.jumbo.com/aanbiedingen/nu', { headers: HEADERS })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()
    const $ = cheerio.load(html)
    const results = []
    const seen = new Set()

    // Strateji 1: __NEXT_DATA__ embedded JSON (mevcutsa en güvenilir kaynak)
    const nextDataRaw = $('script#__NEXT_DATA__').html()
    if (nextDataRaw) {
      try {
        const nextData = JSON.parse(nextDataRaw)
        function* walkPromos(obj, depth) {
          if (!obj || depth > 15) return
          if (Array.isArray(obj)) { for (const v of obj) yield* walkPromos(v, depth + 1) }
          else if (typeof obj === 'object') {
            if ((obj.name || obj.title) && (obj.price !== undefined || obj.imageUrl || obj.image)) yield obj
            for (const v of Object.values(obj)) yield* walkPromos(v, depth + 1)
          }
        }
        for (const p of walkPromos(nextData, 0)) {
          const name = p.name || p.title || p.promotionTitle
          if (!name || name.length < 3 || seen.has(name)) continue
          const priceRaw = p.price?.amount ?? p.price?.current ?? p.currentPrice ?? p.promotionPrice ?? p.price ?? ''
          const dp = parseFloat(String(priceRaw).replace(',', '.')) || 0
          const promoText = p.promotionDescription || p.description || p.subtitle || ''
          const hasPromo = /(1\s*\+\s*1|2\s*\+\s*1|3\s+halen\s+2)/i.test(promoText + ' ' + name)
          if (!dp && !hasPromo) continue
          seen.add(name)
          results.push({
            name,
            market: 'Jumbo',
            originalPrice: dp || 0,
            discountedPrice: dp,
            imageUrl: p.imageUrl || p.image || null,
            isCampaign: true,
            source: 'jumbo.com/__next_data__',
            expiresAt: EXPIRES_AT,
            campaignType: toCampaignType(promoText) || toCampaignType(name),
          })
        }
        if (results.length > 0) {
          console.log(`  ✅ Jumbo: ${results.length} ürün (__NEXT_DATA__)`)
          return results
        }
      } catch {}
    }

    // Strateji 2: JSON API
    try {
      const apiRes = await fetch(
        'https://www.jumbo.com/api/2.0/promotion/?sorteer=relevantie&page=0&pageSize=100&view=grid',
        { headers: { ...HEADERS, 'Accept': 'application/json', 'Referer': 'https://www.jumbo.com/' } }
      )
      if (apiRes.ok) {
        const json = await apiRes.json()
        const proms = json.promotionList?.promotions || json.promotions || []
        for (const p of proms) {
          const name = p.name || p.title || p.promotionTitle
          if (!name || name.length < 3 || seen.has(name)) continue
          const dp = parseFloat((p.price?.amount ?? p.currentPrice ?? p.promotionPrice ?? '').toString().replace(',', '.')) || 0
          const promoText = p.promotionDescription || p.description || ''
          const hasPromo = /(1\s*\+\s*1|2\s*\+\s*1|3\s+halen\s+2)/i.test(promoText + ' ' + name)
          if (!dp && !hasPromo) continue
          seen.add(name)
          results.push({
            name,
            market: 'Jumbo',
            originalPrice: dp || 0,
            discountedPrice: dp,
            imageUrl: (p.imageUrl || p.image || null),
            isCampaign: true,
            source: 'jumbo.com/api',
            expiresAt: EXPIRES_AT,
            campaignType: toCampaignType(promoText) || toCampaignType(name),
          })
        }
        if (results.length > 0) {
          console.log(`  ✅ Jumbo: ${results.length} ürün (API)`)
          return results
        }
      }
    } catch {}

    // Strateji 3: HTML cheerio
    const selectors = [
      'li.jum-card.card-promotion',
      '[class*="promotion-card"]',
      '[class*="offer-card"]',
      '[data-testid*="promotion"]',
      '[class*="product-card"]',
      'article[class*="product"]',
    ]
    $(selectors.join(', ')).each((_, el) => {
      const card = $(el)
      const text = card.text().replace(/\s+/g, ' ').trim()
      const name = card.find('h1,h2,h3,h4,[class*="title"],[class*="name"]').first().text().trim()
        || card.find('a[href*="/product"],a[href*="/aanbiedingen"]').first().text().trim()
      if (!name || name.length < 3 || seen.has(name)) return
      const priceMatch = text.match(/voor\s+(\d+[,.]\d+)/i) || text.match(/€\s*(\d+[,.]\d+)/) || text.match(/(\d+)[,.](\d{2})/)
      let dp = 0
      if (priceMatch) {
        dp = priceMatch[2] ? parseFloat(`${priceMatch[1]}.${priceMatch[2]}`) : parseFloat(priceMatch[1].replace(',', '.'))
      }
      const hasPromo = /(1\+1|2\+1|3\s+halen\s+2)\s*gratis?/i.test(text)
      if (!dp && !hasPromo) return
      seen.add(name)
      const img = card.find('img').first()
      results.push({
        name,
        market: 'Jumbo',
        originalPrice: dp || 0,
        discountedPrice: dp,
        imageUrl: (img.attr('src') || img.attr('data-src') || null),
        isCampaign: true,
        source: 'jumbo.com/aanbiedingen (html)',
        expiresAt: EXPIRES_AT,
        campaignType: toCampaignType(text) || toCampaignType(name),
      })
    })

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

    // Price field may be a range string "2.05 - 3.91" — take minimum value
    const jsonBlocks = html.match(/\{[^{}]*"price"\s*:\s*"[^"]+[^{}]*\}/g) || []
    const seen = new Set()
    const results = []

    for (const block of jsonBlocks) {
      try {
        const obj = JSON.parse(block.replace(/&#47;/g, '/').replace(/&amp;/g, '&'))
        if (!obj.name || !obj.price) continue
        const name = decodeHtmlEntities(obj.name)
        if (seen.has(name)) continue
        seen.add(name)
        const priceStr = String(obj.price).split(/\s*-\s*/)[0].trim()
        const discountedPrice = parseFloat(priceStr)
        if (!discountedPrice) continue
        results.push({
          name,
          market: 'Hoogvliet',
          originalPrice: discountedPrice,
          discountedPrice,
          imageUrl: imgMap[obj.id] || null,
          isCampaign: true,
          source: 'hoogvliet.com/aanbiedingen',
          expiresAt: EXPIRES_AT,
          campaignType: toCampaignType(name),
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

// ─── PLUS — Googlebot UA: listing + product page price fetch ─────────────────
async function scrapePlus() {
  console.log('🏪 [Plus] plus.nl/aanbiedingen...')
  try {
    const botHeaders = {
      ...HEADERS,
      'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Accept': 'text/html',
      'Accept-Language': 'nl-NL',
    }

    // Strateji 1: Listing page → item list
    const listRes = await fetch('https://www.plus.nl/aanbiedingen', { headers: botHeaders })
    if (!listRes.ok) throw new Error(`HTTP ${listRes.status}`)
    const listHtml = await listRes.text()
    const $list = cheerio.load(listHtml)

    const candidates = []
    $list('[class*="plp-item-wrapper"]').each((_, el) => {
      const $el = $list(el)
      const name = $el.find('.plp-item-name span[data-expression]').text().trim()
      if (!name || name.length < 3) return
      const promoLabel = $el.find('.promo-offer-label span[data-expression]').text().replace(/\s+/g, ' ').trim()
      // Skip delivery-only promos — not a product discount
      if (/gratis bezorging/i.test(promoLabel) && !/(1\s*\+\s*1|2\s*\+\s*1|halve prijs|\d+%)/i.test(promoLabel)) return
      const img = $el.find('img[data-image]').attr('src') || $el.find('img').first().attr('src') || null
      const href = $el.closest('a').attr('href') || ''
      candidates.push({ name, promoLabel, img, href })
    })

    console.log(`  📋 Plus: ${candidates.length} kandidaat aanbieding`)

    // Strateji 2: Per item → product page fiyat çek (4'er paralel, max 25 item)
    const results = []
    const seen = new Set()
    const CONCURRENCY = 4
    const limited = candidates.slice(0, 25)

    for (let i = 0; i < limited.length; i += CONCURRENCY) {
      const batch = limited.slice(i, i + CONCURRENCY)
      await Promise.all(batch.map(async (item) => {
        if (seen.has(item.name)) return
        seen.add(item.name)
        let dp = 0
        let op = 0
        if (item.href) {
          try {
            const pRes = await fetch(`https://www.plus.nl${item.href}`, { headers: botHeaders })
            if (pRes.ok) {
              const pHtml = await pRes.text()
              const $p = cheerio.load(pHtml)
              // Integer + decimal birleştir: "2." + "49" → 2.49
              const intText = $p('.product-header-price-integer').filter((_, el) => {
                const t = $p(el).text().trim()
                return t && t !== '0.'
              }).first().text().trim()
              const decText = $p('.product-header-price-decimals').filter((_, el) => $p(el).text().trim()).first().text().trim()
              if (intText && decText) dp = parseFloat(intText + decText) || 0
              const prevText = $p('.product-header-price-previous').first().text().replace(/\s+/g, ' ').trim()
              const prevMatch = prevText.match(/(\d+)[.,](\d+)/)
              op = prevMatch ? parseFloat(`${prevMatch[1]}.${prevMatch[2]}`) : dp
            }
          } catch {}
        }
        if (!dp && !item.promoLabel) return
        results.push({
          name: item.name,
          market: 'Plus',
          originalPrice: op || dp,
          discountedPrice: dp,
          imageUrl: item.img && !item.img.includes('logo') ? item.img : null,
          isCampaign: true,
          source: 'plus.nl/aanbiedingen',
          expiresAt: EXPIRES_AT,
          campaignType: toCampaignType(item.promoLabel) || toCampaignType(item.name),
        })
      }))
    }

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
            originalPrice: discountedPrice,
            discountedPrice,
            imageUrl: img || null,
            isCampaign: true,
            source: 'lidl.nl/aanbiedingen',
            expiresAt: EXPIRES_AT,
            campaignType: toCampaignType(data.name),
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

    const h = {
      'Authorization': `Bearer ${access_token}`,
      'x-application': 'AHWEBSHOP',
      'Accept': 'application/json',
    }

    const seenIds = new Set()
    const candidates = []

    // Strateji 1: bonus=true — tüm bonus ürünleri çek (sortOn=DISCOUNT API'den kaldırıldı)
    for (let page = 0; page < 50; page++) {
      const r = await fetch(
        `https://api.ah.nl/mobile-services/product/search/v2?bonus=true&page=${page}&size=30`,
        { headers: h, signal: AbortSignal.timeout(12000) }
      )
      if (!r.ok) { console.log(`  [AH] S1 p${page} HTTP ${r.status}`); break }
      const json = await r.json()
      const prods = json.products || []
      if (!prods.length) break

      // İlk sayfa diagnostiği
      if (page === 0 && prods[0]) {
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
        candidates.push({ ...promo, name: p.title, imageUrl, ...unitInfo })
      }

      // 150 ürün bulduktan sonra dur
      if (candidates.length >= 150) break
    }

    console.log(`  [AH] S1 (bonus=true): ${seenIds.size} tarandı, ${candidates.length} promosyon`)

    // Strateji 3: AH website HTML / Next.js data
    if (candidates.length < 10) {
      try {
        const htmlRes = await fetch('https://www.ah.nl/aanbiedingen', { headers: HEADERS })
        const html = await htmlRes.text()
        const buildId = html.match(/"buildId"\s*:\s*"([^"]+)"/)?.[1]
        if (buildId) {
          const dataRes = await fetch(
            `https://www.ah.nl/_next/data/${buildId}/aanbiedingen.json`,
            { headers: HEADERS }
          )
          if (dataRes.ok) {
            const raw = await dataRes.text()

            function* extractStrings(obj) {
              if (typeof obj === 'string') yield obj
              else if (Array.isArray(obj)) { for (const v of obj) yield* extractStrings(v) }
              else if (obj && typeof obj === 'object') { for (const v of Object.values(obj)) yield* extractStrings(v) }
            }
            function walkProducts(obj, out, seen) {
              if (!obj || typeof obj !== 'object') return
              if ((obj.title || obj.name) && (obj.currentPrice ?? obj.salesPrice)) {
                const nm = obj.title || obj.name
                if (!seen.has(nm)) { seen.add(nm); out.push(obj) }
              }
              for (const v of (Array.isArray(obj) ? obj : Object.values(obj))) walkProducts(v, out, seen)
            }

            const outer = JSON.parse(raw)
            const seen3 = new Set()
            for (const str of extractStrings(outer)) {
              if (!str.includes('currentPrice') && !str.includes('salesPrice')) continue
              try {
                const inner = JSON.parse(str)
                const prods = []
                walkProducts(inner, prods, seen3)
                for (const p of prods) {
                  if (seenIds.has(p.webshopId || p.id)) continue
                  seenIds.add(p.webshopId || p.id || p.title)
                  const promo = calcAhPromo({ ...p, title: p.title || p.name })
                  if (!promo) continue
                  const img = p.images?.[0]?.url || p.image || null
                  const unitInfo = parseAhUnitInfo(p, promo.discountedPrice)
                  candidates.push({ ...promo, name: p.title || p.name, imageUrl: img, ...unitInfo })
                }
              } catch {}
            }
            console.log(`  [AH] S3 (Next.js data) sonrası toplam: ${candidates.length}`)
          }
        }
      } catch (e3) {
        console.log(`  [AH] S3 hata: ${e3.message}`)
      }
    }

    if (!candidates.length) {
      console.log('  [AH] 3 strateji de 0 ürün döndürdü')
      return []
    }

    candidates.sort((a, b) => (a.discountedPrice / a.originalPrice) - (b.discountedPrice / b.originalPrice))
    const top = candidates.slice(0, 150)
    console.log(`  ✅ Albert Heijn: ${top.length} ürün (${top.filter(p => p.imageUrl).length} görsel)`)

    return top.map(p => ({
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

    for (const p of Object.values(algoliaMap)) {
      if (!p.name || !p.currentPrice?.priceValue) continue
      if (seen.has(p.name)) continue
      seen.add(p.name)

      const discountedPrice = p.currentPrice.priceValue
      // promotionPrices contains the regular/original price (before promo)
      const promo = p.promotionPrices?.find(pr => pr.priceValue && pr.priceValue > discountedPrice)
      const originalPrice = promo?.priceValue ?? discountedPrice
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

// ─── VOMAR — HTML cheerio ─────────────────────────────────────────────────────
async function scrapeVomar() {
  console.log('🏪 [Vomar] vomar.nl/aanbiedingen...')
  try {
    const res = await fetch('https://www.vomar.nl/aanbiedingen', { headers: HEADERS })
    const html = await res.text()
    const $ = cheerio.load(html)
    const results = []
    const seen = new Set()

    // JSON-LD dene
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html())
        const items = data['@graph'] || (data['@type'] === 'ItemList' ? data.itemListElement : null) || []
        for (const item of items) {
          const p = item.item || item
          if (!p?.name || !p.offers?.price) continue
          const discountedPrice = parseFloat(p.offers.price)
          if (!discountedPrice || seen.has(p.name)) continue
          seen.add(p.name)
          const img = Array.isArray(p.image) ? p.image[0] : (p.image || null)
          results.push({
            name: p.name,
            market: 'Vomar',
            originalPrice: discountedPrice,
            discountedPrice,
            imageUrl: typeof img === 'string' ? img : img?.url || null,
            isCampaign: true,
            source: 'vomar.nl/aanbiedingen',
            expiresAt: EXPIRES_AT,
            campaignType: toCampaignType(p.name),
          })
        }
      } catch {}
    })

    // HTML fallback
    if (!results.length) {
      $('[class*="product"], [class*="offer"], [class*="deal"], article').each((_, el) => {
        const card = $(el)
        const name = card.find('h2, h3, h4, [class*="title"], [class*="name"]').first().text().trim()
        if (!name || name.length < 3 || seen.has(name)) return
        const text = card.text()
        const priceMatch = text.match(/€?\s*(\d+)[,.](\d{2})/)
        if (!priceMatch) return
        const discountedPrice = parseFloat(`${priceMatch[1]}.${priceMatch[2]}`)
        if (!discountedPrice || discountedPrice > 200) return
        seen.add(name)
        const img = card.find('img').first()
        const imgSrc = img.attr('src') || img.attr('data-src') || null
        results.push({
          name,
          market: 'Vomar',
          originalPrice: discountedPrice,
          discountedPrice,
          imageUrl: imgSrc && !imgSrc.includes('logo') ? imgSrc : null,
          isCampaign: true,
          source: 'vomar.nl/aanbiedingen',
          expiresAt: EXPIRES_AT,
          campaignType: toCampaignType(text) || toCampaignType(name),
        })
      })
    }

    console.log(`  ✅ Vomar: ${results.length} ürün`)
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

// ─── ANA FONKSİYON ────────────────────────────────────────────────────────────
export async function scrapeFlyerProducts() {
  console.log('🔍 Fetch-only scraper başlatılıyor...')

  const [dirk, jumbo, hoogvliet, plus, lidl, ah, aldi, vomar] = await Promise.all([
    scrapeDirk(),
    scrapeJumbo(),
    scrapeHoogvliet(),
    scrapePlus(),
    scrapeLidl(),
    scrapeAlbertHeijn(),
    scrapeAldi(),
    scrapeVomar(),
  ])

  let all = [...dirk, ...jumbo, ...hoogvliet, ...plus, ...lidl, ...ah, ...aldi, ...vomar]

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

  console.log(`\n✅ Toplam ${all.length} ürün (${dirk.length} Dirk, ${jumbo.length} Jumbo, ${hoogvliet.length} Hoogvliet, ${plus.length} Plus, ${lidl.length} Lidl, ${ah.length} AH, ${aldi.length} Aldi, ${vomar.length} Vomar)`)
  return all
}
