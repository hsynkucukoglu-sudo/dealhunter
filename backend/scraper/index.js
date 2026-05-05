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

// Promosyon mekanizmasından efektif indirim yüzdesi ve fiyatları hesapla
function calcAhPromo(p) {
  const mech = (p.bonusMechanism || '').trim()
  const label = p.discountLabels?.[0]
  const unitPrice = p.priceBeforeBonus || p.currentPrice

  if (!unitPrice || !p.title) return null

  // Düz fiyat indirimi: currentPrice < priceBeforeBonus
  if (p.currentPrice && p.priceBeforeBonus && p.currentPrice < p.priceBeforeBonus) {
    return {
      discountedPrice: p.currentPrice,
      originalPrice: p.priceBeforeBonus,
      promoLabel: mech || label?.defaultDescription || null,
    }
  }

  // 1+1 gratis → %50 efektif indirim
  if (/^1\s*\+\s*1\s*gratis$/i.test(mech) || label?.code === 'DISCOUNT_ONE_PLUS_ONE_FREE') {
    return { discountedPrice: +(unitPrice * 0.5).toFixed(2), originalPrice: unitPrice, promoLabel: '1+1 gratis' }
  }

  // 2+1 gratis → %33 efektif indirim
  if (/^2\s*\+\s*1\s*gratis$/i.test(mech)) {
    return { discountedPrice: +(unitPrice * 0.667).toFixed(2), originalPrice: unitPrice, promoLabel: '2+1 gratis' }
  }

  // 2+2 gratis → %50 efektif indirim
  if (/^2\s*\+\s*2\s*gratis$/i.test(mech)) {
    return { discountedPrice: +(unitPrice * 0.5).toFixed(2), originalPrice: unitPrice, promoLabel: '2+2 gratis' }
  }

  // 2e halve prijs → %25 efektif indirim
  if (/2e\s*halve\s*prijs/i.test(mech) || label?.code === 'DISCOUNT_SECOND_HALF_PRICE') {
    return { discountedPrice: +(unitPrice * 0.75).toFixed(2), originalPrice: unitPrice, promoLabel: '2e halve prijs' }
  }

  // X voor Y.YY (bijv. "2 voor 5.00", "3 voor 5.99")
  const xForY = mech.match(/^(\d+)\s+voor\s+([\d.,]+)/i)
  if (xForY) {
    const count = parseInt(xForY[1])
    const bundlePrice = parseFloat(xForY[2].replace(',', '.'))
    const effectiveUnit = +(bundlePrice / count).toFixed(2)
    if (effectiveUnit < unitPrice) {
      return { discountedPrice: effectiveUnit, originalPrice: unitPrice, promoLabel: mech }
    }
  }

  // X voor Y.YY (DISCOUNT_X_FOR_Y label)
  if (label?.code === 'DISCOUNT_X_FOR_Y' && label.count && label.price) {
    const effectiveUnit = +(label.price / label.count).toFixed(2)
    if (effectiveUnit < unitPrice) {
      return { discountedPrice: effectiveUnit, originalPrice: unitPrice, promoLabel: label.defaultDescription }
    }
  }

  // VOOR X.XX (vaste prijs promosyon)
  const voorPrice = mech.match(/^(?:\d+\s+)?VOOR\s+([\d.,]+)/i)
  if (voorPrice) {
    const promo = parseFloat(voorPrice[1].replace(',', '.'))
    if (promo < unitPrice) {
      return { discountedPrice: promo, originalPrice: unitPrice, promoLabel: mech }
    }
  }

  // % indirim
  if (label?.code === 'DISCOUNT_PERCENTAGE' && label.percentage) {
    const disc = +(unitPrice * (1 - label.percentage / 100)).toFixed(2)
    return { discountedPrice: disc, originalPrice: unitPrice, promoLabel: label.defaultDescription }
  }
  const pctMatch = mech.match(/^(\d+)%\s*(korting|volume\s*voordeel)/i)
  if (pctMatch) {
    const pct = parseInt(pctMatch[1])
    const disc = +(unitPrice * (1 - pct / 100)).toFixed(2)
    return { discountedPrice: disc, originalPrice: unitPrice, promoLabel: mech }
  }

  return null
}

