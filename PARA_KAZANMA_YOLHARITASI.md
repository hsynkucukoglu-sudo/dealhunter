# DealHunter — Para Kazanma Yol Haritası

**Site:** https://www.dealhunter4u.nl
**Güncelleme:** 5 Temmuz 2026 (tam site denetimi sonrası yeniden yazıldı)

---

## 📊 Mevcut Durum (5 Temmuz 2026 canlı denetim)

### Trafik — momentum gerçek, tıklama darboğazı var
- **Gösterim büyümesi: 15x bir ayda** — Haziran başı ~240/gün → Haziran sonu ~3.700/gün (GSC)
- Tıklama hâlâ günde 1-4 → **TO %0.1-0.5, asıl darboğaz bu** (sektör: %3-5)
- Title formülü (rakam+hafta+✓) + AH "Bonus" fix + sitemap fix bu hafta deploy edildi — **etkisi 1-2 hafta içinde ölçülecek**
- Tek sayfa bağımlılığı riski: `/supermarkt/aldi` tek başına toplam gösterimin **%64'ü** (15.849/24.827)
- **Kanıtlanmış format:** karşılaştırma içeriği — `/blog/albert-heijn-vs-jumbo-vs-lidl` tek başına 25 tıklama aldı (sitenin en çok tıklanan sayfası, ana sayfa hariç)

