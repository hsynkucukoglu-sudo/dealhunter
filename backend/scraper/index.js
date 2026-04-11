import puppeteerExtra from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteerExtra.use(StealthPlugin())

const EXPIRES_AT = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

function wait(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function acceptCookies(page) {
  const selectors = [
    '#onetrust-accept-btn-handler',
    'button[id*="accept"][id*="cookie"]',
    'button[title="Accepteren"]',
    'button[title="Akkoord"]',
    '#didomi-notice-agree-button',
    '[data-testid="consent-accept"]',
    'button[class*="accept"]',
  ]
  for (const sel of selectors) {
    const btn = await page.$(sel).catch(() => null)
    if (btn) { await btn.click().catch(() => {}); return true }
  }
  return false
}

// ─── ALBERT HEIJN ─────────────────────────────────────────────────────────────
async function scrapeAH(browser) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
  const results = []

  try {
    console.log('🏪 [Albert Heijn] ah.nl/bonus taranıyor...')
    await page.goto('https://www.ah.nl/bonus', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    await wait(2000)
    await acceptCookies(page)
    await wait(2000)

    // Scroll to load more products
    for (let i = 1; i <= 4; i++) {
      await page.evaluate(i => window.scrollTo(0, i * 1200), i)
      await wait(800)
    }

    const products = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('a.promotion-card_root__EwNRT'))
      return cards.map(card => {
        const img = card.querySelector('img[src*="/dam/product/"]')
        const lines = card.innerText.split('\n').map(s => s.trim()).filter(Boolean)
        const priceStr = lines.find(l => /^\d+[,.]?\d*$/.test(l.replace(',','.')))
        const name = lines[0] || ''
        const deal = lines.find(l => l.includes('voor') || l.includes('korting') || l.includes('%')) || ''
        const href = card.getAttribute('href') || ''
        const imgSrc = img?.src || ''
        // Get original price if deal text has it
        const twoForMatch = card.innerText.match(/(\d+)\s*voor\s*[€]?\s*(\d+[,.]?\d*)/i)
        return { name, deal, priceStr, imgSrc, href, twoForMatch: twoForMatch ? twoForMatch[0] : null, rawText: card.innerText.replace(/\n/g, '|') }
      }).filter(p => p.name && p.name.length > 1)
    })

    for (const p of products.slice(0, 20)) {
      let discountedPrice = parseFloat((p.priceStr || '').replace(',', '.')) || 0
      let originalPrice = discountedPrice > 0 ? parseFloat((discountedPrice * 1.35).toFixed(2)) : 0

      // Parse price from rawText more carefully
      const priceMatches = (p.rawText || '').match(/(\d+[,.]\d+)/g)
      if (priceMatches && priceMatches.length > 0) {
        const prices = priceMatches.map(s => parseFloat(s.replace(',', '.'))).filter(n => n > 0 && n < 500)
        if (prices.length === 1) {
          discountedPrice = prices[0]
          originalPrice = parseFloat((discountedPrice * 1.35).toFixed(2))
        } else if (prices.length >= 2) {
          discountedPrice = Math.min(...prices)
          originalPrice = Math.max(...prices)
        }
      }

      if (!discountedPrice || discountedPrice <= 0) continue

      const imageUrl = p.imgSrc.includes('/dam/product/')
        ? p.imgSrc.replace(/rendition=\d+x\d+/, 'rendition=300x300')
        : null

      results.push({
        name: p.name,
        market: 'Albert Heijn',
        originalPrice: originalPrice || discountedPrice,
        discountedPrice,
        imageUrl,
        isCampaign: true,
        source: 'ah.nl/bonus',
        expiresAt: EXPIRES_AT,
      })
    }

    console.log(`  ✅ Albert Heijn: ${results.length} ürün`)
  } catch (e) {
    console.error('  ❌ AH scraper hatası:', e.message)
  } finally {
    await page.close().catch(() => {})
  }
  return results
}

