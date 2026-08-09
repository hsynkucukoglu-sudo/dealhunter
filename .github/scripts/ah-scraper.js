/**
 * Albert Heijn scraper → Railway ah-ingest
 *
 * WAAROM DIT BESTAAT: Railway's datacenter-IP wordt door Akamai geblokkeerd. Op
 * 2026-08-08 gaf api.ah.nl daar een <HTML> deny-pagina in plaats van JSON terug, de
 * backend-scraper ving dat op als lege lijst en AH stond 5 dagen stil zonder dat
 * iemand het zag. Zelfde klasse als Kruidvat (Akamai) en Hoogvliet (Imperva).
 *
 * WAT DIT SCRIPT WEL EN NIET DOET: het haalt alleen de RUWE API-respons op via een
 * echte browser (stealth) en stuurt die ONGEWIJZIGD door. Het parsen — calcAhPromo,
 * parseAhUnitInfo, dedupePackVariants — blijft in de backend, in één kopie. Die
 * logica is vaak gerepareerd (nep-kortingen, eenheidsprijzen, N+M gratis); een
 * tweede kopie hier zou onvermijdelijk gaan afwijken. Ook bewust niet trimmen: een
 * veldenlijst hier zou stil breken zodra de parser een nieuw veld gaat lezen.
 *
 * Vereist: BACKEND_URL, ADMIN_TOKEN
 */

const { chromium } = require('playwright-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
chromium.use(StealthPlugin())

const BACKEND_URL = process.env.BACKEND_URL || 'https://dealhunter-production-d900.up.railway.app'
const ADMIN_TOKEN = process.env.ADMIN_TOKEN
if (!ADMIN_TOKEN) { console.error('ADMIN_TOKEN eksik'); process.exit(1) }

const MAX_PAGES = 30
const PAGE_SIZE = 50
// Onder deze grens gaan we ervan uit dat Akamai ons (deels) heeft geblokkeerd en
// sturen we NIETS door — liever oude data laten staan dan de markt legen.
const MIN_RAW_PRODUCTS = 200

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

    // Eerst ah.nl bezoeken: Akamai zet hier zijn sessie-cookies (bm_sz, _abck).
    // Zonder die stap krijgt de API-call alsnog een challenge.
    console.log('ah.nl aciliyor (Akamai oturum cookie)...')
    await page.goto('https://www.ah.nl/bonus', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(3000)

    const result = await page.evaluate(async ({ maxPages, pageSize }) => {
      const out = { products: [], error: null, tokenOk: false, pages: 0 }
      try {
        const tokenRes = await fetch('https://api.ah.nl/mobile-auth/v1/auth/token/anonymous', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId: 'appie' }),
        })
        const tokenText = await tokenRes.text()
        let tokenData
        try { tokenData = JSON.parse(tokenText) } catch {
          out.error = `token JSON degil (HTTP ${tokenRes.status}): ${tokenText.slice(0, 120)}`
          return out
        }
        if (!tokenData.access_token) { out.error = 'access_token yok: ' + tokenText.slice(0, 120); return out }
        out.tokenOk = true

        const h = {
          'Authorization': 'Bearer ' + tokenData.access_token,
          'x-application': 'AHWEBSHOP',
          'Accept': 'application/json',
        }
        const seen = new Set()
        for (let p = 0; p < maxPages; p++) {
          const r = await fetch(
            `https://api.ah.nl/mobile-services/product/search/v2?bonus=true&page=${p}&size=${pageSize}`,
            { headers: h }
          )
          if (!r.ok) { out.error = `search p${p} HTTP ${r.status}`; break }
          const txt = await r.text()
          let j
          try { j = JSON.parse(txt) } catch { out.error = `search p${p} JSON degil: ${txt.slice(0, 120)}`; break }
          const prods = j.products || []
          if (!prods.length) break
          for (const x of prods) {
            if (!x.title || seen.has(x.webshopId)) continue
            seen.add(x.webshopId)
            out.products.push(x)
          }
          out.pages = p + 1
          const totalPages = j.page?.totalPages ?? 999
          if (p + 1 >= totalPages) break
        }
      } catch (e) {
        out.error = 'evaluate: ' + e.message
      }
      return out
    }, { maxPages: MAX_PAGES, pageSize: PAGE_SIZE })

    await browser.close()
    browser = null

    console.log(`token: ${result.tokenOk ? 'OK' : 'FAIL'} | sayfa: ${result.pages} | ham urun: ${result.products.length}`)
    if (result.error) console.log('not: ' + result.error)

    if (result.products.length < MIN_RAW_PRODUCTS) {
      throw new Error(`Sadece ${result.products.length} ham urun (alt sinir ${MIN_RAW_PRODUCTS}) — gonderilmedi, eski veri korundu. Sebep: ${result.error || 'bilinmiyor'}`)
    }

    const body = JSON.stringify({ products: result.products })
    console.log(`Railway'e gonderiliyor (${(body.length / 1024 / 1024).toFixed(2)} MB)...`)
    const postRes = await fetch(BACKEND_URL + '/api/scraper/ah-ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + ADMIN_TOKEN },
      body,
    })
    const json = await postRes.json().catch(() => ({}))
    if (!postRes.ok) throw new Error(`Backend HTTP ${postRes.status}: ${JSON.stringify(json)}`)
    console.log(`${json.received} ham → ${json.parsed} parse → ${json.count} urun kaydedildi!`)
  } catch (e) {
    if (browser) await browser.close().catch(() => {})
    console.error('HATA:', e.message)
    process.exit(1)
  }
})()
