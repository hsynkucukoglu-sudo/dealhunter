/**
 * Günlük metrik toplayıcı — Clarity + GSC + AdSense.
 *
 * Neden Puppeteer + kalıcı profil: hiçbirinin bu projede API token'ı yok ve
 * Google hesabı gerektiren servislere otomasyonla GİRİŞ yapılamıyor (Google
 * bot-tespiti engelliyor). Profil bir kez elle açılır, oturum orada kalır.
 * Ayrıntı: ~/.claude/.../memory/gstack-browser-limitation.md
 *
 * Çıktı: docs/gunluk-takip.md (tarihli blok) + docs/data/gunluk.json (seri).
 * Bir kaynak düşerse diğerleri yine yazılır; hata "ALINAMADI" olarak geçer.
 */
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

// Servis başına AYRI profil. Tek profile iki Google hesabı koymak denendi ve
// kırdı: 18 Ağustos'ta AdSense hesabı eklenince GSC mülküne erişimi olan hesap
// profilden düştü ve GSC + Clarity aynı anda boş dönmeye başladı. Bir profil =
// bir kimlik kuralı, /u/0 · /u/1 indeks tahmini gerektirmediği için de sağlam.
const METRICS_PROFILE = 'C:/Users/ASUS/Downloads/metrics-profile'  // hsyn.kucukoglu@gmail.com → GSC + Clarity
const ADSENSE_PROFILE = 'C:/Users/ASUS/Downloads/gsc-profile'      // hyuseyink@gmail.com → AdSense
const CLARITY_ID = 'x232q20xdj'
const GSC_RES = 'https%3A%2F%2Fwww.dealhunter4u.nl%2F'
const ADSENSE_PUB = 'pub-6266103134639533'

const sleep = ms => new Promise(r => setTimeout(r, ms))

// Panel sayısal biçimi: binlik nokta, ondalık virgül ("1.242", "30,47")
const num = s => {
  if (s == null) return null
  const m = String(s).replace(/\./g, '').match(/-?\d+(,\d+)?/)
  return m ? parseFloat(m[0].replace(',', '.')) : null
}

const afterLabel = (text, label, span = 90) => {
  const i = text.indexOf(label)
  return i < 0 ? null : text.slice(i + label.length, i + label.length + span)
}

