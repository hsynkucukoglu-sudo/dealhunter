import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { initDatabase } from './db.js'
import { getProducts, getProduct, createProduct, deleteProduct, updateProduct, updateProductImage, updateProductCategory, clearAllProducts, clearProductsByMarket } from './models.js'
import { saveSubscription, deleteSubscription, getUserFavorites, addUserFavorite, removeUserFavorite, getSubscriptionsForFavoritedProducts, recordPriceHistory, archiveWeeklyDeals, getMinPriceMap, getPriceHistory, getKortingsindexHistory, getMatchedPriceIndex, getComparisonGroups, getScraperStats, upsertUserEmail, getEmailsForFavoritedProducts, updateSubscriptionPreferences, getUnsegmentedSubscriptions, getSegmentedSubscriptions, clearOrphanProducts, getProductCount, clearExpiredProducts, subscribeDealAlert, unsubscribeDealAlert, getMatchingAlerts, markAlertSent, recordClick, getClickStats, getDailyClicks, getAudienceStats } from './db.js'
import { sendWeeklyNewsletter, sendWatchlistAlert, sendDealAlert, getBrevoListStats, sendOpsAlert } from './email.js'
import { findWeeklyChampion } from './productMatch.js'
import { sendPushToAll, sendPushToSubscriptions } from './push.js'
import { scrapeFlyerProducts, parseAhProducts, parseAldiProducts, nearestSunday } from './scraper/index.js'
import { normalizeCategory } from './categorize.js'
import { canonicalBrand, extractBrand } from './brand.js'

const app = express()
app.set('trust proxy', 1)
const PORT = process.env.PORT || 3001

// ===== Rate Limiters =====
const generalLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
})
const imageProxyLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many image requests.' },
})
const scraperLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Scraper çok sık tetiklenemez.' },
})
const pushLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many subscription requests.' },
})
const newsletterLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Te veel aanmeldingen, probeer later opnieuw.' },
})
const trackLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many track requests.' },
})

// ===== Admin Auth Middleware =====
const requireAdmin = (req, res, next) => {
  const token = process.env.ADMIN_TOKEN
  if (!token) {
    return res.status(401).json({ error: 'Admin token yapılandırılmamış' })
  }
  const auth = req.headers['authorization']
  if (!auth || auth !== `Bearer ${token}`) {
    return res.status(401).json({ error: 'Yetkisiz erişim' })
  }
  next()
}

// Middleware
app.use(cors())
// ah-ingest HAM AH API çıktısını alıyor (~3,5 MB) — global 100 KB limitine takılırdı.
// Yola özel parser GLOBAL parser'dan ÖNCE mount ediliyor: body-parser gövdeyi
// ayrıştırdıktan sonra req._body işaretliyor, global olan da onu atlıyor. Limit
// bilinçli olarak sadece bu admin-korumalı yolda yükseltildi, global değil.
app.use('/api/scraper/ah-ingest', express.json({ limit: '12mb' }))
// Aldi ham algoliaDataMap ~0,23 MB — global 100 KB limitini aşıyor. Aynı desen.
app.use('/api/scraper/aldi-ingest', express.json({ limit: '4mb' }))
app.use(express.json())
app.use(generalLimit)

const isProduction = process.env.NODE_ENV === 'production'

// Hata yönetimi middleware'i
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// ===== API Routes =====

// AH görsel CDN allowlist — SSRF'i önler
const AH_IMAGE_ALLOWLIST = [
  /^https:\/\/[\w-]+\.albert\.nl\//,
  /^https:\/\/[\w-]+\.ah\.nl\//,
  /^https:\/\/static\.ah\.nl\//,
  /^https:\/\/images\.albertheijn\.nl\//,
  /^https:\/\/cdn\.dynamicyield\.com\//,
]

// GET /api/ah-image/:id - AH ürün görselini ID ile çek
app.get('/api/ah-image/:id', imageProxyLimit, asyncHandler(async (req, res) => {
  const { id } = req.params
  if (!id || !/^\d+$/.test(id)) return res.status(400).send()

  const AH_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'nl-NL,nl;q=0.9',
    'Referer': 'https://www.ah.nl/',
  }

  // 307 redirect'i takip et
  const pageRes = await fetch(`https://www.ah.nl/producten/product/wi${id}`, {
    headers: AH_HEADERS,
    redirect: 'follow',
    signal: AbortSignal.timeout(10000),
  })
  if (!pageRes.ok) return res.status(404).send()

  const html = await pageRes.text()

  // Tüm JSON-LD bloklarını dene
  const jsonLdBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  let imageUrl = null
  for (const match of jsonLdBlocks) {
    try {
      const jd = JSON.parse(match[1])
      if (jd.image) { imageUrl = jd.image; break }
      if (Array.isArray(jd['@graph'])) {
        for (const node of jd['@graph']) {
          if (node.image) { imageUrl = node.image; break }
        }
      }
    } catch {}
    if (imageUrl) break
  }

  // JSON-LD bulamazsa og:image'a bak
  if (!imageUrl) {
    const og = html.match(/<meta property="og:image" content="([^"]+)"/)
    if (og) imageUrl = og[1]
  }

  if (!imageUrl) return res.status(404).send()

  // SSRF koruması — sadece AH CDN domain'lerinden görsel çek
  if (!AH_IMAGE_ALLOWLIST.some(re => re.test(imageUrl))) {
    return res.status(403).send()
  }

  // Görseli çek ve ilet
  const imgRes = await fetch(imageUrl, {
    headers: AH_HEADERS,
    signal: AbortSignal.timeout(10000),
  })
  if (!imgRes.ok) return res.status(404).send()

  const contentType = imgRes.headers.get('content-type') || ''
  if (!contentType.startsWith('image/')) return res.status(403).send()

  res.setHeader('Content-Type', contentType)
  res.setHeader('Cache-Control', 'public, max-age=604800')
  res.send(Buffer.from(await imgRes.arrayBuffer()))
}))

let scraperRunning = false

// GET /api/products - Tüm veya filtrelenmiş ürünleri getir
app.get('/api/products', asyncHandler(async (req, res) => {
  const { market, category } = req.query
  const products = await getProducts({ market, category })
  res.json(products || [])
}))

// GET /api/status - Scraper durumu
app.get('/api/status', (req, res) => {
  res.json({ scraperRunning })
})

