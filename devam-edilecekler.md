---
date: 2026-07-04
tags: [dealhunter, seo, adsense, affiliate]
status: active
---

# DealHunter4U — Devam Edilecekler

## ✅ Bugün tamamlanan (2026-07-04)

- [x] Daisycon/Awin mailleri tarandı, aksiyona döküldü: 4 kapanan program (Awake Organics, Cloqu, Audiobooks for Everyone, CCreation Market) kodda hiç yoktu — kaldıracak bir şey çıkmadı
- [x] 8 yeni onaylı merchant `affiliate.ts` + `MeerBesparenWidget.tsx`'e eklendi: buttinette NL, Pulsetto, Hermie, VVVCadeaukaarten.nl, Housefinan (DE), Kredanta (DACH), Minisforum (FR), Minisforum (EU) (`873b65c`, `b8558e5`)
- [x] Hermie ve VVVCadeaukaarten.nl Daisycon CSV export'undan gerçek `trackingBase` (si/li) ile tam tracked hale getirildi — Housefinan, Kredanta, Minisforum (FR/EU) hâlâ untracked (çalışıyor ama komisyonsuz), li/domain için yeni CSV export gerekiyor
- [x] My Sugar Daddy (DE) kullanıcı kararıyla eklenmedi/kaldırıldı — editoryal uyumsuzluk (flört platformu, deal sitesi değil)
- [x] Erverte Paris (Awin 87255, Fransız eko-sorumlu erkek giyim) daveti kabul edildi ve mode kategorisine eklendi; World Businesses for Sale daveti (B2B işletme komisyonculuğu) editoryal uyumsuzluk nedeniyle reddedildi (`13142ba`)
- [x] Site canlı olarak gstack/browse ile test edildi — tüm yeni merchant linkleri (`/go?m=...` ve widget) doğru tracking URL'lerine çözülüyor, konsol hatası yok
- [x] **GSC "Crawled - currently not indexed" kök neden analizi**: `sitemap.ts`'de blog sayfalarının `lastModified` değeri her deploy'da `now` (build zamanı) idi — 39 yazının hepsi her deploy'da "bugün değişti" raporlanıyordu, Google'ın freshness güvenini zedeliyordu. Artık her post kendi `date` alanını kullanıyor (`f014479`)
- [x] **6 en zayıf blog yazısı derinleştirildi** (347-384 kelime → 540-600 kelime), her birine gerçek karşılaştırma bölümleri + eksik FAQ'lar eklendi: groenten-fruit-goedkoop-supermarkt, chips-snacks-koek-aanbieding-supermarkt, supermarkt-thuisbezorging-vergelijken (Flink flaş teslimat bölümü eklendi, mevcut affiliate ile bağlantılı), ontbijt-producten-aanbieding-supermarkt, vlees-aanbieding-supermarkt-gids, boodschappen-50-euro-per-week (`740d7bf`)
- [x] Build + tip kontrolü + canlı tarayıcı testi: tüm 6 yazı sorunsuz render oluyor, FAQ schema'lar doğru üretiliyor
- [x] **Stratejik pozisyon tartışması**: "market-only" yerine "her şeyin indirimi" (genel deal-aggregator) kimliğine geçiş konuşuldu. Karar: market kategorisi ana güç alanı olarak kalsın (en derin veri), diğer kategoriler (enerji, reizen, mode) hafif affiliate listesi olarak kalsın. Pilot kategori için **enerji** önerildi (reizen'den daha az rekabetçi SEO alanı, sitenin karşılaştırma-motoru DNA'sına birebir uyuyor, komisyonlar markete göre yüksek) — henüz uygulanmadı, sadece karar aşamasında

## Eski tamamlananlar (2026-07-01)

