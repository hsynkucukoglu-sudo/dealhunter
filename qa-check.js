/**
 * DealHunter4U — Otomatik QA Kontrolü
 * Hem API verisini analiz eder hem de Playwright ile siteyi gerçek browser'da gezdirir.
 * Çalıştır: node qa-check.js
 */

import { chromium } from 'playwright'

const SITE = 'https://www.dealhunter4u.nl'
const API  = 'https://dealhunter-production-d900.up.railway.app'

// ─── Renk kodları ─────────────────────────────────────────────────────────────
const R = '\x1b[31m', G = '\x1b[32m', Y = '\x1b[33m', B = '\x1b[36m', W = '\x1b[0m'
const ok   = (msg) => console.log(`${G}  ✅ ${msg}${W}`)
const warn = (msg) => console.log(`${Y}  ⚠️  ${msg}${W}`)
const fail = (msg) => console.log(`${R}  ❌ ${msg}${W}`)
const info = (msg) => console.log(`${B}  ℹ️  ${msg}${W}`)
const head = (msg) => console.log(`\n${B}▶ ${msg}${W}`)

// ─── 1. API VERİ ANALİZİ ──────────────────────────────────────────────────────
async function checkApiData() {
  head('API Veri Kalitesi')

  const res  = await fetch(`${API}/api/products`)
  const all  = await res.json()

  info(`Toplam ürün: ${all.length}`)

  // Market dağılımı
  const byMarket = {}
  for (const p of all) {
    const m = p.market || '(boş)'
    byMarket[m] = (byMarket[m] || 0) + 1
  }
  const EXPECTED = {
    'Albert Heijn': [50, 800], 'Aldi': [30, 300], 'Jumbo': [50, 400],
    'Lidl': [20, 200], 'Dirk': [30, 250], 'Hoogvliet': [5, 100],
    'DekaMarkt': [20, 200], 'Plus': [30, 300], 'Kruidvat': [50, 300],
    'Vomar': [10, 150], 'Coop': [0, 200],
  }
  for (const [market, count] of Object.entries(byMarket).sort((a,b) => b[1]-a[1])) {
    const [min, max] = EXPECTED[market] || [0, 9999]
    if (market === '(boş)') {
      fail(`${market}: ${count} ürün — market adı eksik, temizlenmeli!`)
    } else if (count > max) {
      warn(`${market}: ${count} ürün — beklenenden fazla (max ~${max}), duplicate olabilir`)
    } else if (count < min) {
      warn(`${market}: ${count} ürün — beklenenden az (min ~${min}), scraper sorunu olabilir`)
    } else {
      ok(`${market}: ${count} ürün`)
    }
  }

  // Aynı market içi duplicate (isim bazlı)
  head('Aynı Market İçi Duplicate')
  let dupCount = 0
  for (const market of Object.keys(byMarket)) {
    const marketProducts = all.filter(p => (p.market || '(boş)') === market)
    const seen = new Map()
    for (const p of marketProducts) {
      const key = p.name?.toLowerCase().trim()
      if (!key) continue
      if (seen.has(key)) {
        if (!dupCount) warn(`İlk duplicate örneği:`)
        warn(`  "${p.name}" — ${market}'de ${(seen.get(key) + 1)}. kez`)
        dupCount++
        if (dupCount >= 10) { warn('  ...daha fazla duplicate var, ilk 10 gösterildi'); break }
      }
      seen.set(key, (seen.get(key) || 1))
    }
  }
  if (!dupCount) ok('Aynı market içinde duplicate yok')

  // Aynı isim farklı market (cross-market)
  head('Cross-Market Aynı Ürünler')
  const nameToMarkets = new Map()
  for (const p of all) {
    const key = p.name?.toLowerCase().trim()
    if (!key) continue
    if (!nameToMarkets.has(key)) nameToMarkets.set(key, [])
    nameToMarkets.get(key).push(p.market)
  }
  let crossCount = 0
  for (const [name, markets] of nameToMarkets) {
    if (markets.length > 1) {
      info(`  "${name}" — ${markets.join(', ')}`)
      if (++crossCount >= 5) { info('  ...ilk 5 gösterildi'); break }
    }
  }
  if (!crossCount) ok('Cross-market duplicate yok')

  // Fiyat sorunları
  head('Fiyat Anomalileri')
  const noDiscount  = all.filter(p => p.originalPrice <= p.discountedPrice || p.discount <= 0)
  const hugeDisc    = all.filter(p => p.discount > 90)
  const zeroPrice   = all.filter(p => !p.discountedPrice || p.discountedPrice <= 0)
  const negSaving   = all.filter(p => p.originalPrice > 0 && p.originalPrice < p.discountedPrice)

  if (zeroPrice.length)   fail(`${zeroPrice.length} ürün €0 fiyat`)
  else                    ok('Sıfır fiyatlı ürün yok')
  if (negSaving.length)   warn(`${negSaving.length} ürün: indirimli fiyat > orijinal fiyat`)
  else                    ok('Negatif indirim yok')
  if (hugeDisc.length)    warn(`${hugeDisc.length} ürün >%90 indirim — kontrol et`)
  else                    ok('%90 üstü indirim yok')
  if (noDiscount.length)  warn(`${noDiscount.length} ürün indirim yüzdesi 0 veya eksik`)

  // Veri eksiklikleri
  head('Eksik Veri')
  const noImg = all.filter(p => !p.imageUrl)
  const noExp = all.filter(p => !p.expiresAt)
  const stale = all.filter(p => p.expiresAt && new Date(p.expiresAt) < new Date())

  if (noImg.length)  warn(`${noImg.length} ürün resim yok`)
  else               ok('Tüm ürünlerin resmi var')
  if (stale.length)  warn(`${stale.length} ürün tarihi geçmiş (expiresAt < bugün)`)
  else               ok('Tarihi geçmiş ürün yok')
  if (noExp.length)  info(`${noExp.length} ürün son kullanma tarihi yok`)

  return all
}

