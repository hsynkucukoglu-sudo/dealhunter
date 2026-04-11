import puppeteerExtra from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteerExtra.use(StealthPlugin())

const EXPIRES_AT = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function wait(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// Her market için ayrı browser — bellek birikimi önlenir
async function launchBrowser() {
  let executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
  if (!executablePath) {
    const fs = await import('fs')
    for (const p of ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome']) {
      try { fs.accessSync(p); executablePath = p; break } catch {}
    }
  }

  const opts = {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-sync',
      '--mute-audio',
      '--js-flags=--max-old-space-size=192',
    ],
  }
  if (executablePath) opts.executablePath = executablePath
  return puppeteerExtra.launch(opts)
}

async function newPage(browser) {
  const page = await browser.newPage()
  await page.setViewport({ width: 800, height: 600 })
  await page.setUserAgent(UA)
  // Görsel, font, medya engelle (CSS bırak — bazı siteler CSS ile render ediyor)
  await page.setRequestInterception(true)
  page.on('request', req => {
    const t = req.resourceType()
    if (t === 'image' || t === 'font' || t === 'media') req.abort()
    else req.continue()
  })
  return page
}

async function acceptCookies(page) {
  const selectors = [
    '#onetrust-accept-btn-handler',
    '#didomi-notice-agree-button',
    'button[id*="accept"][id*="cookie"]',
    'button[title="Accepteren"]',
    'button[title="Akkoord"]',
    '[data-testid="consent-accept"]',
  ]
  for (const sel of selectors) {
    const btn = await page.$(sel).catch(() => null)
    if (btn) { await btn.click().catch(() => {}); return }
  }
}

// ─── ALBERT HEIJN ─────────────────────────────────────────────────────────────
async function scrapeAH() {
  console.log('🏪 [Albert Heijn] ah.nl/bonus taranıyor...')
  const browser = await launchBrowser()
  const results = []
  try {
    const page = await newPage(browser)
    await page.goto('https://www.ah.nl/bonus', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    await wait(2000)
    await acceptCookies(page)
    await wait(1500)
    for (let i = 1; i <= 4; i++) { await page.evaluate(i => window.scrollTo(0, i * 1200), i); await wait(600) }

    const products = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('a.promotion-card_root__EwNRT'))
      return cards.map(card => {
        const img = card.querySelector('img[src*="/dam/product/"]')
        const lines = card.innerText.split('\n').map(s => s.trim()).filter(Boolean)
        const rawText = card.innerText.replace(/\n/g, '|')
        const priceMatches = rawText.match(/(\d+[,.]\d+)/g)
        return { name: lines[0] || '', imgSrc: img?.src || '', priceMatches, rawText }
      }).filter(p => p.name && p.name.length > 1)
    })

    for (const p of products.slice(0, 20)) {
      const prices = (p.priceMatches || []).map(s => parseFloat(s.replace(',', '.'))).filter(n => n > 0 && n < 500)
      if (!prices.length) continue
      const discountedPrice = Math.min(...prices)
      const originalPrice = prices.length > 1 ? Math.max(...prices) : parseFloat((discountedPrice * 1.35).toFixed(2))
      const imageUrl = p.imgSrc.includes('/dam/product/') ? p.imgSrc.replace(/rendition=\d+x\d+/, 'rendition=300x300') : null
      results.push({ name: p.name, market: 'Albert Heijn', originalPrice, discountedPrice, imageUrl, isCampaign: true, source: 'ah.nl/bonus', expiresAt: EXPIRES_AT })
    }
    await page.close()
    console.log(`  ✅ Albert Heijn: ${results.length} ürün`)
  } catch (e) { console.error('  ❌ AH hatası:', e.message) }
  finally { await browser.close().catch(() => {}) }
  return results
}