- [x] AdSense script'i artık her zaman yükleniyor (Consent Mode v2) — review'ın "reklam kodu görünmüyor" takılmasının kök nedeniydi
- [x] GSC verisine göre 2 yeni karşılaştırma blog yazısı eklendi: `is-lidl-goedkoper-dan-albert-heijn`, `is-lidl-goedkoper-dan-jumbo`
- [x] CLS düzeltmesi: AdBanner varsayılan `minHeight` 100→280, `overflow-hidden` kaldırıldı (reklam kırpılma riski)
- [x] React #418 hydration hatası düzeltmesi: ProductCard expiry etiketine `suppressHydrationWarning`
- [x] MeerBesparenWidget'a 4 yeni Daisycon markası: Dr. Martens, Eastpak, Foreo, Difmark
- [x] Awin incelendi: Alibaba + Traverseon onaylandı ama eklenmedi (zayıf marka uyumu, kullanıcı kararı)
- [x] 13 Awin red mailinin ortak nedeni tespit edildi: "Site does not complement advertiser brand" — kalite sorunu değil, kategori uyumsuzluğu
- [x] `/supermarkt/plus`, `/supermarkt/kruidvat`, `/supermarkt/vomar` — eksik SEO içeriği eklendi (AdSense "düşük değerli içerik" bulgusuna somut yanıt)
- [x] Vomar boş-durum mesajı iyileştirildi (6 blog linki 404 vermesin diye sayfa gizlenmedi, bunun yerine "güncelleniyor" mesajı + diğer market linkleri)
- [x] **Vomar scraper düzeltildi** (`a558d1f`) — Publitas folder metin sırası değişmişti, regex güncellendi, canlı veride 0→11 ürün doğrulandı. Tam kapsam yok (haftada 40-60 ürün var, bazı formatlar OCR sırası tutarsız olduğu için parse edilemiyor). Pazartesi 08:00 UTC cron'da otomatik devreye girecek — manuel tetiklemedim çünkü tam scraper işi Dirk/Plus'ın güncel iyi verisini riske atardı
- [x] Kruidvat CDN görselleri kontrol edildi: 163/163 şu an sorunsuz yükleniyor, "26-28 kırık görsel" notu güncel değilmiş (muhtemelen veri yenilenmesiyle kendiliğinden düzelmiş) — aşağıdan kaldırıldı

## 🔜 Sıradaki adımlar (akşam buradan devam)

- [ ] **Deploy et** — bugünkü 4 commit (`873b65c`, `b8558e5`, `13142ba`, `f014479`, `740d7bf`) henüz sadece local/main'de, Railway'e push edilmedi
- [ ] **Housefinan, Kredanta, Minisforum (FR/EU)** — yeni Daisycon CSV export alınca (`Campagnes > Materialen > Deeplinks`) gerçek `trackingBase` (si/li/domain) eklenip tam tracked hale getirilecek
- [ ] **GSC "Doğrula" (Validate Fix)** — sitemap + içerik derinleştirme değişiklikleri deploy olduktan birkaç hafta sonra GSC'de tekrar doğrulama tetiklenmeli (Google'ın yeniden crawl+indexleme kararı genelde 1-4 hafta sürer)
- [ ] **Enerji pilot kategorisi** — "her şeyin indirimi" pozisyonu kararı sonrası ilk somut adım: enerji karşılaştırma sayfası/içeriği (market kalitesinde derinlik) — henüz başlanmadı
- [ ] **AdSense review takibi** — deploy sonrası 3-7 gün içinde dashboard'da "Hazırlanıyor" → "Hazır" değişimini kontrol et
- [ ] **CWV yeniden ölçüm** — birkaç gün sonra Clarity/PageSpeed'den taze veri çekip CLS (0.294 idi) ve hydration hata sayısının düştüğünü doğrula
- [ ] **Vomar veri kontrolü** — Pazartesi cron sonrası `/supermarkt/vomar`'da gerçek ürünlerin göründüğünü doğrula
- [ ] **Mammotion (INT)** — Daisycon'da henüz onaylı değil, sadece bültende duyuruldu. Onaylanıp yeni CSV export'ta göründüğünde MeerBesparenWidget → Thuis & Wonen'e eklenecek

## Referanslar

- Site: https://www.dealhunter4u.nl
- Repo: dealhunter-market (main branch)
- Son commit'ler: `740d7bf` (6 zayıf blog yazısı derinleştirildi), `f014479` (sitemap lastModified fix), `13142ba` (Erverte Paris), `b8558e5` (Minisforum EU), `873b65c` (8 yeni Daisycon/Awin merchant), `ecf3fe2` (cookie banner fix), `630218c` (görsel fallback), `1acff42`+`fa0a78f` (Aldi karşılaştırmaları)
