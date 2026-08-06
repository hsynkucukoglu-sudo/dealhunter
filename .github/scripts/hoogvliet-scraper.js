/**
 * Hoogvliet scraper → Railway bulk-replace
 *
 * Waarom hier en niet in backend/scraper/index.js:
 * hoogvliet.com zit achter Imperva/Incapsula (X-CDN: Imperva, visid_incap_*-cookies).
 * Imperva serveert datacenter-IP's een JS-challenge; een kale fetch vanaf Railway krijgt
 * die challenge en scrapeHoogvliet() gaf daardoor vanaf 2026-07-29 stelselmatig 0
 * producten terug. Omdat de scheduler een markt met 0 resultaten bewust niet leegmaakt
 * (bescherming tegen scraperfouten) bleef de oude folder staan zonder dat er een fout
 * zichtbaar was — dezelfde stille storing als eerder bij Kruidvat/Akamai.
 *
 * Playwright met stealth doorloopt de challenge wel, net als de Kruidvat-scraper.
 *
 * Parsing is 1-op-1 overgenomen uit backend/scraper/index.js (regexvarianten omgezet naar
 * DOM-queries) en geverifieerd tegen de live pagina: 20 tegels → 17 producten, 15 met
 * korting, gelijk aan wat er nu in de database staat.
 */

