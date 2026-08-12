/**
 * Aldi scraper → Railway aldi-ingest
 *
 * WAAROM: vanaf Railway is de Aldi-API onbetrouwbaar. De run van 2026-08-11 leverde
 * nul producten op, terwijl dezelfde API vanaf een gewone (residentiële) verbinding
 * 210 producten met 29 kortingen teruggeeft. Op 2026-08-10 kwam er wél data, maar
 * een onvolledige set (76 producten, geen enkele korting) — Aldi stond die dag met
 * 0 aanbiedingen op de site.
 *
 * WAT DIT SCRIPT DOET: alleen de RUWE algoliaDataMap ophalen en ongewijzigd
 * doorsturen. Het parsen blijft in de backend (parseAldiProducts), in één kopie —
 * zelfde aanpak als bij Albert Heijn.
 *
 * Aldi wisselt op maandag; daarom halen we 'current' én 'next' op en kiezen we de
 * set met de meeste streepprijzen. Een set zonder kortingen is waardeloos voor een
 * aanbiedingensite, hoeveel producten er ook in zitten.
 *
 * Lokaal draaien (handmatige redding):
 *   ADMIN_TOKEN=... node .github/scripts/aldi-scraper.js
 * PowerShell:
 *   $env:ADMIN_TOKEN="..."; node .github/scripts/aldi-scraper.js
 */

const BACKEND_URL = process.env.BACKEND_URL || 'https://dealhunter-production-d900.up.railway.app'
const ADMIN_TOKEN = process.env.ADMIN_TOKEN
if (!ADMIN_TOKEN) { console.error('ADMIN_TOKEN eksik'); process.exit(1) }

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'nl-NL,nl;q=0.9',
  'Referer': 'https://www.aldi.nl/aanbiedingen-deze-week.html',
}

const countDiscounted = (map) =>
  Object.values(map || {}).filter(p => p?.currentPrice?.strikePrice?.strikePriceValue).length

;(async () => {
  try {
    const candidates = []
    for (const week of ['current', 'next']) {
      try {
        const res = await fetch(`https://www.aldi.nl/api/offer/nl/${week}`, {
          headers: HEADERS,
          signal: AbortSignal.timeout(25000),
        })
        if (!res.ok) { console.log(`${week}: HTTP ${res.status}`); continue }
        const json = await res.json()
        const map = json.algoliaDataMap || {}
        const total = Object.keys(map).length
        if (total === 0) { console.log(`${week}: 0 urun`); continue }
        const discounted = countDiscounted(map)
        console.log(`${week}: ${total} urun, ${discounted} indirimli`)
        candidates.push({ week, map, total, discounted })
      } catch (e) {
        console.log(`${week} hata: ${e.message}`)
      }
    }
    if (!candidates.length) throw new Error('Iki hafta da bos dondu')

    candidates.sort((a, b) => (b.discounted - a.discounted) || (b.total - a.total))
    const chosen = candidates[0]
    console.log(`secilen: ${chosen.week} (${chosen.total} urun, ${chosen.discounted} indirimli)`)

    // Backend reddedecek olsa da burada da duruyoruz: kortingsloze set gonderme.
    if (chosen.discounted === 0) {
      throw new Error(`Secilen sette 0 indirim var — gonderilmedi, eski veri korundu`)
    }

    const body = JSON.stringify({ algoliaDataMap: chosen.map })
    console.log(`Railway'e gonderiliyor (${(body.length / 1024).toFixed(0)} KB)...`)
    const postRes = await fetch(`${BACKEND_URL}/api/scraper/aldi-ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ADMIN_TOKEN}` },
      body,
    })
    const json = await postRes.json().catch(() => ({}))
    if (!postRes.ok) throw new Error(`Backend HTTP ${postRes.status}: ${JSON.stringify(json)}`)
    console.log(`${json.parsed} parse (${json.withDiscount} indirimli) → ${json.count} urun kaydedildi!`)
  } catch (e) {
    console.error('HATA:', e.message)
    process.exit(1)
  }
})()
