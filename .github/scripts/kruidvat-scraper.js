/**
 * Kruidvat scraper → Railway bulk-replace
 * Strategy: playwright-extra + stealth plugin → Akamai bypass
 * Intercepts OCC API responses from the real browser session
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

    const rawProducts = []

    page.on('response', async (response) => {
      const url = response.url()
      if (url.includes('api.kruidvat.nl') && url.includes('/products/search')) {
        try {
          const data = await response.json()
          const items = data.products ?? []
          if (items.length > 0) {
            rawProducts.push(...items)
            process.stdout.write('\r  Intercepted: ' + rawProducts.length + ' producten')
          }
        } catch {}
      }
    })

    console.log('Kruidvat aanbiedingen yukleniyor...')
    await page.goto('https://www.kruidvat.nl/aanbiedingen/dezeweek', {
      waitUntil: 'networkidle',
      timeout: 90000,
    })

    // Cookie banner
    try {
      await page.click('#onetrust-accept-btn-handler', { timeout: 4000 })
      await page.waitForTimeout(1000)
    } catch {}

    // Scroll to trigger lazy-load
    console.log('\nSayfayi kaydir...')
    let lastCount = 0
    for (let i = 0; i < 12; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(2000)
      if (rawProducts.length === lastCount && i > 3) break
      lastCount = rawProducts.length
    }

    await browser.close()
    browser = null
    console.log('\nToplam intercepted: ' + rawProducts.length + ' urun')

    if (rawProducts.length === 0) {
      throw new Error('Hic urun intercept edilmedi')
    }

    const seenCodes = new Set()
    const products = rawProducts
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
        const imageUrl = rawImg
          ? (rawImg.startsWith('http') ? rawImg : 'https://media.kruidvat.nl' + rawImg)
          : null
        const endDate = p.topPromotion?.endDate || null
        const promoText = p.topPromotion?.description || p.name || ''
        return {
          name: p.name,
          discountedPrice,
          originalPrice: originalPrice > discountedPrice ? originalPrice : discountedPrice,
          imageUrl,
          url: p.url ? 'https://www.kruidvat.nl' + p.url : null,
          expiresAt: endDate ? new Date(endDate).toISOString().split('T')[0] : null,
          campaignType: toCampaignType(promoText),
          isCampaign: true,
        }
      })
      .filter(Boolean)

    const seenNames = new Set()
    const unique = products.filter(p => {
      const key = p.name?.toLowerCase().trim()
      if (!key || seenNames.has(key)) return false
      seenNames.add(key)
      return true
    })
    console.log(products.length + ' urun -> ' + unique.length + ' uniek na dedup')

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
