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

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { productKaart, affiliateKaart } from './lib/deal-card.mjs'

const DIR = path.dirname(fileURLToPath(import.meta.url))

const INSTANCE_ID = process.env.GREEN_API_INSTANCE_ID
const API_TOKEN   = process.env.GREEN_API_TOKEN
const GROUP_ID    = process.env.WHATSAPP_GROUP_ID
const RAILWAY_API = 'https://dealhunter-production-d900.up.railway.app'

// ---------------------------------------------------------------------------
// Affiliate deals — ENIGE bron: data/affiliates.json
// Stond hier als hardgecodeerde lijst; die liep uit de pas met de site en op
// 2026-08-19 waren 3 van de 12 links dood (Bjorn Borg en McAfee opgeheven,
// Smartbox 503) terwijl ze 3x per dag de groep in gingen.
// ---------------------------------------------------------------------------
const AFFILIATE_DEALS = JSON.parse(
  fs.readFileSync(path.join(DIR, '..', 'data', 'affiliates.json'), 'utf8')
).filter(d => (d.kanallar ?? ['whatsapp']).includes('whatsapp') && d.url)

// ---------------------------------------------------------------------------
// Fetch random supermarket product (prefer high-discount items)
// ---------------------------------------------------------------------------
// 2026-09-03: de catch slikte elke fout. Dit script draait 8x per dag en valt bij
// een lege API terug op een affiliate — dus een haperende fetch betekent stilletjes
// alléén nog affiliate-posts, met "API empty" in de log terwijl er in werkelijkheid
// niets opgehaald kón worden. Dat verschil is maanden onzichtbaar. Nu één retry en
// een expliciete reden in de log.
async function fetchProducts(attempt = 1) {
  try {
    const res = await fetch(`${RAILWAY_API}/api/products`, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const products = await res.json()
    if (!Array.isArray(products)) throw new Error('no array returned')
    return products
  } catch (err) {
    if (attempt === 1) {
      console.warn(`Product fetch failed (${err.message}) — retrying once`)
      return fetchProducts(2)
    }
    console.error(`Product fetch failed permanently: ${err.message}`)
    return null
  }
}

async function getRandomProduct() {
  const products = await fetchProducts()
  if (!products) return null
  if (products.length === 0) {
    console.error('API returned 0 products')
    return null
  }

  const highDiscount = products.filter(p => p.discount >= 30)
  const pool = highDiscount.length >= 5 ? highDiscount : products
  return pool[Math.floor(Math.random() * pool.length)]
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
    message = affiliateKaart(deal, { kanaal: 'whatsapp' })
    console.log(`Sending affiliate: ${deal.naam}`)
  } else {
    const product = await getRandomProduct()
    if (product) {
      message = productKaart(product, { kanaal: 'whatsapp' })
      console.log(`Sending product: ${product.name} (${product.market}, -${product.discount}%)`)
    } else {
      const deal = AFFILIATE_DEALS[Math.floor(Math.random() * AFFILIATE_DEALS.length)]
      message = affiliateKaart(deal, { kanaal: 'whatsapp' })
      console.log(`API empty, fallback affiliate: ${deal.naam}`)
    }
  }

  const result = await sendWhatsApp(message)
  console.log('Sent OK:', result)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