const { chromium } = require('playwright-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
chromium.use(StealthPlugin())

const BACKEND_URL = process.env.BACKEND_URL || 'https://dealhunter-production-d900.up.railway.app'
const ADMIN_TOKEN = process.env.ADMIN_TOKEN
if (!ADMIN_TOKEN) { console.error('ADMIN_TOKEN eksik'); process.exit(1) }

// Zelfde mapping als backend/scraper/index.js
function toCampaignType(text) {
  if (!text) return null
  const s = text.toLowerCase()
  if (/1\s*\+\s*1|one.plus.one|bogo|buy\s*one\s*get\s*one|1\s*plus\s*1|\bgratis\b.*\bex(tra)?\b/.test(s)) return '1+1'
  if (/2e\s*(halve|helft|50%|gratis)|tweede.*(halve|gratis)|2de\s*(halve|gratis)|half\s*price/.test(s)) return '2e-halve-prijs'
  if (/3\s*(halen|voor)\s*2|3\s*halen.*2\s*betalen|buy\s*3.*get\s*(1|one)\s*free/.test(s)) return '3-halen-2-betalen'
  if (/combi(natie)?|samen\s*goedkoper/.test(s)) return 'combinatie'
  if (/tijdelijk|op\s*=\s*op/.test(s)) return 'tijdelijk'
  return null
}

// Nederlandse acties lopen doorgaans t/m zondag — zelfde berekening als de backend
function nextSunday() {
  const now = new Date()
  const d = new Date(now)
  const days = now.getDay() === 0 ? 7 : (7 - now.getDay()) % 7
  d.setDate(now.getDate() + days)
  return d.toISOString().split('T')[0]
}

// Schrijft naar Annotations (leesbaar via de publieke check-runs-API zonder inlog),
// in plaats van console.error die alleen in de ruwe log staat (403 zonder admin-rechten).
function ghError(msg) {
  console.log('::error::' + msg.replace(/\r?\n/g, ' | ').replace(/%/g, '%25'))
}

;(async () => {
  let browser = null
  try {
    browser = await chromium.launch({ headless: true })
    const ctx = await browser.newContext({
      locale: 'nl-NL',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    })
    const page = await ctx.newPage()

    console.log('Hoogvliet /aanbiedingen wordt geladen...')
    const resp = await page.goto('https://www.hoogvliet.com/aanbiedingen', { waitUntil: 'domcontentloaded', timeout: 45000 })
    console.log('HTTP status: ' + (resp ? resp.status() : '(geen response)'))

    // Imperva kan een tussenpagina serveren die zichzelf doorstuurt; wachten op de tegels.
    // Runs #1 (2 aug) en #2 (3 aug) faalden allebei na ~60s zonder duidelijke reden, en
    // #3/#4 (4-5 aug, na het verwijderen van continue-on-error) faalden opnieuw na ~59s —
    // maar console.error komt niet in de Annotations-tab terecht, alleen in de ruwe log
    // (die "Must have admin rights" geeft via de publieke API zonder inlog). De GitHub
    // Actions workflow-command ::error:: schrijft WEL naar Annotations, die de publieke
    // check-runs/{id}/annotations-API zonder authenticatie teruggeeft — dat maakt de
    // volgende mislukking voor het eerst inspecteerbaar zonder in te loggen.
    try {
      await page.waitForSelector('.product-all-info', { timeout: 30000 })
    } catch (waitErr) {
      const title = await page.title().catch(() => '(onbekend)')
      const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 300) || '(leeg)').catch(() => '(niet op te halen)')
      const htmlLen = await page.evaluate(() => document.documentElement.outerHTML.length).catch(() => -1)
      ghError('waitForSelector mislukt — titel: "' + title + '", HTML-lengte: ' + htmlLen + ', eerste 300 tekens body: ' + bodyText)
      throw waitErr
    }

    const raw = await page.evaluate(() => {
      const txt = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : null)
      const out = []
      for (const card of document.querySelectorAll('.product-all-info')) {
        const name = txt(card.querySelector('a.product-title h3'))
        if (!name) continue

        // Afbeelding staat in een voorgaande sibling, niet in de kaart zelf
        let imageUrl = null
        for (let el = card.previousElementSibling; el && !imageUrl; el = el.previousElementSibling) {
          imageUrl = el.querySelector?.('img[data-image-src]')?.getAttribute('data-image-src') || null
        }
        if (!imageUrl) {
          imageUrl = card.parentElement?.querySelector('img[data-image-src]')?.getAttribute('data-image-src') || null
        }

        out.push({
          name,
          desc: txt(card.querySelector('.Short-Description')),
          promo: txt(card.querySelector('.promotion-short-title')),
          euros: txt(card.querySelector('.price-euros > span')),
          cents: txt(card.querySelector('.price-cents sup')),
          strike: txt(card.querySelector('.strikethrough > div')),
          imageUrl,
        })
      }
      return out
    })

    console.log(raw.length + ' tegel gevonden')

    const seen = new Set()
    const products = []
    for (const r of raw) {
      let name = r.name
      // "Alle ..." is een generieke toevoeging, geen productnaam — zelfde filter als backend
      if (r.desc && !/^alle\b/i.test(r.desc)) name = `${name} ${r.desc}`
      if (seen.has(name.toLowerCase())) continue
      if (/^bij\s/i.test(name)) continue
      if (r.promo && /bezorg/i.test(r.promo)) continue

      let discountedPrice = r.euros ? parseFloat(`${r.euros}.${r.cents || '00'}`) : null
      if (discountedPrice == null && r.promo) {
        const pm = r.promo.match(/(\d+[.,]\d{2})/)
        if (pm) discountedPrice = parseFloat(pm[1].replace(',', '.'))
      }
      if (!discountedPrice) continue

      const was = r.strike ? parseFloat(r.strike) : 0
      const originalPrice = (was && was > discountedPrice) ? was : discountedPrice

      seen.add(name.toLowerCase())
      products.push({
        name,
        originalPrice,
        discountedPrice,
        imageUrl: r.imageUrl ? `https://www.hoogvliet.com${r.imageUrl.replace(/&#47;/g, '/')}` : null,
        isCampaign: true,
        source: 'hoogvliet.com/aanbiedingen',
        expiresAt: nextSunday(),
        campaignType: toCampaignType(r.promo || name),
      })
    }

    await browser.close()
    browser = null

    const withSavings = products.filter(p => p.originalPrice > p.discountedPrice).length
    console.log(products.length + ' product (' + withSavings + ' met besparing)')

    // Hoogvliet publiceert 15-20 acties per week. Minder dan 5 betekent vrijwel zeker een
    // geblokkeerde of gewijzigde pagina; dan liever falen dan de folder overschrijven.
    if (products.length < 5) throw new Error('Te weinig producten (' + products.length + ') — waarschijnlijk geblokkeerd')

    console.log("Railway'e gonderiliyor...")
    const postRes = await fetch(BACKEND_URL + '/api/products/bulk-replace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + ADMIN_TOKEN },
      body: JSON.stringify({ market: 'Hoogvliet', products }),
    })
    const json = await postRes.json()
    if (!postRes.ok) throw new Error('Backend: ' + JSON.stringify(json))
    console.log((json.count ?? products.length) + ' urun eklendi!')
  } catch (e) {
    if (browser) await browser.close().catch(() => {})
    ghError('HATA: ' + e.message)
    process.exit(1)
  }
})()