// ─── ALBERT HEIJN — Tüm promosyon tipleri (1+1, halve prijs, X voor Y, %) ───
async function scrapeAlbertHeijn() {
  console.log('🏪 [Albert Heijn] Tüm bonus katalogu taranıyor...')
  try {
    const tokenRes = await fetch('https://api.ah.nl/mobile-auth/v1/auth/token/anonymous', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: 'appie' }),
      signal: AbortSignal.timeout(10000),
    })
    const { access_token } = await tokenRes.json()
    if (!access_token) { console.log('  [AH] token alınamadı'); return [] }

    const h = { 'Authorization': `Bearer ${access_token}`, 'x-application': 'AHWEBSHOP' }

    // webshopIds=1 ile tüm bonus kataloğunu çek (334 sayfa ≈ 10000 ürün)
    // İlk 100 sayfada tarama yap (~3000 ürün) — zaten tekrarlar çok
    const seenIds = new Set()
    const candidates = []
    for (let page = 0; page < 100; page++) {
      const r = await fetch(
        `https://api.ah.nl/mobile-services/product/search/v2?webshopIds=1&page=${page}&size=30`,
        { headers: h, signal: AbortSignal.timeout(10000) }
      )
      if (!r.ok) break
      const json = await r.json()
      const prods = json.products || []
      if (!prods.length) break

      for (const p of prods) {
        if (seenIds.has(p.webshopId) || !p.title) continue
        seenIds.add(p.webshopId)

        const promo = calcAhPromo(p)
        if (!promo) continue

        const imageUrl = p.images?.find(i => i.width === 400)?.url ?? p.images?.[0]?.url ?? null
        candidates.push({ ...promo, name: p.title, imageUrl })
      }
    }

    console.log(`  [AH] Taranan: ${seenIds.size} tekil ürün | Promosyonlu: ${candidates.length}`)
    if (!candidates.length) return []

    // En yüksek indirim oranına göre sırala, ilk 150 al
    candidates.sort((a, b) => (a.discountedPrice / a.originalPrice) - (b.discountedPrice / b.originalPrice))
    const top = candidates.slice(0, 150)

    // Promosyon tipi dağılımı
    const byLabel = {}
    for (const c of top) byLabel[c.promoLabel || 'fiyat indirimi'] = (byLabel[c.promoLabel || 'fiyat indirimi'] || 0) + 1
    console.log('  [AH] Promosyon dağılımı:', JSON.stringify(byLabel))
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
    }))
  } catch (e) {
    console.error('  ❌ Albert Heijn:', e.message)
    return []
  }
}

// ─── ALDI — Next.js data API ──────────────────────────────────────────────────
async function scrapeAldi() {
  console.log('🏪 [Aldi] aldi.nl Next.js data API...')
  try {
    // buildId her deploy'da değişir, önce HTML'den al
    const htmlRes = await fetch('https://www.aldi.nl/aanbiedingen.html', { headers: HEADERS })
    const html = await htmlRes.text()
    const buildIdMatch = html.match(/"buildId":"([^"]+)"/)
    if (!buildIdMatch) throw new Error('buildId bulunamadı')
    const buildId = buildIdMatch[1]

    const dataRes = await fetch(
      `https://www.aldi.nl/_next/data/${buildId}/aanbiedingen.json`,
      { headers: HEADERS }
    )
    const raw = await dataRes.text()
    const results = []
    const seen = new Set()

    // Ürün bloklarını regex ile çıkar (escaped JSON içinde)
    const productPattern = /"url":"(https:\/\/s7g10\.scene7\.com\/[^"]+)"[^}]*"name":"([^"]+)","currentPrice":\{"priceValue":([0-9.]+)/g
    let match
    while ((match = productPattern.exec(raw)) !== null) {
      const [, imgUrl, name, priceStr] = match
      if (!name || seen.has(name)) continue
      seen.add(name)
      const discountedPrice = parseFloat(priceStr)
      if (!discountedPrice || discountedPrice > 500) continue
      results.push({
        name,
        market: 'Aldi',
        originalPrice: parseFloat((discountedPrice * 1.35).toFixed(2)),
        discountedPrice,
        imageUrl: imgUrl || null,
        isCampaign: true,
        source: 'aldi.nl/aanbiedingen',
        expiresAt: EXPIRES_AT,
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
            originalPrice: parseFloat((discountedPrice * 1.35).toFixed(2)),
            discountedPrice,
            imageUrl: typeof img === 'string' ? img : img?.url || null,
            isCampaign: true,
            source: 'vomar.nl/aanbiedingen',
            expiresAt: EXPIRES_AT,
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
          originalPrice: parseFloat((discountedPrice * 1.35).toFixed(2)),
          discountedPrice,
          imageUrl: imgSrc && !imgSrc.includes('logo') ? imgSrc : null,
          isCampaign: true,
          source: 'vomar.nl/aanbiedingen',
          expiresAt: EXPIRES_AT,
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

  console.log(`\n✅ Toplam ${all.length} ürün (${dirk.length} Dirk, ${jumbo.length} Jumbo, ${hoogvliet.length} Hoogvliet, ${plus.length} Plus, ${lidl.length} Lidl, ${ah.length} AH, ${aldi.length} Aldi, ${vomar.length} Vomar)`)
  return all
}
