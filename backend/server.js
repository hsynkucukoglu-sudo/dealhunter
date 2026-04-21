import express from 'express'
import cors from 'cors'
import { initDatabase } from './db.js'
import { getProducts, getProduct, createProduct, deleteProduct, updateProduct, updateProductImage, clearAllProducts } from './models.js'
import { scrapeFlyerProducts } from './scraper/index.js'
import { categorize } from './categorize.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Extracted screenshots
app.use(express.static(path.join(__dirname, 'public')))

const isProduction = process.env.NODE_ENV === 'production'

// Hata yönetimi middleware'i
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// ===== API Routes =====

// GET /api/ah-image/:id - AH ürün görselini ID ile çek
app.get('/api/ah-image/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  if (!id || !/^\d+$/.test(id)) return res.status(400).send()

  // Ürün sayfasından JSON-LD ile görsel URL'si bul
  const pageRes = await fetch(`https://www.ah.nl/producten/product/wi${id}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'nl-NL,nl;q=0.9',
      'Referer': 'https://www.ah.nl/',
    },
    signal: AbortSignal.timeout(8000),
  })
  if (!pageRes.ok) return res.status(404).send()

  const html = await pageRes.text()
  const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  if (!jsonLd) return res.status(404).send()

  const jd = JSON.parse(jsonLd[1])
  const imageUrl = jd.image
  if (!imageUrl) return res.status(404).send()

  // Görseli çek ve ilet
  const imgRes = await fetch(imageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://www.ah.nl/',
    },
    signal: AbortSignal.timeout(8000),
  })
  if (!imgRes.ok) return res.status(404).send()

  res.setHeader('Content-Type', imgRes.headers.get('content-type') || 'image/jpeg')
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
app.post('/api/products', asyncHandler(async (req, res) => {
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
app.put('/api/products/:id', asyncHandler(async (req, res) => {
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
app.patch('/api/products/:id/image', asyncHandler(async (req, res) => {
  const { imageUrl } = req.body
  if (!imageUrl) return res.status(400).json({ error: 'imageUrl gerekli' })
  await updateProductImage(req.params.id, imageUrl)
  res.json({ ok: true })
}))

// DELETE /api/products/:id - Ürünü sil
app.delete('/api/products/:id', asyncHandler(async (req, res) => {
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

    // Bulunan ürünleri veritabanına ekle
    const createdProducts = []
    for(const p of newProducts) {
       const saved = await createProduct({ ...p, category: categorize(p.name) })
       createdProducts.push(saved)
    }

    console.log(`⏰ Görev Tamamlandı. ${createdProducts.length} yeni ürün eklendi.`)
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

// POST /api/scraper/run - Manuel olarak scraper çalıştırır (Arayüzden tetiklendiğinde)
app.post('/api/scraper/run', asyncHandler(async (req, res) => {
  const createdProducts = await runScraperJob()
  res.json({ success: true, count: createdProducts.length, message: `${createdProducts.length} yeni bülten ürünü çekildi.` })
}))

// ===== Health Check =====
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '🚀 Backend çalışıyor' })
})

// ===== 404 Handler / SPA Fallback =====
if (isProduction) {
  const frontendDist = path.join(__dirname, '..', 'frontend', 'dist')
  // Hashed assets uzun süre cache'lenebilir
  app.use('/assets', express.static(path.join(frontendDist, 'assets'), {
    maxAge: '1y',
    immutable: true,
  }))
  // Diğer statik dosyalar
  app.use(express.static(frontendDist, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      }
    },
    index: false,
  }))
  // SPA fallback — sadece /api olmayan route'lar için
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' })
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
} else {
  app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint bulunamadı' })
  })
}

// ===== Global Error Handler =====
app.use((err, req, res, next) => {
  console.error('❌ Hata:', err)
  res.status(500).json({ error: 'Sunucu hatası', message: err.message })
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