// ─── JUMBO ────────────────────────────────────────────────────────────────────
async function scrapeJumbo() {
  console.log('🏪 [Jumbo] jumbo.com/aanbiedingen taranıyor...')
  const browser = await launchBrowser()
  const results = []
  try {
    const page = await newPage(browser)
    await page.goto('https://www.jumbo.com/aanbiedingen/nu', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    await wait(2000)
    await acceptCookies(page)
    await wait(2000)
    for (let i = 1; i <= 4; i++) { await page.evaluate(i => window.scrollTo(0, i * 1000), i); await wait(500) }
    await wait(1500)

    const products = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('li.jum-card.card-promotion'))
      return cards.slice(0, 25).map(card => {
        const img = card.querySelector('img')
        const priceMatch = card.innerText.match(/voor\s+(\d+[,.]\d+)/i)
        const lines = card.innerText.split('\n').map(s => s.trim()).filter(Boolean)
        const name = lines.find(l => l.length > 3 && !/^(voor|wo|ma|di|do|vr|za|zo|t\/m|\d)/.test(l.toLowerCase())) || ''
        return { name, price: priceMatch ? priceMatch[1] : '', img: img?.src || '', text: card.innerText.replace(/\n/g, '|').substring(0, 200) }
      }).filter(p => p.name)
    })

    for (const p of products) {
      const priceMatches = ((p.price || '') + '|' + (p.text || '')).match(/(\d+[,.]\d+)/g)
      if (!priceMatches) continue
      const prices = priceMatches.map(s => parseFloat(s.replace(',', '.'))).filter(n => n > 0 && n < 500)
      if (!prices.length) continue
      const discountedPrice = Math.min(...prices)
      const originalPrice = prices.length > 1 ? Math.max(...prices) : parseFloat((discountedPrice * 1.35).toFixed(2))
      results.push({ name: p.name, market: 'Jumbo', originalPrice, discountedPrice, imageUrl: p.img?.includes('logo') ? null : p.img || null, isCampaign: true, source: 'jumbo.com/aanbiedingen', expiresAt: EXPIRES_AT })
    }
    await page.close()
    console.log(`  ✅ Jumbo: ${results.length} ürün`)
  } catch (e) { console.error('  ❌ Jumbo hatası:', e.message) }
  finally { await browser.close().catch(() => {}) }
  return results
}