const TRACK_CHANNELS = new Set(['sponsor', 'market', 'flink', 'blog', 'share', 'whatsapp', 'other'])

// POST /api/track - Tıklama takibi (navigator.sendBeacon hedefi)
// sendBeacon body'yi text/plain olarak gönderir — express.json() Content-Type
// eşleşmediği için body'yi parse etmeden geçer, o yüzden burada ayrıca
// express.text({ type: '*/*' }) ile ham body'yi Content-Type'tan bağımsız okuyoruz.
app.post('/api/track', trackLimit, express.text({ type: '*/*' }), asyncHandler(async (req, res) => {
  try {
    const raw = typeof req.body === 'string' ? req.body : ''
    const data = JSON.parse(raw || '{}')
    const channel = String(data.channel ?? 'other').slice(0, 20)
    const target = String(data.target ?? '').slice(0, 80)
    if (target && TRACK_CHANNELS.has(channel)) {
      const ua = req.headers['user-agent'] || ''
      const device = /mobile|android|iphone/i.test(ua) ? 'mobile' : 'desktop'
      await recordClick({
        channel,
        target,
        dealId: data.dealId ? String(data.dealId).slice(0, 60) : undefined,
        page: data.page ? String(data.page).slice(0, 120) : undefined,
        device,
      })
    }
  } catch {
    // sessizce yut — kullanıcı akışını bozma, sendBeacon zaten yanıt beklemiyor
  }
  res.status(204).end()
}))

// Rapor endpoint'leri için kimlik doğrulama.
//
// Anahtar ÖNCE Authorization header'ından okunuyor. Query string (?key=...) hâlâ
// kabul ediliyor ama ARTIK ÖNERİLMİYOR: URL'deki anahtar tarayıcı geçmişinde,
// sunucu erişim loglarında ve referrer header'ında düz metin olarak kalır. İlk
// sürüm sadece query destekliyordu — bu bir tasarım hatasıydı, header yolu eklendi.
function checkStatsAuth(req) {
  const key = process.env.TRACK_STATS_KEY
  if (!key) return false
  const auth = req.headers['authorization']
  if (auth === `Bearer ${key}`) return true
  if (req.query.key === key) {
    console.warn('⚠️ stats endpoint query string ile çağrıldı — Authorization header kullan (anahtar loglara sızıyor)')
    return true
  }
  return false
}

// GET /api/track/stats - Tıklama raporu
// Kullanım: curl -H "Authorization: Bearer $TRACK_STATS_KEY" .../api/track/stats?days=14
app.get('/api/track/stats', asyncHandler(async (req, res) => {
  if (!checkStatsAuth(req)) return res.status(404).end()
  const days = Number(req.query.days) || 14
  const [totals, daily] = await Promise.all([getClickStats(days), getDailyClicks(days)])
  res.json({ days, totals, daily })
}))

// GET /api/audience/stats - Abone sayıları
// Kullanım: curl -H "Authorization: Bearer $TRACK_STATS_KEY" .../api/audience/stats
app.get('/api/audience/stats', asyncHandler(async (req, res) => {
  if (!checkStatsAuth(req)) return res.status(404).end()
  const [db, newsletter] = await Promise.all([getAudienceStats(), getBrevoListStats()])
  // newsletter null = BREVO_API_KEY/BREVO_LIST_ID yok of Brevo gaf een fout;
  // bewust niet als 0 gerapporteerd, dat zou "geen abonnees" suggereren.
  res.json({ ...db, newsletter })
}))

// GET /api/products/:id - Belirli ürünü getir
app.get('/api/products/:id', asyncHandler(async (req, res) => {
  const product = await getProduct(req.params.id)
  if (!product) {
    return res.status(404).json({ error: 'Ürün bulunamadı' })
  }
  res.json(product)
}))

// POST /api/products - Yeni ürün oluştur
app.post('/api/products', requireAdmin, asyncHandler(async (req, res) => {
  const { name, market, originalPrice, discountedPrice, imageUrl, expiresAt, isCampaign, source } = req.body

  // Validasyon
  if (!name || !market || !originalPrice || !discountedPrice || !expiresAt) {
    return res.status(400).json({ error: 'Gerekli alanlar eksik' })
  }

  const product = await createProduct({
    name,
    market,
    originalPrice,
    discountedPrice,
    imageUrl,
    isCampaign,
    source,
    expiresAt,
  })

  res.status(201).json(product)
}))

// PUT /api/products/:id - Ürünü güncelle
app.put('/api/products/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { name, market, originalPrice, discountedPrice, imageUrl, expiresAt } = req.body

  if (!name || !market || !originalPrice || !discountedPrice || !expiresAt) {
    return res.status(400).json({ error: 'Gerekli alanlar eksik' })
  }

  const product = await updateProduct(req.params.id, {
    name,
    market,
    originalPrice,
    discountedPrice,
    imageUrl,
    expiresAt,
  })

  res.json(product)
}))

// PATCH /api/products/:id/image - Görsel URL güncelle
app.patch('/api/products/:id/image', requireAdmin, asyncHandler(async (req, res) => {
  const { imageUrl } = req.body
  if (!imageUrl) return res.status(400).json({ error: 'imageUrl gerekli' })
  await updateProductImage(req.params.id, imageUrl)
  res.json({ ok: true })
}))

// PATCH /api/products/:id/category - Kategori güncelle
app.patch('/api/products/:id/category', requireAdmin, asyncHandler(async (req, res) => {
  const { category } = req.body
  if (!category) return res.status(400).json({ error: 'category gerekli' })
  await updateProductCategory(req.params.id, category)
  res.json({ ok: true })
}))

// DELETE /api/products/:id - Ürünü sil
app.delete('/api/products/:id', requireAdmin, asyncHandler(async (req, res) => {
  await deleteProduct(req.params.id)
  res.status(204).send()
}))

import cron from 'node-cron'

