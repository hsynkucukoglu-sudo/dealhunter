import express from 'express'
import cors from 'cors'
import { initDatabase } from './db.js'
import { getProducts, getProduct, createProduct, deleteProduct, updateProduct, updateProductImage, updateProductCategory, clearAllProducts } from './models.js'
import { scrapeFlyerProducts } from './scraper/index.js'
import { categorize } from './categorize.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

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

  // Görseli çek ve ilet
  const imgRes = await fetch(imageUrl, {
    headers: AH_HEADERS,
    signal: AbortSignal.timeout(10000),
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

// PATCH /api/products/:id/category - Kategori güncelle
app.patch('/api/products/:id/category', asyncHandler(async (req, res) => {
  const { category } = req.body
  if (!category) return res.status(400).json({ error: 'category gerekli' })
  await updateProductCategory(req.params.id, category)
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
  res.json({ status: 'ok', message: '🚀 Backend çalışıyor', version: '2026-04-21-v2' })
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
  // SPA fallback — bot gelirse ürünleri HTML'e göm, normal kullanıcıya SPA ver
  app.get('*', asyncHandler(async (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' })

    const ua = req.headers['user-agent'] || ''
    const isBot = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandex|sogou|facebot|ia_archiver|twitterbot|linkedinbot|whatsapp|telegrambot/i.test(ua)

    if (!isBot) {
      return res.sendFile(path.join(frontendDist, 'index.html'))
    }

    // Bot: ürünleri DB'den çek, HTML'e göm
    const products = await getProducts()
    const productCards = products.slice(0, 200).map(p => {
      const discount = p.originalPrice > p.discountedPrice
        ? Math.round(((p.originalPrice - p.discountedPrice) / p.originalPrice) * 100)
        : 0
      return `
        <article itemscope itemtype="https://schema.org/Product">
          <h2 itemprop="name">${escapeHtml(p.name)}</h2>
          <p itemprop="brand">${escapeHtml(p.market)}</p>
          ${p.imageUrl && !p.imageUrl.startsWith('ah-product-id:') ? `<img itemprop="image" src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.name)}" loading="lazy"/>` : ''}
          <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
            <meta itemprop="priceCurrency" content="EUR"/>
            <span itemprop="price" content="${p.discountedPrice}">€${p.discountedPrice.toFixed(2)}</span>
            ${discount > 0 ? `<s>€${p.originalPrice.toFixed(2)}</s> <strong>-%${discount}</strong>` : ''}
            <meta itemprop="availability" content="https://schema.org/InStock"/>
          </div>
          <p>Geldig t/m: ${escapeHtml(p.expiresAt || '')}</p>
        </article>`
    }).join('\n')

    const markets = [...new Set(products.map(p => p.market))].join(', ')

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(`<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>DealHunter — Beste Supermarkt Aanbiedingen Nederland</title>
  <meta name="description" content="Vergelijk wekelijkse aanbiedingen van Albert Heijn, Jumbo, Lidl, Dirk en meer. Bespaar op boodschappen met de beste supermarktdeals."/>
  <meta name="keywords" content="supermarkt aanbiedingen, albert heijn bonus, jumbo deals, lidl folder, dirk aanbiedingen, besparen boodschappen"/>
  <link rel="canonical" href="https://dealhunter4u.nl/"/>
  <meta property="og:title" content="DealHunter — Beste Supermarkt Aanbiedingen"/>
  <meta property="og:description" content="Vergelijk wekelijkse aanbiedingen van alle grote supermarkten."/>
  <meta property="og:url" content="https://dealhunter4u.nl"/>
  <meta property="og:type" content="website"/>
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "DealHunter",
    "url": "https://dealhunter4u.nl",
    "description": "Wekelijkse supermarkt aanbiedingen van " + markets,
    "potentialAction": { "@type": "SearchAction", "target": "https://dealhunter4u.nl/?q={search_term_string}", "query-input": "required name=search_term_string" }
  })}</script>
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DealHunter",
    "url": "https://dealhunter4u.nl",
    "logo": {
      "@type": "ImageObject",
      "url": "https://dealhunter4u.nl/icon-512x512.png",
      "width": 512,
      "height": 512
    },
    "sameAs": ["https://dealhunter4u.nl"]
  })}</script>
  <style>
    body { font-family: sans-serif; max-width: 1200px; margin: 0 auto; padding: 1rem; background: #F5EDE3; color: #1A1A1A; }
    h1 { color: #E33D26; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
    article { background: white; border-radius: 12px; padding: 1rem; }
    article img { width: 100%; height: 160px; object-fit: contain; }
    strong { color: #E33D26; }
  </style>
</head>
<body>
  <header>
    <h1>DealHunter — Beste Supermarkt Aanbiedingen Nederland</h1>
    <p>${products.length} actieve aanbiedingen van ${escapeHtml(markets)}</p>
  </header>
  <main class="grid">
    ${productCards}
  </main>
  <footer>
    <p>DealHunter vergelijkt wekelijkse aanbiedingen van alle grote Nederlandse supermarkten.</p>
  </footer>
</body>
</html>`)
  }))
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