async function clarity(page) {
  const out = {}
  const pencereler = [['dun', 'Yesterday'], ['g7', 'Last%207%20days'], ['g30', 'Last%2030%20days']]
  for (const [key, q] of pencereler) {
    await page.goto(`https://clarity.microsoft.com/projects/view/${CLARITY_ID}/dashboard?date=${q}`,
      { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {})
    await sleep(14000)
    const t = await page.evaluate(() => document.body.innerText)
    const bas = afterLabel(t, 'Oturumlar', 120) || ''
    const gidenIdx = t.indexOf('Giden')
    const smart = gidenIdx >= 0 ? t.slice(gidenIdx, gidenIdx + 220) : ''
    out[key] = {
      oturum: num(bas),
      bot: num((bas.match(/([\d.]+)\s*bot/) || [])[1]),
      sayfaOturum: num(afterLabel(t, 'Oturum aç sayfası', 40)),
      kaydirma: num(afterLabel(t, 'derinliği', 40)),
      etkinSure: ((afterLabel(t, 'Harcanan etkin süreleri', 40) || '').trim().split('\n').filter(Boolean)[0] || null),
      geriDonen: num(afterLabel(t, 'Geri dönen kullanıcıların oturumları', 30)),
      oluTiklama: num(afterLabel(t, 'Geçersiz adımlar', 30)),
      giden: num(afterLabel(smart, 'Giden', 30)),
      arama: num(afterLabel(smart, 'Ara', 30)),
    }
  }
  return out
}

async function gscIndex(page) {
  await page.goto(`https://search.google.com/search-console/index?resource_id=${GSC_RES}`,
    { waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {})
  await sleep(28000)
  await page.evaluate(() => window.scrollTo(0, 600))
  await sleep(6000)
  const t = await page.evaluate(() => document.body.innerText)
  const say = etiket => {
    const esc = etiket.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const m = t.match(new RegExp(esc + '[^\\d]{0,80}(\\d+)'))
    return m ? parseInt(m[1], 10) : null
  }
  return {
    eklenen: num(afterLabel(t, 'Dizine eklenen', 20)),
    eklenmeyen: num(afterLabel(t, 'Dizine eklenmedi', 20)),
    noindex: say('"noindex" etiketi tarafından hariç tutuldu'),
    robots: say('Robots.txt tarafından engellendi'),
    kesfedildi: say('Keşfedildi - şu anda dizine eklenmiş değil'),
    tarandi: say('Tarandı - şu anda dizine eklenmiş değil'),
    kopya: say('Kullanıcı tarafından seçilen standart sayfa olmadan kopya'),
  }
}

async function gscPerf(page) {
  await page.goto(`https://search.google.com/search-console/performance/search-analytics?resource_id=${GSC_RES}&num_of_days=28`,
    { waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {})
  await sleep(24000)
  const t = await page.evaluate(() => document.body.innerText)
  const grab = etiket => {
    const m = t.match(new RegExp(etiket + '[^\\d]{0,60}([\\d.,]+\\s*[BK]?)'))
    return m ? m[1].trim() : null
  }
  return {
    tiklama: grab('Toplam tıklama sayısı'),
    gosterim: grab('Toplam gösterim sayısı'),
    to: grab('Ortalama TO'),
    konum: grab('Ortalama konum'),
  }
}

async function adsense(page) {
  // pub-6266103134639533 hyuseyink@gmail.com altında; gsc-profile ise
  // hsyn.kucukoglu@gmail.com ile açılmış. Chrome'da ikinci hesap eklenirse
  // /u/1, /u/2 ... ona denk gelir, bu yüzden sırayla deneniyor.
  for (const u of [0, 1, 2, 3]) {
    await page.goto(`https://adsense.google.com/adsense/u/${u}/${ADSENSE_PUB}/home`,
      { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {})
    await sleep(15000)
    const t = await page.evaluate(() => document.body.innerText)
    if (/Erişim reddedildi|Access denied|Hesabınız onaylanmadı|oturum aç/i.test(t.slice(0, 500))) continue
    const grab = e => {
      const m = t.match(new RegExp(e + '[^\\d€$]{0,60}([€$]?\\s?[\\d.,]+)'))
      return m ? m[1].trim() : null
    }
    return {
      hesapIndex: u,
      bugun: grab('Bugün'),
      dun: grab('Dün'),
      son7: grab('Son 7 gün'),
      buAy: grab('Bu ay'),
    }
  }
  return { hata: 'ERISIM YOK — hyuseyink@gmail.com bu Chrome profiline bir kez giris yapmali' }
}

const bugun = new Date().toISOString().slice(0, 10)
const rapor = { tarih: bugun }

async function profildeCalistir(profil, isler) {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: CHROME,
    userDataDir: profil,
    defaultViewport: { width: 1700, height: 1200 },
    args: ['--no-first-run', '--no-default-browser-check'],
  })
  try {
    const page = (await browser.pages())[0] || await browser.newPage()
    for (const [ad, fn] of isler) {
      try {
        rapor[ad] = await fn(page)
        console.log(`✓ ${ad}`)
      } catch (e) {
        rapor[ad] = { hata: 'ALINAMADI: ' + e.message }
        console.log(`✗ ${ad}: ${e.message}`)
      }
    }
  } finally {
    await browser.close()
  }
}

// Sırayla: iki Chrome aynı anda açılmıyor, profiller birbirini kilitlemesin.
await profildeCalistir(METRICS_PROFILE, [['clarity', clarity], ['gscIndex', gscIndex], ['gscPerf', gscPerf]])
await profildeCalistir(ADSENSE_PROFILE, [['adsense', adsense]])

const dataDir = path.join(ROOT, 'docs', 'data')
fs.mkdirSync(dataDir, { recursive: true })
const seriPath = path.join(dataDir, 'gunluk.json')
const seri = fs.existsSync(seriPath) ? JSON.parse(fs.readFileSync(seriPath, 'utf8')) : []
const idx = seri.findIndex(r => r.tarih === bugun)
if (idx >= 0) seri[idx] = rapor
else seri.push(rapor)
fs.writeFileSync(seriPath, JSON.stringify(seri, null, 1))

const c = rapor.clarity || {}
const g = rapor.gscIndex || {}
const gp = rapor.gscPerf || {}
const a = rapor.adsense || {}
const satir = (ad, o) => o
  ? `| ${ad} | ${o.oturum ?? '—'} | ${o.sayfaOturum ?? '—'} | ${o.kaydirma ?? '—'}% | ${o.etkinSure ?? '—'} | ${o.geriDonen ?? '—'} | ${o.giden ?? '—'} | ${o.arama ?? '—'} |`
  : `| ${ad} | — | — | — | — | — | — | — |`

const md = [
  '',
  `## ${bugun}`,
  '',
  '### Clarity',
  '| Pencere | Oturum | Sayfa/ot | Kaydırma | Etkin süre | Geri dönen | Giden tık | Arama |',
  '|---|---|---|---|---|---|---|---|',
  satir('Dün', c.dun),
  satir('7 gün', c.g7),
  satir('30 gün', c.g30),
  '',
  '### GSC',
  `Dizine eklenen **${g.eklenen ?? '—'}** · eklenmeyen **${g.eklenmeyen ?? '—'}** (noindex ${g.noindex ?? '—'} · robots ${g.robots ?? '—'} · keşfedildi ${g.kesfedildi ?? '—'} · tarandı ${g.tarandi ?? '—'} · kopya ${g.kopya ?? '—'})`,
  '',
  `28 gün: tıklama **${gp.tiklama ?? '—'}** · gösterim **${gp.gosterim ?? '—'}** · TO ${gp.to ?? '—'} · konum ${gp.konum ?? '—'}`,
  '',
  '### AdSense',
  a.hata ? `🔴 ${a.hata}` : `bugün ${a.bugun ?? '—'} · dün ${a.dun ?? '—'} · son 7 gün ${a.son7 ?? '—'} · bu ay ${a.buAy ?? '—'} (hesap /u/${a.hesapIndex})`,
  '',
].join('\n')

const mdPath = path.join(ROOT, 'docs', 'gunluk-takip.md')
const baslik = '# Günlük Takip\n\n> `node scripts/gunluk-metrik.mjs` ile otomatik yazılır; her sabah Windows Görev Zamanlayıcı çalıştırır.\n> Buraya yalnızca ölçülen sayı girer — yorum ve strateji analiz dokümanlarına yazılır.\n'
let mevcut = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, 'utf8') : baslik

// Aynı gün ikinci kez çalışırsa (elle çalıştırma + zamanlanmış görev) blok
// tekrarlanmasın: o tarihin bloğu siliniyor, yenisi sona yazılıyor.
const gunBasligi = `\n## ${bugun}\n`
const bas = mevcut.indexOf(gunBasligi)
if (bas >= 0) {
  const sonraki = mevcut.indexOf('\n## ', bas + gunBasligi.length)
  mevcut = mevcut.slice(0, bas) + (sonraki >= 0 ? mevcut.slice(sonraki) : '')
}
fs.writeFileSync(mdPath, mevcut.replace(/\s+$/, '') + '\n' + md)
console.log(md)
console.log('yazildi -> docs/gunluk-takip.md + docs/data/gunluk.json')