// Scraper iş mantığı
// Scraper sağlık alarmı — 0 ürün dönen market SESSİZCE eski veriyle kalıyor, çünkü
// clearProductsByMarket aşağıda sadece ürün DÖNEN marketlere uygulanıyor. Bu sessizlik
// üç kez günlerce fark edilmedi: Hoogvliet (Imperva), Kruidvat (Akamai) ve 2026-08-08'de
// Albert Heijn — AH 5 gün boyunca boş döndü, kimse görmedi.
//
// ÖLÇÜT "bu çalışmada 0 ürün döndü" DEĞİL, "verinin yaşı" — ilk sürüm bu yüzden yanlış
// alarm verdi (2026-08-08: Plus + Kruidvat). O ikisini backend zaten taramıyor; ayrı
// GitHub Actions workflow'ları var ve backend'den SONRA çalışıyorlar (Kruidvat 08:15,
// Plus 09:00, backend 08:00). Backend'in onlara 0 dönmesi normal. Yaşa bakmak hem bu
// yanlış alarmı bitiriyor hem de kapsamı genişletiyor: GH Actions workflow'u bozulursa
// veri bayatlar ve alarm yine öter.
//
// Coop ve Hoogvliet bilinçli olarak listede DEĞİL: Coop OutSystems SPA'sı taranamıyor
// (hidden=true), Hoogvliet Imperva arkasında ve kovalanmama kararı alındı. Her gün ötüp
// duran alarm okunmaz hale gelir — bilinen ölüleri kapsama almak alarmı çöpe çevirir.
const MONITORED_MARKETS = [
  'Albert Heijn', 'Jumbo', 'Lidl', 'Aldi', 'Dirk',
  'Plus', 'DekaMarkt', 'Vomar', 'Kruidvat',
]

// 2 gün: GH Actions cron'u saatlerce gecikebiliyor, 1 günlük eşik tek gecikmede
// yanlış alarm verirdi. 2 gün, gerçek arızayı ~48 saat içinde yakalar.
const STALE_ALERT_DAYS = 2

// Alarm satırlarını üretir. reportScraperHealth VE /api/health/scraper aynı
// fonksiyonu kullanır, böylece dışarıdan bakınca alarmın NE gördüğü doğrulanabilir.
export function computeScraperAlerts(markets) {
  const byMarket = new Map(markets.map(r => [r.market, r]))
  const alerts = []
  for (const m of MONITORED_MARKETS) {
    const row = byMarket.get(m)
    if (!row?.last_scraped) { alerts.push(`${m}: veritabanında hiç ürünü yok`); continue }

    const days = Math.floor((Date.now() - new Date(row.last_scraped).getTime()) / 86400000)
    if (days >= STALE_ALERT_DAYS) {
      alerts.push(`${m}: veri ${days} gündür bayat (son: ${String(row.last_scraped).slice(0, 10)})`)
      continue
    }

    // Kalite kontrolü — yaş kontrolü bunu KAÇIRIYORDU. 2026-08-11'de Aldi 76 taze
    // ürün döndürdü ama HİÇBİRİ indirimli değildi (hepsi orij = indirimli, sadece
    // non-food sabit fiyatlı ürünler). Veri taze olduğu için alarm sessiz kaldı.
    // İndirim sitesinde 0 indirimli ürün, ölü scraper kadar kötü.
    if (row.total > 0 && row.with_discount === 0) {
      alerts.push(`${m}: ${row.total} ürün var ama HİÇBİRİ indirimli değil (fiyat ayrıştırma bozulmuş olabilir)`)
    }
  }
  return alerts
}

// Son çalışmanın izi — /api/health/scraper üzerinden dışarı veriliyor.
//
// NEDEN: alarm iki kez sessiz kaldı (8 Ağu: OPS_ALERT_EMAIL yoktu; 11 Ağu: sebep
// bilinmiyor) ve Railway loguna erişimi olmayan biri "alarm tespit etmedi mi, yoksa
// mail mi gidemedi" sorusunu ayırt edemedi. Aynı körlük Hoogvliet, AH ve Aldi'de de
// zaman kaybettirdi. Bu iz, tespit ile teslimatı birbirinden ayırıp dışarıdan
// görünür kılıyor. Sır içermiyor — sadece market adı, sayı ve hata mesajı.
let lastScrapeRun = null   // { at, perMarket, empty }
let lastAlertRun = null    // { at, alerts, emailSent, emailError }

async function reportScraperHealth(newProducts) {
  const perMarket = {}
  for (const p of newProducts ?? []) perMarket[p.market] = (perMarket[p.market] ?? 0) + 1
  const returned = new Set(Object.keys(perMarket))
  const emptyThisRun = MONITORED_MARKETS.filter(m => !returned.has(m))
  lastScrapeRun = { at: new Date().toISOString(), perMarket, empty: emptyThisRun }
  if (emptyThisRun.length) {
    // Bilgi amaçlı — alarm DEĞİL. Plus/Kruidvat burada normalde görünür.
    console.log(`🩺 Backend scraper'ından ürün dönmeyen market: ${emptyThisRun.join(', ')}`)
  }

  let stale = []
  try {
    const { markets } = await getScraperStats()
    stale = computeScraperAlerts(markets)
  } catch (e) {
    console.error('🩺 Sağlık raporu: getScraperStats hatası:', e.message)
    lastAlertRun = { at: new Date().toISOString(), alerts: null, emailSent: false, emailError: `getScraperStats: ${e.message}` }
    return
  }

  if (!stale.length) {
    lastAlertRun = { at: new Date().toISOString(), alerts: [], emailSent: false, emailError: null }
    console.log('🩺 Scraper sağlık: izlenen tüm marketlerin verisi taze.')
    return
  }

  console.error(`🚨 SCRAPER ALARM: ${stale.length} market bayat\n  - ${stale.join('\n  - ')}`)
  const sent = await sendOpsAlert(`🚨 DealHunter: ${stale.length} market bayat veri`, stale)
  lastAlertRun = {
    at: new Date().toISOString(),
    alerts: stale,
    emailSent: sent,
    emailError: sent ? null : 'sendOpsAlert false döndü (OPS_ALERT_EMAIL/BREVO_API_KEY eksik veya Brevo reddetti)',
  }
  if (!sent) {
    console.error('🚨 Alarm e-postası GÖNDERİLEMEDİ (OPS_ALERT_EMAIL/BREVO_API_KEY eksik olabilir) — sadece log var.')
  }
}

