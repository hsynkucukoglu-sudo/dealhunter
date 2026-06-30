/**
 * Kruidvat scraper → Railway bulk-replace
 * Strategy: playwright-extra + stealth → Akamai bypass
 *   1. Load /aanbiedingen in real browser (Akamai session cookies)
 *   2. Parse spartacus-app-state → promo-tab-dezeweek → product codes
 *   3. In-browser fetch /products/{code}?fields=FULL (cookies apply)
 *   4. POST to Railway bulk-replace
 */

const { chromium } = require('playwright-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
chromium.use(StealthPlugin())

const BACKEND_URL = process.env.BACKEND_URL || 'https://dealhunter-production-d900.up.railway.app'
const ADMIN_TOKEN = process.env.ADMIN_TOKEN
if (!ADMIN_TOKEN) { console.error('ADMIN_TOKEN eksik'); process.exit(1) }

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

function findInState(obj, key, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 8) return null
  if (key in obj) return obj[key]
  for (const k of Object.keys(obj)) {
    const found = findInState(obj[k], key, depth + 1)
    if (found) return found
  }
  return null
}

;(async () => {
  let browser
  try {
    console.log('Playwright + stealth baslatiliyor...')
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      locale: 'nl-NL',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
    })
    const page = await context.newPage()

    // /aanbiedingen ana document HTML'ini yakala (JS hydrate edip state script'ini
    // silmeden önce ham SSR çıktısını al)
    let aanbiedingenHtml = null
    page.on('response', async (response) => {
      const url = response.url()
      const ct = response.headers()['content-type'] || ''
      if (!aanbiedingenHtml && url.includes('/aanbiedingen') && ct.includes('text/html')) {
        try { aanbiedingenHtml = await response.text() } catch {}
      }
    })

    // Ana sayfa — Akamai bot session (.kruidvat.nl cookies)
    console.log('Ana sayfa ile session kuruluyor...')
    await page.goto('https://www.kruidvat.nl/', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(4000)
    try {
      await page.click('#onetrust-accept-btn-handler', { timeout: 5000 })
      await page.waitForTimeout(1000)
    } catch {}

    // Aanbiedingen sayfası → spartacus-app-state
    console.log('Aanbiedingen yukleniyor...')
    await page.goto('https://www.kruidvat.nl/aanbiedingen', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(3000)

    // State'i önce yakalanan ham HTML'den, olmazsa DOM'dan al
    let stateJson = null
    if (aanbiedingenHtml) {
      const m = aanbiedingenHtml.match(/<script id="spartacus-app-state"[^>]*>([\s\S]*?)<\/script>/)
      if (m) stateJson = m[1]
    }
    if (!stateJson) {
      stateJson = await page.evaluate(() => {
        const el = document.getElementById('spartacus-app-state')
        return el ? el.textContent : null
      })
    }
    if (!stateJson) throw new Error('spartacus-app-state bulunamadi (html=' + (aanbiedingenHtml ? aanbiedingenHtml.length : 'null') + ')')

    const decoded = stateJson
      .replace(/&quot;/g, '"').replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))
    const state = JSON.parse(decoded)

    const promoTab = state['promo-tab-dezeweek'] || findInState(state, 'promo-tab-dezeweek')
    if (!promoTab) throw new Error('promo-tab-dezeweek bulunamadi')

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
    console.log(allTiles.length + ' tile -> ' + productTiles.length + ' unieke urun tile')

    if (productTiles.length === 0) throw new Error('Hic urun tile bulunamadi')

    // Tile listesini tarayıcıya geçir, /products/{code} fetch'lerini orada yap
    const tilePayload = productTiles.map(t => ({
      code: t.localizedURLLink.match(/\/p\/(\d+)/)[1],
      link: t.localizedURLLink,
      title: t.title || '',
      img: t.image?.url || null,
    }))

    console.log('Urun detaylari cekiliyor (browser context)...')
    const { products, firstErr } = await page.evaluate(async (tiles) => {
      const OCC = 'https://api.kruidvat.nl/api/v2/kvn-spa'
      const out = []
      let firstErr = null
      const CONC = 8
      for (let i = 0; i < tiles.length; i += CONC) {
        const batch = tiles.slice(i, i + CONC)
        const res = await Promise.all(batch.map(async (t) => {
          try {
            const r = await fetch(OCC + '/products/' + t.code + '?lang=nl&curr=EUR&fields=FULL', {
              headers: { 'Accept': 'application/json', 'Accept-Language': 'nl-NL,nl;q=0.9' },
              credentials: 'include',
            })
            if (!r.ok) { if (!firstErr) firstErr = 'HTTP ' + r.status + ' code=' + t.code; return null }
            const p = await r.json()
            const dp = p.price?.value
            if (!dp || dp <= 0) return null
            const op = p.price?.oldValue ?? dp
            const rawImg = p.listImage?.url || p.thumbnailImage?.url || t.img || null
            const imageUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : 'https://media.kruidvat.nl' + rawImg) : null
            return {
              name: p.name || t.title,
              discountedPrice: dp,
              originalPrice: op > dp ? op : dp,
              imageUrl,
              url: 'https://www.kruidvat.nl' + t.link,
              expiresAt: p.topPromotion?.endDate ? new Date(p.topPromotion.endDate).toISOString().split('T')[0] : null,
              promoText: [p.topPromotion?.description || '', t.title, t.link].join(' '),
            }
          } catch (e) { if (!firstErr) firstErr = 'ERR ' + e.message; return null }
        }))
        out.push(...res.filter(Boolean))
      }
      return { products: out, firstErr }
    }, tilePayload)

    await browser.close()
    browser = null

    const finalProducts = products.map(p => ({
      name: p.name,
      discountedPrice: p.discountedPrice,
      originalPrice: p.originalPrice,
      imageUrl: p.imageUrl,
      url: p.url,
      expiresAt: p.expiresAt,
      campaignType: toCampaignType(p.promoText),
      isCampaign: true,
    }))

    console.log(finalProducts.length + ' urun toplandi (ilk hata: ' + (firstErr || 'yok') + ')')
    if (finalProducts.length === 0) throw new Error('Islenebilir urun yok — ilk hata: ' + firstErr)

    console.log("Railway'e gonderiliyor...")
    const postRes = await fetch(BACKEND_URL + '/api/products/bulk-replace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + ADMIN_TOKEN },
      body: JSON.stringify({ market: 'Kruidvat', products: finalProducts }),
    })
    const json = await postRes.json()
    if (!postRes.ok) throw new Error('Backend: ' + JSON.stringify(json))
    console.log(json.count + ' urun eklendi!')
  } catch (e) {
    if (browser) await browser.close().catch(() => {})
    console.error('HATA:', e.message)
    process.exit(1)
  }
})()