// ─── JUMBO ────────────────────────────────────────────────────────────────────
async function scrapeJumbo(browser) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
  const results = []

  try {
    console.log('🏪 [Jumbo] jumbo.com/aanbiedingen taranıyor...')
    await page.goto('https://www.jumbo.com/aanbiedingen/nu', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    await wait(2000)
    await acceptCookies(page)
    await wait(3000)

    // Scroll to trigger lazy load
    for (let i = 1; i <= 5; i++) {
      await page.evaluate(i => window.scrollTo(0, i * 1000), i)
      await wait(600)
    }
    await wait(2000)

    const products = await page.evaluate(() => {
      // Jumbo uses li.jum-card.card-promotion structure
      const cards = Array.from(document.querySelectorAll('li.jum-card.card-promotion'))
      return cards.slice(0, 25).map(card => {
        const img = card.querySelector('img')
        const lines = card.innerText.split('\n').map(s => s.trim()).filter(Boolean)
        // Format: "voor 1,00", "ProductName", "valid period"
        const priceMatch = card.innerText.match(/voor\s+(\d+[,.]\d+)/i)
        const name = lines.find(l => l.length > 3 && !/^(voor|wo|ma|di|do|vr|za|zo|t\/m|\d)/.test(l.toLowerCase()))
        return {
          name: name || '',
          price: priceMatch ? priceMatch[1] : '',
          img: img?.src || '',
          text: card.innerText.replace(/\n/g, '|').substring(0, 200)
        }
      }).filter(p => p.name)
    })

    for (const p of products) {
      const priceMatches = ((p.price || '') + (p.text || '')).match(/(\d+[,.]\d+)/g)
      if (!priceMatches) continue
      const prices = priceMatches.map(s => parseFloat(s.replace(',', '.'))).filter(n => n > 0 && n < 500)
      if (prices.length === 0) continue
      const discountedPrice = Math.min(...prices)
      const originalPrice = prices.length > 1 ? Math.max(...prices) : parseFloat((discountedPrice * 1.35).toFixed(2))

      results.push({
        name: p.name || 'Jumbo ürün',
        market: 'Jumbo',
        originalPrice,
        discountedPrice,
        imageUrl: p.img?.includes('logo') ? null : p.img || null,
        isCampaign: true,
        source: 'jumbo.com/aanbiedingen',
        expiresAt: EXPIRES_AT,
      })
    }

    console.log(`  ✅ Jumbo: ${results.length} ürün`)
  } catch (e) {
    console.error('  ❌ Jumbo scraper hatası:', e.message)
  } finally {
    await page.close().catch(() => {})
  }
  return results
}

// ─── DIRK ─────────────────────────────────────────────────────────────────────
async function scrapeDirk(browser) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
  const results = []

  try {
    console.log('🏪 [Dirk] dirk.nl/aanbiedingen taranıyor...')
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
        // Skip ACTIE, van X.XX, single digits, very short lines
        const nameLines = a.innerText.split('\n').map(s => s.trim()).filter(s =>
          s.length > 3 &&
          !/^(ACTIE|van|per|gram|liter|ml|kg|blik|pak|stuk)$/i.test(s) &&
          !/^van\s+\d/i.test(s) &&
          !/^\d+$/.test(s) &&
          !/^\d+[,.]\d+$/.test(s)
        )
        return {
          name: nameLines[0] || '',
          imgSrc: img?.src || '',
          vanPrice: vanMatch ? parseFloat(vanMatch[1].replace(',', '.')) : 0,
          priceNumbers,
          rawText: a.innerText.replace(/\n/g, '|').substring(0, 200)
        }
      }).filter(p => p.name && p.name.length > 3)
    })

    for (const p of products) {
      if (!p.name || p.name.length < 3) continue
      const prices = (p.priceNumbers || []).map(s => parseFloat(s.replace(',', '.'))).filter(n => n > 0 && n < 500)
      let discountedPrice = prices.length > 0 ? Math.min(...prices) : 0
      let originalPrice = p.vanPrice > discountedPrice ? p.vanPrice : (prices.length > 1 ? Math.max(...prices) : parseFloat((discountedPrice * 1.35).toFixed(2)))

      if (!discountedPrice || discountedPrice <= 0) continue

      results.push({
        name: p.name,
        market: 'Dirk',
        originalPrice,
        discountedPrice,
        imageUrl: p.imgSrc && !p.imgSrc.includes('logo') ? p.imgSrc : null,
        isCampaign: true,
        source: 'dirk.nl/aanbiedingen',
        expiresAt: EXPIRES_AT,
      })
    }

    console.log(`  ✅ Dirk: ${results.length} ürün`)
  } catch (e) {
    console.error('  ❌ Dirk scraper hatası:', e.message)
  } finally {
    await page.close().catch(() => {})
  }
  return results
}