async function runScraperJob() {
  if (scraperRunning) {
    console.log('⏰ Scraper zaten çalışıyor, atlanıyor...')
    return []
  }
  scraperRunning = true
  console.log('⏰ Otomatik Zamanlanmış Scraper Görevi Başlıyor...')

  // finally'de sağlık raporu için gerekli — try dışında tanımlı olmalı
  let newProducts = []

  try {
  newProducts = await scrapeFlyerProducts()

  // Sadece ürünler başarıyla geldiyse eskileri temizle (market bazlı — başarısız market silinmez)
  if (newProducts && newProducts.length > 0) {
    const updatedMarketSet = new Set(newProducts.map(p => p.market))
    for (const market of updatedMarketSet) {
      await clearProductsByMarket(market)
    }

    // Drop products without market name + name-based dedup per market
    const insertSeen = new Set()
    const insertProducts = newProducts.filter(p => {
      if (!p.market || !p.name) return false
      const key = `${p.market}:${p.name.toLowerCase().trim()}`
      if (insertSeen.has(key)) return false
      insertSeen.add(key)
      return true
    })

    // Bulunan ürünleri veritabanına ekle (NaN fiyatlıları atla)
    const createdProducts = []
    for (const p of insertProducts) {
      const orig = parseFloat(p.originalPrice)
      const disc = parseFloat(p.discountedPrice)
      if (isNaN(orig) || isNaN(disc) || disc <= 0) continue
      try {
        const saved = await createProduct({ ...p, originalPrice: orig, discountedPrice: disc, category: normalizeCategory(p.category, p.name) })
        createdProducts.push(saved)
      } catch (e) {
        console.error(`  ⚠️ Ürün kaydedilemedi (${p.name}):`, e.message)
      }
    }

    console.log(`⏰ Görev Tamamlandı. ${createdProducts.length} yeni ürün eklendi.`)

    // Fiyat geçmişini kaydet
    recordPriceHistory(createdProducts).catch(e => console.error('Fiyat geçmişi kayıt hatası:', e.message))

    // Haftalık deal arşivi — Kortingsindex ve prijshistorie hammaddesi
    archiveWeeklyDeals(createdProducts).catch(e => console.error('Deal arşiv hatası:', e.message))

    // IndexNow ping — Bing/Yandex'e güncel URL'leri bildir
    const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'dh4u-2026-x9k3m7p2'
    const MARKET_SLUGS = {
      'Albert Heijn': 'albert-heijn', 'Jumbo': 'jumbo', 'Aldi': 'aldi',
      'Lidl': 'lidl', 'Dirk': 'dirk', 'Hoogvliet': 'hoogvliet', 'Vomar': 'vomar', 'DekaMarkt': 'dekamarkt',
    }
    const updatedMarkets = [...new Set(createdProducts.map(p => MARKET_SLUGS[p.market]).filter(Boolean))]
    const pingUrls = [
      'https://www.dealhunter4u.nl',
      'https://www.dealhunter4u.nl/deals',
      ...updatedMarkets.map(s => `https://www.dealhunter4u.nl/supermarkt/${s}`),
    ]
    fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: 'www.dealhunter4u.nl',
        key: INDEXNOW_KEY,
        keyLocation: `https://www.dealhunter4u.nl/${INDEXNOW_KEY}.txt`,
        urlList: pingUrls,
      }),
      signal: AbortSignal.timeout(10000),
    })
      .then(r => console.log(`🔍 IndexNow: ${pingUrls.length} URL ping gönderildi (${r.status})`))
      .catch(e => console.error('IndexNow ping hatası:', e.message))

    // Push bildirimleri gönder
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      // 1. Hedefli push — favorisi eşleşen kullanıcılara
      const targetedEndpoints = new Set()
      try {
        const targeted = await getSubscriptionsForFavoritedProducts()
        if (targeted.length > 0) {
          // Her subscription için eşleşen ürün sayısını bul
          for (const sub of targeted) {
            const matchCount = sub.favoriteKeys.length
            const firstKey = sub.favoriteKeys[0].split('::')
            const firstName = firstKey[0]
            const body = matchCount === 1
              ? `${firstName} is deze week in de aanbieding!`
              : `${matchCount} van jouw favorieten zijn in de aanbieding!`
            sendPushToSubscriptions([{ endpoint: sub.endpoint, keys: sub.keys }], {
              title: '⭐ Jouw favoriete deal!',
              body,
              url: 'https://www.dealhunter4u.nl',
              icon: 'https://www.dealhunter4u.nl/icon-512x512.png',
            }).catch(e => console.error('Hedefli push hatası:', e.message))
            targetedEndpoints.add(sub.endpoint)
          }
          console.log(`🎯 ${targeted.length} kullanıcıya hedefli bildirim gönderildi`)
        }
      } catch (e) {
        console.error('Hedefli push sorgulama hatası:', e.message)
      }

      // 2. Segment push — market/kategori tercihli kullanıcılara
      try {
        const newMarkets = [...new Set(createdProducts.map(p => p.market))]
        const newCategories = [...new Set(createdProducts.map(p => p.category).filter(Boolean))]
        const segmented = await getSegmentedSubscriptions(newMarkets, newCategories)
        const segmentTargets = segmented.filter(s => !targetedEndpoints.has(s.endpoint))
        if (segmentTargets.length > 0) {
          sendPushToSubscriptions(segmentTargets, {
            title: '🎯 Aanbiedingen voor jou!',
            body: `Nieuwe deals bij jouw favoriete supermarkten.`,
            url: 'https://www.dealhunter4u.nl',
            icon: 'https://www.dealhunter4u.nl/icon-512x512.png',
          }).catch(e => console.error('Segment push hatası:', e.message))
          segmentTargets.forEach(s => targetedEndpoints.add(s.endpoint))
          console.log(`🎯 ${segmentTargets.length} segment kullanıcısına bildirim gönderildi`)
        }
      } catch (e) {
        console.error('Segment push sorgulama hatası:', e.message)
      }

      // 3. Genel push — hiç tercihi olmayan kullanıcılara
      try {
        const unsegmented = await getUnsegmentedSubscriptions()
        const generalTargets = unsegmented.filter(s => !targetedEndpoints.has(s.endpoint))
        if (generalTargets.length > 0) {
          sendPushToSubscriptions(generalTargets, {
            title: '🛒 Nieuwe aanbiedingen beschikbaar!',
            body: `${createdProducts.length} nieuwe deals van Albert Heijn, Jumbo, Lidl en meer.`,
            url: 'https://www.dealhunter4u.nl',
            icon: 'https://www.dealhunter4u.nl/icon-512x512.png',
          }).catch(e => console.error('Genel push hatası:', e.message))
          console.log(`📢 ${generalTargets.length} genel kullanıcıya bildirim gönderildi`)
        }
      } catch (e) {
        console.error('Genel push sorgulama hatası:', e.message)
      }
    }

    // Watchlist email alerts — favorisi eşleşen kullanıcılara email gönder
    if (process.env.BREVO_API_KEY) {
      getEmailsForFavoritedProducts()
        .then(async rows => {
          for (const { email, products } of rows) {
            await sendWatchlistAlert(email, products).catch(e =>
              console.error(`[Email] Watchlist alert hatası (${email}):`, e.message)
            )
          }
          if (rows.length > 0) {
            console.log(`📧 Watchlist email: ${rows.length} kullanıcıya gönderildi`)
          }
        })
        .catch(e => console.error('[Email] Watchlist email sorgulama hatası:', e.message))
    }

    // Deal alerts — keyword-based email notifications
    if (process.env.BREVO_API_KEY) {
      ;(async () => {
        try {
          const allProducts = await getProducts()
          const productNames = allProducts.map(p => p.name)
          const matchingAlerts = await getMatchingAlerts(productNames)
          if (!matchingAlerts.length) return

          // Group alerts by email — one email may match multiple keywords
          const emailMap = new Map()
          for (const alert of matchingAlerts) {
            const kw = alert.keyword.toLowerCase()
            const matched = allProducts.filter(p =>
              p.name.toLowerCase().includes(kw) &&
              (alert.market ? p.market === alert.market : true) &&
              p.originalPrice > p.discountedPrice && p.originalPrice > 0
            )
            if (!matched.length) continue
            if (!emailMap.has(alert.email)) emailMap.set(alert.email, [])
            emailMap.get(alert.email).push({ alert, products: matched })
          }

          let sent = 0
          for (const [email, entries] of emailMap) {
            // Deduplicate products across multiple keyword matches
            const seen = new Set()
            const uniqueProducts = entries.flatMap(e => e.products).filter(p => {
              if (seen.has(p.id)) return false
              seen.add(p.id)
              return true
            })
            const keywords = [...new Set(entries.map(e => e.alert.keyword))]
            const unsubToken = entries[0].alert.token

            try {
              await sendDealAlert(email, keywords, uniqueProducts, unsubToken)
              for (const { alert } of entries) await markAlertSent(alert.id)
              sent++
              await new Promise(r => setTimeout(r, 200))
            } catch (e) {
              console.error(`[Email] Deal alert hatası (${email}):`, e.message)
            }
          }

          if (sent > 0) console.log(`🔔 Deal alerts: ${sent} kullanıcıya gönderildi`)
        } catch (e) {
          console.error('[Email] Deal alert sorgulama hatası:', e.message)
        }
      })()
    }

    return createdProducts
  } else {
    console.log('❌ Yeni ürün bulunamadı, tablo güncellenmedi.')
    return []
  }
  } finally {
    scraperRunning = false
    // finally: yazma adımı patlasa da, erken return olsa da sağlık raporu çalışsın.
    // Yazımdan SONRA olmalı — ölçüt verinin yaşı, taze kayıtlar DB'ye düşmüş olmalı.
    try {
      await reportScraperHealth(newProducts)
    } catch (e) {
      console.error('🩺 Sağlık raporu çalışmadı:', e.message)
    }
  }
}