// ─── DIRK ─────────────────────────────────────────────────────────────────────
async function scrapeDirk() {
  console.log('🏪 [Dirk] dirk.nl/aanbiedingen taranıyor...')
  const browser = await launchBrowser()
  const results = []
  try {
    const page = await newPage(browser)
    await page.goto('https://www.dirk.nl/aanbiedingen', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    await wait(2000)
    await acceptCookies(page)
    await wait(1500)

    const products = await page.evaluate(() => {
      const articles = Array.from(document.querySelectorAll('article'))
      return articles.slice(0, 30).map(a => {
        const img = a.querySelector('img')
        const vanMatch = a.innerText.match(/van\s+(\d+[,.]\d+)/i)
        const priceNumbers = a.innerText.match(/\b\d+[,.]\d{2}\b/g) || []
        const nameLines = a.innerText.split('\n').map(s => s.trim()).filter(s =>
          s.length > 3 &&
          !/^(ACTIE|van|per|gram|liter|ml|kg|blik|pak|stuk)$/i.test(s) &&
          !/^van\s+\d/i.test(s) &&
          !/^\d+$/.test(s) &&
          !/^\d+[,.]\d+$/.test(s)
        )
        return { name: nameLines[0] || '', imgSrc: img?.src || '', vanPrice: vanMatch ? parseFloat(vanMatch[1].replace(',', '.')) : 0, priceNumbers, rawText: a.innerText.replace(/\n/g, '|').substring(0, 200) }
      }).filter(p => p.name && p.name.length > 3)
    })

    for (const p of products) {
      const prices = (p.priceNumbers || []).map(s => parseFloat(s.replace(',', '.'))).filter(n => n > 0 && n < 500)
      const discountedPrice = prices.length ? Math.min(...prices) : 0
      if (!discountedPrice) continue
      const originalPrice = p.vanPrice > discountedPrice ? p.vanPrice : (prices.length > 1 ? Math.max(...prices) : parseFloat((discountedPrice * 1.35).toFixed(2)))
      results.push({ name: p.name, market: 'Dirk', originalPrice, discountedPrice, imageUrl: p.imgSrc && !p.imgSrc.includes('logo') ? p.imgSrc : null, isCampaign: true, source: 'dirk.nl/aanbiedingen', expiresAt: EXPIRES_AT })
    }
    await page.close()
    console.log(`  ✅ Dirk: ${results.length} ürün`)
  } catch (e) { console.error('  ❌ Dirk hatası:', e.message) }
  finally { await browser.close().catch(() => {}) }
  return results
}

// ─── PLUS ─────────────────────────────────────────────────────────────────────
async function scrapePlus() {
  console.log('🏪 [Plus] plus.nl/aanbiedingen taranıyor...')
  const browser = await launchBrowser()
  const results = []
  try {
    const page = await newPage(browser)
    await page.goto('https://www.plus.nl/aanbiedingen', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    await wait(2000)
    await acceptCookies(page)
    await wait(2000)
    for (let i = 1; i <= 4; i++) { await page.evaluate(i => window.scrollTo(0, i * 1200), i); await wait(500) }
    await wait(1000)

    const products = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.plp-item-wrapper'))
      return items.slice(0, 40).map(item => {
        const img = item.querySelector('img')
        const text = item.innerText?.replace(/\n/g, '|').substring(0, 300)
        return { img: img?.src || '', text }
      }).filter(p => p.text && p.text.length > 10)
    })

    for (const p of products) {
      const text = p.text || ''
      const reconstructed = text.replace(/(\d+)\.\|(\d+)/g, '$1.$2')
      const priceMatches = reconstructed.match(/\b\d+\.\d+\b/g)
      if (!priceMatches) continue
      const prices = priceMatches.map(s => parseFloat(s)).filter(n => n > 0 && n < 500)
      if (!prices.length) continue
      const discountedPrice = Math.min(...prices)
      const originalPrice = prices.length > 1 ? Math.max(...prices) : parseFloat((discountedPrice * 1.35).toFixed(2))
      const parts = text.split('|').map(s => s.trim()).filter(Boolean)
      let name = ''
      const bijvPart = parts.find(s => /^bijv\.?\s+/i.test(s))
      if (bijvPart) { name = bijvPart.replace(/^bijv\.?\s+/i, '').trim() }
      else {
        const allePart = parts.find(s => /^alle\s+/i.test(s))
        if (allePart) { name = allePart.replace(/^alle\s+/i, '').trim() }
        else { name = parts.find(s => s.length > 4 && !/^(\d+\+\d+|\d+\s*%|\d+\s+voor|gratis|extra|korting|nieuw|per\s|t\/m)/i.test(s) && !/^\d/.test(s)) || '' }
      }
      if (!name || name.length < 4) continue
      results.push({ name, market: 'Plus', originalPrice, discountedPrice, imageUrl: p.img && !p.img.includes('logo') && !p.img.includes('svg') ? p.img : null, isCampaign: true, source: 'plus.nl/aanbiedingen', expiresAt: EXPIRES_AT })
    }
    await page.close()
    console.log(`  ✅ Plus: ${results.length} ürün`)
  } catch (e) { console.error('  ❌ Plus hatası:', e.message) }
  finally { await browser.close().catch(() => {}) }
  return results
}

