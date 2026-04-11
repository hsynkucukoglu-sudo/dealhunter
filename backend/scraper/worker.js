/**
 * Puppeteer worker — her market için ayrı process olarak çalışır.
 * Ana process bu dosyayı spawn eder, JSON alır, process biter → bellek tamamen serbest kalır.
 * Kullanım: node worker.js <market>
 */
import puppeteer from 'puppeteer'

const market = process.argv[2]
const EXPIRES_AT = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function wait(ms) { return new Promise(r => setTimeout(r, ms)) }

async function launch() {
  let executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
  if (!executablePath) {
    const fs = await import('fs')
    for (const p of ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome']) {
      try { fs.accessSync(p); executablePath = p; break } catch {}
    }
  }
  const opts = {
    headless: 'new',
    args: [
      '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
      '--disable-gpu', '--no-first-run', '--disable-extensions',
      '--disable-background-networking', '--mute-audio',
    ],
  }
  if (executablePath) opts.executablePath = executablePath
  return puppeteer.launch(opts)
}

async function newPage(browser) {
  const page = await browser.newPage()
  await page.setViewport({ width: 800, height: 600 })
  await page.setUserAgent(UA)
  await page.setRequestInterception(true)
  page.on('request', req => {
    if (['image', 'font', 'media'].includes(req.resourceType())) req.abort()
    else req.continue()
  })
  return page
}

async function acceptCookies(page) {
  for (const sel of ['#onetrust-accept-btn-handler', '#didomi-notice-agree-button', 'button[title="Accepteren"]', '[data-testid="consent-accept"]']) {
    const btn = await page.$(sel).catch(() => null)
    if (btn) { await btn.click().catch(() => {}); return }
  }
}

// ─── ALBERT HEIJN ─────────────────────────────────────────────────────────────
async function scrapeAH() {
  const browser = await launch()
  const results = []
  try {
    const page = await newPage(browser)
    await page.goto('https://www.ah.nl/bonus', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    await wait(2000)
    await acceptCookies(page)
    await wait(1500)
    for (let i = 1; i <= 4; i++) { await page.evaluate(i => window.scrollTo(0, i * 1200), i); await wait(500) }

    const products = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a.promotion-card_root__EwNRT')).map(card => {
        const img = card.querySelector('img[src*="/dam/product/"]')
        const lines = card.innerText.split('\n').map(s => s.trim()).filter(Boolean)
        const priceMatches = card.innerText.replace(/\n/g, '|').match(/(\d+[,.]\d+)/g)
        return { name: lines[0] || '', imgSrc: img?.src || '', priceMatches }
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
  } catch (e) { process.stderr.write('AH error: ' + e.message + '\n') }
  finally { await browser.close().catch(() => {}) }
  return results
}

// ─── JUMBO ────────────────────────────────────────────────────────────────────
async function scrapeJumbo() {
  const browser = await launch()
  const results = []
  try {
    const page = await newPage(browser)
    await page.goto('https://www.jumbo.com/aanbiedingen/nu', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    await wait(2000)
    await acceptCookies(page)
    await wait(2000)
    for (let i = 1; i <= 4; i++) { await page.evaluate(i => window.scrollTo(0, i * 1000), i); await wait(500) }
    await wait(1000)

    const products = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('li.jum-card.card-promotion')).slice(0, 25).map(card => {
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
  } catch (e) { process.stderr.write('Jumbo error: ' + e.message + '\n') }
  finally { await browser.close().catch(() => {}) }
  return results
}

// ─── PLUS ─────────────────────────────────────────────────────────────────────
async function scrapePlus() {
  const browser = await launch()
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
      return Array.from(document.querySelectorAll('.plp-item-wrapper')).slice(0, 40).map(item => {
        const img = item.querySelector('img')
        return { img: img?.src || '', text: item.innerText?.replace(/\n/g, '|').substring(0, 300) }
      }).filter(p => p.text && p.text.length > 10)
    })

    for (const p of products) {
      const reconstructed = (p.text || '').replace(/(\d+)\.\|(\d+)/g, '$1.$2')
      const priceMatches = reconstructed.match(/\b\d+\.\d+\b/g)
      if (!priceMatches) continue
      const prices = priceMatches.map(s => parseFloat(s)).filter(n => n > 0 && n < 500)
      if (!prices.length) continue
      const discountedPrice = Math.min(...prices)
      const originalPrice = prices.length > 1 ? Math.max(...prices) : parseFloat((discountedPrice * 1.35).toFixed(2))
      const parts = (p.text || '').split('|').map(s => s.trim()).filter(Boolean)
      let name = ''
      const bijvPart = parts.find(s => /^bijv\.?\s+/i.test(s))
      if (bijvPart) name = bijvPart.replace(/^bijv\.?\s+/i, '').trim()
      else {
        const allePart = parts.find(s => /^alle\s+/i.test(s))
        if (allePart) name = allePart.replace(/^alle\s+/i, '').trim()
        else name = parts.find(s => s.length > 4 && !/^(\d+\+\d+|\d+\s*%|gratis|korting|per\s|t\/m)/i.test(s) && !/^\d/.test(s)) || ''
      }
      if (!name || name.length < 4) continue
      results.push({ name, market: 'Plus', originalPrice, discountedPrice, imageUrl: p.img && !p.img.includes('logo') ? p.img : null, isCampaign: true, source: 'plus.nl/aanbiedingen', expiresAt: EXPIRES_AT })
    }
  } catch (e) { process.stderr.write('Plus error: ' + e.message + '\n') }
  finally { await browser.close().catch(() => {}) }
  return results
}

// ─── LIDL ─────────────────────────────────────────────────────────────────────
async function scrapeLidl() {
  const browser = await launch()
  const results = []
  try {
    const page = await newPage(browser)
    await page.goto('https://www.lidl.nl/aanbiedingen', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    await wait(2000)
    await acceptCookies(page)
    await wait(3000)
    for (let i = 1; i <= 5; i++) { await page.evaluate(i => window.scrollTo(0, i * 1200), i); await wait(500) }

    const products = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.product-grid-box')).slice(0, 30).map(box => {
        const name = box.querySelector('a.odsc-tile__link')?.textContent.trim() || ''
        const img = box.querySelector('img')?.src || null
        const priceEl = box.querySelector('.ods-price__value')
        const newPrice = priceEl?.textContent.trim() || ''
        const oldPriceMatch = box.textContent.match(/(\d+[.,]\d+)\s*[-–]\s*\d+%/)
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
  } catch (e) { process.stderr.write('Lidl error: ' + e.message + '\n') }
  finally { await browser.close().catch(() => {}) }
  return results
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
const scrapers = { ah: scrapeAH, jumbo: scrapeJumbo, plus: scrapePlus, lidl: scrapeLidl }
const fn = scrapers[market]
if (!fn) { process.stdout.write('[]'); process.exit(0) }

fn().then(results => {
  process.stdout.write(JSON.stringify(results))
  process.exit(0)
}).catch(e => {
  process.stderr.write('Worker error: ' + e.message + '\n')
  process.stdout.write('[]')
  process.exit(0)
})