// Elke dag 08:00 UTC — scraper (2026-07-05: haftalıktan günlüğe çevrildi, AH/Jumbo/Lidl/Aldi/Hoogvliet/Vomar/DekaMarkt
// haftanın son günlerinde expiresAt geçtiği için boş kalıyordu — botlanma testi temiz çıktı, sadece Coop/Plus 403 veriyor ki onlar zaten ayrı yönetiliyor)
cron.schedule('0 8 * * *', async () => {
  try {
    await runScraperJob()
  } catch (error) {
    console.error('⏰ Scraper Zamanlama Hatası:', error)
  }
  // Süresi geçmiş/orphan ürün temizliği önceden sadece sunucu başlangıcında (restart'ta)
  // çalışıyordu — deploy'lar arası günlerce eski veri DB'de kalabiliyordu. Artık günlük.
  try {
    await clearOrphanProducts()
    const deleted = await clearExpiredProducts()
    if (deleted > 0) console.log(`🧹 ${deleted} tarihi geçmiş ürün DB'den silindi.`)
  } catch (error) {
    console.error('🧹 Günlük Temizlik Hatası:', error)
  }
})

// Pazartesi 09:00 — haftalık bülten (scraper bittikten 1 saat sonra)
cron.schedule('0 9 * * 1', async () => {
  try {
    const allProducts = await getProducts()
    const topDeals = allProducts
      .filter(p => p.discount >= 20)
      .sort((a, b) => b.discount - a.discount)
      .slice(0, 10)
    // "Marktkampioen" bölümü: hangi market bu hafta belirli bir ürünü en ucuza satıyor
    // — buildComparisonGroups (frontend) ile aynı mantığın backend'e taşınmış hali.
    const champion = findWeeklyChampion(allProducts)
    await sendWeeklyNewsletter(topDeals, champion)
  } catch (error) {
    console.error('⏰ Haftalık Bülten Hatası:', error)
  }
})

// POST /api/push/subscribe - Push aboneliği kaydet
app.post('/api/push/subscribe', pushLimit, asyncHandler(async (req, res) => {
  const { endpoint, keys, userId } = req.body
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: 'Geçersiz abonelik' })
  }
  await saveSubscription({ endpoint, keys, userId: userId || null })
  res.status(201).json({ ok: true })
}))

// DELETE /api/push/unsubscribe - Push aboneliğini sil
app.delete('/api/push/unsubscribe', asyncHandler(async (req, res) => {
  const { endpoint } = req.body
  if (!endpoint) return res.status(400).json({ error: 'endpoint gerekli' })
  await deleteSubscription(endpoint)
  res.json({ ok: true })
}))

