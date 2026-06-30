#!/usr/bin/env node
/**
 * WhatsApp Deal Sender
 * Sends a random deal (supermarket product or affiliate) to the WhatsApp group.
 * Called by GitHub Actions cron at 08:00, 11:00, 14:00, 17:00, 20:00 CEST.
 *
 * Required env vars:
 *   GREEN_API_INSTANCE_ID  - Green API instance ID (from greenapi.com dashboard)
 *   GREEN_API_TOKEN        - Green API token
 *   WHATSAPP_GROUP_ID      - WhatsApp group chat ID (format: 120363XXXXXXXXX@g.us)
 */

const INSTANCE_ID = process.env.GREEN_API_INSTANCE_ID
const API_TOKEN   = process.env.GREEN_API_TOKEN
const GROUP_ID    = process.env.WHATSAPP_GROUP_ID
const RAILWAY_API = 'https://dealhunter-production-d900.up.railway.app'
const SITE_URL    = 'https://www.dealhunter4u.nl'

// ---------------------------------------------------------------------------
// Affiliate deals (sourced from MeerBesparenWidget)
// ---------------------------------------------------------------------------
const AFFILIATE_DEALS = [
  { name: 'Bol.com',          emoji: '📦', tagline: 'Dagelijks nieuwe topdeals',         url: `${SITE_URL}/supermarkt/albert-heijn` },
  { name: 'Holland & Barrett', emoji: '🌿', tagline: 'Megaweek 3=1 t/m 12 juli!',         url: 'https://www.awin1.com/cread.php?awinmid=8108&awinaffid=2932569&ued=' + encodeURIComponent('https://www.hollandandbarrett.nl/shop/aanbiedingen/') },
  { name: 'Ziggo',             emoji: '📡', tagline: 'Internet, TV & bellen aanbieding',  url: 'https://jf79.net/c/?si=17174&li=1742299&wi=420902&dl=' + encodeURIComponent('https://www.meervoordeel.nl/providers/ziggo/') },
  { name: "Levi's",            emoji: '👖', tagline: 'Jeans & kleding sale',              url: 'https://glp8.net/c/?si=19949&li=1850890&wi=420902' },
  { name: 'Plein.nl',          emoji: '💊', tagline: 'Drogist & gezondheid online',       url: 'https://fr135.net/c/?si=3366&li=1161224&wi=420902&dl=' + encodeURIComponent('https://www.plein.nl/') },
  { name: 'Smartbox & Bongo',  emoji: '🎁', tagline: 'Cadeaubon voor een beleving',      url: 'https://glp8.net/c/?si=21185&li=1902306&wi=420902&dl=' + encodeURIComponent('https://www.smartbox.com/nl-nl/') },
  { name: 'Bjorn Borg',        emoji: '👟', tagline: 'Sportkleding & ondergoed sale',    url: 'https://bdt9.net/c/?si=18683&li=1810656&wi=420902&dl=' + encodeURIComponent('https://www.bjornborg.com/nl-nl/') },
  { name: 'Oakley',            emoji: '🕶️', tagline: 'Sport brillen & kleding',          url: 'https://bdt9.net/c/?si=18433&li=1819889&wi=420902&dl=' + encodeURIComponent('https://www.oakley.com/nl-nl/') },
  { name: 'McAfee',            emoji: '🔒', tagline: 'Antivirus & internetsecurity deal', url: 'https://glp8.net/c/?si=20283&li=1865780&wi=420902&dl=' + encodeURIComponent('https://www.mcafee.com/nl-nl/') },
  { name: 'XLLease',           emoji: '🚗', tagline: 'Private lease aanbiedingen',        url: 'https://fr135.net/c/?si=20255&li=1864272&wi=420902&dl=' + encodeURIComponent('https://www.xllease.nl/') },
  { name: 'noSun',             emoji: '☀️', tagline: 'Zonnepanelen voor thuis',           url: 'https://dt51.net/c/?si=19142&li=1877489&wi=420902&dl=' + encodeURIComponent('https://www.nosun.nl/') },
  { name: 'Leukstetickets',    emoji: '🎭', tagline: 'Uitjes, events & shows',            url: 'https://lt45.net/c/?si=15805&li=1684191&wi=420902&dl=' + encodeURIComponent('https://www.leukstetickets.nl/') },
]