// ─── LIDL ─────────────────────────────────────────────────────────────────────
async function scrapeLidl() {
  console.log('🏪 [Lidl] lidl.nl/aanbiedingen taranıyor...')
  const browser = await launchBrowser()
  const results = []
  try {
    const page = await newPage(browser)
    await page.goto('https://www.lidl.nl/aanbiedingen', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    await wait(2000)
    await acceptCookies(page)
    await wait(3000)
    for (let i = 1; i <= 5; i++) { await page.evaluate(i => window.scrollTo(0, i * 1200), i); await wait(500) }

    const products = await page.evaluate(() => {
      const boxes = Array.from(document.querySelectorAll('.product-grid-box'))
      return boxes.slice(0, 30).map(box => {
        const name = box.querySelector('a.odsc-tile__link')?.textContent.trim() || ''
        const img = box.querySelector('img')?.src || null
        const priceEl = box.querySelector('.ods-price__value')
        const newPrice = priceEl?.textContent.trim() || ''
        const allText = box.textContent
        const oldPriceMatch = allText.match(/(\d+[.,]\d+)\s*[-–]\s*\d+%/)
        return { name, img, newPrice, oldPrice: oldPriceMatch ? oldPriceMatch[1] : '' }
      }).filter(p => p.name && p.newPrice)
    })

    for (const p of products) {
      const discountedPrice = parseFloat((p.newPrice || '').replace(',', '.')) || 0
      if (!discountedPrice) continue
      const oldPriceNum = parseFloat((p.oldPrice || '').replace(',', '.')) || 0
      const originalPrice = oldPriceNum > discountedPrice ? oldPriceNum : parseFloat((discountedPrice * 1.35).toFixed(2))
      results.push({ name: p.name, market: 'Lidl', originalPrice, discountedPrice, imageUrl: p.img && !p.img.includes('logo') ? p.img : null, isCampaign: true, source: 'lidl.nl/aanbiedingen', expiresAt: EXPIRES_AT })
    }
    await page.close()
    console.log(`  ✅ Lidl: ${results.length} ürün`)
  } catch (e) { console.error('  ❌ Lidl hatası:', e.message) }
  finally { await browser.close().catch(() => {}) }
  return results
}

// ─── HOOGVLIET — fetch ile (Puppeteer yok!) ───────────────────────────────────
async function scrapeHoogvliet() {
  console.log('🏪 [Hoogvliet] hoogvliet.com fetch ile taranıyor...')
  const results = []
  try {
    const res = await fetch('https://www.hoogvliet.com/aanbiedingen', {
      headers: { 'User-Agent': UA, 'Accept-Language': 'nl-NL,nl;q=0.9', 'Accept': 'text/html' }
    })
    const html = await res.text()

    // Hoogvliet JSON data layer: {"id":"...","name":"...","price":"5.99",...}
    const jsonBlocks = html.match(/\{[^{}]*"price"\s*:\s*"[\d.]+[^{}]*\}/g) || []
    const seen = new Set()
    for (const block of jsonBlocks) {
      try {
        // Fix malformed JSON (missing quotes around keys)
        const fixed = block.replace(/"(\w+)"\s*:/g, '"$1":').replace(/:\s*"([^"]*)"([^,}])/g, ':"$1"$2')
        const obj = JSON.parse(fixed.replace(/&#47;/g, '/').replace(/&amp;/g, '&'))
        if (!obj.name || !obj.price || seen.has(obj.id)) continue
        seen.add(obj.id)
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
  } catch (e) { console.error('  ❌ Hoogvliet hatası:', e.message) }
  return results
}

// ─── ANA FONKSİYON ────────────────────────────────────────────────────────────
export async function scrapeFlyerProducts() {
  console.log('🔍 Süpermarket scraper başlatılıyor...')
  let allResults = []

  try {
    // Her market kendi browser'ını açıp kapatır → bellek birikmez
    allResults.push(...await scrapeAH())
    allResults.push(...await scrapeJumbo())
    allResults.push(...await scrapeDirk())
    allResults.push(...await scrapePlus())
    allResults.push(...await scrapeLidl())
    allResults.push(...await scrapeHoogvliet())

    // Duplicate temizliği
    const seen = new Set()
    allResults = allResults.filter(p => {
      const key = p.name.toLowerCase().trim()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    console.log(`\n✅ Toplam ${allResults.length} ürün çekildi.`)
  } catch (e) {
    console.error('❌ Genel scraper hatası:', e.message)
  }

  return allResults
}
