import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EXPIRES_AT = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// ─── CHILD PROCESS RUNNER ─────────────────────────────────────────────────────
// Her Puppeteer market'ı ayrı process'te çalışır → bitince tüm bellek serbest kalır
function runWorker(market, timeoutMs = 120000) {
  return new Promise((resolve) => {
    const workerPath = path.join(__dirname, 'worker.js')
    const child = spawn(process.execPath, [workerPath, market], {
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let output = ''
    let errOutput = ''
    child.stdout.on('data', d => { output += d.toString() })
    child.stderr.on('data', d => { errOutput += d.toString() })

    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      process.stderr.write(`  ⏱ ${market} worker timeout\n`)
      resolve([])
    }, timeoutMs)

    child.on('close', () => {
      clearTimeout(timer)
      if (errOutput) process.stderr.write(`  [${market}] ${errOutput.slice(0, 200)}\n`)
      try { resolve(JSON.parse(output || '[]')) }
      catch { resolve([]) }
    })
  })
}

// ─── DIRK — fetch + JSON-LD (Puppeteer yok!) ──────────────────────────────────
async function scrapeDirk() {
  console.log('🏪 [Dirk] dirk.nl fetch ile taranıyor...')
  try {
    const res = await fetch('https://www.dirk.nl/aanbiedingen', {
      headers: { 'User-Agent': UA, 'Accept-Language': 'nl-NL' }
    })
    const html = await res.text()
    const jsonLdBlock = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]
    if (!jsonLdBlock) return []

    const data = JSON.parse(jsonLdBlock)
    const items = data['@graph']?.[0]?.itemListElement || []

    const results = items.map(item => {
      const p = item.item
      if (!p || !p.name || !p.offers?.price) return null
      const discountedPrice = parseFloat(p.offers.price)
      if (!discountedPrice) return null
      const imgSrc = Array.isArray(p.image) ? p.image[0] : p.image
      return {
        name: p.name,
        market: 'Dirk',
        originalPrice: parseFloat((discountedPrice * 1.35).toFixed(2)),
        discountedPrice,
        imageUrl: imgSrc || null,
        isCampaign: true,
        source: 'dirk.nl/aanbiedingen',
        expiresAt: EXPIRES_AT,
      }
    }).filter(Boolean)

    console.log(`  ✅ Dirk: ${results.length} ürün`)
    return results
  } catch (e) {
    console.error('  ❌ Dirk hatası:', e.message)
    return []
  }
}

// ─── HOOGVLIET — fetch + embedded JSON (Puppeteer yok!) ───────────────────────
async function scrapeHoogvliet() {
  console.log('🏪 [Hoogvliet] hoogvliet.com fetch ile taranıyor...')
  try {
    const res = await fetch('https://www.hoogvliet.com/aanbiedingen', {
      headers: { 'User-Agent': UA, 'Accept-Language': 'nl-NL' }
    })
    const html = await res.text()
    const jsonBlocks = html.match(/\{[^{}]*"price"\s*:\s*"[\d.]+[^{}]*\}/g) || []
    const seen = new Set()
    const results = []

    for (const block of jsonBlocks) {
      try {
        const obj = JSON.parse(block.replace(/&#47;/g, '/').replace(/&amp;/g, '&'))
        if (!obj.name || !obj.price || seen.has(obj.id || obj.name)) continue
        seen.add(obj.id || obj.name)
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
    return results
  } catch (e) {
    console.error('  ❌ Hoogvliet hatası:', e.message)
    return []
  }
}

// ─── ANA FONKSİYON ────────────────────────────────────────────────────────────
export async function scrapeFlyerProducts() {
  console.log('🔍 Süpermarket scraper başlatılıyor...')
  let allResults = []

  // Fetch-based (hafif, hızlı, bellek kullanmaz)
  allResults.push(...await scrapeDirk())
  allResults.push(...await scrapeHoogvliet())

  // Puppeteer-based (child process — her biri bitince bellek tamamen serbest kalır)
  for (const market of ['ah', 'jumbo', 'plus', 'lidl']) {
    const labels = { ah: 'Albert Heijn', jumbo: 'Jumbo', plus: 'Plus', lidl: 'Lidl' }
    console.log(`🏪 [${labels[market]}] taranıyor...`)
    const results = await runWorker(market)
    console.log(`  ✅ ${labels[market]}: ${results.length} ürün`)
    allResults.push(...results)
  }

  // Duplicate temizliği
  const seen = new Set()
  allResults = allResults.filter(p => {
    const key = p.name.toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  console.log(`\n✅ Toplam ${allResults.length} ürün çekildi.`)
  return allResults
}