// ─── PLUS ─────────────────────────────────────────────────────────────────────
async function scrapePlus(browser) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
  const results = []

  try {
    console.log('🏪 [Plus] plus.nl/aanbiedingen taranıyor...')
    await page.goto('https://www.plus.nl/aanbiedingen', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    await wait(2000)
    await acceptCookies(page)
    await wait(2000)

    for (let i = 1; i <= 4; i++) {
      await page.evaluate(i => window.scrollTo(0, i * 1200), i)
      await wait(600)
    }

    const products = await page.evaluate(() => {
      // Plus uses .plp-item-wrapper for product cards (33+ products)
      const items = Array.from(document.querySelectorAll('.plp-item-wrapper'))
      return items.slice(0, 40).map(item => {
        const img = item.querySelector('img')
        const text = item.innerText?.replace(/\n/g, '|').substring(0, 300)
        return { img: img?.src || '', text }
      }).filter(p => p.text && p.text.length > 10)
    })

    for (const p of products) {
      const text = p.text || ''
      const parts = text.split('|').map(s => s.trim()).filter(Boolean)

      // Price format: "5.|98" → 5.98, or "1.|95" → 1.95 (split across elements)
      // Reconstruct prices: find pattern like "5." followed by "98"
      const reconstructed = text.replace(/(\d+)\.\|(\d+)/g, '$1.$2')
      const priceMatches = reconstructed.match(/\b\d+\.\d+\b/g)
      if (!priceMatches) continue
      const prices = priceMatches.map(s => parseFloat(s)).filter(n => n > 0 && n < 500)
      if (prices.length === 0) continue
      const discountedPrice = Math.min(...prices)
      const originalPrice = prices.length > 1 ? Math.max(...prices) : parseFloat((discountedPrice * 1.35).toFixed(2))

      // Name extraction strategy:
      // 1. "Bijv. ProductName" → extract "ProductName"
      // 2. "Alle BrandName" → extract "BrandName"
      // 3. First non-deal part
      let name = ''
      const bijvPart = parts.find(s => /^bijv\.?\s+/i.test(s))
      if (bijvPart) {
        name = bijvPart.replace(/^bijv\.?\s+/i, '').trim()
      } else {
        const allePart = parts.find(s => /^alle\s+/i.test(s))
        if (allePart) {
          name = allePart.replace(/^alle\s+/i, '').trim()
        } else {
          const skipPatterns = /^(\d+\+\d+|\d+\s*%|\d+\s+voor|gratis|extra|korting|nieuw|per\s|t\/m)/i
          name = parts.find(s =>
            s.length > 4 &&
            !skipPatterns.test(s) &&
            !/^\d/.test(s)
          ) || ''
        }
      }
      if (!name || name.length < 4) continue

      results.push({
        name,
        market: 'Plus',
        originalPrice,
        discountedPrice,
        imageUrl: p.img && !p.img.includes('logo') && !p.img.includes('svg') ? p.img : null,
        isCampaign: true,
        source: 'plus.nl/aanbiedingen',
        expiresAt: EXPIRES_AT,
      })
    }

    console.log(`  ✅ Plus: ${results.length} ürün`)
  } catch (e) {
    console.error('  ❌ Plus scraper hatası:', e.message)
  } finally {
    await page.close().catch(() => {})
  }
  return results
}

// ─── LIDL ─────────────────────────────────────────────────────────────────────
async function scrapeLidl(browser) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
  const results = []

  try {
    console.log('🏪 [Lidl] lidl.nl/aanbiedingen taranıyor...')
    await page.goto('https://www.lidl.nl/aanbiedingen', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    await wait(2000)
    await acceptCookies(page)
    await wait(3000)

    for (let i = 1; i <= 5; i++) {
      await page.evaluate(i => window.scrollTo(0, i * 1200), i)
      await wait(700)
    }

    const products = await page.evaluate(() => {
      const boxes = Array.from(document.querySelectorAll('.product-grid-box'))
      return boxes.slice(0, 30).map(box => {
        const name = box.querySelector('a.odsc-tile__link')?.textContent.trim() || ''
        const img = box.querySelector('img')?.src || null
        const priceEl = box.querySelector('.ods-price__value')
        const newPrice = priceEl?.textContent.trim() || ''
        // Old price: look for crossed-out price in text, format "1.19-25%0.89"
        const allText = box.textContent
        const oldPriceMatch = allText.match(/(\d+[.,]\d+)\s*[-–]\s*\d+%/)
        const oldPrice = oldPriceMatch ? oldPriceMatch[1] : ''
        const dateMatch = allText.match(/(\d{2}\/\d{2}\s*[-–]\s*\d{2}\/\d{2})/)
        return { name, img, newPrice, oldPrice, date: dateMatch?.[1] || '' }
      }).filter(p => p.name && p.newPrice)
    })

    for (const p of products) {
      const discountedPrice = parseFloat((p.newPrice || '').replace(',', '.')) || 0
      if (!discountedPrice || discountedPrice <= 0) continue
      const oldPriceNum = parseFloat((p.oldPrice || '').replace(',', '.')) || 0
      const originalPrice = oldPriceNum > discountedPrice ? oldPriceNum : parseFloat((discountedPrice * 1.35).toFixed(2))

      results.push({
        name: p.name,
        market: 'Lidl',
        originalPrice,
        discountedPrice,
        imageUrl: p.img && !p.img.includes('logo') && !p.img.includes('svg') ? p.img : null,
        isCampaign: true,
        source: 'lidl.nl/aanbiedingen',
        expiresAt: EXPIRES_AT,
      })
    }

    console.log(`  ✅ Lidl: ${results.length} ürün`)
  } catch (e) {
    console.error('  ❌ Lidl scraper hatası:', e.message)
  } finally {
    await page.close().catch(() => {})
  }
  return results
}

