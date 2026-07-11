/**
 * DealHunter4U — Site Audit Script
 * Kullanım: node scripts/site-audit.mjs
 */

const BASE = 'https://www.dealhunter4u.nl'
const API_ORIGIN = 'https://dealhunter-production-d900.up.railway.app'

const PAGES = [
  { url: '/',                         name: 'Homepage' },
  { url: '/supermarkt/albert-heijn',  name: 'AH market' },
  { url: '/supermarkt/jumbo',         name: 'Jumbo market' },
  { url: '/supermarkt/lidl',          name: 'Lidl market' },
  { url: '/supermarkt/aldi',          name: 'Aldi market' },
  { url: '/supermarkt/kruidvat',      name: 'Kruidvat market' },
  { url: '/supermarkt/dirk',          name: 'Dirk market' },
  { url: '/supermarkt/hoogvliet',     name: 'Hoogvliet market' },
  { url: '/supermarkt/vomar',         name: 'Vomar market' },
  { url: '/supermarkt/dekamarkt',     name: 'DekaMarkt market' },
  { url: '/blog',                     name: 'Blog listing' },
  { url: '/blog/albert-heijn-vs-jumbo-vs-lidl-wie-is-goedkoper', name: 'AH vs Jumbo blog' },
  { url: '/blog/wie-is-dealhunter4u',  name: 'Over ons blog' },
  { url: '/categorie/vlees-vis',      name: 'Vlees-Vis categorie' },
  { url: '/categorie/zuivel',         name: 'Zuivel categorie' },
  { url: '/privacy',                  name: 'Privacy' },
  { url: '/contact',                  name: 'Contact' },
  { url: '/over-ons',                 name: 'Over ons' },
  { url: '/sitemap.xml',              name: 'Sitemap' },
  { url: '/robots.txt',               name: 'Robots.txt' },
  { url: '/ads.txt',                  name: 'Ads.txt' },
]

const API_CHECKS = [
  { url: '/api/health',                          name: 'Health API (frontend)' },
  { url: `${API_ORIGIN}/api/health/scraper`,     name: 'Scraper health (backend)' },
  { url: `${API_ORIGIN}/api/push/vapid-public-key`, name: 'Push VAPID key (backend)' },
]

const COLORS = {
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
}

const c = (color, text) => `${COLORS[color]}${text}${COLORS.reset}`

async function checkPage({ url, name }) {
  const fullUrl = `${BASE}${url}`
  const start = Date.now()
  try {
    const res = await fetch(fullUrl, {
      redirect: 'follow',
      headers: { 'User-Agent': 'DealHunter-Audit/1.0' },
      signal: AbortSignal.timeout(10000),
    })
    const ms = Date.now() - start
    const status = res.status
    const ok = status >= 200 && status < 400

    let seoInfo = ''
    if (ok && url !== '/sitemap.xml' && url !== '/robots.txt' && url !== '/ads.txt' && !url.startsWith('/api')) {
      const html = await res.text()
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      const descMatch  = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
      const canonMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
      const hasSchema  = html.includes('"@context":"https://schema.org"') || html.includes('"@context": "https://schema.org"')
      const hasFaq     = html.includes('"@type":"FAQPage"') || html.includes('"@type": "FAQPage"')

      const title = titleMatch?.[1]?.trim().substring(0, 60) ?? c('red', 'MISSING')
      const desc  = descMatch?.[1]?.trim().substring(0, 80)  ?? c('red', 'MISSING')
      const canon = canonMatch?.[1] ? c('green', '✓') : c('yellow', '⚠ missing')
      const schema = hasSchema ? c('green', '✓') : c('dim', '—')
      const faq    = hasFaq    ? c('green', 'FAQ') : c('dim', '—')

      seoInfo = `\n    title:  ${title}\n    desc:   ${desc}\n    canon: ${canon}  schema: ${schema}  faq: ${faq}`
    }

    const statusColor = ok ? 'green' : status >= 400 ? 'red' : 'yellow'
    const msColor = ms < 800 ? 'green' : ms < 2000 ? 'yellow' : 'red'
    console.log(`${c(statusColor, `[${status}]`)} ${c('bold', name.padEnd(25))} ${c(msColor, `${ms}ms`)}${seoInfo}`)
    return { ok, status, ms }
  } catch (err) {
    const ms = Date.now() - start
    console.log(`${c('red', '[ERR]')} ${c('bold', name.padEnd(25))} ${c('red', err.message)} (${ms}ms)`)
    return { ok: false, status: 0, ms }
  }
}

async function checkApi({ url, name }) {
  const fullUrl = url.startsWith('http') ? url : `${BASE}${url}`
  const start = Date.now()
  try {
    const res = await fetch(fullUrl, { signal: AbortSignal.timeout(15000) })
    const ms = Date.now() - start
    const ok = res.status === 200
    let info = ''
    if (ok) {
      try {
        const data = await res.json()
        if (Array.isArray(data)) info = ` → ${c('cyan', `${data.length} items`)}`
        else if (data?.products) info = ` → ${c('cyan', `${data.products.length} products`)}`
        else if (data?.status) info = ` → ${c('cyan', data.status)}`
      } catch { /* non-json */ }
    }
    const statusColor = ok ? 'green' : 'red'
    const msColor = ms < 1000 ? 'green' : ms < 3000 ? 'yellow' : 'red'
    console.log(`${c(statusColor, `[${res.status}]`)} ${c('bold', name.padEnd(25))} ${c(msColor, `${ms}ms`)}${info}`)
    return { ok, ms }
  } catch (err) {
    const ms = Date.now() - start
    console.log(`${c('red', '[ERR]')} ${c('bold', name.padEnd(25))} ${c('red', err.message)}`)
    return { ok: false, ms }
  }
}

async function main() {
  console.log(`\n${c('bold', '━━━ DealHunter4U Site Audit')} ${c('dim', new Date().toLocaleString('nl-NL'))} ${'━'.repeat(30)}`)
  console.log(`${c('cyan', 'Target:')} ${BASE}\n`)

  console.log(c('bold', '▶ Pages'))
  const pageResults = []
  for (const page of PAGES) {
    const result = await checkPage(page)
    pageResults.push(result)
  }

  console.log(`\n${c('bold', '▶ API Endpoints')}`)
  const apiResults = []
  for (const api of API_CHECKS) {
    const result = await checkApi(api)
    apiResults.push(result)
  }

  const allResults = [...pageResults, ...apiResults]
  const total  = allResults.length
  const passed = allResults.filter(r => r.ok).length
  const failed = total - passed
  const avgMs  = Math.round(allResults.reduce((s, r) => s + r.ms, 0) / total)

  console.log(`\n${c('bold', '━━━ Summary ' + '━'.repeat(50))}`)
  console.log(`  Total:   ${total}`)
  console.log(`  ${c('green', `✓ Passed: ${passed}`)}`)
  if (failed > 0) console.log(`  ${c('red', `✗ Failed: ${failed}`)}`)
  console.log(`  Avg latency: ${avgMs}ms`)
  console.log()

  if (failed > 0) process.exit(1)
}

main().catch(err => { console.error(err); process.exit(1) })
