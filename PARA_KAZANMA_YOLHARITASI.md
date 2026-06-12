# DealHunter — Para Kazanma Yol Haritası

**Site:** https://www.dealhunter4u.nl
**Güncelleme:** 12 Haziran 2026

---

## ✅ Faz 1 — Tamamlandı (Trafik & Temel Monetizasyon)

### SEO Temeli
- [x] Google Search Console + sitemap.xml + robots.txt
- [x] Organization / WebSite / BreadcrumbList / FAQ schema
- [x] Her market için ayrı sayfa (`/supermarkt/[slug]` — 8 market)
- [x] Kategori sayfaları (`/categorie/[slug]` — 10 kategori)
- [x] Meta title/description optimizasyonu (GSC CTR odaklı)
- [x] **30 blog yazısı** (market gidsleri, ürün kategorileri, vergelijkingen)
- [x] Haftalık otomatik "beste deals" sayfası (`/blog/beste-deals/[week]`)

### Monetizasyon
- [x] Google AdSense **onaylandı** + slot ID'leri eklendi
- [x] Daisycon affiliate kaydı (medya onayı bekleniyor)
- [x] Ürün kartlarında "Naar [market]" butonu (direkt market linki)
- [x] GA4 (G-Y253QH18ZH) + Microsoft Clarity analytics

### Ürün & Teknik
- [x] 9 market scraper (AH, Jumbo, Lidl, Dirk, Aldi, Hoogvliet, Vomar, DekaMarkt) — ~640 ürün
- [x] Fuzzy search (Fuse.js), kategori/market/kampanya filtreleri
- [x] Favori/watchlist + konum bazlı filtreleme (posta kodu)
- [x] Fiyat karşılaştırma + "Laagste prijs!" badge + price_history
- [x] PWA + VAPID push notification + hedefli bildirim
- [x] Google OAuth login (web + Android APK)
- [x] GDPR cookie banner, Brevo newsletter (double opt-in)
- [x] Android APK hazır (Capacitor 8 Live URL mode)
- [x] Core Web Vitals optimizasyonları (INP, CLS, scroll depth)

---

## 🔵 Faz 2 — Şu An Buradayız (Büyüme & Gelir)

**Hedef:** Aylık 20.000+ ziyaretçi, ilk anlamlı AdSense + affiliate geliri.

### 2.1 İçerik & SEO
- [x] Blog 13 → 30 yazı
- [x] **404 hataları çözüldü** (weekly deals route + 9 kırık iç link + build hatası)
- [x] **GSC keyword optimizasyonu** — AH, Dirk, DekaMarkt, Jumbo meta title/desc güçlendirildi
- [x] İç linkleme stratejisi — kategori→blog + blog→ilgili yazılar (getRelatedPosts)
- [x] Blog görselleri — CSS-only kategori banner sistemi (emoji + accent color)
- [ ] **"Maaltijdbox vergelijken" blog yazısı** — Marley Spoon affiliate için → *SIRADAKİ*

### 2.2 Email & Bildirim ✅
- [x] "Haftanın En İyi Fırsatları" haftalık bülteni (Brevo, Pzt 09:00 cron)
- [x] Watchlist email bildirimi (favori ürün indirime girince, AuthEmailSync)
- [x] Push notification segmentasyonu (market/kategori bazlı)

### 2.3 Gelir Optimizasyonu
- [x] AdSense blog sayfasına 2. slot eklendi (başlık altı + gövde sonrası)
- [x] Marley Spoon NL affiliate başvurusu — Awin (onay bekleniyor, ~82 gün cookie)
- [ ] Daisycon medya onayı kontrol → onaylanınca affiliate ID'leri entegre et
- [ ] Marley Spoon onayı sonrası blog yazılarına affiliate link ekle

---

## 🟡 Faz 3 — Ölçeklendirme (gelir başlayınca)

**Hedef:** Aylık €1.000+ gelir, 100.000+ ziyaretçi.

### 3.1 Yeni Marketler (Railway Pro $5/ay gerekli)
- [ ] **Plus** market (OutSystems SPA — Puppeteer gerekli)
- [ ] **Coop** market (OutSystems SPA — Puppeteer gerekli)
- *Not: Gelir başlayınca Railway Pro'ya geçilecek (kullanıcı kararı)*

### 3.2 Mobil & Genişleme
- [ ] Play Store yayını ($25 developer hesabı — APK hazır)
- [ ] Premium üyelik (€1.99/ay): anlık bildirim, fiyat geçmişi, gelişmiş filtre
- [ ] Stripe entegrasyonu
- [ ] Belçika marketleri (Colruyt, Delhaize)

### 3.3 Market Ortaklıkları
- [ ] Küçük marketlerle doğrudan "sponsored listing" (€50–200/hafta)

---

## Gelir Modeli Özeti

| Kaynak | Faz | Tahmini Aylık | Durum |
|--------|-----|---------------|-------|
| Google AdSense | 1–2 | €20–100 | ✅ Onaylı, aktif |
| Affiliate (Daisycon) | 1–2 | €50–300 | ⏳ Medya onayı bekleniyor |
| Email/push sponsorluğu | 2 | €100–500 | ⏳ Altyapı hazır |
| Premium üyelik | 3 | €100–1.000 | ⬜ Planlı |
| Sponsored listing | 3 | €200–2.000 | ⬜ Planlı |

---

## Hemen Yapılacaklar (öncelik sırası)

1. **"Maaltijdbox vergelijken" blog yazısı** — Marley Spoon affiliate link hazır olunca eklenecek
2. Daisycon medya onayını kontrol et → onaylanınca affiliate ID'leri ekle
3. GSC'yi takip et — AH/Dirk/DekaMarkt/Jumbo optimizasyonlarının etkisi 2-3 haftada görünür
4. Gelir başlayınca: Railway Pro → Plus + Coop scraper'ları
5. Play Store yayını ($25)
