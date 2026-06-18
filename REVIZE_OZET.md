# DealHunter — Proje Özeti (Haziran 2026 GÜNCEL)

## 🎯 Proje Amacı
Hollanda süpermarket indirim aggregator platformu. 8+ marketin (AH, Jumbo, Lidl, vb.) indirimlerini merkezi bir dashboard üzerinden sunar. Kullanıcılar tasarruf sağlar, karşılaştırma yapar ve alışveriş listesi oluşturur.

- **Canlı Site:** [www.dealhunter4u.nl](https://www.dealhunter4u.nl)
- **Repo:** [github.com/hsynkucukoglu-sudo/dealhunter](https://github.com/hsynkucukoglu-sudo/dealhunter)
- **Mimari:** Modern Full-Stack (Next.js 15 SSR + Express.js API)

---

## 🏗️ Teknik Mimari (Yeni Durum)

### 1. Backend (Express API)
- **Misyonsuzluktan Kurtuldu:** Artık statik dosya servis etmiyor veya bot-SSR yapmıyor. Sadece JSON API olarak çalışıyor.
- **Veritabanı:** PostgreSQL (Railway).
- **Affiliate Desteği:** `products` tablosu `affiliate_url` kolonu ile güncellendi.
- **Güvenlik:** API timeout (15sn) ve geliştirilmiş hata yakalama eklendi.

### 2. Frontend (Next.js 15 App Router)
- **SEO Lideri:** SSR ve dinamik metadata Next.js tarafında yönetiliyor.
- **Middleware Redirection:** `non-www` ve diğer geçici domainler `https://www.dealhunter4u.nl` adresine 301 (kalıcı) olarak yönlendiriliyor.
- **UI/UX:** API hataları için "Bağlantı Hatası" ekranı ve "Tekrar Dene" mekanizması eklendi.
- **Affiliate Flow:** Ürün kartları artık `/go?u=[affiliate-link]` yapısını destekliyor.

### 3. Scraper Motoru (Fetch + Cheerio)
- **Puppeteer SİLİNDİ:** Bellek verimliliği için Puppeteer kalıntıları temizlendi, tamamen `fetch` tabanlı sisteme geçildi.
- **Akıllı Tarih Yönetimi:** 
  - Sabit 7 günlük süre yerine, indirimlerin genel bitiş günü olan **Pazar günü** varsayılan olarak hesaplanıyor.
  - AH, Lidl, Aldi, Dirk ve Coop için **gerçek kampanya bitiş tarihleri** (priceValidUntil) kaynaktan çekiliyor.

---

## 💰 Monetizasyon Altyapısı
- **Google AdSense:** Aktif (Slot: 5913072775).
- **Affiliate (Daisycon/Awin):** Altyapı hazır. Scraper'a veya DB'ye link eklendiği anda ürün kartları otomatik olarak affiliate linklerine dönüşecek.
- **Premium (Gelecek):** Push bildirimleri ve favori takibi için premium abonelik planı.

---

## 🚦 Güncel Durum ve Next Actions

### ✅ Tamamlananlar (Haziran 2026)
1.  **Backend Sadeleştirme:** Gereksiz bot kodları ve eski SPA klasörü silindi.
2.  **SEO Fix:** www-yönlendirmesi middleware seviyesinde çözüldü.
3.  **Data Fix:** Kampanya bitiş tarihlerindeki tutarsızlık giderildi.
4.  **Affiliate Prep:** Veritabanı ve UI özel satış linklerini destekleyecek hale getirildi.

### 📋 Bekleyen Aksiyonlar
1.  **Deploy:** Yapılan kod değişikliklerinin Railway üzerine pushlanması gerekiyor.
2.  **Affiliate Link Girişi:** Onaylanan marketler için Daisycon/Awin linklerinin sisteme girilmesi.
3.  **Vomar/Coop Scraper Kontrolü:** Değişen veri yapılarına göre bitiş tarihlerinin doğrulanması.

---

## 🚀 Deploy Notu
Yapılan değişiklikleri canlıya almak için:
1. Backend servisi güncellenmeli.
2. Frontend için `frontend-next/` içinde `railway up` çalıştırılmalı.
