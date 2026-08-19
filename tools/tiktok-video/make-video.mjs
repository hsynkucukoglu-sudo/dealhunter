// DealHunter4U — haftalık TikTok videosu üretici (tek komut)
// Akış: canlı API'den top 5 deal → animasyonlu HTML → Playwright kaydı → mp4
// Kullanım:  cd tools/tiktok-video && npm i && node make-video.mjs
// Çıktı:     out/dealhunter-top5-weekNN.mp4  (1080x1920, ~21sn, H.264)
// Not: playwright global kurulumdan çözülür (repo'ya browser indirmemek için).
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { EDITIES, planVoorDag, isoWeek } from './editions.mjs'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(DIR, 'out')
const API = 'https://dealhunter-production-d900.up.railway.app'
const HOOK = 2.4, CARD = 3.0, OUTRO = 3.6

const MARKET_COLORS = {
  'Albert Heijn': '#00A0E2', Jumbo: '#FFD700', Lidl: '#0050AA', Dirk: '#C8102E',
  Aldi: '#00205B', Hoogvliet: '#164194', Vomar: '#FF6600', DekaMarkt: '#006633',
  Coop: '#007B5E', Plus: '#2D8B35', Kruidvat: '#D50032',
}

// Bovengrens voor de korting die in de video mag verschijnen.
//
// Deze selectie pakt per definitie de uiterste staart van de dataset, en dat is precies
// waar prijsfouten zitten. Meting 2026-08-02 over 1257 afgeprijsde producten: het aandeel
// met eenheidsdata (waarmee een prijs per kg/l te controleren is) zakt van 62% bij <40%
// korting naar 25% bij 60-69%, en naar 0% zodra de korting boven de 70% komt. In die
// bovenste band stond o.a. "AH Varkenshaas €6,00 → €1,09 (-82%)" — varkenshaas kost geen
// €1,09, dat is een prijs per 100 gram die tegen een pakprijs is afgezet.
//
// Boven deze grens dus niet tonen. Let op: 3-halen-1-betalen-acties (Plus Lenor
// €29,97 → €9,99) komen op ~67% uit en zijn wél echt; die blijven bewust staan.
const MAX_DISCOUNT = Number(process.env.MAX_DISCOUNT ?? 70)
const MIN_DISCOUNT = Number(process.env.MIN_DISCOUNT ?? 20)

// ─── 1. Veri: kullanılabilir ürün havuzu (seçimi editie yapar) ───────────────
async function fetchPool() {
  const res = await fetch(`${API}/api/products`)
  if (!res.ok) throw new Error(`API ${res.status}`)
  const all = await res.json()
  const pool = []
  const dropped = []
  for (const p of all) {
    if (!p.imageUrl || !p.originalPrice || p.originalPrice <= p.discountedPrice) continue
    const disc = Math.round((p.originalPrice - p.discountedPrice) / p.originalPrice * 100)
    if (disc < MIN_DISCOUNT) continue
    if (disc >= MAX_DISCOUNT) {
      // Niet stil weggooien: als hier structureel echte deals sneuvelen wil je dat zien.
      dropped.push(`${p.market} ${p.name} -${disc}% (€${p.originalPrice}→€${p.discountedPrice})`)
      continue
    }
    pool.push({
      name: p.name, market: p.market, orig: p.originalPrice, price: p.discountedPrice,
      disc, img: p.imageUrl, category: p.category, campaignType: p.campaignType,
    })
  }
  if (dropped.length) {
    console.log(`⚠️  ${dropped.length} product overgeslagen (korting ≥ ${MAX_DISCOUNT}%, niet te verifiëren):`)
    dropped.forEach(d => console.log(`     ${d}`))
  }
  return pool
}

// ─── 2. HTML şablonu ──────────────────────────────────────────────────────────
const PROXY_HOSTS = ['static.ah.nl', 'media.kruidvat.nl']
const imgSrc = (url) => PROXY_HOSTS.some(h => url.includes(h))
  ? 'https://www.dealhunter4u.nl/api/img-proxy?u=' + encodeURIComponent(url)
  : url
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const fmt = (n) => '€' + n.toFixed(2).replace('.', ',')

// De hook-titel wisselt per editie: "TOP 5" is kort, "KASSAKOOPJES" of
// "GROENTE & FRUIT" niet. Met een vaste 230px liep de tekst buiten beeld
// (gemeten 2026-08-19 op de kassakoopjes-editie), dus schaalt hij mee.
function hookFontSize(titel) {
  const zichtbaar = titel.replace(/<[^>]+>/g, '')
  if (zichtbaar.length <= 6) return 230
  if (zichtbaar.length <= 9) return 165
  if (zichtbaar.length <= 13) return 122
  return 96
}

