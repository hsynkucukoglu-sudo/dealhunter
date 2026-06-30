/**
 * Kruidvat scraper → Railway bulk-replace
 * Strategy: playwright-extra + stealth → Akamai bypass
 *   1. Load /aanbiedingen (browser obtains Akamai session)
 *   2. Read spartacus-app-state → promo-tab-dezeweek tiles
 *   3. For each /p/ tile (product code), fetch /products/{code}?fields=FULL
 *      from inside the browser context (Akamai cookies apply)
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

function decodeEntities(s) {
  return s
    .replace(/&quot;/g, '"').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))
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

    // Ana sayfa → Akamai bot cookie (.kruidvat.nl)
    console.log('Ana sayfa ile session kuruluyor...')
    await page.goto('https://www.kruidvat.nl/', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(3000)
    try {
      await page.click('#onetrust-accept-btn-handler', { timeout: 5000 })
      await page.waitForTimeout(1000)
    } catch {}

    // Aanbiedingen sayfası
    console.log('Aanbiedingen yukleniyor...')
    await page.goto('https://www.kruidvat.nl/aanbiedingen', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(2000)

    // spartacus-app-state oku
    const stateText = await page.evaluate(() => {
      const el = document.getElementById('spartacus-app-state')
      return el ? el.textContent : ''
    })
    if (!stateText) throw new Error('spartacus-app-state bulunamadi')

    const state = JSON.parse(decodeEntities(stateText))
    const promoTab = state['promo-tab-dezeweek']
    if (!promoTab) throw new Error('promo-tab-dezeweek bulunamadi')

    const allTiles = []
    for (const tab of promoTab.tabs || []) {
      for (const cat of tab.categories || []) {
        allTiles.push(...(cat.promotionTiles || []))
      }
    }

    // /p/ tile → ürün kodu (tile.code), dedup
    const seenCodes = new Set()
    const productTiles = allTiles.filter(t => {
      if (!t.available) return false
      const link = t.localizedURLLink || ''
      const code = t.code || (link.match(/\/p\/(\d+)/)?.[1])
      if (!link.includes('/p/') && !/^\d+$/.test(t.code || '')) {
        // /a/ kampanya sayfaları fiyatsız — atla
        if (!link.includes('/p/')) return false
      }
      if (!code || seenCodes.has(code)) return false
      seenCodes.add(code)
      t.__code = code
      return true
    })
    console.log(allTiles.length + ' tile -> ' + productTiles.length + ' urun tile')

    if (productTiles.length === 0) throw new Error('Urun tile bulunamadi')

    // Ürün detaylarını browser içinden fetch et (Akamai cookie uygulanır)
    const codeList = productTiles.map(t => ({ code: t.__code, title: t.title, link: t.localizedURLLink, img: t.image?.url }))
    console.log('Urun detaylari cekiliyor (' + codeList.length + ' adet)...')

    const products = await page.evaluate(async (tiles) => {
      const OCC = 'https://api.kruidvat.nl/api/v2/kvn-spa'
      const out = []
      const CONC = 8
      for (let i = 0; i < tiles.length; i += CONC) {
        const batch = tiles.slice(i, i + CONC)
        const res = await Promise.all(batch.map(async (t) => {
          try {
            const r = await fetch(OCC + '/products/' + t.code + '?lang=nl&curr=EUR&fields=FULL', {
              headers: { 'Accept': 'application/json' }, credentials: 'include',
            })
            if (!r.ok) return null
            const p = await r.json()
            const dp = p.price?.value
            if (!dp || dp <= 0) return null
            const op = p.price?.oldValue ?? dp
            const rawImg = p.listImage?.url || p.thumbnailImage?.url || t.img || null
            return {
              name: p.name || t.title,
              discountedPrice: dp,
              originalPrice: op > dp ? op : dp,
              imageUrl: rawImg ? (rawImg.startsWith('http') ? rawImg : 'https://media.kruidvat.nl' + rawImg) : null,
              url: t.link ? 'https://www.kruidvat.nl' + t.link : null,
              expiresAt: p.topPromotion?.endDate ? new Date(p.topPromotion.endDate).toISOString().split('T')[0] : null,
              promoText: [p.topPromotion?.description || '', t.title || '', t.link || ''].join(' '),
            }
          } catch { return null }
        }))
        out.push(...res.filter(Boolean))
      }
      return out
    }, codeList)

    await browser.close()
    browser = null

    const mapped = products.map(p => ({
      name: p.name,
      discountedPrice: p.discountedPrice,
      originalPrice: p.originalPrice,
      imageUrl: p.imageUrl,
      url: p.url,
      expiresAt: p.expiresAt,
      campaignType: toCampaignType(p.promoText),
      isCampaign: true,
    }))

    // Name dedup
    const seenNames = new Set()
    const unique = mapped.filter(p => {
      const key = p.name?.toLowerCase().trim()
      if (!key || seenNames.has(key)) return false
      seenNames.add(key)
      return true
    })
    console.log(mapped.length + ' urun -> ' + unique.length + ' uniek na dedup')

    if (unique.length === 0) throw new Error('Islenebilir urun bulunamadi!')

    console.log("Railway'e gonderiliyor...")
    const postRes = await fetch(BACKEND_URL + '/api/products/bulk-replace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + ADMIN_TOKEN },
      body: JSON.stringify({ market: 'Kruidvat', products: unique }),
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
