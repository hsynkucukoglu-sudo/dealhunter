import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import httpProxy from 'http-proxy'
import { initDatabase } from './db.js'
import { getProducts, getProduct, createProduct, deleteProduct, updateProduct, updateProductImage, updateProductCategory, clearAllProducts } from './models.js'
import { saveSubscription, deleteSubscription, getUserFavorites, addUserFavorite, removeUserFavorite, getSubscriptionsForFavoritedProducts, recordPriceHistory, getMinPriceMap, getComparisonGroups, getScraperStats } from './db.js'
import { sendPushToAll, sendPushToSubscriptions } from './push.js'
import { scrapeFlyerProducts } from './scraper/index.js'
import { categorize } from './categorize.js'

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

// ===== Admin Auth Middleware =====
const requireAdmin = (req, res, next) => {
  const token = process.env.ADMIN_TOKEN
  if (!token) return next() // no token configured → dev mode, allow
  const auth = req.headers['authorization']
  if (!auth || auth !== `Bearer ${token}`) {
    return res.status(401).json({ error: 'Yetkisiz erişim' })
  }
  next()
}

// Middleware
app.use(cors())
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

// GET /api/products - Tüm ürünleri getir
app.get('/api/products', asyncHandler(async (req, res) => {
  const products = await getProducts()
  res.json(products || [])
}))

// GET /api/status - Scraper durumu
app.get('/api/status', (req, res) => {
  res.json({ scraperRunning })
})

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
async function runScraperJob() {
  if (scraperRunning) {
    console.log('⏰ Scraper zaten çalışıyor, atlanıyor...')
    return []
  }
  scraperRunning = true
  console.log('⏰ Otomatik Zamanlanmış Scraper Görevi Başlıyor...')

  try {
  const newProducts = await scrapeFlyerProducts()

  // Sadece ürünler başarıyla geldiyse eskileri temizle
  if (newProducts && newProducts.length > 0) {
    await clearAllProducts()

    // Bulunan ürünleri veritabanına ekle (NaN fiyatlıları atla)
    const createdProducts = []
    for (const p of newProducts) {
      const orig = parseFloat(p.originalPrice)
      const disc = parseFloat(p.discountedPrice)
      if (isNaN(orig) || isNaN(disc) || disc <= 0) continue
      try {
        const saved = await createProduct({ ...p, originalPrice: orig, discountedPrice: disc, category: categorize(p.name) })
        createdProducts.push(saved)
      } catch (e) {
        console.error(`  ⚠️ Ürün kaydedilemedi (${p.name}):`, e.message)
      }
    }

    console.log(`⏰ Görev Tamamlandı. ${createdProducts.length} yeni ürün eklendi.`)

    // Fiyat geçmişini kaydet
    recordPriceHistory(createdProducts).catch(e => console.error('Fiyat geçmişi kayıt hatası:', e.message))

    // IndexNow ping — Bing/Yandex'e güncel URL'leri bildir
    const INDEXNOW_KEY = 'dh4u-2026-x9k3m7p2'
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

      // 2. Genel push — hedefli bildirim almayanlara
      sendPushToAll({
        title: '🛒 Nieuwe aanbiedingen beschikbaar!',
        body: `${createdProducts.length} nieuwe deals van Albert Heijn, Jumbo, Lidl en meer.`,
        url: 'https://www.dealhunter4u.nl',
        icon: 'https://www.dealhunter4u.nl/icon-512x512.png',
      }, targetedEndpoints).catch(e => console.error('Genel push hatası:', e.message))
    }

    return createdProducts
  } else {
    console.log('❌ Yeni ürün bulunamadı, tablo güncellenmedi.')
    return []
  }
  } finally {
    scraperRunning = false
  }
}

// "Her Pazartesi sabah 08:00'de" otomatik çalışacak Cron Job
cron.schedule('0 8 * * 1', async () => {
  try {
    await runScraperJob()
  } catch (error) {
    console.error('⏰ Scraper Zamanlama Hatası:', error)
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

// GET /api/compare - SQL tabanlı fiyat karşılaştırma grupları (isim + boyut kombinasyonu)
app.get('/api/compare', asyncHandler(async (req, res) => {
  const rows = await getComparisonGroups()
  res.json(rows)
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
  res.json({ ...stats, scraperRunning })
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

// ===== API 404 Handler =====
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı' })
})

// ===== Next.js Proxy =====
const NEXT_PORT = process.env.NEXT_PORT || 3000
const nextProxy = httpProxy.createProxyServer({ target: `http://localhost:${NEXT_PORT}`, xfwd: true })
nextProxy.on('error', (_err, _req, res) => {
  res.writeHead(502, { 'Content-Type': 'text/html' })
  res.end('<h1>Frontend başlatılıyor, lütfen bekleyin...</h1>')
})
app.use((req, res) => {
  nextProxy.web(req, res)
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

    // Açılışta otomatik tarama — 5 sn bekle ki sunucu tam ayağa kalksın
    setTimeout(async () => {
      try {
        console.log('🚀 Açılış taraması başlatılıyor...')
        await runScraperJob()
      } catch (e) {
        console.error('❌ Açılış tarama hatası:', e.message)
      }
    }, 5000)

  } catch (error) {
    console.error('❌ Başlatma hatası:', error)
    process.exit(1)
  }
}

startServer()