function buildHtml(deals, week, hook) {
  const ranked = [...deals].sort((a, b) => a.disc - b.disc) // #5'ten #1'e
  const total = HOOK + ranked.length * CARD + OUTRO

  const cardScenes = ranked.map((d, i) => {
    const rank = ranked.length - i
    const start = HOOK + i * CARD
    const color = MARKET_COLORS[d.market] || '#1A1A1A'
    return `
  <div class="scene card-scene" style="animation-delay:${start}s, ${start + CARD - 0.35}s">
    <div class="rank" style="color:${color}">#${rank}</div>
    <div class="card">
      <div class="imgwrap"><img src="${imgSrc(d.img)}" onerror="this.style.display='none';this.parentElement.classList.add('noimg')"><span class="fallback">🛒</span></div>
      <div class="pname">${esc(d.name)}</div>
      <div class="mpill" style="background:${color}">${esc(d.market)}</div>
      <div class="prices"><span class="old">${fmt(d.orig)}</span><span class="new">${fmt(d.price)}</span></div>
      <div class="dbadge">-${d.disc}%</div>
    </div>
    <div class="dots">${ranked.map((_, j) => `<span class="${j === i ? 'on' : ''}"></span>`).join('')}</div>
  </div>`
  }).join('\n')

  return `<!doctype html><html><head><meta charset="utf-8"><style>
* { margin:0; padding:0; box-sizing:border-box; }
html,body { width:1080px; height:1920px; overflow:hidden; background:#F5EDE3;
  font-family:'Segoe UI', Arial, sans-serif; }
.topbar { position:fixed; top:0; left:0; right:0; z-index:50; display:flex;
  justify-content:space-between; align-items:center; padding:44px 56px; }
.logo { font-size:52px; font-weight:900; color:#1A1A1A; }
.logo b { color:#E33D26; }
.weekpill { font-size:36px; font-weight:700; color:#fff; background:#1A1A1A;
  padding:14px 32px; border-radius:999px; font-family:Consolas, monospace; }
.scene { position:absolute; inset:0; display:flex; flex-direction:column;
  align-items:center; justify-content:center; opacity:0;
  animation: sceneIn .45s cubic-bezier(.16,1,.3,1) forwards, sceneOut .35s ease-in forwards;
  animation-play-state: paused, paused; }
.scene.last { animation: sceneIn .45s cubic-bezier(.16,1,.3,1) forwards;
  animation-play-state: paused; }
body.play .scene { animation-play-state: running, running; }
body.play .scene.last { animation-play-state: running; }
@keyframes sceneIn  { from { opacity:0; transform:translateY(70px) scale(.96); } to { opacity:1; transform:none; } }
@keyframes sceneOut { to { opacity:0; transform:translateY(-60px) scale(.97); } }
.hook .fire { font-size:150px; }
.hook h1 { font-weight:900; color:#1A1A1A; line-height:.95; letter-spacing:-6px;
  padding:0 40px; max-width:1080px; }
.hook h1 b { color:#E33D26; }
.hook h2 { font-size:82px; font-weight:900; color:#1A1A1A; margin-top:8px; letter-spacing:2px; }
.hook p { font-size:52px; color:#6B6259; margin-top:28px; font-weight:600; }
.rank { font-size:200px; font-weight:900; line-height:1; margin-bottom:8px;
  letter-spacing:-6px; text-shadow:0 6px 0 rgba(0,0,0,.06); }
.card { background:#fff; border-radius:56px; padding:56px 64px; width:820px;
  display:flex; flex-direction:column; align-items:center;
  box-shadow:0 30px 80px rgba(0,0,0,.12); }
.imgwrap { width:560px; height:560px; display:flex; align-items:center; justify-content:center; position:relative; }
.imgwrap img { max-width:100%; max-height:100%; object-fit:contain; }
.imgwrap .fallback { display:none; font-size:220px; }
.imgwrap.noimg .fallback { display:block; }
.pname { font-size:54px; font-weight:800; color:#1A1A1A; text-align:center;
  margin-top:36px; line-height:1.2; max-height:2.4em; overflow:hidden; }
.mpill { margin-top:28px; color:#fff; font-size:38px; font-weight:800;
  padding:14px 40px; border-radius:999px; }
.prices { display:flex; align-items:baseline; gap:36px; margin-top:36px; }
.old { font-size:58px; color:#9C9389; text-decoration:line-through; font-weight:600; }
.new { font-size:130px; color:#E33D26; font-weight:900; letter-spacing:-3px; }
.dbadge { margin-top:8px; background:#1B9E4B; color:#fff; font-size:56px;
  font-weight:900; padding:16px 52px; border-radius:999px; }
.dots { display:flex; gap:20px; margin-top:56px; }
.dots span { width:26px; height:26px; border-radius:50%; background:#D9CFC2; }
.dots span.on { background:#E33D26; }
.outro { background:#E33D26; z-index:60; }
.outro .big { font-size:120px; font-weight:900; color:#fff; text-align:center; line-height:1.1; letter-spacing:-3px; }
.outro .url { margin-top:60px; background:#fff; color:#E33D26; font-size:74px;
  font-weight:900; padding:36px 80px; border-radius:32px; }
.outro .sub { margin-top:44px; color:rgba(255,255,255,.85); font-size:46px; font-weight:600; }
</style></head><body>
<div class="topbar"><div class="logo">🛒 Deal<b>Hunter</b>4U</div><div class="weekpill">WEEK ${week}</div></div>
<div class="scene hook" style="animation-delay:0s, ${HOOK - 0.35}s">
  <div class="fire">${hook.emoji}</div>
  <h1 style="font-size:${hookFontSize(hook.titel)}px">${hook.titel}</h1>
  <h2>${hook.onder}</h2>
  <p>${hook.note}</p>
</div>
${cardScenes}
<div class="scene outro last" style="animation-delay:${HOOK + ranked.length * CARD}s">
  <div class="big">Alle 1.600+ deals<br>op één plek</div>
  <div class="url">dealhunter4u.nl</div>
  <div class="sub">elke dag automatisch bijgewerkt ✓</div>
</div>
<script>window.TOTAL_MS = ${Math.round(total * 1000)}</script>
</body></html>`
}

