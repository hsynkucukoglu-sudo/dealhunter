# DealHunter — Proje Özeti

## Genel Bakış

**DealHunter**, Hollanda'daki büyük süpermarketlerin haftalık indirimlerini karşılaştıran bir web uygulamasıdır.  
Kullanıcılar Albert Heijn, Jumbo, Lidl, Dirk ve diğer marketlerin kampanyalı ürünlerini tek sayfada görebilir, alışveriş listesi oluşturabilir.

- **Domain:** [www.dealhunter4u.nl](https://www.dealhunter4u.nl)
- **GitHub:** https://github.com/hsynkucukoglu-sudo/dealhunter
- **Deploy:** Railway (proje adı: `pleasing-learning`)

---

## Mimari

```
dealhunter-market/
├── backend/          Express.js API + PostgreSQL scraper
│   ├── server.js     REST API, görsel proxy
│   ├── db.js         PostgreSQL bağlantısı (DATABASE_URL)
│   ├── models.js     Ürün CRUD operasyonları
│   ├── categorize.js Otomatik kategori atama
│   └── scraper/
│       ├── index.js  8 market için scraper fonksiyonları
│       └── worker.js Cron ile tetiklenen scraper worker
└── frontend-next/    Next.js 15 App Router
    ├── app/          SSR sayfaları
    ├── components/   React bileşenleri
    ├── context/      Language + ShoppingList context
    └── lib/          Tip tanımları, yardımcı fonksiyonlar
```

---

## Backend

| Özellik | Detay |
|---------|-------|
| Framework | Express.js (ESM) |
| Veritabanı | PostgreSQL (Railway managed) |
| Bağlantı | `process.env.DATABASE_URL` |
| Deploy URL | https://dealhunter-production-d900.up.railway.app |
| Cron | Her Pazartesi 08:00 — scraper otomatik çalışır |

### API Endpointleri

| Endpoint | Açıklama |
|----------|----------|
| `GET /api/products` | Tüm ürünler (filtre destekli) |
| `GET /api/products/:id` | Tek ürün |
| `POST /api/products` | Ürün ekle |
| `PUT /api/products/:id` | Ürün güncelle |
| `DELETE /api/products/:id` | Ürün sil |
| `POST /api/scrape` | Manuel scrape tetikle |
| `GET /api/ah-image/:id` | AH ürün görseli proxy |

---

## Scraper

Puppeteer/Chromium **kullanılmaz** — yalnızca `fetch` + `cheerio` (Railway 512MB RAM uyumlu).

| Market | Yöntem |
|--------|--------|
| Albert Heijn | GraphQL API (`api.ah.nl`) |
| Jumbo | Cheerio SSR |
| Lidl | HTML + JSON-LD batch |
| Dirk | JSON-LD |
| Hoogvliet | HTML regex |
| Plus | Cheerio SSR |
| Aldi | JSON-LD + Cheerio HTML fallback |
| Vomar | JSON-LD + Cheerio HTML fallback |

---

## Frontend

| Özellik | Detay |
|---------|-------|
| Framework | Next.js 15, App Router |
| Stil | Tailwind CSS v4 |
| Animasyon | framer-motion |
| Fontlar | Space Grotesk, Playfair Display |
| Deploy URL | https://dealhunter-frontend-production.up.railway.app |
| Custom domain | www.dealhunter4u.nl |

### Sayfalar

| Rota | Açıklama |
|------|----------|
| `/` | Ana sayfa (SSR) — tüm marketler |
| `/supermarkt/[slug]` | Market sayfaları (9 market) |
| `/categorie/[slug]` | Kategori sayfaları (10 kategori) |
| `/privacy` | Gizlilik politikası |
| `/contact` | İletişim |
| `/api/health` | Railway healthcheck |
| `/sitemap.xml` | Otomatik sitemap |

### Marketler (slug)

`albert-heijn`, `jumbo`, `lidl`, `dirk`, `aldi`, `plus`, `hoogvliet`, `vomar`

### Kategoriler (slug)

`groente-fruit`, `zuivel`, `vlees-vis`, `dranken`, `bakkerij`, `snacks`, `maaltijden`, `verzorging`, `huishouden`, `overig`

### Bileşenler

| Bileşen | Görev |
|---------|-------|
| `ProductCard.tsx` | Ürün kartı (görsel, fiyat, indirim) |
| `ProductsPage.tsx` | Ana sayfa ürün listesi |
| `MarketPage.tsx` | Market sayfası |
| `CategoryPage.tsx` | Kategori sayfası (çok dil destekli) |
| `ShoppingListSidebar.tsx` | Alışveriş listesi yan panel |
| `AddProductForm.tsx` | Manuel ürün ekleme formu |
| `LanguageSwitcher.tsx` | TR / EN / NL dil seçici |
| `DealHunterLogo.tsx` | Inline SVG logo bileşeni |

### Context

- **LanguageContext** — TR / EN / NL dil yönetimi
- **ShoppingListContext** — Alışveriş listesi state yönetimi

---

## SEO & Metadata

- `layout.tsx`'te Organization schema.org JSON-LD
- Her market ve kategori için dinamik `metadata` (SSR)
- `sitemap.xml` — Google Search Console'a kayıtlı
- `robots.txt` mevcut
- OpenGraph etiketleri tanımlı

---

## Deploy (Railway)

### Frontend deploy
```bash
# frontend-next/ klasöründen:
railway service dealhunter-frontend
railway up --detach
```

> **Not:** `railway status` bazen yanlış servise bağlı kalabilir.  
> Her deploy öncesi `railway service dealhunter-frontend` çalıştırmak gerekir.

### Önemli env değişkenleri
| Değişken | Kullanım |
|----------|----------|
| `DATABASE_URL` | PostgreSQL bağlantısı (Railway otomatik sağlar) |
| `NEXT_PUBLIC_API_URL` | Frontend → Backend API URL |
| `NODE_ENV` | `production` / `development` |

---

## Monetizasyon Yol Haritası

| Faz | Durum | Açıklama |
|-----|-------|----------|
| Faz 1 | ✅ Tamamlandı | SEO sayfaları, sitemap, domain, logo, çok dil |
| Faz 2 | 🔄 Sıradaki | Daisycon/Awin affiliate linkleri, Google AdSense |
| Faz 3 | 📋 Planlı | Premium bildirim üyeliği €2.99/ay, sponsorluk |
| Faz 4 | 📋 Planlı | Belçika/Almanya açılımı, WhatsApp kanalı |

---

## Teknik Kararlar

- **Puppeteer yok** → Railway ücretsiz tier 512MB RAM'e sığsın diye fetch+cheerio kullanılıyor
- **DATABASE_URL** → Hardcoded host/port yerine Railway'in sağladığı env değişkeni
- **tailwindcss** → `devDependencies`'den `dependencies`'e taşındı (production build'de yüklenmesi için)
- **next.config.ts** → `/api/*` istekleri backend'e rewrite ediliyor
- **Domain** → Sadece `www.dealhunter4u.nl` çalışıyor (www'suz yönlendirme yok)