// ─── 2. BROWSER TESTİ ─────────────────────────────────────────────────────────
async function checkBrowser(products) {
  head('Browser QA — Playwright')
  const browser = await chromium.launch({ headless: true })
  const page    = await browser.newPage()

  const errors = []
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })

  // ── Ana sayfa ───────────────────────────────────────────────────────────────
  info('Ana sayfa yükleniyor...')
  await page.goto(SITE, { waitUntil: 'networkidle', timeout: 30000 })

  // Başlık
  const title = await page.title()
  if (title.includes('DealHunter')) ok(`Başlık: "${title}"`)
  else                               fail(`Beklenmeyen başlık: "${title}"`)

  // Market showcase kartları
  const marketCards = await page.locator('.grid button').count()
  if (marketCards >= 8)  ok(`${marketCards} market kartı görünüyor`)
  else                   warn(`Yalnızca ${marketCards} market kartı — eksik olabilir`)

  // Broken images (market logoları)
  const brokenLogos = await page.evaluate(() => {
    return [...document.querySelectorAll('img')].filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src)
  })
  if (brokenLogos.length) fail(`${brokenLogos.length} kırık resim:\n${brokenLogos.slice(0,5).map(s=>'    '+s).join('\n')}`)
  else                    ok('Kırık resim yok')

  // Verloopt Binnenkort — max 8 ürün gösterir, sadece varlık kontrolü
  head('Browser: Verloopt Binnenkort Section')
  const expirySection = page.locator('text=Verloopt Binnenkort')
  if (await expirySection.count() > 0) {
    ok('"Verloopt Binnenkort" bölümü görünüyor (max 8 ürün gösterir)')
  } else {
    info('"Verloopt Binnenkort" bölümü yok (sona yakın ürün yok)')
  }

  // ── Kruidvat filtresi ────────────────────────────────────────────────────────
  head('Browser: Kruidvat Market Filtresi')
  const kruidvatBtn = page.locator('button', { hasText: 'Kruidvat' }).first()
  if (await kruidvatBtn.count() > 0) {
    await kruidvatBtn.click()
    await page.waitForTimeout(1500)
    const productCount = await page.locator('[class*="grid"] > div').count()
    const expectedKruidvat = products.filter(p => p.market === 'Kruidvat').length
    // Pagination: ilk sayfa max 48 ürün gösterir
    const expectedVisible = Math.min(expectedKruidvat, 48)
    info(`Kruidvat: browser ${productCount} kart, API ${expectedKruidvat} ürün`)
    if (Math.abs(productCount - expectedVisible) <= 10) ok('Kruidvat ürün sayısı tutarlı (pagination dahil)')
    else warn(`Kruidvat sayısı tutarsız — browser: ${productCount}, beklenen: ~${expectedVisible}`)
  } else {
    warn('Kruidvat butonu bulunamadı')
  }

  // ── Console hataları ─────────────────────────────────────────────────────────
  head('Browser: Console Hataları')
  if (errors.length) {
    fail(`${errors.length} console hatası:`)
    errors.slice(0,5).forEach(e => fail(`  ${e.substring(0,120)}`))
  } else {
    ok('Console hatası yok')
  }

  await browser.close()
}

// ─── ÖZET ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${'═'.repeat(55)}`)
  console.log(`  🔍 DealHunter4U QA Raporu — ${new Date().toLocaleString('nl-NL')}`)
  console.log(`${'═'.repeat(55)}`)

  try {
    const products = await checkApiData()
    await checkBrowser(products)
  } catch (e) {
    fail(`QA scripti çöktü: ${e.message}`)
    console.error(e)
  }

  console.log(`\n${'═'.repeat(55)}\n`)
}

main()