// PATCH /api/push/preferences - Market/kategori tercihleri güncelle
app.patch('/api/push/preferences', asyncHandler(async (req, res) => {
  const { endpoint, markets, categories } = req.body
  if (!endpoint) return res.status(400).json({ error: 'endpoint gerekli' })
  const VALID_MARKETS = ['Albert Heijn', 'Jumbo', 'Lidl', 'Aldi', 'Dirk', 'Hoogvliet', 'Vomar', 'DekaMarkt']
  const VALID_CATEGORIES = ['groente-fruit', 'zuivel', 'vlees-vis', 'dranken', 'bakkerij', 'snacks', 'maaltijden', 'verzorging', 'huishouden', 'overig']
  const cleanMarkets = Array.isArray(markets) ? markets.filter(m => VALID_MARKETS.includes(m)) : []
  const cleanCategories = Array.isArray(categories) ? categories.filter(c => VALID_CATEGORIES.includes(c)) : []
  await updateSubscriptionPreferences(endpoint, { markets: cleanMarkets, categories: cleanCategories })
  res.json({ ok: true, markets: cleanMarkets, categories: cleanCategories })
}))

// GET /api/push/vapid-public-key - Frontend'e public key ver
app.get('/api/push/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY })
})

// GET /api/favorites?user_id=... - Kullanıcı favorilerini getir
app.get('/api/favorites', asyncHandler(async (req, res) => {
  const userId = req.query.user_id
  if (!userId) return res.status(400).json({ error: 'user_id gerekli' })
  const favorites = await getUserFavorites(userId)
  res.json(favorites)
}))

// POST /api/favorites - Favori ekle
app.post('/api/favorites', asyncHandler(async (req, res) => {
  const { user_id, product_name, product_market } = req.body
  if (!user_id || !product_name || !product_market) {
    return res.status(400).json({ error: 'user_id, product_name, product_market gerekli' })
  }
  await addUserFavorite(user_id, product_name, product_market)
  res.status(201).json({ ok: true })
}))

// DELETE /api/favorites - Favori kaldır
app.delete('/api/favorites', asyncHandler(async (req, res) => {
  const { user_id, product_name, product_market } = req.body
  if (!user_id || !product_name || !product_market) {
    return res.status(400).json({ error: 'user_id, product_name, product_market gerekli' })
  }
  await removeUserFavorite(user_id, product_name, product_market)
  res.json({ ok: true })
}))

// GET /api/price-history-min - Tüm ürünlerin tarihsel minimum fiyatları
app.get('/api/price-history-min', asyncHandler(async (req, res) => {
  const map = await getMinPriceMap()
  res.json(map)
}))

// GET /api/price-history?name=...&market=... - Tek ürünün haftalık fiyat geçmişi
app.get('/api/price-history', asyncHandler(async (req, res) => {
  const { name, market } = req.query
  if (!name || !market) return res.status(400).json({ error: 'name and market required' })
  const history = await getPriceHistory(name, market)
  res.json(history)
}))

// GET /api/kortingsindex-history - Haftalık kortingsindex serisi (market x hafta)
app.get('/api/kortingsindex-history', asyncHandler(async (req, res) => {
  const rows = await getKortingsindexHistory()
  res.json(rows)
}))

// GET /api/matched-price-index - Matched-pair prijsindex (alleen gepaarde waarnemingen)
app.get('/api/matched-price-index', asyncHandler(async (req, res) => {
  const rows = await getMatchedPriceIndex()
  res.json(rows)
}))

// GET /api/compare - SQL tabanlı fiyat karşılaştırma grupları (isim + boyut kombinasyonu)
app.get('/api/compare', asyncHandler(async (req, res) => {
  const rows = await getComparisonGroups()
  res.json(rows)
}))

// POST /api/products/bulk-replace - Belirli bir market'in ürünlerini tamamen değiştirir
// GitHub Actions gibi harici scraperlar tarafından kullanılır
async function replaceMarketProducts(market, products) {
  // Name-based dedup before insert (prevents race-condition duplicates)
  const seenNames = new Set()
  const uniqueProducts = products.filter(p => {
    const key = p.name?.toLowerCase().trim()
    if (!key || seenNames.has(key)) return false
    seenNames.add(key)
    return true
  })
  await clearProductsByMarket(market)
  const created = []
  for (const p of uniqueProducts) {
    if (!p.name || !p.discountedPrice) continue
    const orig = p.originalPrice || p.discountedPrice
    const disc = p.discountedPrice
    const product = await createProduct({
      id: crypto.randomUUID(),
      name: p.name,
      market,
      originalPrice: orig,
      discountedPrice: disc,
      discount: orig > disc ? Math.round((1 - disc / orig) * 100) : 0,
      imageUrl: p.imageUrl || null,
      isCampaign: p.isCampaign ?? true,
      source: p.source || `${market.toLowerCase()}.nl/aanbiedingen`,
      expiresAt: p.expiresAt || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      campaignType: p.campaignType || null,
      // Ruwe scraperwaarde werd hier ongefilterd opgeslagen. Plus schreef zo zijn
      // eigen labels ("Aardappelen, groente, fruit") in de kolom en Kruidvat/AH
      // sturen niets, dus stonden die drie markten (587 producten, 2026-08-13)
      // volledig buiten de categoriefilters.
      category: normalizeCategory(p.category, p.name),
      // Zelfde reden als de categorie hierboven: de standalone Actions-scrapers
      // sturen rauwe merkwaarden ("Pepsi," van Plus) en de oude heuristiek maakte
      // van elk hoofdletterwoord een merk. Hier is het enige punt waar álle
      // scrapers langskomen, dus hier wordt het merk gevalideerd.
      // brandVerified: de parser haalde het merk uit een echt merkveld van de bron
      // (Aldi brandName, AH brand, Jumbo GraphQL brand). Die waarde is al schoon
      // en mag NIET nog eens door de whitelist: canonicalBrand doet een substring-
      // match en maakte van "Sun Snacks" (Aldi's eigen snackmerk) "Sun" (het
      // vaatwasmerk). Gemeten 2026-08-19: van 189 Aldi-producten hielden er zo
      // maar 22 een merk over, terwijl de bron er 143 levert.
      // Zonder vlag blijft de oude controle staan — die is er niet voor niets:
      // de standalone Actions-scrapers sturen rauwe waarden ("Pepsi," van Plus).
      brand: p.brandVerified ? (p.brand ?? null) : (canonicalBrand(p.brand) ?? extractBrand(p.name)),
      // Eenheidsvelden werden hier niet doorgegeven, terwijl de GitHub
      // Actions-scrapers (Plus, Kruidvat, Dirk) hun markt via deze route volledig
      // vervangen. De backend-scraper vult ze om 08:02 wel, waarna de Actions-run
      // ze er even later weer uit haalde — vandaar dat Plus op 0% eenheidsdata
      // stond (gemeten 2026-08-02). Ontbreken ze in de payload, dan wordt het
      // null (models.js), dus dit is veilig voor scrapers die ze nog niet sturen.
      unitSize: p.unitSize ?? null,
      unitType: p.unitType ?? null,
      unitPrice: p.unitPrice ?? null,
      fullSizeLabel: p.fullSizeLabel ?? null,
      // Markt-eigen permanente artikel-ID (Kruidvat code, AH webshopId, Jumbo sku)
      sourceId: p.sourceId ?? null,
    })
    created.push(product)
  }
  console.log(`📦 bulk-replace: ${market} → ${created.length} ürün eklendi`)

  // Fiyat geçmişi bu yolda HİÇ yazılmıyordu — sadece runScraperJob yazıyordu.
  // Sonuçları: Plus 13 haftanın hiçbirinde price_history'de yok (GH Actions'a
  // taşındığından beri), ve bugün AH'yi ah-ingest'e taşıyınca AH de bu yola girdi,
  // yani gelecek haftadan itibaren o da birikmeyi bırakacaktı. "Laagste prijs"
  // rozeti ve fiyat grafiği bu tablodan besleniyor.
  // await DEĞİL: yanıt bunu beklemesin, hata da isteği düşürmesin (runScraperJob
  // içindeki çağrı da aynı deseni kullanıyor).
  recordPriceHistory(created).catch(e => console.error('Fiyat geçmişi kayıt hatası:', e.message))

  return created
}

