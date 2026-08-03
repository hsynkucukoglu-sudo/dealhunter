/**
 * Dirk.nl scraper — GitHub Actions'ta çalışır (Cloudflare'ı bypass eder)
 * Sonuçları Railway backend'e POST eder.
 */

const BACKEND_URL = process.env.BACKEND_URL || 'https://dealhunter-production-d900.up.railway.app'
const ADMIN_TOKEN = process.env.ADMIN_TOKEN

if (!ADMIN_TOKEN) {
  console.error('❌ ADMIN_TOKEN eksik')
  process.exit(1)
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'nl-NL,nl;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
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

function resolveNuxt(raw, idx, depth = 0, cache = new Map()) {
  if (depth > 20) return raw[idx]
  if (cache.has(idx)) return cache.get(idx)
  const val = raw[idx]
  if (val === null || val === undefined || typeof val !== 'object') { cache.set(idx, val); return val }
  if (Array.isArray(val)) {
    if (val.length === 2 && typeof val[0] === 'string' && typeof val[1] === 'number') return resolveNuxt(raw, val[1], depth + 1, cache)
    const result = val.map(i => typeof i === 'number' ? resolveNuxt(raw, i, depth + 1, cache) : i)
    cache.set(idx, result); return result
  }
  const result = {}
  for (const [k, v] of Object.entries(val)) result[k] = typeof v === 'number' ? resolveNuxt(raw, v, depth + 1, cache) : v
  cache.set(idx, result); return result
}

function getExpiry() {
  const now = new Date()
  const sunday = new Date(now)
  const daysUntilSunday = now.getDay() === 0 ? 7 : (7 - now.getDay()) % 7
  sunday.setDate(now.getDate() + daysUntilSunday)
  return sunday.toISOString().split('T')[0]
}

// ─── Eenheidsdata ────────────────────────────────────────────────────────────
// Overgenomen uit backend/scraper/index.js (parseUnitLabel + extractSizeFromPromoText).
// Dirk zet de maat in offer.packaging ("Zak 450 gram.", "Pak 3 stuks."), maar die
// werd hier alleen aan de naam geplakt. Sinds bulk-replace de eenheidsvelden
// doorgeeft (2026-08-02) kunnen ze mee. Gemeten op de live folder 2026-08-03:
// 46 van 99 aanbiedingen (46%) leveren een eenduidige maat op.
//
// Standalone kopie: dit script draait in Actions en kan de ESM-module van de
// backend niet importeren.
function parseUnitLabel(label, discountedPrice) {
  const desc = (label || '').trim()
  if (!desc) return {}

  // Multipack: "24 x 30 cl" -> 7200 ml. fullSizeLabel houdt het origineel.
  const multi = desc.match(/^(\d+)\s*[x×]\s*([\d,.]+)\s*(g|gram|kg|kilo|ml|cl|dl|l|liter|stuks?|stuk)\b/i)
  if (multi) {
    const count = parseInt(multi[1], 10)
    const each = parseFloat(multi[2].replace(',', '.'))
    if (count > 0 && each > 0) {
      const total = parseUnitLabel(`${count * each} ${multi[3]}`, discountedPrice)
      return total.unitSize ? { ...total, fullSizeLabel: desc } : {}
    }
  }

  const m = desc.match(/^([\d,.]+)\s*(g|gram|kg|kilo|ml|cl|dl|l|liter|stuks?|stuk|tabs?|capsu?les?|rollen?|zakjes?)\b/i)
  if (!m) return {}
  const amount = parseFloat(m[1].replace(',', '.'))
  if (!(amount > 0)) return {}
  const raw = m[2].toLowerCase()
  let unitSize, unitType
  if (/^(g|gram)$/.test(raw)) { unitSize = amount; unitType = 'g' }
  else if (/^(kg|kilo)$/.test(raw)) { unitSize = amount * 1000; unitType = 'g' }
  else if (/^ml$/.test(raw)) { unitSize = amount; unitType = 'ml' }
  else if (/^cl$/.test(raw)) { unitSize = amount * 10; unitType = 'ml' }
  else if (/^dl$/.test(raw)) { unitSize = amount * 100; unitType = 'ml' }
  else if (/^(l|liter)$/.test(raw)) { unitSize = amount * 1000; unitType = 'ml' }
  else { unitSize = amount; unitType = 'stuks' }

  let unitPrice = null
  if (discountedPrice > 0 && unitSize > 0) {
    if (unitType === 'g') unitPrice = unitSize >= 500 ? discountedPrice / (unitSize / 1000) : discountedPrice / (unitSize / 100)
    else if (unitType === 'ml') unitPrice = unitSize >= 1000 ? discountedPrice / (unitSize / 1000) : discountedPrice / (unitSize / 100)
    else unitPrice = discountedPrice / unitSize
    unitPrice = parseFloat(unitPrice.toFixed(4))
  }
  return { unitSize, unitType, fullSizeLabel: m[0].trim(), unitPrice }
}

const PROMO_PACK_WORDS = 'pak|pakje|schaal|blik|kuip|kuipje|zak|zakje|fles|pot|potje|doos|doosje|bak|rol|krat|net|bos|beker|bus|flacon|gigapack|tray|emmer|stuk'

// Folderteksten noemen vaak meerdere maten in één aanbieding ("Bak 500 gram of
// 1 kilo", "Pot 330 - 370 gram"). Dan hoort er geen enkele maat bij de prijs en
// zou unitPrice fout zijn — die slaan we bewust over. Idem voor schattingen
// ("Per stuk ca. 4 kilo").
function extractSizeFromPromoText(text) {
  const t = (text || '').replace(/\n/g, ' ').trim()
  if (!t) return null
  if (/ca\.|ongeveer|vanaf/i.test(t)) return null

  const withoutPrices = t.replace(/€\s*\d+[.,]?\d*/g, ' ')
  const numbers = withoutPrices.match(/\d+[.,]?\d*/g) || []

  const mm = t.match(new RegExp(`\\b(?:${PROMO_PACK_WORDS})\\s+(\\d+)\\s*[x×]\\s*(\\d+[.,]?\\d*)\\s*(gram|kg|kilo|ml|cl|dl|liter|l|stuks?)\\b`, 'i'))
  if (mm && numbers.length === 2) return `${mm[1]} x ${mm[2]} ${mm[3]}`

  const m = t.match(new RegExp(`\\b(?:${PROMO_PACK_WORDS})\\s+(\\d+[.,]?\\d*)\\s*(gram|kg|kilo|ml|cl|dl|liter|l|stuks?)\\b`, 'i'))
  if (!m) return null
  if (numbers.length !== 1) return null
  return `${m[1]} ${m[2]}`
}

async function scrapeDirk() {
  console.log('🏪 Dirk.nl scraper başlıyor...')
  const EXPIRES_AT = getExpiry()

  const res = await fetch('https://www.dirk.nl/aanbiedingen', {
    headers: HEADERS,
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()

  const nd = html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (!nd) throw new Error('__NUXT_DATA__ bulunamadı')
  const raw = JSON.parse(nd[1])

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
      const unit = parseUnitLabel(extractSizeFromPromoText(offer.packaging), offerPrice)

      results.push({
        name,
        discountedPrice: offerPrice,
        originalPrice: normalPrice && normalPrice > offerPrice ? normalPrice : offerPrice,
        unitSize: unit.unitSize ?? null,
        unitType: unit.unitType ?? null,
        unitPrice: unit.unitPrice ?? null,
        fullSizeLabel: unit.fullSizeLabel ?? null,
        imageUrl,
        url: `https://www.dirk.nl/aanbiedingen`,
        expiresAt,
        category: null,
        campaignType: toCampaignType(offer.textPriceSign || '') || toCampaignType(name),
        isCampaign: true,
        source: 'dirk.nl/aanbiedingen',
      })
    }
  }

  console.log(`  ✅ ${results.length} ürün toplandı`)
  return results
}

async function postToBackend(products) {
  console.log(`\n📤 ${products.length} ürün Railway'e gönderiliyor...`)
  const res = await fetch(`${BACKEND_URL}/api/products/bulk-replace`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify({ market: 'Dirk', products }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`Backend hata: ${JSON.stringify(json)}`)
  console.log(`✅ Backend: ${json.count} ürün eklendi`)
}

;(async () => {
  try {
    const products = await scrapeDirk()
    if (products.length === 0) {
      console.error('❌ Hiç ürün bulunamadı')
      process.exit(1)
    }
    await postToBackend(products)
  } catch (e) {
    console.error('❌ Hata:', e.message)
    process.exit(1)
  }
})()
