#!/usr/bin/env node
/**
 * Controleert data/affiliates.json tegen het Daisycon-paneel.
 *
 * Waarom dit bestaat: op 2026-08-19 bleken 3 van de 12 affiliate-links in de
 * WhatsApp-rotatie dood (Bjorn Borg en McAfee opgeheven, Smartbox 503) terwijl
 * ze 3x per dag de groep in gingen. Niemand merkte het, want er was geen check.
 *
 * ZONDER KLIKKEN. Een trackinglink aanklikken telt in het netwerk als klik; met
 * ~10 links per controle vervuil je precies de cijfers die je probeert te lezen.
 * Daarom via het paneel: /api/publishers/{id}/programs?status=joined en matchen
 * op programId. Staat een programma niet in die lijst, dan is de link dood.
 *
 * Gebruik:  node scripts/affiliate-check.mjs
 * Vereist:  een Chrome-profiel waarin Daisycon is ingelogd (zie hieronder).
 *           Inloggen kan niet automatisch — open het profiel handmatig:
 *           chrome --user-data-dir=C:\Users\ASUS\Downloads\daisycon-profile
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const PROFIEL = process.env.DAISYCON_PROFIEL || 'C:/Users/ASUS/Downloads/daisycon-profile'
const CHROME = process.env.CHROME_PAD || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PUBLISHER = '478402'
const PANEEL = 'https://my.daisycon.com/publisher/campaigns/overview'

const slaap = (ms) => new Promise(r => setTimeout(r, ms))

async function haalProgrammas() {
  const browser = await puppeteer.launch({
    headless: false, executablePath: CHROME, userDataDir: PROFIEL,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-first-run', '--no-default-browser-check'],
  })
  let auth = null
  let cookie = ''
  try {
    const page = (await browser.pages())[0] || await browser.newPage()
    // Het token zit niet in een cookie maar in de Authorization-header die de
    // SPA zelf meestuurt; alleen cookies geven 401.
    page.on('request', r => {
      const h = r.headers()
      if (/my\.daisycon\.com\/api\//.test(r.url()) && h['authorization']) auth = h['authorization']
    })
    await page.goto(PANEEL, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {})
    await slaap(13000)
    if (/login\.daisycon/.test(page.url())) {
      throw new Error(`Daisycon-sessie verlopen. Open het profiel handmatig en log in:\n  chrome --user-data-dir=${PROFIEL}`)
    }
    cookie = (await page.cookies('https://my.daisycon.com')).map(c => `${c.name}=${c.value}`).join('; ')
  } finally {
    await browser.close()
  }
  if (!auth) throw new Error('Geen Authorization-header opgevangen — paneel niet volledig geladen?')

  const alles = []
  for (let p = 1; p <= 30; p++) {
    const url = `https://my.daisycon.com/api/publishers/${PUBLISHER}/programs?status=joined&page=${p}&per_page=200`
    const res = await fetch(url, {
      headers: {
        Authorization: auth, Cookie: cookie, Accept: 'application/json',
        Referer: PANEEL, Origin: 'https://my.daisycon.com',
      },
      signal: AbortSignal.timeout(40000),
    })
    if (!res.ok) throw new Error(`Paneel-API ${res.status} op pagina ${p}`)
    const j = await res.json()
    const rij = Array.isArray(j) ? j : (j.data ?? [])
    alles.push(...rij)
    if (rij.length < 200) break
  }
  return alles
}

const affiliates = JSON.parse(fs.readFileSync(path.join(DIR, '..', 'data', 'affiliates.json'), 'utf8'))
const programmas = await haalProgrammas()
const opId = new Set(programmas.map(p => String(p.id)))

console.log(`Daisycon: ${programmas.length} actieve programma's`)
console.log(`Lijst   : ${affiliates.length} affiliates\n`)

const dood = []
for (const a of affiliates) {
  if (!a.programId) {
    console.log(`  ${a.id.padEnd(20)} — geen Daisycon (${/awin/.test(a.url) ? 'Awin' : 'overig'}), niet te controleren`)
    continue
  }
  const leeft = opId.has(String(a.programId))
  console.log(`  ${a.id.padEnd(20)} ${leeft ? '✅ actief' : '❌ PROGRAMMA WEG'}  (program ${a.programId})`)
  if (!leeft) dood.push(a)
}

if (dood.length) {
  console.error(`\n${dood.length} dode link(s) in data/affiliates.json: ${dood.map(d => d.id).join(', ')}`)
  console.error('Verwijder ze of vervang de trackinglink voordat ze weer de groep in gaan.')
  process.exit(1)
}
console.log('\nAlles actief.')
