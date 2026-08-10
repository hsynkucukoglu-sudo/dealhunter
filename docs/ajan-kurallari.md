---
date: 2026-08-09
tags: [dealhunter, ajanlar, kurallar]
status: active
---

# Ajan Kuralları — HER AJAN ÖNCE BUNU OKUR

Bu dosya, DealHunter'da pahalıya öğrenilmiş derslerin listesi. Ajanlar soğuk başlar
ve geçmiş oturumları hatırlamaz; bu dosya olmadan aynı hataları sıfırdan tekrarlarlar.

---

## 0. Sistem koordinatları

| Ne | Nerede |
|---|---|
| Site | `https://www.dealhunter4u.nl` |
| Backend API | `https://dealhunter-production-d900.up.railway.app` |
| Repo | `Yeni klasör/dealhunter-market/` |
| Scraper sağlığı | `GET /api/health/scraper` (açık) |
| Tıklama raporu | `GET /api/track/stats?days=14` — **`Authorization: Bearer $TRACK_STATS_KEY`** |
| Abone sayıları | `GET /api/audience/stats` — aynı header |
| Ürünler | `GET /api/products` |
| Fiyat geçmişi | `GET /api/kortingsindex-history` |

Backend Railway'de, frontend Next.js. Scraper'ların bir kısmı GitHub Actions'ta
(AH 08:10, Kruidvat 08:15, Plus 09:00, Dirk Pzt 08:30), gerisi backend cron'da (08:00 UTC).

---

## 1. Ölçüm dersleri

### 1.1 Yüzdeye değil, MUTLAK SAYIYA bak
GSC'de "%6,5 TO" gördüğünde tıklama sayısını kontrol et. 2026-08-09'da "dagdeal
fırsatı" diye bir iş önerildi; dayanağı **3 tıklamaydı**. Aynı gün çürütüldü.

**Kural:** 20 tıklamanın altındaki hiçbir TO farkı sinyal değildir.