app.post('/api/products/bulk-replace', requireAdmin, asyncHandler(async (req, res) => {
  const { market, products } = req.body
  if (market === undefined || market === null || !Array.isArray(products)) {
    return res.status(400).json({ error: 'market ve products[] gerekli' })
  }
  const created = await replaceMarketProducts(market, products)
  res.json({ success: true, market, count: created.length })
}))

// POST /api/scraper/ah-ingest - GitHub Actions'tan gelen HAM AH bonus-API çıktısı
//
// Railway'in IP'si Akamai tarafından bloklanıyor (2026-08-08: token endpoint'i JSON
// yerine <HTML> deny sayfası döndürdü, AH 5 gün sessizce boş kaldı). Ağ katmanı GH
// Actions'a taşındı ama parse/dedup mantığı burada — calcAhPromo defalarca düzeltildi,
// iki kopyaya bölünmemeli. Actions ham JSON'u kırpmadan gönderiyor ki parser yeni bir
// alan okumaya başladığında sessizce bozulmasın.
app.post('/api/scraper/ah-ingest', requireAdmin, asyncHandler(async (req, res) => {
  const { products } = req.body
  if (!Array.isArray(products)) {
    return res.status(400).json({ error: 'products[] (ham AH API ürünleri) gerekli' })
  }

  const parsed = parseAhProducts(products, nearestSunday())

  // 0 ürün çıktıysa AH'yi SİLME. Tam da bu sessizlik yüzünden 5 gün kaybedildi;
  // bozuk bir çalışmanın canlı veriyi silmesindense eski veri kalsın, alarm ötsün.
  if (!parsed.length) {
    console.error(`🚨 ah-ingest: ${products.length} ham üründen 0 ürün çıktı — AH DEĞİŞTİRİLMEDİ`)
    return res.status(422).json({ error: 'Ham veriden 0 ürün çıkarıldı, market korundu', received: products.length })
  }

  const created = await replaceMarketProducts('Albert Heijn', parsed)
  console.log(`📦 ah-ingest: ${products.length} ham → ${parsed.length} parse → ${created.length} kaydedildi`)
  res.json({ success: true, received: products.length, parsed: parsed.length, count: created.length })
}))

// POST /api/scraper/aldi-ingest - Aldi'nin HAM algoliaDataMap'i
//
// Railway'in IP'sinden Aldi API'sine erişim güvenilmez: 2026-08-11 taraması hiç
// ürün döndürmedi, aynı API residential IP'den 210 ürün/29 indirimli veriyor.
// Ağ katmanı dışarı alındı, parse burada tek kopya (ah-ingest ile aynı desen).
app.post('/api/scraper/aldi-ingest', requireAdmin, asyncHandler(async (req, res) => {
  const { algoliaDataMap } = req.body
  if (!algoliaDataMap || typeof algoliaDataMap !== 'object') {
    return res.status(400).json({ error: 'algoliaDataMap (ham Aldi offer API çıktısı) gerekli' })
  }

  const parsed = parseAldiProducts(algoliaDataMap, nearestSunday())
  const withDiscount = parsed.filter(p => p.originalPrice > p.discountedPrice).length

  // 0 ürün çıktıysa Aldi'yi SİLME — ah-ingest ile aynı koruma.
  if (!parsed.length) {
    console.error(`🚨 aldi-ingest: ${Object.keys(algoliaDataMap).length} ham üründen 0 ürün çıktı — ALDİ DEĞİŞTİRİLMEDİ`)
    return res.status(422).json({ error: 'Ham veriden 0 ürün çıkarıldı, market korundu' })
  }
  // 0 İNDİRİMLİ de reddediliyor: 10 Ağustos'ta tam bu veri seti (76 ürün, hepsi
  // non-food sabit fiyatlı) kaydedildi ve site bir gün Aldi'de 0 aanbieding gösterdi.
  if (withDiscount === 0) {
    console.error(`🚨 aldi-ingest: ${parsed.length} ürün var ama 0 indirimli — ALDİ DEĞİŞTİRİLMEDİ`)
    return res.status(422).json({ error: 'Hiçbir ürün indirimli değil, market korundu', parsed: parsed.length })
  }

  const created = await replaceMarketProducts('Aldi', parsed)
  console.log(`📦 aldi-ingest: ${Object.keys(algoliaDataMap).length} ham → ${parsed.length} parse (${withDiscount} indirimli) → ${created.length} kaydedildi`)
  res.json({ success: true, parsed: parsed.length, withDiscount, count: created.length })
}))

