#!/usr/bin/env node
/**
 * sync-affiliates.mjs
 * Awin + Daisycon API'den onaylı tüm programları çeker,
 * komisyon/cookie bilgilerini gösterir ve affiliate.ts için hazır kod üretir.
 *
 * Kullanım:
 *   AWIN_TOKEN=xxx DAISYCON_TOKEN=xxx node sync-affiliates.mjs
 *
 * Token alma:
 *   Awin:     https://ui.awin.com/user/{userId}/api-credentials  (API key bölümü)
 *   Daisycon: https://my.daisycon.com/settings/api
 *
 * Sadece Awin:     AWIN_TOKEN=xxx node sync-affiliates.mjs
 * Sadece Daisycon: DAISYCON_TOKEN=xxx node sync-affiliates.mjs
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Kimlik bilgileri ──────────────────────────────────────────────────────────
const AWIN_PUBLISHER_ID   = '2932569'
const DAISYCON_MEDIA_ID   = '16070'
const DAISYCON_WEBSITE_ID = '420902'

const AWIN_TOKEN      = process.env.AWIN_TOKEN
const DAISYCON_TOKEN  = process.env.DAISYCON_TOKEN

// ── Mevcut entegrasyon: affiliate.ts'den oku ─────────────────────────────────
function readCurrentIntegrations() {
  try {
    const affiliatePath = join(__dirname, 'frontend-next', 'lib', 'affiliate.ts')
    const content = readFileSync(affiliatePath, 'utf8')
    // AFFILIATE_MAP içindeki key'leri çıkar: 'MarketName': { ...
    const keys = [...content.matchAll(/^\s+'?([^':{}\n]+)'?\s*:\s*\{[^}]*network:\s*'(awin|daisycon|bol|direct)'/gm)]
      .map(m => ({ name: m[1].trim().replace(/^'|'$/g, ''), network: m[2] }))
    return keys
  } catch {
    return []
  }
}

// ── Yardımcılar ───────────────────────────────────────────────────────────────
function normalizeUrl(raw) {
  if (!raw) return ''
  const s = raw.trim()
  if (s.startsWith('http')) return s.replace(/\/$/, '')
  return 'https://' + s.replace(/\/$/, '')
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ═══════════════════════════════════════════════════════════════════════════════
// AWIN
// ═══════════════════════════════════════════════════════════════════════════════

async function fetchAwinPrograms() {
  if (!AWIN_TOKEN) {
    console.log('[Awin] AWIN_TOKEN eksik — atlanıyor')
    return []
  }

  const headers = {
    'Authorization': `Bearer ${AWIN_TOKEN}`,
    'Accept': 'application/json',
  }

  // 1) Tüm joined (onaylı) programları çek
  console.log('\n🔗 [Awin] Onaylı programlar çekiliyor...')
  const url = `https://api.awin.com/publishers/${AWIN_PUBLISHER_ID}/programmes/?relationship=joined`
  const res = await fetch(url, { headers })

  if (!res.ok) {
    const text = await res.text()
    console.error(`[Awin] Hata ${res.status}: ${text}`)
    return []
  }

  const programmes = await res.json()
  if (!Array.isArray(programmes) || programmes.length === 0) {
    console.log('[Awin] Onaylı program bulunamadı.')
    return []
  }

  console.log(`[Awin] ${programmes.length} onaylı program bulundu. Komisyon detayları çekiliyor...`)

  // 2) Her program için komisyon grubunu çek (rate-limit: 1 istek/san)
  const results = []
  for (let i = 0; i < programmes.length; i++) {
    const p = programmes[i]
    const merchantId = String(p.id ?? p.merchantId ?? '')
    const name = p.name ?? p.merchantName ?? ''
    const destUrl = normalizeUrl(p.displayUrl ?? p.clickThroughUrl ?? p.url ?? '')
    const sector = p.primarySector ?? ''

    let commission = null
    let cookieDays = null

    try {
      const cgUrl = `https://api.awin.com/publishers/${AWIN_PUBLISHER_ID}/commissiongroups/?programmeId=${merchantId}`
      const cgRes = await fetch(cgUrl, { headers })
      if (cgRes.ok) {
        const cgData = await cgRes.json()
        // [{programmeId, commissionGroups:[{type,percentage,amount,currency}]}]
        const groups = Array.isArray(cgData)
          ? cgData[0]?.commissionGroups
          : cgData?.commissionGroups
        if (groups?.length > 0) {
          const g = groups[0]
          if (g.type === 'percentage' && g.percentage > 0) commission = `%${g.percentage}`
          else if (g.amount > 0) commission = `€${g.amount} ${g.currency ?? ''}`.trim()
        }
      }
    } catch {
      // komisyon çekilemedi, devam
    }

    // Cookie window — Awin program detay endpoint'i (v6)
    try {
      const detailUrl = `https://api.awin.com/publishers/${AWIN_PUBLISHER_ID}/programmes/${merchantId}`
      const dRes = await fetch(detailUrl, { headers })
      if (dRes.ok) {
        const d = await dRes.json()
        cookieDays = d.cookiePolicy ?? d.cookiePeriod ?? d.cookieDays ?? null
      }
    } catch {
      // detay çekilemedi
    }

    results.push({ merchantId, name, destUrl, sector, commission, cookieDays })

    // Rate-limit: 300ms aralık
    if (i < programmes.length - 1) await sleep(300)
  }

  return results
}

function printAwinResults(programs, integrated) {
  if (programs.length === 0) return

  const integratedIds = new Set(
    integrated.filter(i => i.network === 'awin').map(i => i.name.toLowerCase())
  )

  console.log('\n══════════════════════════════════════════')
  console.log('  AWIN — Onaylı Programlar')
  console.log('══════════════════════════════════════════')

  const newOnes = []
  for (const p of programs) {
    const isNew = !integratedIds.has(p.name.toLowerCase())
    const status = isNew ? '🆕' : '✅'
    const comm = p.commission ? `  komisyon: ${p.commission}` : ''
    const cookie = p.cookieDays ? `  cookie: ${p.cookieDays}g` : ''
    console.log(`${status} [${p.merchantId}] ${p.name}`)
    console.log(`    ${p.destUrl}  ${p.sector}${comm}${cookie}`)
    if (isNew) newOnes.push(p)
  }

  if (newOnes.length === 0) {
    console.log('\n  Tüm programlar affiliate.ts\'de zaten entegre.')
    return
  }

  console.log('\n── affiliate.ts\'e eklenecek yeni girişler ──────────────────')
  for (const p of newOnes) {
    const commComment = p.commission
      ? ` — ${p.commission} komisyon${p.cookieDays ? `, ${p.cookieDays}g cookie` : ''}`
      : ''
    console.log(`  // ${p.name}${commComment}`)
    console.log(`  '${p.name}': { destinationUrl: '${p.destUrl}/', network: 'awin', programId: '${p.merchantId}', rel: REL },`)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DAISYCON
// ═══════════════════════════════════════════════════════════════════════════════

async function fetchDaisyconPrograms() {
  if (!DAISYCON_TOKEN) {
    console.log('[Daisycon] DAISYCON_TOKEN eksik — atlanıyor')
    return []
  }

  const headers = {
    'Authorization': `Bearer ${DAISYCON_TOKEN}`,
    'Accept': 'application/json',
  }

  console.log('\n🔗 [Daisycon] Onaylı programlar çekiliyor...')

  let page = 1
  const approved = []

  while (true) {
    const url = `https://services.daisycon.com/publishers/${DAISYCON_MEDIA_ID}/programs?per_page=100&page=${page}`
    const res = await fetch(url, { headers })

    if (!res.ok) {
      const text = await res.text()
      console.error(`[Daisycon] Hata ${res.status}: ${text}`)
      break
    }

    const data = await res.json()
    const items = Array.isArray(data) ? data : (data.data ?? data.programs ?? [])
    if (items.length === 0) break

    for (const p of items) {
      const status = (p.status ?? p.relationship ?? '').toLowerCase()
      if (!['accepted', 'active', 'approved'].includes(status)) continue

      // Tüm medya/website kombinasyonlarını incele
      const medias = p.medias ?? p.websites ?? []
      const ourMedia = medias.find(m =>
        String(m.id ?? m.media_id ?? m.si ?? '') === DAISYCON_MEDIA_ID
      )

      approved.push({
        programId: String(p.id ?? p.program_id ?? p.advertiser_id ?? ''),
        name: p.name ?? p.program_name ?? p.advertiser_name ?? '',
        destUrl: normalizeUrl(p.url ?? p.website_url ?? p.website ?? ''),
        status,
        commission: p.commission_percent
          ? `%${p.commission_percent}`
          : p.commission_fixed
          ? `€${p.commission_fixed}`
          : p.commission ?? null,
        cookieDays: p.cookie_duration ?? p.cookie_days ?? p.cookiePeriod ?? null,
        // Spesifik tracking linki (li parametresi)
        li: String(ourMedia?.program_id ?? ourMedia?.li ?? p.id ?? ''),
      })
    }

    if (items.length < 100) break
    page++
    await sleep(200)
  }

  return approved
}

async function fetchDaisyconProgramDetail(programId, headers) {
  try {
    const url = `https://services.daisycon.com/publishers/${DAISYCON_MEDIA_ID}/programs/${programId}`
    const res = await fetch(url, { headers })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

function printDaisyconResults(programs, integrated) {
  if (programs.length === 0) return

  const integratedNames = new Set(
    integrated.filter(i => i.network === 'daisycon').map(i => i.name.toLowerCase())
  )

  console.log('\n══════════════════════════════════════════')
  console.log('  DAISYCON — Onaylı Kampanyalar')
  console.log('══════════════════════════════════════════')

  const newOnes = []
  for (const p of programs) {
    const isNew = !integratedNames.has(p.name.toLowerCase())
    const status = isNew ? '🆕' : '✅'
    const liDisplay = p.li !== p.programId ? ` (li: ${p.li})` : ''
    const comm = p.commission ? `  komisyon: ${p.commission}` : ''
    const cookie = p.cookieDays ? `  cookie: ${p.cookieDays}g` : ''
    console.log(`${status} [${p.programId}]${liDisplay} ${p.name}`)
    console.log(`    ${p.destUrl}${comm}${cookie}`)
    if (isNew) newOnes.push(p)
  }

  if (newOnes.length === 0) {
    console.log('\n  Tüm kampanyalar affiliate.ts\'de zaten entegre.')
    return
  }

  console.log('\n── affiliate.ts\'e eklenecek yeni girişler ──────────────────')
  for (const p of newOnes) {
    const commComment = p.commission
      ? ` — ${p.commission} komisyon${p.cookieDays ? `, ${p.cookieDays}g cookie` : ''}`
      : ''
    const liParam = p.li || p.programId
    console.log(`  // ${p.name}${commComment}`)
    console.log(`  '${p.name}': { destinationUrl: '${p.destUrl}/', network: 'daisycon', programId: '${liParam}', rel: REL },`)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║  DealHunter — Affiliate Sync             ║')
  console.log(`║  ${new Date().toLocaleString('nl-NL').padEnd(40)}║`)
  console.log('╚══════════════════════════════════════════╝')

  if (!AWIN_TOKEN && !DAISYCON_TOKEN) {
    console.error('\n❌ Hiçbir token ayarlı değil.')
    console.error('   AWIN_TOKEN=xxx DAISYCON_TOKEN=xxx node sync-affiliates.mjs')
    process.exit(1)
  }

  const integrated = readCurrentIntegrations()
  console.log(`\n📋 affiliate.ts'de mevcut entegrasyon: ${integrated.length} market`)

  const [awinPrograms, daisyconPrograms] = await Promise.all([
    fetchAwinPrograms(),
    fetchDaisyconPrograms(),
  ])

  printAwinResults(awinPrograms, integrated)
  printDaisyconResults(daisyconPrograms, integrated)

  // Özet
  const awinNew = awinPrograms.filter(p =>
    !integrated.some(i => i.name.toLowerCase() === p.name.toLowerCase())
  ).length
  const dcNew = daisyconPrograms.filter(p =>
    !integrated.some(i => i.name.toLowerCase() === p.name.toLowerCase())
  ).length

  console.log('\n══════════════════════════════════════════')
  console.log(`  Awin     → ${awinPrograms.length} onaylı, ${awinNew} yeni`)
  console.log(`  Daisycon → ${daisyconPrograms.length} onaylı, ${dcNew} yeni`)
  console.log(`  affiliate.ts'de toplam: ${integrated.length} entegre`)
  console.log('══════════════════════════════════════════\n')
}

main().catch(err => {
  console.error('❌ Beklenmedik hata:', err)
  process.exit(1)
})
