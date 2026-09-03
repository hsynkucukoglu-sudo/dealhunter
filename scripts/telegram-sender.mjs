#!/usr/bin/env node
/**
 * Telegram Deal Sender — zelfde kaart als WhatsApp, ander kanaal.
 *
 * De opmaak komt uit scripts/lib/deal-card.mjs en de affiliatelijst uit
 * data/affiliates.json; beide gedeeld met whatsapp-sender.mjs. Kopieer hier
 * niets naartoe — dat is precies hoe de WhatsApp-lijst stilletjes 3 dode links
 * kreeg (zie docs/dagitim-otomasyonu-plani.md, Faz 0).
 *
 * Verschil met WhatsApp: producten gaan als foto met bijschrift de lucht in.
 * Telegram toont die groot in de tijdlijn en de kaart heeft al een imageUrl —
 * WhatsApp-groepen krijgen alleen tekst.
 *
 * Env:
 *   TELEGRAM_BOT_TOKEN  — van @BotFather
 *   TELEGRAM_CHAT_ID    — '@kanaalnaam' of numeriek id; bot moet beheerder zijn
 *
 * Droogdraaien (verstuurt niets):  node scripts/telegram-sender.mjs --dry
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { productKaart, affiliateKaart } from './lib/deal-card.mjs'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID
const RAILWAY_API = 'https://dealhunter-production-d900.up.railway.app'
const DROOG = process.argv.includes('--dry')

const AFFILIATE_DEALS = JSON.parse(
  fs.readFileSync(path.join(DIR, '..', 'data', 'affiliates.json'), 'utf8')
).filter(d => (d.kanallar ?? ['whatsapp']).includes('telegram') && d.url)

// 2026-09-03: de catch slikte elke fout en gaf null terug, waarna main() meldde
// "Geen product met afbeelding" — een misleidende boodschap, want de echte oorzaak
// was meestal een hapering in het ophalen. Bij een droogloop op 03-09 faalde de
// eerste poging en slaagden de drie volgende: puur transient. Nu één retry en een
// logregel die de werkelijke reden noemt, zodat een stille uitval opvalt.
async function haalProducten(poging = 1) {
  try {
    const res = await fetch(`${RAILWAY_API}/api/products`, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const producten = await res.json()
    if (!Array.isArray(producten)) throw new Error('geen array terug')
    return producten
  } catch (err) {
    if (poging === 1) {
      console.warn(`API ophalen mislukt (${err.message}) — één retry`)
      return haalProducten(2)
    }
    console.error(`API ophalen definitief mislukt: ${err.message}`)
    return null
  }
}

async function willekeurigProduct() {
  const producten = await haalProducten()
  if (!producten) return null
  if (!producten.length) {
    console.error('API gaf 0 producten terug')
    return null
  }
  const hoog = producten.filter(p => p.discount >= 30 && p.imageUrl)
  const pool = hoog.length >= 5 ? hoog : producten.filter(p => p.imageUrl)
  if (!pool.length) {
    console.error(`API gaf ${producten.length} producten, maar geen enkele met imageUrl`)
    return null
  }
  return pool[Math.floor(Math.random() * pool.length)]
}

async function telegram(methode, body) {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${methode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, ...body }),
    signal: AbortSignal.timeout(20000),
  })
  const json = await res.json().catch(() => ({}))
  // Telegram antwoordt met HTTP 200 én ok:false; alleen res.ok checken is niet genoeg.
  if (!res.ok || json.ok === false) {
    throw new Error(`Telegram ${methode} mislukt (${res.status}): ${json.description ?? JSON.stringify(json).slice(0, 200)}`)
  }
  return json
}

async function main() {
  if (!DROOG && (!TOKEN || !CHAT_ID)) {
    throw new Error('Ontbrekende env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID')
  }
  if (!AFFILIATE_DEALS.length) {
    console.log('Let op: geen affiliate met kanaal "telegram" in data/affiliates.json')
  }

  // Zelfde ritme als WhatsApp: affiliate op 07/10/13 UTC, anders een product.
  const uurUtc = new Date().getUTCHours()
  const affiliateUren = new Set([7, 10, 13])

  let methode, body, wat

  if (affiliateUren.has(uurUtc) && AFFILIATE_DEALS.length) {
    const deal = AFFILIATE_DEALS[Math.floor(Math.random() * AFFILIATE_DEALS.length)]
    methode = 'sendMessage'
    body = { text: affiliateKaart(deal, { kanaal: 'telegram' }), parse_mode: 'HTML' }
    wat = `affiliate: ${deal.naam}`
  } else {
    const p = await willekeurigProduct()
    if (!p) throw new Error('Geen product met afbeelding uit de API — niets verstuurd')
    const tekst = productKaart(p, { kanaal: 'telegram' })
    methode = 'sendPhoto'
    body = { photo: p.imageUrl, caption: tekst, parse_mode: 'HTML' }
    wat = `product: ${p.name} (${p.market}, -${p.discount}%)`
  }

  if (DROOG) {
    console.log(`[droog] ${methode} — ${wat}\n`)
    console.log(body.caption ?? body.text)
    return
  }

  console.log(`Versturen ${wat}`)
  try {
    await telegram(methode, body)
  } catch (e) {
    // Een productfoto kan geweigerd worden (hotlink-blokkade, te groot). De deal
    // is dan nog steeds het versturen waard — val terug op tekst.
    if (methode === 'sendPhoto') {
      console.log(`Foto geweigerd (${e.message.slice(0, 90)}) — tekst als terugval`)
      await telegram('sendMessage', { text: body.caption, parse_mode: 'HTML' })
    } else {
      throw e
    }
  }
  console.log('Verstuurd.')
}

main().catch(err => {
  console.error(err.message)
  process.exit(1)
})