// POST /api/scraper/run - Manuel olarak scraper çalıştırır (Arayüzden tetiklendiğinde)
app.post('/api/scraper/run', requireAdmin, scraperLimit, (req, res) => {
  if (scraperRunning) {
    return res.json({ success: true, running: true, message: 'Scraper zaten çalışıyor.' })
  }
  // Hemen 202 döndür, scraper arka planda çalışsın
  res.json({ success: true, running: true, message: 'Scraper başlatıldı.' })
  runScraperJob().catch(e => console.error('Manuel scraper hatası:', e.message))
})

app.get('/api/ads-txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.send('google.com, pub-6266103134639533, DIRECT, f08c47fec0942fa0\n')
})

// ===== Health Check =====
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '🚀 Backend çalışıyor', version: '2026-05-14-v4' })
})

// GET /api/health/scraper - Market bazında ürün sayıları ve indirim istatistikleri
app.get('/api/health/scraper', asyncHandler(async (req, res) => {
  const stats = await getScraperStats()
  res.json({
    ...stats,
    scraperRunning,
    // Alarmın ŞU AN ne gördüğü — reportScraperHealth ile aynı fonksiyondan.
    // Böylece "alarm tespit etmedi mi, yoksa mail mi gidemedi" sorusu Railway
    // loguna bakmadan cevaplanabiliyor.
    alerts: computeScraperAlerts(stats.markets),
    // Son scraper çalışmasının izi (market başına kaç ürün döndü, hangileri boştu)
    lastScrapeRun,
    // Son alarm denemesi ve e-posta teslimatının sonucu
    lastAlertRun,
  })
}))

// POST /api/user/email - Store user email after OAuth login (for watchlist alerts)
app.post('/api/user/email', asyncHandler(async (req, res) => {
  const { userId, email } = req.body
  if (!userId || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'userId en geldig email zijn verplicht' })
  }
  await upsertUserEmail(userId, email)
  res.json({ ok: true })
}))

// GET /api/newsletter/unsubscribe - Remove contact from Brevo list
app.get('/api/newsletter/unsubscribe', asyncHandler(async (req, res) => {
  const { email } = req.query
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).send('Ongeldig e-mailadres')
  }
  const apiKey = process.env.BREVO_API_KEY
  const listId = parseInt(process.env.BREVO_LIST_ID || '0', 10)
  if (apiKey && listId) {
    await fetch(`https://api.brevo.com/v3/contacts/lists/${listId}/contacts/remove`, {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails: [email] }),
    }).catch(() => {})
  }
  res.redirect('https://www.dealhunter4u.nl?unsubscribed=1')
}))

app.post('/api/newsletter/subscribe', newsletterLimit, asyncHandler(async (req, res) => {
  const { email } = req.body
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Ongeldig e-mailadres' })
  }

  const apiKey = process.env.BREVO_API_KEY
  const listId = parseInt(process.env.BREVO_LIST_ID || '0', 10)

  if (!apiKey || !listId || isNaN(listId)) {
    return res.status(503).json({ error: 'Newsletter service niet beschikbaar' })
  }

  const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, listIds: [listId], updateEnabled: false }),
  })

  if (brevoRes.status === 201 || brevoRes.status === 204) {
    return res.json({ success: true })
  }

  const data = await brevoRes.json().catch(() => ({}))
  // Al zeker ingeschreven → toch success tonen
  if (data.code === 'duplicate_parameter') {
    return res.json({ success: true })
  }

  console.error('[Newsletter] Brevo error', brevoRes.status, JSON.stringify(data))
  res.status(500).json({ error: 'Aanmelding mislukt, probeer het later opnieuw' })
}))

// POST /api/deal-alerts/subscribe
app.post('/api/deal-alerts/subscribe', newsletterLimit, asyncHandler(async (req, res) => {
  const { email, keyword, market } = req.body
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Ongeldig e-mailadres' })
  }
  if (!keyword || keyword.trim().length < 2) {
    return res.status(400).json({ error: 'Vul een zoekwoord in (minimaal 2 tekens)' })
  }
  const crypto = await import('crypto')
  const token = crypto.randomBytes(24).toString('hex')
  await subscribeDealAlert({ email, keyword: keyword.trim(), market: market || null, token })
  res.json({ success: true, message: `Je ontvangt een alert zodra er "${keyword}" aanbiedingen zijn.` })
}))

// GET /api/deal-alerts/unsubscribe?token=xxx
app.get('/api/deal-alerts/unsubscribe', asyncHandler(async (req, res) => {
  const { token } = req.query
  if (!token) return res.status(400).json({ error: 'Token ontbreekt' })
  const removed = await unsubscribeDealAlert(token)
  if (removed) {
    res.send('<html><body style="font-family:sans-serif;text-align:center;padding:60px"><h2>✅ Uitgeschreven</h2><p>Je ontvangt geen deal alerts meer.</p><a href="https://www.dealhunter4u.nl">Terug naar DealHunter4U</a></body></html>')
  } else {
    res.status(404).send('<html><body>Token niet gevonden.</body></html>')
  }
}))

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı' })
})

// ===== Global Error Handler =====
app.use((err, req, res, next) => {
  console.error('❌ Hata:', err)
  res.status(500).json({ error: 'Sunucu hatası' })
})

// ===== Server Start =====
async function startServer() {
  try {
    await initDatabase()
    const server = app.listen(PORT, () => {
      console.log(`🚀 Backend çalışıyor: http://localhost:${PORT}`)
      console.log(`📊 Health check: http://localhost:${PORT}/health`)
    })
    server.setTimeout(600000)

    // Açılışta expired ürünleri temizle + orphan temizle.
    // 1 gün tolerans: dün biten ürünler yeni tarama gelene kadar kalır — aksi halde
    // Pazartesi 00:00-08:00 arası her restart (deploy!) haftalık marketleri boşaltıyordu.
    setTimeout(async () => {
      try {
        await clearOrphanProducts()
        const deleted = await clearExpiredProducts(1)
        if (deleted > 0) console.log(`🧹 ${deleted} tarihi geçmiş ürün DB'den silindi.`)
        const count = await getProductCount()
        if (count > 100) {
          console.log(`🚀 DB'de ${count} ürün var, açılış taraması atlanıyor.`)
          return
        }
        console.log('🚀 DB boş, açılış taraması başlatılıyor...')
        await runScraperJob()
      } catch (e) {
        console.error('❌ Açılış tarama hatası:', e.message)
      }
    }, 10000)

  } catch (error) {
    console.error('❌ Başlatma hatası:', error)
    process.exit(1)
  }
}

startServer()