### Ürün — sağlam temel
- 1.436 ürün, 10 market, **artık günlük scraping** (5 Tem: haftalık→günlük cron fix)
- 39 blog yazısı, `/energie` + `/zomeracties` pilot sayfaları canlı
- PWA + push notification + favoriler/watchlist + fiyat karşılaştırma + price_history (DB'de var, henüz kullanıcıya açılmadı)
- Android APK hazır (Play Store'a yüklenmedi), Brevo newsletter, WhatsApp kanalı (günde 8 mesaj otomasyonu)

### Monetizasyon yüzeyleri — kurulu ama gelir henüz akmıyor
- AdSense: 5 slot ana sayfada, **"low value content" düzeltmeleri sonrası re-review bekleniyor** ← en büyük tekil kaldıraç
- ~51 affiliate linki ana sayfada, MeerBesparen widget ~70 merchant (Daisycon+Awin), Flink banner, Bol.com
- GA4 + Clarity + affiliate_click event tracking aktif

### ⚠️ Kritik içgörü: gelir denklemi
**Süpermarket linklerinin kendisi para kazandırmıyor** — AH/Jumbo/Lidl vb. hepsi `network: 'direct'` (süpermarketlerin affiliate programı yok, bu NL'de genel durum). Yani:

> **Süpermarket içeriği = trafik motoru. Para = o trafiği yüksek komisyonlu dikeylere ve reklama çevirmek.**

| Gelir kanalı | Komisyon profili | Durum |
|---|---|---|
| AdSense (RPM) | NL: ~€5-15 RPM | Re-review bekliyor 🔴 |
| Energie switch (ENGIE, Oxxio, Pure Energie) | €20-60/switch — **en yüksek birim gelir** | `/energie` canlı, trafik yok henüz |
| Telecom/verzekering (Ziggo, hollandsnieuwe, JW) | €10-40/lead | Widget'ta, sayfa yok |
| Bezorging/maaltijdbox (Flink, Marley Spoon) | €5-15/order | Flink aktif, Marley Spoon: durum belirsiz |
| Widget e-commerce (70 merchant) | %3-10 satış | Aktif, düşük hacim |
| Bol.com ürün eşleştirme | %2-6 | Kurulu ama ürün-bazlı eşleştirme YOK |
| Email/WhatsApp kitlesi | sponsorluk/affiliate | Altyapı var, kitle boyutu bilinmiyor |

---

## 🗺️ Yol Haritası

### FAZ A — Ölç ve Kilidi Aç (şimdi → 2 hafta)
*Hiçbir yeni büyük iş başlatma; deploy edilenlerin etkisini ölç, geliri engelleyen tek şeyi (AdSense) aç.*

- [ ] **AdSense re-review takibi** — dashboard'da durum kontrolü. Onay gelirse trafik büyümesi anında gelire dönüşmeye başlar. Red gelirse gerekçeyi buraya işle ve düzelt.
- [ ] **GSC CTR ölçümü (haftalık rutin)** — taze export al, hedef sorgular: "aldi" (TO %0.03→hedef %2+), "plus aanbiedingen", "dirk aanbiedingen", "bonus aanbiedingen". Title fix'lerinin işleyip işlemediği burada görünür.
- [ ] **Günlük scraper cron doğrulama** (6 Tem Pzt 08:00 UTC ilk çalışma) + Kruidvat veri tazeliği (30 Haz'dan beri güncellenmedi, GH Action kontrol)
- [ ] **Daisycon CSV export** → Housefinan, Kredanta, Minisforum (FR/EU), JW Verzekeringen'i tracked yap (şu an komisyonsuz çalışıyorlar)
- [ ] **Energie içerik kümesi başlat** — `/energie` sayfası tek başına sıralanamaz; onu besleyecek 2-3 blog yazısı: "Energie vergelijken gids 2026", "Vast of variabel energiecontract?", "Zonnepanelen terugverdientijd" → hepsinden `/energie`'ye iç link. **Energie tek switch'te €20-60 kazandırır; 1000 market tıklamasından fazla.**

### FAZ B — TO→Trafik→Gelir Çevrimi (2-6 hafta)
*Kanıtlanmış olanı ölçekle.*

- [ ] **Karşılaştırma içeriğini ölçekle** — tek kanıtlanmış format bu (25 tıklama/yazı). Eksik ikililer: "Dirk vs Aldi", "Plus vs Jumbo", "Kruidvat vs Etos", "DekaMarkt vs Dirk". Hedef: 2 yazı/hafta, her biri 600+ kelime + FAQ.
- [ ] **Aldi bağımlılığını çeşitlendir** — Aldi formülü çalıştıysa (15.8K gösterim) aynı derinliği Plus (3.7K gösterim, 1 tıklama!) ve Dirk sayfalarına uygula.
- [ ] **Play Store yayını** ($25) — APK hazır, bedava dağıtım kanalı; app kullanıcısı = push bildirimi = tekrar ziyaret.
- [ ] **Kitle büyütme CTA'ları** — newsletter/WhatsApp aboneliği şu an pasif. Blog yazısı sonuna + exit noktalarına belirgin CTA; Brevo abone sayısını ölç ve buraya işle (şu an bilinmiyor).
- [ ] **AdSense onaylanınca:** slot yerleşim optimizasyonu — blog içi 2 slot var, market sayfalarında yerleşim gözden geçir (viewability).
- [ ] **Fiyat geçmişini kullanıcıya aç** — `price_history` DB'de birikmiş ama görünmüyor. "Prijsgeschiedenis" grafiği = Folderz/Reclamefolder'da OLMAYAN özellik = paylaşılabilir, linklenebilir fark. (Tweakers'ın Pricewatch'ı gibi.)

### FAZ C — Monetizasyon Derinleştirme (6-12 hafta)
*Trafik kanıtı oluşunca gelir kanallarını çeşitlendir.*

- [ ] **Energie pilot değerlendirmesi** — GSC'de "energie vergelijken" sorgularında hareket var mı? Varsa aynı şablonu (karşılaştırma kartları + editoryal + FAQ) **verzekering** (JW hazır) ve **telecom**'a (Ziggo, hollandsnieuwe hazır) kopyala. Yoksa nedenini analiz et.
- [ ] **Bol.com ürün eşleştirme** — non-food süpermarket ürünlerini (elektronik, oyuncak, huishouden) Bol.com aramasına linkle; her ürün kartı potansiyel komisyon.
- [ ] **Maaltijdbox içeriği** — `maaltijdbox-vergelijken-2026` yazısı var; Marley Spoon Awin onay durumunu kontrol et, onaylıysa affiliate linki ekle (~82 gün cookie, yüksek komisyon).
- [ ] **Media kit + sponsored listing** — trafik 20K+/ay olunca küçük NL merkezli merchant'lara "haftalık öne çıkan deal" satışı (€50-200/hafta). GA4 ekran görüntüleriyle tek sayfalık PDF.
- [ ] **Premium üyelik (€1,99/ay)** — SADECE trafik 50K+/ay ve push/favori kullanımı kanıtlanınca. Erken başlatma; şimdiki kitleyle anlamlı gelir üretmez, geliştirme süresini yer.

### Sürekli (her hafta ~30 dk)
- Pazartesi: GSC export → TO tablosuna işle; Daisycon/Awin mail taraması (yeni onay/kapanan program); scraper health check (`/api/health/scraper`)

---

## 💰 Gerçekçi Gelir Projeksiyonu

| Dönem | Varsayım | Tahmini aylık |
|---|---|---|
| **Ağustos 2026** | AdSense onaylı, TO %1'e çıktı (~30-50 tık/gün), energie 1-2 switch | €50-150 |
| **Ekim 2026** | Trafik 15-25K/ay, energie+verzekering 5-10 lead, widget satışları | €200-500 |
| **Ocak 2027** | Trafik 50K+/ay, 3 dikey aktif, sponsored listing 1-2 | €500-1.500 |

**En büyük 3 kaldıraç (öncelik sırasıyla):**
1. **AdSense onayı** — trafik zaten 15x büyüdü; reklamsız her gün kayıp
2. **TO %0.5→%2+** — aynı gösterimle 4-10x tıklama; title fix'leri deploy edildi, ölçüm bekliyor
3. **Energie/verzekering lead'leri** — tek lead onlarca market tıklamasına bedel; içerik kümesi gerekiyor

**En büyük 3 risk:**
1. Aldi tek-sayfa bağımlılığı (%64) — Google güncellemesi o sorguda vurursa trafik yarılanır → çeşitlendir (Faz B)
2. AdSense reddi tekrarı — içerik düzeltmeleri yapıldı ama garantisi yok → red gelirse gerekçe odaklı düzelt
3. Genç domain + hızlı içerik temposu — Google indekslemesi seçici (bkz. GSC "Crawled not indexed") → nicelik değil derinlik

---

## Arşiv: Tamamlanan Fazlar

<details>
<summary>Faz 1-2 tamamlananlar (Nisan-Temmuz 2026)</summary>

- SEO temeli: GSC, sitemap, schema'lar (Organization/FAQ/Product/Breadcrumb), 39 blog yazısı, market+kategori sayfaları
- AdSense ilk onay + slotlar; sonra "low value content" bulgusu → içerik düzeltmeleri (Tem 2026), re-review bekleniyor
- Daisycon + Awin onayları: ~70 merchant entegre (affiliate.ts tek doğruluk kaynağı)
- 10 market scraper (günlük), fiyat karşılaştırma, PWA+push, Google OAuth, Android APK
- Brevo newsletter + watchlist email + WhatsApp otomasyonu (8 mesaj/gün)
- CWV düzeltmeleri (CLS, hydration), cookie banner fix, market OG image'ları
- `/energie` + `/zomeracties` pilot sayfaları
- GSC teşhisleri: sitemap lastModified bug fix, 6 thin blog yazısı derinleştirme, title CTR formülü

</details>
