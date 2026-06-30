/**
 * Kruidvat scraper → Railway bulk-replace
 * Strategy: playwright-extra + stealth plugin → Akamai bypass
 * Loads homepage to obtain Akamai session cookies, then calls the OCC
 * search API from inside the browser context (credentials included)
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

    // Önce ana sayfa — Akamai bot cookie/session (.kruidvat.nl) kur
    console.log('Ana sayfa ile session kuruluyor...')
    await page.goto('https://www.kruidvat.nl/', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(4000)

    // Cookie banner
    try {
      await page.click('#onetrust-accept-btn-handler', { timeout: 5000 })
      await page.waitForTimeout(1000)
    } catch {}

    // OCC search API'sini tarayıcı içinden çağır — Akamai session cookie'leri uygulanır
    console.log('OCC search API sorgulaniyor (browser context)...')
    const rawProducts = await page.evaluate(async () => {
      const OCC = 'https://api.kruidvat.nl/api/v2/kvn-spa'
      const all = []
      let pageNo = 0
      const pageSize = 100
      while (pageNo < 30) {
        const url = OCC + '/products/search?query=%3Arelevance%3AisPromoted%3Atrue&lang=nl&curr=EUR&currentPage='
          + pageNo + '&pageSize=' + pageSize
          + '&fields=products(code,name,price(value,oldValue),listImage(url),thumbnailImage(url),topPromotion(description,endDate),url),pagination'
        const res = await fetch(url, {
          headers: { 'Accept': 'application/json', 'Accept-Language': 'nl-NL,nl;q=0.9' },
          credentials: 'include',
        })
        if (!res.ok) {
          if (pageNo === 0) throw new Error('OCC HTTP ' + res.status)
          break
        }
        const data = await res.json()
        const items = data.products || []
        all.push(...items)
        const total = data.pagination?.totalPages ?? 1
        if (pageNo + 1 >= total || items.length === 0) break
        pageNo++
      }
      return all
    })

    await browser.close()
    browser = null
    console.log('Toplam alinan: ' + rawProducts.length + ' urun')

    if (rawProducts.length === 0) {
      throw new Error('Hic urun alinamadi')
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