// ─── 3. Kayıt + mp4 ───────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const nu = new Date()
  const week = isoWeek(nu)

  // EDITIE overschrijft de weekdagplanning — handig voor handmatige runs en tests.
  const plan = process.env.EDITIE ? { editie: process.env.EDITIE, offset: 0 } : planVoorDag(nu)
  const editie = EDITIES[plan.editie]
  if (!editie) throw new Error(`Onbekende editie "${plan.editie}". Keuze: ${Object.keys(EDITIES).join(', ')}`)

  const pool = await fetchPool()
  const keuze = editie.kies ? editie.kies(week, plan.offset) : null
  const ctx = { week, keuze }
  const deals = editie.select(pool, ctx)

  // Onder de vijf kaarten wordt de video mager en de hook klopt niet meer
  // ("tot X% korting" boven twee producten). Liever niets uploaden dan dat.
  if (deals.length < 5) {
    throw new Error(`Editie "${editie.id}"${keuze ? ` (${keuze.label ?? keuze})` : ''} leverde maar ${deals.length} product(en) uit een pool van ${pool.length} — te weinig voor een video.`)
  }

  const etiket = keuze ? ` · ${keuze.label ?? keuze}` : ''
  console.log(`Week ${week} — editie "${editie.id}"${etiket}:`, deals.map(d => `${d.market} -${d.disc}%`).join(', '))

  const hook = editie.hook(deals, ctx)
  const htmlPath = path.join(OUT, 'video.html')
  fs.writeFileSync(htmlPath, buildHtml(deals, week, hook))

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    recordVideo: { dir: OUT, size: { width: 1080, height: 1920 } },
  })
  const page = await context.newPage()
  const t0 = Date.now()
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  const leadMs = Date.now() - t0
  await page.evaluate(() => document.body.classList.add('play'))
  const totalMs = await page.evaluate(() => window.TOTAL_MS)
  console.log(`kayıt: lead ${leadMs}ms + animasyon ${totalMs}ms...`)
  await page.waitForTimeout(totalMs + 800)
  const video = page.video()
  await context.close()
  const webmPath = await video.path()
  await browser.close()

  const require = createRequire(import.meta.url)
  const ffmpeg = require('ffmpeg-static')
  const datum = nu.toISOString().slice(0, 10)
  const slug = `dealhunter-${editie.id}-${datum}`
  const mp4 = path.join(OUT, `${slug}.mp4`)
  execFileSync(ffmpeg, [
    '-y', '-ss', (leadMs / 1000).toFixed(2), '-i', webmPath,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30', '-crf', '20',
    '-movflags', '+faststart', mp4,
  ], { stdio: 'ignore' })
  fs.unlinkSync(webmPath)

  // Sidecar: upload-youtube.mjs leest hieruit welk bestand met welke titel de
  // lucht in moet. Zonder dit zou de uploader de titel opnieuw moeten afleiden
  // en dan lopen video en omschrijving uit elkaar zodra de editie wisselt.
  const meta = { slug, bestand: path.basename(mp4), editie: editie.id, keuze: keuze?.label ?? keuze ?? null, week, datum, ...editie.youtube(deals, ctx) }
  fs.writeFileSync(path.join(OUT, `${slug}.json`), JSON.stringify(meta, null, 1))
  fs.writeFileSync(path.join(OUT, 'laatste.json'), JSON.stringify(meta, null, 1))

  console.log('✅ MP4 hazır:', mp4)
  console.log('   YouTube titel:', meta.title)
}

main().catch(e => { console.error(e); process.exit(1) })