// ─── HOOGVLIET ────────────────────────────────────────────────────────────────
async function scrapeHoogvliet(browser) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
  const results = []

  try {
    console.log('🏪 [Hoogvliet] hoogvliet.com/aanbiedingen taranıyor...')
    await page.goto('https://www.hoogvliet.com/aanbiedingen', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    await wait(2000)
    await acceptCookies(page)
    await wait(2000)

    for (let i = 1; i <= 4; i++) {
      await page.evaluate(i => window.scrollTo(0, i * 1200), i)
      await wait(600)
    }

    const products = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[class*="product-card"], [class*="ProductCard"], [class*="product-item"], [class*="tile"], article'))
      if (cards.length === 0) {
        return Array.from(document.querySelectorAll('img')).filter(i => {
          const src = i.src || ''
          return src.includes('hoogvliet') && !src.includes('logo') && !src.includes('svg') && src.startsWith('http')
        }).slice(0, 20).map(img => {
          let el = img
          for (let i = 0; i < 10; i++) {
            el = el.parentElement
            if (!el) break
            const text = el.innerText?.replace(/\n/g, '|')
            if (text && text.length > 15 && /\d+[,.]\d+/.test(text)) return { img: img.src, text: text.substring(0, 200) }
          }
          return null
        }).filter(Boolean)
      }
      return cards.slice(0, 20).map(card => {
        const img = card.querySelector('img')
        const nameEl = card.querySelector('[class*="title"], [class*="name"], h2, h3')
        const text = card.innerText?.replace(/\n/g, '|').substring(0, 200)
        return { name: nameEl?.innerText?.trim() || '', img: img?.src || '', text }
      }).filter(p => p.name || p.text)
    })

    for (const p of products) {
      const text = p.text || ''
      const priceMatches = text.match(/(\d+[,.]\d+)/g)
      if (!priceMatches) continue
      const prices = priceMatches.map(s => parseFloat(s.replace(',', '.'))).filter(n => n > 0 && n < 500)
      if (prices.length === 0) continue
      const discountedPrice = Math.min(...prices)
      const originalPrice = prices.length > 1 ? Math.max(...prices) : parseFloat((discountedPrice * 1.35).toFixed(2))
      const name = p.name || text.split('|').find(s => s.trim().length > 3 && !/^\d/.test(s.trim())) || ''
      if (!name || name.length < 3) continue

      results.push({
        name,
        market: 'Hoogvliet',
        originalPrice,
        discountedPrice,
        imageUrl: p.img && !p.img.includes('logo') && !p.img.includes('svg') ? p.img : null,
        isCampaign: true,
        source: 'hoogvliet.com/weekaanbiedingen',
        expiresAt: EXPIRES_AT,
      })
    }

    console.log(`  ✅ Hoogvliet: ${results.length} ürün`)
  } catch (e) {
    console.error('  ❌ Hoogvliet scraper hatası:', e.message)
  } finally {
    await page.close().catch(() => {})
  }
  return results
}

// ─── ANA FONKSİYON ────────────────────────────────────────────────────────────
export async function scrapeFlyerProducts() {
  console.log('🔍 Süpermarket scraper başlatılıyor...')

  // Chromium path: env var > common Linux paths > default
  let executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
  if (!executablePath) {
    const fs = await import('fs')
    for (const p of ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome']) {
      try { fs.accessSync(p); executablePath = p; break } catch {}
    }
  }

  const launchOptions = {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
    ]
  }
  if (executablePath) launchOptions.executablePath = executablePath

  const browser = await puppeteerExtra.launch(launchOptions)

  let allResults = []

  try {
    // Tüm marketleri paralel değil sırayla çek (bot tespitini azaltmak için)
    const ahResults = await scrapeAH(browser)
    allResults.push(...ahResults)

    const jumbResults = await scrapeJumbo(browser)
    allResults.push(...jumbResults)

    const dirkResults = await scrapeDirk(browser)
    allResults.push(...dirkResults)

    const plusResults = await scrapePlus(browser)
    allResults.push(...plusResults)

    const lidlResults = await scrapeLidl(browser)
    allResults.push(...lidlResults)

    const hoogvlietResults = await scrapeHoogvliet(browser)
    allResults.push(...hoogvlietResults)

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
  } finally {
    await browser.close().catch(() => {})
  }

  return allResults
}