// Market slug mapping for site URLs
const MARKET_SLUGS = {
  'Albert Heijn': 'albert-heijn',
  'Jumbo':        'jumbo',
  'Lidl':         'lidl',
  'Dirk':         'dirk',
  'Aldi':         'aldi',
  'Hoogvliet':    'hoogvliet',
  'Vomar':        'vomar',
  'DekaMarkt':    'dekamarkt',
  'Coop':         'coop',
  'Plus':         'plus',
  'Kruidvat':     'kruidvat',
}

// ---------------------------------------------------------------------------
// Fetch random supermarket product (prefer high-discount items)
// ---------------------------------------------------------------------------
async function getRandomProduct() {
  try {
    const res = await fetch(`${RAILWAY_API}/api/products`, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) return null
    const products = await res.json()
    if (!Array.isArray(products) || products.length === 0) return null

    const highDiscount = products.filter(p => p.discount >= 30)
    const pool = highDiscount.length >= 5 ? highDiscount : products
    return pool[Math.floor(Math.random() * pool.length)]
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Message formatters
// ---------------------------------------------------------------------------
function formatProductMessage(p) {
  const slug = MARKET_SLUGS[p.market] ?? p.market.toLowerCase().replace(/\s+/g, '-')
  const link = `${SITE_URL}/supermarkt/${slug}`
  const orig = `€${p.originalPrice.toFixed(2).replace('.', ',')}`
  const disc = `€${p.discountedPrice.toFixed(2).replace('.', ',')}`
  const exp  = p.expiresAt ? new Date(p.expiresAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' }) : null

  const lines = [
    `🔥 *Aanbieding van de dag!*`,
    ``,
    `🛒 *${p.name}*`,
    `🏪 ${p.market}  |  📉 -*${p.discount}%* korting`,
    `💰 ~${orig}~ → *${disc}*`,
  ]
  if (exp) lines.push(`📅 Geldig t/m ${exp}`)
  lines.push(``, `👉 Meer deals: ${link}`, ``, `🤖 _DealHunter4U · Elke dag besparen_`)
  return lines.join('\n')
}

function formatAffiliateMessage(deal) {
  return [
    `💡 *Deal tip van DealHunter4U!*`,
    ``,
    `${deal.emoji} *${deal.name}*`,
    `${deal.tagline}`,
    ``,
    `👉 ${deal.url}`,
    ``,
    `🤖 _DealHunter4U · Elke dag besparen_`,
  ].join('\n')
}

// ---------------------------------------------------------------------------
// Green API sender
// ---------------------------------------------------------------------------
async function sendWhatsApp(message) {
  const url = `https://api.green-api.com/waInstance${INSTANCE_ID}/sendMessage/${API_TOKEN}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId: GROUP_ID, message }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Green API ${res.status}: ${body}`)
  }
  return res.json()
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  if (!INSTANCE_ID || !API_TOKEN || !GROUP_ID) {
    throw new Error('Missing env vars: GREEN_API_INSTANCE_ID, GREEN_API_TOKEN, WHATSAPP_GROUP_ID')
  }

  // Affiliate uren (UTC): 07:00, 10:00, 13:00 = 09:00, 12:00, 15:00 CEST
  const utcHour = new Date().getUTCHours()
  const affiliateHours = new Set([7, 10, 13])

  let message

  if (affiliateHours.has(utcHour)) {
    const deal = AFFILIATE_DEALS[Math.floor(Math.random() * AFFILIATE_DEALS.length)]
    message = formatAffiliateMessage(deal)
    console.log(`Sending affiliate: ${deal.name}`)
  } else {
    const product = await getRandomProduct()
    if (product) {
      message = formatProductMessage(product)
      console.log(`Sending product: ${product.name} (${product.market}, -${product.discount}%)`)
    } else {
      const deal = AFFILIATE_DEALS[Math.floor(Math.random() * AFFILIATE_DEALS.length)]
      message = formatAffiliateMessage(deal)
      console.log(`API empty, fallback affiliate: ${deal.name}`)
    }
  }

  const result = await sendWhatsApp(message)
  console.log('Sent OK:', result)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