### 1.2 Toplulaştırılmış metrik önce kapsama kontrolünden geçer
Scraper kapsamı market başına 20 kata kadar farklı ve zaman içinde sıçrıyor
(AH 2026-06-15'te 193→676). "Ortalama indirim" gibi her metrik bundan zehirlenir.
2026-08-01'de "fiyat endeksi ile otorite kur" önerisi tam bu yüzden çürüdü.

**Kural:** market karşılaştıran bir iddia yayınlamadan önce her marketin ürün
sayısını ve o sayının haftalık oynaklığını yaz.

### 1.3 Kendi tarayıcında SERP kontrol etme
Kişiselleştirme yüzünden kendi tarayıcında 3. sırada görünen sayfa GSC'de 8,5'te
olabilir. GSC'nin konumu gerçek olandır.

### 1.4 Ölçüm penceresi dolmadan yorum yapma
GSC değişiklikleri 2-4 hafta sonra okunur. Google ~2 haftada bir tarar.

---

## 2. Sessiz arıza deseni (bu projenin bir numaralı sorunu)

Üç kez günlerce fark edilmedi: **Hoogvliet** (Imperva), **Kruidvat** (Akamai),
**Albert Heijn** (Akamai, 5 gün). Desen hep aynı:

> Scraper 0 ürün döner → scheduler 0 ürünlü marketi bilinçli SİLMEZ (doğru davranış,
> eski veri kalsın diye) → site eski veriyle çalışmaya devam eder → hiçbir uyarı çıkmaz.

Ayrıca **kısmi** arıza da aynı sınıf: 2026-08-09'da AH scraper'ı 30 sayfanın 20'sini
çekip kalanı sessizce atladı, workflow **yeşil** göründü, AH'nin üçte biri kayboldu.

**Kurallar:**
- `continue-on-error: true` KULLANMA. Hoogvliet'te bu bayrak aylarca arızayı gizledi.
- Bir scraper "başarılı" derken kaç birim çektiğini beklenen sayıyla karşılaştır
  (`sayfa: 30/30` gibi), sadece "hata yok"a bakma.
- Veri yazan her yol için sor: 0 sonuç dönerse ne oluyor? Sessizce mi geçiyor?
- Alarm ölçütü "bu çalışmada 0 döndü" DEĞİL, **"verinin yaşı"** olmalı — çünkü bazı
  marketleri backend değil ayrı workflow'lar besliyor ve onlar sonra çalışır.

---

## 3. Git ve deploy

### 3.1 `git add -A` YASAK
Repo kökünde `.env.whatsapp.txt` var (Green API token). Bir kez yanlışlıkla commit'e
girdi. **Dosyaları her zaman isimle ekle.**

### 3.2 Railway tuzakları
1. Panel'deki "Deploy" butonu son commit'i deploy ETMEZ — son *başarılı* build'i geri
   yükler. Yeni kod için yeni commit push et.
2. Railway kendi SHA'larını gösterir, GitHub'dakilerle eşleşmez. Commit **mesajından** eşleştir.
3. Build log kaybolursa: lockfile senkronu → gitignore kapsamı → yerel `tsc`+`build`
   → `frontend-next/Dockerfile` sonundaki cache buster satırını ilerlet.

### 3.3 Build'i atlama
`auth.ts` kaynaklı bir build hatası günlerce TÜM deploy'ları bloke etti ve fark
edilmedi. Backend değişikliğinde `node --check`, frontend'de `tsc --noEmit` + `next build`.

### 3.4 Next.js sürümü farklı
`frontend-next/AGENTS.md`: bu bildiğin Next.js değil. Kod yazmadan önce
`node_modules/next/dist/docs/` içindeki ilgili rehberi oku.

---

## 4. Affiliate kuralları

- **Daisycon `dl=` parametresi çoğunlukla KIRIK** — hedef URL ana sayfaya yapıştırılıp
  404 üretiyor. 36 girişten 35'i kırıktı. Varsayılan desen: `dl`siz tam link.
- Yeni affiliate linki eklerken `dl`li VE `dl`siz curl testi ZORUNLU.
- Link satan siteye (ör. Bespaartop100) para verme — Google spam politikası, kendi
  siteni riske atar.
- Affiliate ağları compliance taramasında `/contact-us` ve `/privacy` kontrol eder.
  Oralarda 404 program reddine yol açabilir.
- TradeTracker/affilired gibi ağların **doğrulama botları** Clarity'de gerçek oturum
  gibi görünür. Ham oturum sayısına değil, referrer kırılımına bak.

---

## 5. Veri kalitesi

- **Yüksek indirim = veri hatası** olabilir: birim verisi kapsamı %0-39 indirimde %62,
  %70+ indirimde **%0**. Ama %67'deki 3-al-1-öde kampanyaları GERÇEK — körü körüne
  "yüksek indirim = hata" deme, gerçek fırsatları da elersin.
- Jenerik ürün isimleri farklı ürünleri çarpıştırır ("Lipton" €2,25-€19,38).
  `getMinPriceMap`'te 3,5x oran koruması bunun için var.
- `price_history.product_id` (AH webshopId / Jumbo sku / Kruidvat code) **yazılıyor
  ama henüz okunmuyor** — okumaya çevirmek en büyük 3 marketin geçmişini sıfırlar,
  bilinçli bekletiliyor.
- Kaynak API'ler şema değiştirir, sessizce. AH 2026-08-09'da `p.price`,
  `p.unitSizeDescription`, `p.unitSize` alanlarını kaldırdı; fark edilmeseydi birim
  verisi %81'den %0'a düşecekti. **Parser yazarken alanın var olduğunu canlı API'de doğrula.**

---

## 6. Yayınlanmış iddialar için yasaklı liste

Bunları outreach/blog/basın metninde KULLANMA:
- ❌ Fiyat geçmişi / "laagste prijs ooit" — ürün eşleştirmesi henüz güvenilir değil
- ❌ "Tek site olan…" gibi üstünlük iddiaları — doğrulanamaz
- ❌ Somut tasarruf rakamı ("haftada €30 tasarruf") — dayanağı yok
- ❌ Ortalama indirim ile market sıralaması — kapsama yanlılığı (bkz. 1.2)

- ❌ **"Folder siteleri sadece PDF yayınlıyor, fiyat veremezler"** — 2026-08-10'da
  ÇÜRÜTÜLDÜ. folderz.nl'in online teklif sayfalarında tam fiyat verisi var
  (€38,94 → €35,99 + "Je bespaart €2,95"). Sadece *offline/folder* tarafı fiyatsız.
  Savunulabilir fark: süpermarket odağı ve market-arası karşılaştırma, "fiyat verisi
  var/yok" değil. Bkz. `docs/rakip-analizi-2026-08-10.md`.

Kullanılabilir olgusal sayımlar: canlı teklif sayısı, market sayısı, güncelleme
sıklığı, ücretsiz/hesapsız olması.

---

## 7. Kapanmış tartışmalar — yeniden açma

Bunlar veriyle birden fazla kez test edildi:

| Konu | Karar | Kanıt |
|---|---|---|
| Head-term'ler (`lidl aanbiedingen` vb.) | **Kovalanmayacak** | ~20 B gösterim → 8 tıklama, konum 8-9, 1-2. sıra marketin kendi sitesi. 4 kez doğrulandı |
| "Daha çok karşılaştırma yazısı yaz" | **Hayır** | 46 yazı var, 9'u karşılaştırma, konum 3-6 ama 3 ayda 30-100 gösterim — sorgu hacmi yok |
| Fiyat endeksi ile otorite | **Hayır** | Kapsama yanlılığı + promosyon fiyatı, savunulabilir yorumu yok |
| Coop scraper | **Park** | OutSystems SPA, 403, zaten gizli market |
| Hoogvliet | **Kovalanmayacak** | Imperva, cron kapatıldı, DB'de 0 ürün |
| Sosyal medyada elle içerik | **Hayır** | Kullanıcının zaman bütçesi ~0 saat/hafta; sadece tam otomatik kanallar |

Yeniden açmak için **yeni veri** gerekir, yeni fikir değil.

---

## 8. Rapor formatı

Her ajan raporunu şöyle bitirir:

- **Bulgu** — ne gördün, hangi ölçümle (mutlak sayı ver)
- **Kanıt** — komut/URL/dosya:satır
- **Emin olmadığın** — açıkça yaz, "muhtemelen"i gizleme
- **Öneri** — tek bir sonraki adım, gerekçesiyle

Bulgu yoksa "bulgu yok" yaz. İş üretmek için iş uydurma.
