---
date: 2026-08-01
tags: [dealhunter, seo, adsense, affiliate, scraper]
status: active
---

# DealHunter4U — Devam Edilecekler

## 🔍 GSC + Clarity trafik analizi (2026-08-06) — büyüme fırsatları

**GSC (son 3 ay, 4 May-3 Ağu):** 356 tıklama, 125K gösterim, ort. TO %0,3, ort. pozisyon 9,6.

### ✅ Yapıldı — 5 vergelijk çifti index'e açıldı (`7fe29a8`)

**Önemli düzeltme:** İlk analizde "15+ vergelijk sayfası büyük fırsat" dedim ama bu
yanlıştı — `lib/vergelijk.ts`'te 55 olası çiftten sadece 2'si (`albert-heijn-vs-aldi`,
`albert-heijn-vs-dekamarkt`) index'e açıktı, kalanı **bilerek** noindex (2026-07-13
AdSense "ince içerik" reddi + 2026-07-25'te blog'u zaten kazanan 8 çift daha çıkarıldı
— kannibalizasyon önlemek için). GSC'de gördüğüm "poz 4-12 ama TO %0" sayfaların çoğu
zaten bu noindex grubundaydı, title fix'i onlar için işe yaramazdı.

**Gerçek aksiyon:** GSC'de gerçek talep gösteren VE blog karşılığı OLMAYAN 5 çift
index'e eklendi (blog'u zaten kazanan `albert-heijn-vs-lidl` gibi çiftler bilerek
dışarıda tutuldu — 07-25 dersini tekrarlamamak için):
`aldi-vs-dekamarkt` (poz 4.0), `lidl-vs-kruidvat` (poz 6.0), `lidl-vs-plus` (poz 6.3),
`vomar-vs-plus` (poz 6.4), `albert-heijn-vs-hoogvliet` (poz 8.3). Sitemap otomatik
güncellenir (`isIndexedPair` üzerinden okuyor). Etki 2-4 hafta sonra ölçülmeli.

### ✅ Yapıldı — /vergelijk/ sayfa title fix (`500c531`)

**Bulgu:** 15+ `/vergelijk/X-vs-Y` sayfası pozisyon 4-12'de (bazıları MÜKEMMEL: aldi-vs-dekamarkt
4.0, lidl-vs-kruidvat 6.0) ama **TO %0 — sıfır tıklama**, onlarca-yüzlerce gösterime rağmen:
albert-heijn-vs-aldi (107 gösterim, poz 9.2), albert-heijn-vs-lidl (91, 9.6), jumbo-vs-vomar
(43, 8.8), lidl-vs-plus (25, 6.3), vb. Aynı zamanda `/blog/is-X-goedkoper-dan-Y` yazıları TO
%0,6-3,3 ile çalışıyor. Kök neden: vergelijk title'ı "Wie Heeft de Beste Aanbiedingen?"
diye çerçeveleniyordu, ama bu sayfaları sıralayan gerçek sorgular "is X goedkoper dan Y",
"X vs Y" — "goedkoper" (daha ucuz) niyeti, "beste aanbiedingen" (en iyi fırsatlar) değil.
**Fix:** title → "Is X Goedkoper dan Y? Prijzen & Aanbiedingen Vergeleken", description
aynı şekilde "goedkoper"/"prijzen" odaklı yeniden yazıldı. H1'e dokunulmadı (SERP'te
görünmüyor). Etki 2-4 hafta sonra GSC'de ölçülmeli.

### ⛔ KAPATILDI — Hoogvliet scraper artık kovalanmıyor (2026-08-07)

`::error::` teşhis fix'i (`f7d2cbb`) nihayet gerçek sebebi gösterdi: sayfa 897 karakterlik
boş bir kabuk dönüyor (`titel: "", HTML-lengte: 897, body: leeg`) — klasik Imperva
JS-challenge stub'ı, GitHub Actions'ın datacenter IP'sini bazen (2-3 Ağu) geçiyor bazen
(4-5-6 Ağu) geçemiyor. Apify Store'da hazır bir Incapsula-bypass Actor yok, tek çözüm
ücretli residential proxy (garanti değil, tekrarlayan maliyet). Hoogvliet en küçük market
(15-20 ürün/hafta) — emek/değer dengesi tutmuyor. **Karar: olduğu gibi bırakılıyor,
başarısız çalıştığında mail gelmeye devam edecek ama artık uğraşılmayacak.**

### 📌 AÇIK — diğer bulgular (aksiyon bekliyor)

1. ~~Blog title-mismatch~~ **⛔ KAPATILDI (2026-08-07):** 4 yazıdan 2'sini kontrol ettim
   (`is-aldi-goedkoper-dan-jumbo`, `is-dirk-goedkoper-dan-aldi`) — title'ları ZATEN doğru
   formatta ("Is X Goedkoper dan Y?"), vergelijk sayfalarındaki gibi bir kusur yok, 0 tık
   büyük olasılıkla küçük örneklem şansı (90 günde 121/49 gösterim). Kalan 2'si
   (`barbecue-aanbieding-supermarkt-2026` 129 gösterim, `jumbo-aanbiedingen-gids` 155
   gösterim) kontrol edilmedi — GSC'ye yeniden giriş gerektiriyordu, ikisi de düşük
   hacimli/şüpheli değerli olduğu için (Hoogvliet dersiyle aynı: emek/değer dengesi
   tutmuyor) kullanıcı kararıyla kovalanmıyor.
2. **`/supermarkt/albert-heijn` pozisyonu (12.7) diğer marketlerden kötü** (aldi 8.5, lidl
   8.7, dirk 9.0) — AH en büyük envantere sahip olduğu halde en kötü sıralanıyor. Bugünkü
   paket-boyutu dedup fix'inin (614→368 ürün, bkz. yukarıdaki commit) bunu iyileştirip
   iyileştirmediği 2-4 hafta sonra kontrol edilmeli.
3. ~~İç linkleme fırsatı~~ **✅ ZATEN ÇÖZÜLMÜŞ (yan etki):** `MarketPage.tsx`'teki
   `comparisonPairs` bloğu zaten `isIndexedPair()` üzerinden filtreleniyor — 5 çifti
   index'e açtığımız commit (`7fe29a8`) bunu otomatik olarak da çözdü. Aldi sayfası artık
   "Aldi vs Albert Heijn" VE "Aldi vs DekaMarkt" linklerini gösteriyor, kod değişikliği
   gerekmedi. (2026-08-07 doğrulandı)
4. ~~Clarity geçersiz tıklama (%6,9) araştırması~~ **⛔ KAPATILDI (2026-08-07):** GSC'ye
   yeniden giriş gerektiriyordu, kullanıcı kararıyla kovalanmıyor (bkz. madde 1).
   **TradeTracker trafiği (merchant.tradetracker.com 95 oturum) AYRICA ARAŞTIRILDI VE
   ÇÖZÜLDÜ** (bkz. [[huntermd110]]): `/tools/clickOut` — kodumuzdaki tek TradeTracker
   linki (B2Ctelecom, farklı domain/format) ile ilgisi yok, kodda düzeltilecek bir şey
   yok.

## ✅ Bugün tamamlanan (2026-08-06) — AH verpakkingsvarianten dedup

Kullanıcı şikayeti: Albert Heijn sayfasında sanki ürün eksik hissi var, çünkü aynı ürün
2-li/4-lü/10-lu/20-li gibi farklı paket boyutlarında tekrar tekrar listeleniyor.

**Doğrulandı:** 614 AH ürününün **391'i (%64)** sadece 145 taban üründen türeyen paket-
boyutu kopyası çıktı (örn. Coca-Cola Zero sugar tek başına 4/5/6/10/24/40-pack olarak
6 ayrı kart kaplıyordu). Diğer 8 markette bu sorun hiç yok (%0) — sadece AH'nin bonus
API'si aynı ürünü her ambalaj boyutu için ayrı SKU olarak döndürüyor.

**Fix (`cf5716a`):** `backend/scraper/index.js` → `dedupePackVariants()` eklendi.
Taban isme (paket eki silinmiş hâl) göre gruplayıp grup içinden **öncelik gerçek indirimi
olan, sonra en küçük ambalaj** (paket etiketi olmayan tekli ürün en küçük sayılır — yoksa
en düşük `unitSize`) seçiliyor. 614 → **368 ürün** (145 grup 1'e indi; Robijn örneğinde
tam olarak istenen "2'li hali" kazandı çünkü grupta en küçüğü oydu).

**AÇIK:** Backend cron her gün 08:00 UTC'de çalışıyor (`server.js:470`), fix bir sonraki
scrape'te canlıya yansıyacak. Manuel tetiklemek için `/api/scraper/run` admin token
gerektiriyor, elimde yok — kullanıcı panelden tetikleyebilir ya da yarın sabah bekler.

## 📱 Mobil fold denetimi — 1 fix gitti, 2 KARAR SENDE (2026-08-02)

**Clarity (son 3 gün):** 39 oturum, **sayfa/oturum 1**, kaydırma derinliği **%26,4**,
geri dönen kullanıcı **%0**, sinirli tıklama %0. İnsanlar geliyor, üst çeyreğe bakıyor, çıkıyor.

**Ölçüm — `/supermarkt/lidl`, mobil 390x844** (trafiğin %69'u mobil):

| Öğe | y | Yükseklik |
|---|---|---|
| Sabit header | 0 | 65 |
| PWA kurulum bandı | 65 | **113** |
| h1 | 128 | 64 |
| açıklama + arama + filtre + istatistik | 196-508 | ~312 |
| "POPULAIR — Is Aldi Goedkoper dan Lidl?" blog linki | 532 | 74 |
| "🛵 Boodschappen laten bezorgen" affiliate CTA | 630 | 84 |
| **İlk ürün kartı** | **738** | 425 |
| AdSense anchor reklam (`position:fixed`, **aralıklı**) | 586-844 | **258** |

"lidl aanbiedingen" arayan kullanıcı, tek bir aanbieding görmeden çıkıyor.

### ✅ Yapıldı: PWA bandı etkileşime bağlandı (`adb8f48`)

`InstallPrompt.tsx` koşulsuz gösteriliyordu. Oturumların %100'ü yeni kullanıcıyken,
hiçbir şey görmemiş kişiden "uygulamayı yükle" istemek hem erken hem de 113px'lik en
değerli alanı yiyordu. Artık **2 ekran yüksekliği kaydırdıktan sonra** çıkıyor.
`beforeinstallprompt` yine anında yakalanıyor (yoksa tarayıcı kendi çubuğunu gösterir),
sadece gösterim erteleniyor. Etki: ilk ürün 851 → **738**, yani fold'un içine girdi.

### ⚠️ KARAR 1 — AdSense anchor reklam (gelir vs ilk izlenim)

Ekranın alt %31'ini kaplıyor ve tam ilk ürünün olduğu bölgeyi (586-844) örtüyor.
**Kodda değil** — AdSense Auto Ads ayarı (Auto ads → Ad formats → Anchor ads).
Sadece sen kapatabilirsin. Aralıklı çıkıyor, her sayfa görüntülemesinde değil.
Kapatmak reklam gelirini düşürür; bu yüzden dokunmadım.

### ✅ KARAR 2 — YAPILDI: tanıtım blokları ilk ürün satırının altına alındı (`2fea171`)

Blog linki (74px) + bezorging affiliate CTA (84px) ürünlerden **önce** duruyordu.
İkisi de `col-span-full` olarak grid'in içine, **4. karttan sonra** taşındı — mobilde
(grid-cols-2) ikinci satırın sonu. Yani önce dört gerçek fırsat, sonra alternatif.
4'ten az ürün varsa blok son karta kayıyor, hiç kaybolmuyor.

Yerelde ölçüldü: **ilk kart y=738 → y=532**, fold'un rahat içinde. Görsel doğrulandı,
düzen bozulmuyor. 2026-07-21'deki "bounce eden ziyaretçiye alternatif sun" kararı
silinmedi, sadece fırsatların arkasına alındı.

**Sınır:** anchor reklamın çıktığı sayfa görüntülemelerinde (y=586'dan başlıyor) bu
taşımadan geriye pek bir şey kalmıyor — kartın sadece 54px'i görünüyor. Tam kazanç
KARAR 1 ile geliyor.

### Panel erişimi düştü
GSC + AdSense oturumu kapanmış, `.gstack/browse-states/google.json` (29 Tem) da süresi
geçmiş — hesap seçme ekranında takılıyor. Yeniden giriş gerekiyor, sonra
`state save google` ile tazelenmeli. Clarity oturumu çalışıyordu, veriler ondan.

## 🔴 SIRADAKİ İŞ — Trafik teşhisi tamamlandı, uygulama bekliyor (2026-08-01)

**Teşhis: gösterim sorunu yok, CTR sorunu var.** GSC + canlı SERP analizi yapıldı.

| Dönem | Gösterim/gün | Tıklama/gün | TO |
|---|---|---|---|
| Önceki 62 gün | 806 | 3,35 | %0,42 |
| Son 28 gün | **2.357** (+192%) | 4,64 (+38%) | **%0,20** |

Google 3 kat fazla gösteriyor, tıklama neredeyse sabit. Sayfa tipine göre ters orantı (3 ay):

| Sayfa tipi | Gösterim | Tıklama | TO |
|---|---|---|---|
| `/supermarkt/*` | ~91.000 | 67 | **%0,07** |
| Blog karşılaştırma | ~30.600 | 86 | %0,28 |
| `/vergelijk/*` | ~800 | ~9 | **%1,1** |
| Ana sayfa (marka) | 538 | 138 | %25,7 |

### 1. [x] Hafta numaralarını title/description'dan kaldır — ✅ YAPILDI (2026-08-01)

Uygulandı ve canlı sunucuda doğrulandı (`next build` + `next start` ile gerçek HTML çıktısı):
- `Lidl Aanbiedingen Deze Week ✓ 86 Actuele Deals | DealHunter4U`
- `Albert Heijn Bonus Aanbiedingen Deze Week ✓ 697 Actuele Deals | DealHunter4U`
- `Aldi Aanbiedingen Deze Week ✓ 192 Actuele Deals | DealHunter4U`
- `Albert Heijn vs Jumbo: Wie Heeft de Beste Aanbiedingen? | DealHunter4U`
- `Koffie Aanbieding Deze Week ✓ Vergelijk 9 Winkels | DealHunter4U`
- description: `✓ 86 actuele Lidl aanbiedingen van deze week — tot 50% korting…`

Değişen dosyalar: `app/supermarkt/[slug]/page.tsx` (week+year değişkenleri ve `getISOWeek`
importu da temizlendi, satır 40'taki replace bug'ı silindi), `app/vergelijk/[slug]/page.tsx`,
`app/product/[slug]/page.tsx`. `npx tsc --noEmit` temiz, build başarılı.

**Bilinçli olarak dokunulmadı:**
- Deal sayısı (86/192/697) title'da bırakıldı — eskimesi zararsız, hafta no gibi
  "bayat içerik" sinyali vermiyor, ayrıca somut rakam TO'yu artırır.
- Sayfa **içindeki** görünür "Week {week}" ifadeleri (`vergelijk` satır 132, `product`
  satır 120) duruyor — sayfa canlı render edildiği için her zaman güncel, sorun sadece
  Google'ın önbelleklediği metadata'daydı.
- `lib/schema.ts:107,126,150` ItemList `name` alanlarındaki hafta no — structured data
  adı kullanıcıya gösterilmiyor, cerrahi kalmak için dokunulmadı.

**Ölçüm:** GSC'de market sayfası TO'su 2-4 hafta içinde takip edilmeli (şu an %0,07).
Google yeniden tarayana kadar SERP'te eski başlıklar görünmeye devam edecek.

<details><summary>Orijinal teşhis (referans için)</summary>

`site:dealhunter4u.nl/supermarkt` sorgusu çalıştırıldı. **Bugün hafta 31**, indexteki başlıklar:
Kruidvat=**Week 28**, Lidl/Hoogvliet/DekaMarkt=**Week 29**, Vomar/Jumbo/AH=**Week 30**,
Plus/Aldi=Week 31 ✅, Dirk=başlığı Google yeniden yazmış (güvenmediği sinyali).
→ **10 sayfadan 7'si SERP'te eski hafta gösteriyor.** Kullanıcı bayat sanıp rakibe tıklıyor.
Canlı sayfa doğru (Week 31) ama Google ~2 haftada bir tarıyor — bu yarış kaybedilemez.

Rakiplerin **hiçbiri** hafta no kullanmıyor: Folderz "vanaf 07-08 | Deze & volgende week",
AlleFolders/Reclamefolder "van deze week" (evergreen).

Yapılacak:
- `app/supermarkt/[slug]/page.tsx:39` — `Week ${week} ✓ ${dealCount} Actuele Deals` → evergreen "Deze Week"
- `app/supermarkt/[slug]/page.tsx:44` — description'daki `voor week ${week}` aynı şekilde
- **`page.tsx:40` GERÇEK BUG** — evergreen fallback'teki `'Deze Week'` ifadesini
  `Week ${week} ${year}` ile **değiştiriyor**, yani doğru seçenek bile bozuluyor. Bu satır silinmeli.
- Aynı sorun: `app/vergelijk/[slug]/page.tsx:33`, `app/product/[slug]/page.tsx:28`
- Deal sayısı da eskiyor (Lidl indexte 73, canlıda 86) → kaldır veya "100+" gibi yuvarla

Beklenti: market sayfaları %0,07 → %0,5 çıksa bile toplam tıklama ikiye katlanır.

</details>

### 2. [!] Karşılaştırma içeriği — **ÖNCEKİ ÖNERİ YANLIŞTI, DÜZELTİLDİ (2026-08-01)**

İlk öneri "5-10 yeni karşılaştırma yazısı yaz"dı. Veri bunu çürüttü.

**Düzeltme 1 — sayı hatası:** kazanan yazının gösterimini 27.578 okumuşum, doğrusu **7.720**
(63 tıklama ÷ %0,8 TO ile tutarlı). GSC'nin bitişik sayı formatı yanlış ayrıştırılmıştı.

**Düzeltme 2 — zaten 46 blog yazısı var**, 9'u karşılaştırma yazısı
(`is-aldi-goedkoper-dan-jumbo`, `is-lidl-goedkoper-dan-jumbo`, `is-plus-goedkoper-dan-jumbo`,
`goedkoopste-supermarkt-nederland-2026` vb.). Yani içerik eksikliği yok.

**Asıl bulgu — karşılaştırma yazıları ZATEN iyi sıralanıyor, sorun sorgu hacmi:**

| Yazı | Konum | Gösterim (3 ay) | Tıklama |
|---|---|---|---|
| is-lidl-goedkoper-dan-jumbo | **3,3** | 96 | 1 |
| is-plus-goedkoper-dan-jumbo | **4,5** | 100 | 3 |
| is-dirk-goedkoper-dan-aldi | **4,5** | 42 | 0 |
| is-aldi-goedkoper-dan-lidl | **5,1** | 42 | 1 |
| is-dekamarkt-goedkoper-dan-dirk | **5,8** | 30 | 0 |

Konum 3-6, yani sıralama mükemmel. Ama 3 ayda 30-100 gösterim = günde ~1 gösterim.
Bu sorgularda Hollanda'da arama hacmi yok. Yeni "is X goedkoper dan Y" yazmak
top-5'e çıkan ama çeyrekte ~2 tıklama getiren sayfalar üretir.

**Barbell problemi — site geneli sorgular gösterime göre:**

| Sorgu | Gösterim | Tıklama | Konum |
|---|---|---|---|
| aldi | 39.913 | 15 | 8,2 |
| lidl aanbiedingen | 10.361 | 2 | 8,5 |
| dirk aanbiedingen | 9.339 | 3 | 8,5 |
| plus aanbiedingen | 3.389 | 0 | 9,0 |
| aanbiedingen lidl | 2.018 | 2 | 8,7 |
| jumbo aanbiedingen | 1.449 | 2 | 9,5 |
| *(sonraki hepsi)* | <900 | | |

İlk 10 sorgu ≈ **69.500 gösterim → 10 tıklama**. Ortası yok: ya kazanılamayan head-term
(konum 8-10), ya da zaten kazanılan ama hacmi olmayan long-tail.

**Kaldıraç hesabı:** 10 yeni karşılaştırma yazısı ≈ +20 tıklama/çeyrek.
Tek başına "lidl aanbiedingen"i konum 8,5'ten 3'e taşımak ≈ +1.000 tıklama.
**50x fark.** Ama bu içerik değil, otorite problemi.

**Blog yine de market sayfalarından 10x iyi dönüyor:** blog ~14.000 gösterim → 103 tıklama
(%0,74), market sayfaları ~91.000 → 67 (%0,07). 46 yazının ~30'u sıfır tıklama alıyor.

`/kortingsindex` sayfası var ama konum 30,8, 146 gösterim — linklenebilir varlık olarak paketlenmemiş.

**SEÇİLEN YOL: A (otorite inşası).** İlk adım atıldı, ama veri denetimi engel çıkardı — aşağıya bak.

### 2a. [!] Kortingsindex verisi YAYINLANABİLİR DEĞİL — metodoloji sorunu (2026-08-01)

`GET /api/kortingsindex-history` eklendi (commit sonrası canlı) ve 12 haftalık seri incelendi
(2026-05-11 → 07-27, 9 market, 84 kayıt). Sonuç: **mevcut endeks metriği (market başına
ortalama indirim %) ne marketler arası ne de zaman içinde karşılaştırılabilir.**

**Sorun 1 — kapsama yanlılığı (marketler arası):** haftalık ürün sayıları uçurum gibi farklı.

| Market | Haftalık ürün | Ort. indirim |
|---|---|---|
| Hoogvliet | 27-31 | %37,8-46 |
| Aldi | 25-42 | %22,4-27,3 |
| Albert Heijn | 167-743 | %13,4-20,9 |

Hoogvliet'in scraper'ı sadece manşet fırsatları çekiyor (yüksek indirim), AH'ninki tüm
assortimanı (küçük indirimler dahil). "Hoogvliet %43, AH %18" gerçek değil, scraper
kapsamının yan ürünü. Karşılaştırma elma-armut.

**Sorun 2 — zaman içinde kırılma:** scraper değişiklikleri sahte trend üretiyor.
- Albert Heijn ürün sayısı 06-08'de 193 → 06-15'te **676** (3,5x sıçrama)
- Dirk ort. indirim 06-08'de %30,8 → 06-15'te **%44,3** (bilinen Dirk scraper yeniden yazımı)
- Kruidvat serisi ancak 06-29'da başlıyor, Vomar 07-06'da (05-18'deki tek %78 okuması saçma)

Yani "Dirk haziranda indirimlerini ikiye katladı" diye yayınlansa **yanlış** olurdu ve bir
gazeteci/rakip bunu kolayca çürütürdü — otorite inşasının tam tersi.

**Sorun 3 — sağlam alternatif şu an kurulamıyor.** Metodolojik olarak doğru yol sabit sepet
(aynı ürünlerin marketler arası fiyatı). `GET /api/compare` çalıştırıldı: **sadece 5 adet
çok-marketli karşılaştırılabilir ürün grubu** var. Sepet endeksi için çok az.

**CANLI RİSK — ✅ ÇÖZÜLDÜ (commit `d21d8b2`).** `/kortingsindex` sayfası süpermarketleri
ortalama indirime göre sıralıyor, lideri "kopploeg" ilan ediyor ve metodoloji bölümünde
**gazetecileri bu rakamları kaynak göstererek kullanmaya davet ediyordu** (`/pers` basın
kitinden de link veriliyordu). Yapılanlar:
- `lib/kortingsindex.ts`: sıralama ortalama indirim yerine **alfabetik**
- Sayfa: kopploeg bandı ve sıra numaraları kaldırıldı; başlık/FAQ artık "hangi süpermarket
  en yüksek indirimi veriyor" demiyor; tablonun üstüne okuma uyarısı, metodolojiye
  "bu rakamlar ne DEĞİLDİR" bölümü eklendi
- `/pers`: serbest kullanım iznine aynı kayıt düşüldü
- Deal sayısı, en yüksek indirim ve 1+1 sayısı duruyor — bunlar olgusal sayımlar,
  yayınlanabilir. Kaldırılan tek şey sıralama iddiası.

**Yayınlanabilir olan ne var:** ürün bazlı, tek market içi zaman serisi — kapsama yanlılığından
etkilenmez. Örn. "koffie promosyon fiyatları mayıstan beri %X değişti". `price_history` bunu
destekliyor. İfade net olmalı: bu **promosyon** fiyatı, raf fiyatı değil.

**Seçilen:** (ii) ürün bazlı zaman serisi. Kuruldu ve test edildi — sonuç aşağıda.

### 2b. [!] Matched-pair endeksi de yayınlanabilir değil (2026-08-01)

`GET /api/matched-price-index` eklendi: sadece ardışık iki haftada da görülen **aynı ürünün**
fiyat oranı alınıyor (TÜFE yöntemi). Kapsama yanlılığı sorunu böylece çözüldü — kapsam
değişimi artık endeksi kıpırdatamaz. Ama veri yine tutmuyor.

| Market | Kümülatif | Hafta | Medyan eşleşme | %0 hafta |
|---|---|---|---|---|
| Aldi | **+62,0%** | 6 | 54 | 0/6 |
| Albert Heijn | **+20,5%** | 11 | 486 | 0/11 |
| Jumbo | +14,9% | 11 | 175 | 0/11 |
| DekaMarkt | +3,3% | 8 | 102 | 2/8 |
| Lidl | +1,2% | 8 | 70 | **5/8** |
| Hoogvliet | -0,1% | 10 | 16 | **7/10** |
| Dirk | -2,5% | 10 | 103 | 1/10 |
| Vomar | -8,4% | 5 | 49 | 2/5 |

**Neden yayınlanamaz:**
1. **Aldi +%62 / 6 hafta** — imkânsız. Medyan eşleşme 54, bazı haftalar 11-12 ürün.
2. **AH +%20,5'in 7,2 puanı tek haftadan** (06-22) geliyor ve o hafta eşleşme sayısı
   182→486 sıçradı (kapsama genişlemesi). O hafta çıkarılınca +%13,3. Zincir kayması var.
3. **Hoogvliet 7/10, Lidl 5/8 hafta tam %0** — veri statik, scraper aynı değerleri
   tekrar okuyor. Gerçek seri değil.
4. **Dağılım ekonomik olarak imkânsız:** aynı dönemde AH +%20,5 iken Vomar -%8,4.
   Aynı tedarikçi ve enflasyon ortamındaki marketler arasında 29 puanlık fark olmaz.
5. **En temel sorun — metrik ne ölçtüğü belli değil:** bunlar *promosyon* fiyatları.
   AH mayısta derin indirim, temmuzda sığ indirim yaptıysa endeks yükselir ama hiçbir
   raf fiyatı değişmemiştir. Okuyucunun "fiyatlar arttı" diye anlayacağı şeyi ölçmüyor.
   Doğru hesaplansa bile savunulabilir bir yorumu yok.

**SONUÇ: 12 haftalık promosyon verisiyle istatistiksel iddia kurulamaz.** İki tur doğrulama
da bunu gösterdi. Endpoint'ler kodda duruyor (zararsız, ileride işe yarar) ama üzerine
sayfa/rapor YAPILMADI — bilinçli karar.

**Ne zaman mümkün olur:** scraper'lar ancak yeni stabilleşti (Kruidvat 06-29, Vomar 07-06).
Bugünden itibaren temiz seri biriktirip 3-6 ay sonra yayınlamak savunulabilir olur.
O zamana kadar Hoogvliet/Lidl'in %0 sorunu da çözülmeli.

**Bugün savunulabilir olan:** toplulaştırma gerektirmeyen, tek tek doğrulanabilir iddialar —
"bu hafta koffie Lidl'de €7,99, AH'de €X". `/product` sayfaları zaten bunu yapıyor.
Otorite için veri-PR yerine ortaklık/dizin kaynaklı link yolu daha gerçekçi görünüyor.

### 2c. [!] Hoogvliet sessiz scraper arızası — YENİDEN AÇILDI (2026-08-04)

**Fix çalışmadı.** İki gündür (2 ve 3 Ağustos) workflow çalışıyor ama Hoogvliet hâlâ
canlıda **0 ürün**. Sebep: workflow YAML'ine Kruidvat şablonundan `continue-on-error: true`
kopyalamışım — her iki run da GERÇEKTE `exit code 1` ile başarısız oluyordu (annotation'da
görülüyor) ama bu ayar yüzünden job "Success" (yeşil tik) gösteriyordu. Tam olarak
çözmeye çalıştığım "sessiz arıza" türünü ben yaratmışım.

**Düzeltilen (commit `fe1b3d0`):** `continue-on-error` kaldırıldı. Script'e teşhis
loglaması eklendi — `waitForSelector` başarısız olursa artık sayfa başlığı, HTML uzunluğu
ve ilk 300 karakter body metni loglanıyor.

**Henüz KANITLANMAMIŞ teori:** her iki başarısız run da ~60 saniye sürmüş — bu,
`page.goto` (45sn) + `waitForSelector` (30sn) timeout'larının üst üste binmesiyle
örtüşüyor. Yani muhtemelen **GitHub Actions'ın IP'si de Imperva challenge'ını
geçemiyor** (Kruidvat/Dirk/Plus'ta geçiyordu, Hoogvliet'in WAF konfigürasyonu daha
agresif olabilir). Ama bu bir teori — kesin teşhis ancak bir sonraki çalışmanın
log çıktısıyla gelecek.

**AÇIK:** Ben GitHub'a giriş yapamıyorum (oturum yok), workflow'u elle tetikleyemem.
Yarın (5 Ağustos) 08:20 UTC'de kendiliğinden çalışacak, ya da Actions sekmesinden
"Run workflow" ile hemen tetiklenebilir. Eğer teori doğru çıkarsa (Imperva GH Actions
IP'sini de engelliyor), playwright+stealth yaklaşımı bu market için yetersiz kalır —
alternatif (residential proxy, self-hosted runner, ya da bırakma kararı) o zaman
değerlendirilmeli. Hoogvliet zaten haftada sadece 15-20 ürün sunan küçük bir market.

<details><summary>Önceki (yanlış) "çözüldü" notu — referans için</summary>

### 2c-eski. Hoogvliet sessiz scraper arızası — ✅ ÇÖZÜLDÜ (commit `1c23849`)

**"Hoogvliet ve Lidl aynı veriyi tekrar okuyor" demiştim — yarısı yanlıştı.**
- **Lidl'de sorun YOK.** Scraper her gün çalışıyor (son tarama bugün 08:02). %0 haftaları
  gerçek: promosyonlar 2 hafta sürüyor. Doğrulandı — "Koffie goud XXL" 07-20 ve 07-27'de
  €7,99; "Gemengd gehakt" 06-29+07-06'da €5,99, 07-20+07-27'de €5,29. Bug değil.
- **Hoogvliet'te gerçek arıza vardı** ama sebebi "aynı veriyi okumak" değil, hiç
  okuyamamaktı: `last_scraped` 29 Temmuz'da donmuş, diğer tüm marketler günlük güncelleniyordu.

**Kök neden:** hoogvliet.com **Imperva/Incapsula** arkasında (`X-CDN: Imperva`,
`visid_incap_*` çerezleri). Imperva veri merkezi IP'lerine JS challenge veriyor →
Railway'den `fetch` başarısız → `scrapeHoogvliet()` catch'e düşüp `[]` dönüyor →
scheduler 0 ürünlü marketi bilinçli olarak silmediği için eski folder sessizce kalıyor.
Kruidvat/Akamai ile aynı sınıf sessiz arıza.

**Kurmadan önce doğrulandı:** sayfa sağlam (HTTP 200, 20 tegel), parser sağlam
(scraper'ın TAM başlıklarıyla residential IP'den 17 ürün çıkıyor). Fark IP'de, kodda değil.

**Çözüm:** `.github/scripts/hoogvliet-scraper.js` (Playwright + stealth, Kruidvat şablonu),
`.github/workflows/hoogvliet-scraper.yml` günlük 08:20 UTC. Yerelde çalıştırıldı:
20 tegel → 17 ürün, 17 indirimli. Challenge sayfasının folderi ezmemesi için
5 ürün alt eşiği kondu.

**Yan bugfix:** backend regex parser her kartı 2500 karakterde kesiyordu; Aviko Churros
(8346) ve Page toiletpapier (8549) kartlarında strikethrough o pencerenin dışında kalıyor,
bu 2 ürün "indirimsiz" olarak kaydediliyordu. DOM sürümü yakalıyor. Fiyatın doğru ürüne
ait olduğu doğrulandı (her iki kartta tek ürün başlığı, strikethrough aynı `price-container`'da).

**AÇIK:** `gh` CLI bu ortamda yok, workflow elle tetiklenemedi. Yarın 08:20 UTC'de
kendiliğinden çalışacak; Actions sekmesinden "Run workflow" ile hemen de tetiklenebilir.
Sonrasında `/api/health/scraper`'da Hoogvliet `last_scraped`'i güncel olmalı.

**İzlenecek risk (bu değişiklikte çözülmedi):** backend scraper Hoogvliet/Kruidvat/Dirk/Plus
için minimum ürün eşiği içermiyor. Bir gün Imperva 200 + challenge sayfası dönerse ve
parser birkaç çöp ürün çıkarırsa, market silinip çöple değiştirilebilir. Proje genelinde
mevcut bir desen, ayrı iş olarak ele alınmalı.

</details>

<details><summary>Üç strateji yolu (referans)</summary>

Kanıt: tek yazı `/blog/albert-heijn-vs-jumbo-vs-lidl-wie-is-goedkoper` = **62 tıklama**
(tüm sitenin %18'i), 27.578 gösterim, konum 6,4. Diğerleri: `is-lidl-goedkoper-dan-albert-heijn`
%2,3 TO (konum 4,8), `is-kruidvat-goedkoper-dan-etos` %1,2, `beste-dag-boodschappen-doen` %1,1.
`/vergelijk` sayfaları %1,1 TO ile mükemmel dönüyor ama sayfa başına sadece 17-106 gösterim (hacim yok).

**A) Otorite inşası** — 69.500 head-term gösterimini açacak tek şey. Moat gerçek:
10+ markette haftalık fiyat verisi var, folder siteleri sadece PDF yayınlıyor. Bu veriyi
alıntılanabilir bir varlığa çevir (aylık Hollanda market fiyat endeksi raporu) ve tüketici/haber
mecralarına sun. `/kortingsindex` altyapısı var ama hikâye olarak paketlenmemiş.
Yavaş ama tek gerçek kaldıraç.

**B) İnce karşılaştırma yazılarını birleştir** — 9 yazının çoğu <100 gösterim alıyor, sinyali
dağıtıyor olabilir. Tek güçlü "welke supermarkt is het goedkoopst" hub'ında toplamak sinyali
yoğunlaştırır. RİSK: şu an konum 3-6'dalar, birleştirme bunu bozabilir.

**C) Tavanı kabul et, mevcut trafiği paraya çevir** — trafik hedefi bırak, AdSense/affiliate
dönüşümüne odaklan. Blog trafiği zaten market sayfalarından 10x iyi dönüyor.

*(Eski öneri — referans için: "goedkoopste supermarkt van nederland", "welke supermarkt is het
goedkoopst 2026" gibi sorgulara 5-10 yazı. Yukarıdaki veriye göre bu yolun tavanı düşük.)*

</details>

### 3. [ ] Head-term optimizasyonunu bırak

"aldi" 11.947 gösterim/28g → 4 tıklama (%0,03). "lidl aanbiedingen" 9.989 → 2.
Bu SERP'lerde 1-2. sıra marketin kendi sitesi, arkasında reclamefolder/allefolders/folderz/yenom/foldoo
(yıllarca otorite biriktirmiş). Konum 8-9'da kullanıcı zaten aradığını bulmuş oluyor.
Title/meta ince ayarı yapmayı kes — bu otorite savaşı, kopya savaşı değil.

> ⚠️ **SERP kontrolünde tuzak:** kendi tarayıcında kişiselleştirme yüzünden site 3. sırada
> görünüyor. GSC'nin verdiği 8,5 konumu gerçek olan. Canlı SERP'e bakıp "iyi sıradayız" deme.

### 4. [x] 44 "keşfedildi-indekslenmedi" sayfa — ✅ TEŞHİS + FIX YAPILDI (2026-08-01)

**Uygulanan fix (doğrulandı, sunucu HTML'inde):**
- `components/CategoryPage.tsx` + `app/categorie/[slug]/page.tsx`: kategori sayfalarına
  "Populaire producten in deze categorie" chip bloğu eklendi. `PRODUCT_KEYWORDS`'ün
  `category` alanı kategori slug'ıyla eşleştiriliyor. Sonuç: **20/20 ürün sayfası**
  artık bağlamsal iç link alıyor (zuivel 5, dranken 4, vlees-vis 3, overig 3,
  maaltijden 2, huishouden/snacks/verzorging 1'er). bakkerij + groente-fruit'te eşleşen
  keyword yok → blok gizleniyor.
- `components/ProductCard.tsx`: `/merk/` linkine `rel="nofollow"` eklendi. Kullanıcı için
  link duruyor, Googlebot tarama bütçesini indexlenmeyecek sayfalara harcamıyor.
  Doğrulandı: kategori sayfasında 48-124 nofollow.
- `tsc --noEmit` temiz, `next build` başarılı. (Build'deki "Failed to load dynamic font
  for ✓" uyarıları OG görsel üreticisinden, önceden de vardı, bu değişiklikle ilgisiz.)

**Ölçüm:** GSC "Keşfedildi - şu anda dizine eklenmiş değil" sayısı 2-4 hafta içinde
44'ten düşmeli. Düşmezse sorun tarama bütçesi değil, domain otoritesi demektir.

<details><summary>Teşhis detayı (referans)</summary>

**44 URL'in dağılımı:** 14 `/product/*`, 14 `/merk/*`, 9 `/categorie/*`, 6 blog, 1 `/contact`.

"Keşfedildi" = Google URL'i biliyor ama **henüz taramadı** (reddetmiş değil — "tarandı-indekslenmedi"
sadece 8 sayfa). Yani sorun içerik kalitesi değil, tarama önceliği.
İçerik ince de değil: `/product/koffie` 932 kelime, `/categorie/zuivel` 1050, blog 1277.

**KÖK NEDEN: iç linkleme önceliği tam ters.** Ham sunucu HTML'inde (Googlebot'un gördüğü):

| Sayfa tipi | Ana sayfadan link | Market sayfasından | Durum |
|---|---|---|---|
| `/merk/*` (**noindex!**) | 29 | 42 | asla indexlenmeyecek |
| `/categorie/*` | 7 | 7 | 10'un 9'u indexlenmemiş |
| `/product/*` | **0** | **0** | 20'nin 14'ü indexlenmemiş |

`/product/*` sayfalarına tek erişim yolu `/product` index sayfası (oradan 20 link var),
ana sayfa da o index'e 784 linkinden sadece 1'ini veriyor. Yani dar bir huniden besleniyorlar.
Buna karşılık **noindex** olan `/merk/*` sayfaları her sayfadan 29-42 doğrudan link alıyor.

**Yapılacak fix:**
- `/product/*` sayfalarına bağlamsal iç link ekle — en mantıklısı `/categorie/*` sayfalarından
  ("Populaire producten in deze categorie") ve ilgili blog yazılarından.
- `/merk/*` link yoğunluğunu azalt (ürün kartlarındaki marka etiketleri, `card-product` içinde).
  Sayfalar `noindex, follow` — teknik olarak doğru, robots.txt'de de engelli değil (doğru),
  ama her sayfadan 42 link vermek tarama bütçesini indexlenmeyecek sayfalara harcıyor.

**Elenen hipotezler:** ince içerik değil (kelime sayıları yukarıda); `/merk` sitemap'te yok (doğru);
ana sayfadaki 643 adet `href="#"` link çerez onay bannerının satıcı listesi — gerçek URL değil, sorun değil.

</details>

### Elenen hipotezler (tekrar bakma)
- **Ürün snippet'leri**: arama görünümü kırılımında sadece 483 gösterim — structured data yüzeyi sorun değil.
- **Cihaz**: mobil 45.779 gösterim/94 tıklama, masaüstü 16.812/31 — mobil %69 hakim, dengesizlik yok.

---

## 🎉 AdSense ONAYLANDI — 29 Tem 2026 07:49 CEST

- [x] Panelde doğrulandı: `dealhunter4u.nl` onay durumu **"Hazır"** (yeşil),
  Ads.txt "Yetki verildi". 13 Tem'deki "düşük değerli içerik" reddinden,
  içerik derinleştirme + `/merk` noindex + `/vergelijk` budaması + 26 Tem'deki
  yeniden inceleme talebinden sonra 3 gün içinde onaylandı.
- [x] **"İnceleme sırasında dokunma" kısıtı artık kalktı** — aşağıdaki eski not
  (UniqPaid.com'dan kaçınma, büyük yapısal değişiklik yapmama) geçersiz,
  normal şekilde devam edilebilir.
- [ ] **Sıradaki:** Ana Sayfa'da "Kimlik doğrulama" adımı bekliyor (ödeme
  alabilmek için gerekli), "Daha fazla reklam oluşturun" önerisi var — ilk
  gerçek kazanç rakamları birkaç gün içinde Tahmini Kazançlar panelinde
  görünmeye başlayacak, takip edilmeli.

## ✅ Bugün tamamlanan (2026-07-29) — Dirk/Plus expiresAt bug

- [x] **Dirk 1/102 ürün gösteriyordu, kök neden bulundu ve düzeltildi (`054ea09`)**:
  `/api/products?market=Dirk` 1, `/api/health/scraper` 102 diyordu. DB'de 101
  Dirk ürününün `expiresAt`'i taranma günüydü (dün, 2026-07-28) — Dirk'in kendi
  API'si dün geçici olarak bugünün tarihini `endDate` döndürmüş (kampanya geçiş
  penceresi), kod hiç doğrulamadan yazmış. Aynı sınıftan bug Plus'ta da bulundu
  (`.github/scripts/plus-scraper.js` — GH Actions'taki Plus'ın asıl kaynağı,
  guard'ı yoktu; `backend/scraper/index.js`'teki Plus fonksiyonunda zaten vardı).
  Her iki dosyaya "endDate > today" guard'ı eklendi. Deploy edildi, Railway'de
  manuel scraper tetiklendi — **Dirk 109 taze ürüne döndü, canlıda doğrulandı.**
  **Plus'ın fix'i henüz canlı değil** — GH Actions script'i, kendi zamanlanmış
  çalışmasında (09:00 UTC) otomatik düzelecek, `gh` CLI bu ortamda yok, manuel
  tetiklenemedi. Aldi'de farklı şekilde küçük bir stale-row grubu var (40/192,
  muhtemelen normal rotasyon kalıntısı), dokunulmadı.

## ✅ Bugün tamamlanan (2026-07-28) — GSC mail analizi + week-N bug fix

- [x] **GSC mailleri incelendi, gerçek bug bulundu ve düzeltildi (`e43b3d8`)**:
  Google'a connect+handoff ile giriş yapıldı (oturum `.gstack/browse-states/google.json`'a
  kaydedildi). "Tarandı - şu anda dizine eklenmiş değil, doğrulama başarısız" (8 sayfa)
  satırındaki URL'ler tek tek incelendi: 4x `/go?...` zaten bilinçli noindex (sorun
  değil), 1x opengraph-image bir görsel asset (sorun değil), 2x blog yazısı teknik
  olarak sağlıklı (muhtemelen crawl bütçesi gecikmesi), **1x gerçek bug**:
  `/blog/beste-deals/[week]/page.tsx` URL'deki hafta numarasını sadece başlıkta
  kullanıyordu, içerik her zaman canlı veriden geliyordu — week-24 ve week-31
  sayfaları birebir aynı fiyatları gösteriyordu. Her eski hafta URL'i sınırsız
  büyüyen bir duplicate-content tuzağıydı. Fix: eski week slug'ları `permanentRedirect()`
  (308) ile güncel haftaya yönlendiriliyor artık. Canlıda doğrulandı.
- [x] `dealhunter-market.onrender.com` GSC maili — eski/terk edilmiş Render deploy'u,
  aksiyon gerekmedi.

## ✅ Bugün tamamlanan (2026-07-27, devamı) — Awin mid'leri

- [x] **ALLPOWERS NL (mid=125964) + Deporvillage NL (mid=121218) eklendi (`0d7f17b`)**:
  huntermd91'den beri açık bekleyen iş kapandı. Kullanıcı Awin'e `connect`+`handoff`
  ile giriş yaptı, oturum `.gstack/browse-states/awin.json`'a kaydedildi (bir dahaki
  sefere tekrar giriş gerekmez). `MeerBesparenWidget.tsx`'e eklendi: ALLPOWERS →
  Thuis & Wonen, Deporvillage → Sport & Mode. Canlıda doğrulandı (JS chunk'ında
  mid'ler bulundu, tracking linkleri GET ile 200 + doğru `awc=` parametresiyle test
  edildi — `curl -I` Deporvillage'da yanlış negatif verdi, HEAD desteklenmiyor).

## ✅ ÇÖZÜLDÜ — AdSense incelemesi (yukarıda bkz. "AdSense ONAYLANDI")

- [x] ~~AdSense inceleme sonucunu takip et~~ — 29 Tem'de onaylandı.
  **UniqPaid.com hâlâ eklenmedi** — ScamAdviser düşük güven puanı sebebiyle
  editoryal karar olarak atlandı, AdSense onayından bağımsız, tekrar gündeme
  getirilebilir ama önerilmez.

> [!warning] Eski "27 Tem" görevi hatalıydı — kaldırıldı
> Bu dosyada 22 Tem'e kadar "27 Tem'de inceleme iste, o zamana kadar TIKLAMA"
> diye bir görev vardı. **Yanlıştı.** Panel 13 Tem'den beri "Müdahale edilmesi
> gerekiyor" durumundaydı ve "Sorunları giderdiğimi onaylıyorum" butonu hazır
> bekliyordu — beklenecek bir inceleme yoktu, top bizdeydi. Bu yanlış not
> yüzünden ~2 hafta boşa geçti. **Ders: panel durumunu varsayma, bak.**

## ✅ Bugün tamamlanan (2026-07-27) — perf doğrulama + 2 commit

- [x] **26 Tem'deki framer-motion LCP fix'i (`2398eee`) ölçüldü ve doğrulandı**: PSI
  kotası dolu olduğu için yerel Lighthouse kullanıldı. Ana sayfa: skor 43-49→**52**,
  LCP 13,1-13,7s→**~3,5s**, FCP 8,4-9,5s→**~2,5s**. Fix tuttu.
- [x] **Yeni bulgu — Aldi/market sayfaları (GSC gösterimlerinin %62'si) throttled
  Lighthouse'ta hâlâ kötü (FCP 4-7,2s, LCP 4,7-13,5s) ama run'lar arası çok gürültülü**
  (aynı sayfa art arda 2 ölçümde 2 kat fark). Unthrottled temiz ve tutarlı (skor 92-93,
  FCP/LCP 2,6-2,7s) — gerçek network/kod sorunu yok, throttled sayı Lantern
  simülasyon gürültüsü. `9156970`: MarketPage fold-altı 40+ karta
  `content-visibility:auto` eklendi (`.cv-auto-card`, 300px), main-thread work
  ölçülebilir düştü ama headline FCP/LCP sayısı gürültü yüzünden net değişmedi.
  **Dürüst durum: kod değişikliği güvenli/muhtemelen faydalı ama kesin "X saniye
  kazandırdı" iddiası şu an yapılamaz — PSI kotası yarın sıfırlanınca 3-5 run
  ortalamasıyla tekrar ölçülmeli.**
- [x] **Bağımsız bug bulundu ve düzeltildi: CategoryPage (`47dac32`)** — MarketPage'in
  26 Tem'de düzeltilen hatasının birebir aynısı (tüm kartlar `opacity:0` + SINIRSIZ
  kademeli gecikme `i*0.03s`, pagination yok → 100+ ürünlü kategoride son kart 3+
  saniye bekliyordu) burada atlanmıştı. MarketPage'le aynı düzeltme uygulandı.
  Unthrottled doğrulama: skor 100, FCP/LCP 1,0s.
- [x] Her iki commit push edildi, Railway otomatik deploy etti, `curl` ile canlıda
  doğrulandı.
- [x] **AH scraper stale veri tespit edildi ve manuel düzeltildi**: `/api/health/scraper`
  kontrolünde AH'nin `last_scraped`'i 07-26 08:02'de takılı kalmış, diğer tüm marketler
  07-27'de güncellenmişti. Sebep: `api.ah.nl` Akamai Bot Manager sayfalama sırasında
  bugünkü cron denemesinde erken 403 vermiş → 0 ürün → eski (ama gerçek) veri
  korunmuş, timestamp güncellenmemiş. Manuel `POST /api/scraper/run` tetiklendi,
  bu seferki deneme sayfa 15'e kadar geçti (403 yine geldi ama daha geç) → 750
  ürün tarandı, 290 gerçek promosyon toplandı. AH şimdi 286 ürünle taze
  (19:03 UTC). Bilinen/tekrarlayan Akamai deseni (bkz. huntermd32), kod bug'ı değil.
- [x] **"✓ Laagste prijs" rozeti — ratio-guard eklendi (`7eba1db`)**: `docs/outreach.md`'de
  (26 Tem) not düşülen "generieke namen delen productidentiteit" sorunu ölçüldü ve
  düzeltildi. Live data: 1.971 (name,market) grubunda (>=3 hafta geçmiş) max/min
  oranı 3,5x üstü olanlar (Red Bull €1,38-€29,99, Lipton €2,25-€19,38, Biefstuk
  naturel €2,49-€26,90 — 21 farklı örnek incelendi) neredeyse hep isim çakışması,
  gerçek haftalık indirim değil. 3,5x altındaki büyük çoğunluk (Kruidvat elektroniği
  tam yarı fiyatta, AH-marka ürünler) korundu — sadece 18/1.971 grup (%0,9) etkilendi.
  `getMinPriceMap()`'e `HAVING MAX/MIN <= 3.5` eklendi, frontend değişikliği
  gerekmedi (eksik entry zaten `isLowestPrice()`'ta false dönüyor). Canlıda
  doğrulandı: Red Bull/Lipton haritadan çıktı, AH Aubergine gibi meşru kayıtlar kaldı.

## ✅ Bugün tamamlanan (2026-07-26) — 22 commit

**AdSense — asıl tıkanıklık açıldı**
- [x] **Gerçek durum tespit edildi:** 13 Tem'de "düşük değere sahip içerik" ile
  reddedilmiş, bekleyen inceleme yok. Maillerde AdSense'ten son yazı 26 Mayıs.
- [x] **İnce içerik denetimi (sitemap 124 URL, kelime sayımı):** `/supermarkt/*`
  ~2.614 ✅, `/product/*` 671-1.011 ✅, `/blog/*` ~894 ✅, **`/merk/*` 342-396 ❌**.
  Kırık URL yok (124/124 HTTP 200).
- [x] **`/merk/[slug]` → `noindex, follow` + sitemap dışı** (`a7184ff`). Sitemap
  124 → 105. Sayfalar kullanıcıya açık. Trafik kaybı ihmal edilebilir.
- [x] İnceleme talebi gönderildi.

**Fiyat geçmişi / "Laagste prijs" rozeti — 3 kat düzeltme**
- [x] **Yazma/okuma yolu çelişkisi** (`d15dab4`): `UNIQUE(name, market, week)` birim
  içermiyordu ama `getMinPriceMap()` birime göre grupluyordu → tek ürünün geçmişi
  ikiye bölünüyordu. Kanıt: "1 de Beste Limoenen" (Dirk) birim anahtarı €0,89/1hafta,
  eski anahtar €0,79/3hafta → rozet €0,89'da "en düşük" diyordu. Fix: `(name, market)`
  bazında gruplama + eşik 2→3 hafta.
- [x] **Kategori promosyonları** (`a775c96`): "Alle Sensodyne", "Rode paprika of
  courgette" gibi isimlerde altındaki ürün her hafta değişiyor → rozet anlamsız.
  `CATEGORY_OFFER` regex ile eleniyor.
- [x] **Sonuç: 437 → 254 rozet.** 183 şüpheli iddia kaldırıldı.
- [x] **Constraint migrasyonu GEREKMEDİĞİ ölçümle kanıtlandı:** canlı sette aynı
  (isim, market) ile sıfır tekrar var; constraint doğru çalışıyor. Sorun isimlendirmede.

**Birim verisi (unitPrice) — rakip analizinden çıkan iş**
- [x] **Jumbo %0 → %7** (`a567374`): GraphQL `product.subtitle` ("570 ml") mevcut
  batch çağrısına eklendi, ekstra istek yok. Sadece tek ürünlü promolarda (58'i 4+ ürünlü).
- [x] **DekaMarkt %0 → %29** (`4077460`): `subText`'ten ("Pak 4 stuks.") ayrıştırma.
  Belirsizler eleniyor ("Beker 230 of blik 250 ml", "ca. 150 gram").

**Affiliate**
- [x] **6 yüksek komisyonlu program bağlandı** (`8264f92`): Wittebrug Lease €350,
  Carvendo €350, IkRij.nl €175, Lease.auto €85, MeerMetZiggo €50, I-KOOK €50.
  Hesapta 580 onaylı programdan sadece 93'ü bağlıymış.
- [x] 2 outreach maili gönderildi (Sparen en Besparen, One Broke Girl).

## 📌 Açık işler

- [x] **Birim verisi — ÇÖZÜLDÜ (2026-08-02, `c17098e`)** — not bayatmış, durum farklıydı:
  Lidl %71, Kruidvat %50 zaten iyiydi; **sadece Plus %0'daydı.**
  **Kök neden iki katmanlıydı:**
  1. `bulk-replace` handler'ı `createProduct`'ı sabit alan listesiyle kuruyordu ve
     `unitSize/unitType/unitPrice/fullSizeLabel` o listede yoktu. Backend scraper
     08:02'de birimleri dolduruyor, GH Actions run'ı (Plus/Kruidvat/Dirk) marketi
     komple değiştirip **birimleri siliyordu**. Mantık zaten vardı, API sınırında düşüyordu.
  2. Plus'ın Actions scraper'ı zaten göndermiyordu. Çıkarım (`PLUS_SIZE_RE` +
     `extractPlusSizeLabel` + `parseUnitLabel`) sadece `backend/scraper/index.js`'teydi;
     Actions script'i standalone çalıştığı için ESM modülü import edemiyor, birebir kopyalandı.

  Canlı API'de ölçüldü: **42/139 = %30**. Yerel alıcıyla uçtan uca test edildi,
  fiyatlar doğru (druiven 500g €0,99 → €1,98/kg; avocado 2 stuks €1,99 → €0,995/stuk).
  Kalanlar bilinçli reddediliyor: aralık ("Schaal 225-400 gram"), iki maat,
  tahmin ("ca. 150 gram"), örnek ("Bijv. ...").

  **Uyarı:** Plus scraper'ı çalışırken `⚠️ versionInfo değişti` diyor — OutSystems
  modül sürümü değişmiş. Şu an çalışıyor (139 ürün) ama ileride kırılabilir.

  **Kruidvat + Dirk de tamamlandı (2026-08-03, `6c50844`).** Aynı desen: mantık
  backend'de zaten vardı, Actions scraper'ları göndermiyordu.
  - Dirk: `offer.packaging` ("Zak 450 gram.", "Pak 3 stuks.") parse edildi.
    Uçtan uca test: 99 üründen 46'sı birim aldı (%46).
  - Kruidvat: `tile.subTitle` ("125 ml") kaynakta zaten vardı ama payload'a
    taşınmıyordu; artık taşınıyor, browser context'inde parse ediliyor (script
    backend modülünü import edemediği için birebir kopyalandı). Uçtan uca
    test: 100 üründen 45'i birim aldı (%45).
  - Yan bugfix: `extractSizeFromPromoText` (Dirk/DekaMarkt/Jumbo paylaşıyor)
    `kg` ve `liter` biliyordu ama `kilo`/`dl` bilmiyordu, oysa `parseUnitLabel`
    ikisini de kabul ediyor. Eklendi — "Zak 1 kilo" gibi ifadeler artık düşmüyor.
  - Reddedilenler bilinçli kalıyor: aralık ("Pot 330-370 gram"), iki maat
    ("Bak 500 gram of 1 kilo"), tahmin ("ca. 4 kilo").
- [ ] **Outreach takibi ~5 Ağustos** — her bloga en fazla BİR hatırlatma, sonra bırak
- [x] **Awin mid'leri — bayat not, zaten yapılmış.** ALLPOWERS (125964) ve
  Deporvillage (121218) `MeerBesparenWidget.tsx:139,147`'de duruyor. 2026-08-01'de
  de fark edilmişti (huntermd90), bugün doğrulandı, kapatıldı.
- [ ] **GSC ölçümü (2-4 hafta):** 25-26 Tem'deki SEO değişikliklerinin etkisi
  (AH-vs-Jumbo redirect, /vergelijk içeriği + noindex, merk noindex)
- [x] **Ürün kimliği — YAZMA TARAFI UYGULANDI (2026-08-09, commit `31881bb`).** price_history'ye `product_id` eklendi; AH `webshopId`, Jumbo `sku` (sadece singleProduct), Kruidvat `code` yazılıyor. **OKUMA bilinçli olarak kapalı** — `getMinPriceMap` isme göre gruplandırmaya devam ediyor, çünkü doğrudan çevirmek en büyük 3 marketin 12 haftalık geçmişini sıfırlardı. Birkaç hafta kimlik verisi biriktikten sonra okumayı çevirmek AYRI bir karar. Ayrıca aynı commit'te bulunan regresyon düzeltildi: `bulk-replace` fiyat geçmişi hiç yazmıyordu (Plus 13 haftadır yok, AH bugün o yola girmişti).
  <details><summary>Orijinal araştırma (2026-08-03)</summary>
  `docs/outreach.md`'deki engellenmiş veri hikâyesiyle bağlantılı (jenerik isimler
  farklı ürünleri çarpıştırıyor, "Lipton" örneği). Amaç: `price_history`'ye
  `product_id` ekleyip isim çarpışmasını kökten çözmek.

  **Bulgu — hangi marketlerde kaynakta zaten kalıcı kimlik var:**
  | Market | Alan | Durum |
  |---|---|---|
  | Albert Heijn | `webshopId` | **Kanıtlı kalıcı** — `ah.nl/producten/product/wi{id}` resmi ürün URL'si, kod zaten kendi image proxy'sinde (`server.js:103`) kullanıyor |
  | Kruidvat | `code` | **Kanıtlı kalıcı** — ürün sayfası URL'sinde (`/p/{code}`) |
  | Jumbo | `sku` | **Güçlü kanıt** — bağımsız `product(sku: "...")` GraphQL sorgusunda kullanılıyor, kampanyaya bağlı değil |
  | Plus | `Product_SKU` | **Kanıtlı GÜVENİLMEZ** — canlı API'de test edildi: "Alle Dove en Rexona" ve "Alle Elmex en Colgate" (farklı ürünler) aynı SKU'yu (963886) taşıyor. Slug bazlı filtre denendi (gerçek ürün slug'ı olanlar ayrı): sadece 19/137 teklif (~%14) güvenilir çıktı, pratikte değersiz. |
  | Dirk | `offerId` | **Olumsuz sinyal** — offer objesinde hiç ürün detay sayfası/URL alanı yok, tüm ürünler aynı genel `/aanbiedingen` sayfasına yönleniyor |
  | DekaMarkt | `offerId` | **Olumsuz sinyal** — GraphQL alan adı `currentOffers` ("o anki teklifler"), ayrı bir ürün ID alanı yok |
  | Hoogvliet, Lidl, Aldi, Vomar | — | kimlik yok, mevcut isim+market fallback'te kalır |

  **Karar:** sadece AH+Kruidvat+Jumbo (en büyük 3 market, ~936 ürün/hafta) güvenle
  kullanılabilir. Diğerlerini eklemek isim çarpışmasından daha kötü bir sorun
  yaratır — offer ID'ler muhtemelen haftalık sıfırlanıyor, yani "her hafta yeni
  ürün" gibi görünüp hiç fiyat geçmişi biriktirmez.

  **DURDURULDU (kullanıcı kararı, 2026-08-03):** şemaya `product_id` eklemek ve
  3 scraper'ı güncellemek geri dönüşü zor bir adım (mevcut 12 haftalık geçmişin
  yorumunu etkiler). Sadece araştırma yapıldı, uygulanmadı. Devam edilecekse:
  1. `price_history`'ye `product_id TEXT` ekle, `UNIQUE` kısıtına dahil et
  2. Backend AH/Jumbo scraper'larına `webshopId`/`sku`'yu `recordPriceHistory`'ye geçir
  3. Kruidvat Actions scraper'ına `code`'u aynı şekilde ekle
  4. `getMinPriceMap()`/`getPriceHistory()`'yi `product_id` varsa onu, yoksa
     `name::market` fallback'ini kullanacak şekilde güncelle (geriye dönük uyumluluk)
  </details>

## ⚠️ Railway deploy tuzakları (tekrar lazım olacak)

1. **"Deploy" butonu son commit'i deploy ETMEZ** — son *başarılı* build'i geri
   yükler. Yeni kod için **yeni commit push et**.
2. **Railway kendi SHA'larını gösterir** — paneldeki ID'ler (`cf2a2711`, `7ad41557`)
   GitHub'da yok. Commit **mesajından** eşleştir.
3. **Build log kaybolabilir** ("Yapı kayıtları yok"). O durumda sırayla: lockfile
   senkronu → gitignore kapsamı → yerel `tsc`+`build` → **`frontend-next/Dockerfile`
   sonundaki cache buster satırını ilerlet**. 26 Tem'de sebep bozuk Docker katmanıydı,
   cache buster çözdü.
4. **Railway Agent'ın 11 `railway/code-change-*` branch'i var** — otonom commit atıyor,
   PR açıyor. Kritik build düzeltmeleri main'de, kontrol edildi.

## ✅ Bugün tamamlanan (2026-07-14)

- [x] **Clarity kayıt CSV analizi (13 Temmuz, 28 oturum) + 1 sitemap düzeltmesi**: Kullanıcının paylaştığı Clarity export'u incelendi. Gerçek ziyaretçi ~20-21 (09:24-09:25 ve 04:51-05:38 arası Edge/PC kümesi kullanıcının kendi test trafiği). **Kanıt: `/vergelijk/albert-heijn-vs-dekamarkt`** — dünkü budamada noindex listesindeydi ama aynı gün 2 ayrı organik Google oturumu aldı (biri 1:45dk + 3 tıklama, gerçek okuma). `INDEXED_PAIR_SLUGS`'a eklendi → tekrar indexleniyor, sitemap'e geri girdi. `/merk/alesto`'nun organik trafik alması merk sayfalarını budamama kararını doğruladı. Sürekli sorun: 28/28 oturum tek sayfa — dünkü "Lees ook" iç linkleme fix'inin etkisi 1-2 hafta sonra bu export tekrar çekilerek ölçülmeli. Build ✅.

## ✅ Tamamlanan (2026-07-13)

- [x] 🚨 **BÜYÜK affiliate link denetimi — 105 widget + 36 /go linkinin TAMAMI canlı test edildi, ~60 kırık düzeltildi**: Kullanıcı "bazı MeerBesparen linkleri hata veriyor" dedi. Sistematik test (curl redirect zinciri + şüphelilerde gerçek tarayıcı) sonucu: **`dl=` parametresi Daisycon kampanyalarının neredeyse tamamında kırık** — hedef URL ana sayfaya yapıştırılıyor (`site.nl/https://site.nl/...` → 404). affiliate.ts'te 36 trackingBase'li girişten **35'i kırıktı** (dün eklenen Flink kartı dahil!); widget'ta 58+3 giriş. **Fix (script ile):** kırık girişlerde tam tracking linki `destinationUrl` oldu, `trackingBase` kaldırıldı; widget'ta `DC()` → düz link. `dl`'nin gerçekten çalıştığı istisnalar korundu: Libelle Shop, Kiwi.com, Lycamobile, Bjorn Borg, Plaud + DS üçlüsü (CheapTickets/Prijsvrij/Oad). Ek fix: Bol.com topdeals hedefi ölmüştü → ana sayfa. Rakuten zincirleri (Smartbox/Dr.Martens/Eastpak/Foreo) tarayıcıda 4/4 doğrulandı (curl 400'leri bot-bloğu). Vakantiediscounter 500 kendi sitelerinin sorunu. **DERS: yeni Daisycon linki eklerken dl'li VE dl'siz curl testi ZORUNLU — dl çoğunlukla çalışmıyor, varsayılan desen düz tam-link olmalı.**

- [x] **Mail taraması (Daisycon+Awin, son 2 gün) + Pure Energie yükseltmesi**: 5 yeni onay geldi — **Pure Energie kendi programı (9321)** hemen yükseltildi: legacy toplu linkten (si=16070/ds1.nl) kendi programına (si=9321/jdt8.net) geçildi, `dl=` çift-URL bug'ının yeni programda da sürdüğü canlı test edildi → ENGIE/Oxxio deseni (dl'siz tam link). Daisycon oturumu "hatırlanan hesap" tıklamasıyla parolasız tazelendi + yeniden kaydedildi. Kapanışlar (Bloomcabin NL/PL) sitede yoktu — aksiyon gerekmedi. **Karar verildi (Reddingshop hariç hepsi):** Zwemshop.com (si=14485, Sport&Mode) + Sneakids NL (Awin 103061, Sport&Mode) + Degrootmeesters (si=14804, Thuis&Wonen) eklendi (`0607e7d`) — Zwemshop+Degrootmeesters'te dl= çift-URL bug'ı canlı testte yakalandı, dl'siz tam link deseni kullanıldı. Reddingshop.nl atlandı (editoryal uyumsuzluk).

- [x] **Blog derinleştirme 2. parti — 10 yazı daha** (523-637 → 800+ bandına): supermarkt-app (privacy, klantenkaarten dijital, app vs folder), gezinsboodschappen (batch cooking, kinderen-regeli, vakantie bütçesi), barbecue (invriezen/marineren, vega BBQ, houtskool sezon sonu), jumbo-gids (Extra's, laagsteprijsgarantie, Weekendknallers), wasmiddel (dosering, voorraad kuralı, huismerk), chips-snacks (shrinkflation/100gr kuralı, diepvries gebak), **goedkoopste-supermarkt (GSC poz 2!** — kategori bazlı kazananlar, bölgesel şampiyonlar, 2026 fiyat manzarası), dranken (statiegeld, krat/blik/fles, alcoholvrij), lidl-gids (Lidl Plus, themaweken, non-food), beste-dag (günün saati, afprijsstickers, online ritim). Toplam 800 altı: 41→34, taban 417→657. Build ✅.

- [x] **AdSense adım 3 — en ince 9 blog yazısı derinleştirildi** (417-516 → 657-816 kelime): biologisch (bio-keurmerken, dirty dozen, markt), snacks-aldi-lidl (sezon takvimi, bewaren/invriezen, gezonde alternatieven), hoogvliet-gids (kortingscode gerçeği — GSC'de aranan sorgu, dagdeals, Dirk+Hoogvliet kombinasyonu), week-menu (örnek budget weekmenu, meal prep), zuivel-kaas (kaas bewaren, plantaardige zuivel fiyatları), 10-tips (3 valkuil, rekenvoorbeeld), huismerk-test (A-merk ne zaman kazanır, blindproef), vleeswaren (bewaren/invriezen, zout), dekamarkt-gids (klantenkaart + bier aanbiedingen — ikisi de GSC sorgusu). FAQ'suz 5 yazıya 3'er FAQ eklendi (rich results). Tüm eklemeler gerçek fayda — uydurma istatistik yok, GSC'de gerçekten aranan konularla hizalı. Build ✅. **Adım 4: ~2 hafta bekle (≈27 Temmuz), sonra AdSense'te yeniden inceleme iste — "Sorunları giderdiğimi onaylıyorum"a o zamana kadar TIKLAMA.**

- [x] **AdSense "düşük değerli içerik" adım 2 — ince içerik denetimi + /vergelijk budaması**: Sitemap denetimi (182 URL): blog 49 ✓, /supermarkt 10 ✓ (1235 kelime), /product 21 ✓ (900-1000 kelime), /merk 34 ✓ (460-750 kelime — ilk şüphenin aksine sağlıklı; 404 çıkan test URL'i sitemap'te olmayan bir slug'dı). **Gerçek suçlu: /vergelijk — 46 otomatik kombinasyon** (C(10,2), "hoogvliet-vs-vomar" dahil), sayfa başına ~170 benzersiz kelime, birbirinin şablon kopyası = sitemap'in %25'i doorway-page deseni. **Fix:** `INDEXED_PAIR_SLUGS` (9 gerçek talepli ikili — GSC sorguları + karşılaştırma blog yazılarıyla örtüşenler) dışındaki tüm ikililer `robots: noindex,follow` + sitemap dışı. Sayfalar kullanıcı için erişilebilir kalıyor. Sitemap 182→~145 URL, tamamı dolu içerik. Build ✅.

- [x] 🐛 **"Albert gitti" kök nedeni bulundu ve yapısal olarak düzeltildi**: Kullanıcı sabah AH'nin sitede olmadığını gördü; teşhis anında her şey yerindeydi (648 ürün, 08:02 taraması) → geçici pencere. Kök neden: haftalık ürünler Pazar gecesi topluca "expired" düşüyor + **başlangıç temizliği her sunucu restart'ında (yani her deploy'da!) çalışıyor** → Pazartesi 00:00-08:00 (yeni tarama) arasındaki herhangi bir restart tüm haftalık marketleri boşaltıyor. Dün akşamki deploy'lar bunu tetikledi. **Fix:** `clearExpiredProducts(graceDays)` parametresi — başlangıç temizliği 1 gün tolerans kullanıyor (dün biten ürünler taze tarama gelene kadar kalır), tarama-sonrası temizlik sıkı (graceDays=0). Trade-off: haftada birkaç sabah saati market sayfalarında "Aanbieding verlopen" etiketli dünkü ürünler görünebilir — boş market sayfasından hem kullanıcı hem AdSense incelemecisi için çok daha iyi. Ana sayfa gridi zaten expired'ı client-side filtreliyor.

- [x] **TikTok video pipeline kalıcılaştırıldı** (`tools/tiktok-video/`): dün scratchpad'de prototiplenen "Top 5 Supermarkt Deals" video üreticisi tek dosyada birleştirilip repoya taşındı (`make-video.mjs` — veri çek → animasyonlu HTML → Playwright 1080x1920 kaydı → ffmpeg mp4). Repodan uçtan uca test edildi, taze veriyle çalıştı (bugünün top 5'i: Dirk Robijn -74% #1). Kullanım: `cd tools/tiktok-video && npm i && node make-video.mjs` → `out/dealhunter-top5-weekNN.mp4`. Bağımlılık sadece ffmpeg-static (playwright global'den çözülür, browser indirilmez); `out/` ve `node_modules/` gitignore'da. İlk örnek video masaüstünde: `dealhunter-top5-week28.mp4` — kullanıcı TikTok hesabı açıp yükleyecek, ses uygulama içinden eklenecek.

## ✅ Bugün tamamlanan (2026-07-12)

- [x] **Kalıcı panel erişimi kuruldu (Daisycon + AdSense + GSC + Clarity)**: gstack browse `state save/load` ile oturum çerezleri vault kökünde `.gstack/browse-states/` altında saklanıyor (`daisycon.json`, `google.json` — AdSense+GSC birlikte, `clarity.json`). Artık her seferinde giriş/CSV istemeye gerek yok. **Not:** çerezler düz metin — repo İÇİNE kopyalanmamalı; `state load` komutu vault kökünden çalıştırılmalı (cwd'ye göre çözümleniyor). Google girişi headless engellendiği için `connect` + `handoff` ile kullanıcı kendisi giriş yaptı, çerez/parola transcript'e hiç girmedi.
- [x] **6 yeni Daisycon merchant eklendi — deeplink'ler panelden otomatik alındı**: Vandebron (si=12134, Energie), Beddengoeddirect.nl (si=14527), Kameo Sleep NL (si=21324), LEDshop Groenovatie (si=10385) → Thuis & Wonen; Sif Jakobs (si=21808), Freewear.nl (si=13066) → Sport & Mode. `affiliate.ts` + `MeerBesparenWidget.tsx`, tsc temiz. Editoryal uyumu zayıf onaylar (Avalon/Amsterdam Genetics/Disposables.bio/3 vitamin sitesi vb.) kullanıcı kararıyla atlandı. Awin tarafında 5 program kapanışı vardı, hiçbiri sitede yoktu — aksiyon gerekmedi.
- [x] **AdSense durumu kontrol edildi (panel, canlı)**: dealhunter4u.nl hâlâ **"Hazırlanıyor"**; "Site sahipliği doğrulandı" ✓ ve "İnceleme istendi" ✓. Paneldeki "Ads.txt: Bulunamadı" 1 Temmuz tarihli bayat tarama — dosya canlıda doğru (200, doğru pub-ID). Manuel "yeniden tara" butonu YOK, Google kendi zamanlamasıyla tarıyor — yapılacak bir şey yok, bekleme aşaması.
- [x] 🔬 **GSC derin analiz — CTR teşhisi değişti** (detay: `docs/ctr-takip.md`): site geneli %0,2 TO bir karışım yanılsaması; `/supermarkt/aldi` tek başına gösterimlerin %62'si. Navigasyonel marka sorguları (aldi, plus aanbiedingen...) ~%0,036 TO ile kazanılamaz; karşılaştırma/soru sorguları %3-14 TO ile kanıtlanmış format. **Karar: marka sorguları için title optimizasyonu bırakılıyor, büyüme kaldıracı karşılaştırma içeriği.**
- [x] 🔬 **Clarity derin analiz (8-12 Tem, 39 oturum — proje 8 Tem'den beri doğru veri alıyor)**: oturum başına 1,0 sayfa, %21 kaydırma derinliği, 21 sn etkin süre — gelen ziyaretçi tek sayfada çıkıyor. JS hatası 0 ✅ (hydration fix'leri tutmuş). Ölü tıklama %12,8 (5 oturum, örneklem küçük — takipte). "Geri dönen kullanıcı %0" alarmı büyük ölçüde artefakt: proje 4 günlük, dönecek vakit olmadı. **2-3 hafta sonra aynı analiz tekrarlanmalı** (retention + ölü tıklama o zaman gerçekten ölçülebilir).

- [x] 🔍 **Kullanıcı gözüyle site incelemesi + monetizasyon analizi**: Mobil ana sayfa 22.117px (~27 ekran); Clarity %21 kaydırma = kullanıcı ~4.645px'te çıkıyor. **İlk AdSense slotu %31 derinlikte, energie bölümü %97'de — ortalama kullanıcı hiçbir gelir yüzeyini görmüyor.** Market butonları (fold'da, tüm tıklamalar) komisyonsuz. ⚡Energie çipi %4'te MeerBesparen drawer'ı açıyor (erişilebilir ama pasif). PSI mobil: ana sayfa **25/100** (LCP 11,5s, TBT 2s), Aldi sayfası 61/100 (LCP 8,8s, TBT 80ms, CLS 0,002). **Karar verilen öncelik sırası: (1) karşılaştırma içeriği ile trafik, (2) market sayfalarına niyet-uyumlu affiliate (Flink kartı), (3) AdSense onayı gelince ilk slotu ~%15-20 bandına taşı, (4) ana sayfa mobil performans projesi.**
- [x] **Adım 1 uygulandı — iç linkleme kaldıraç düzeltmesi** (`lib/posts.ts`): (a) `getPostsByMarket` artık Vergelijking yazılarını öne + en yeniyi başa alıyor → Aldi sayfası (gösterimlerin %62'si) "Lees ook"ta 1/3 yerine 3/3 karşılaştırma yazısı gösteriyor, AH sayfası ~400 gösterimlik ailenin taze yazısını (`is-jumbo-goedkoper-dan-albert-heijn`, 07-10) ilk sıraya koyuyor; (b) `getRelatedPosts` kategori içinde tarihe göre sıralıyor → taze yazılar tüm kardeşlerden otomatik link alıyor (önceden hep POSTS dizisinin ilk 3'ü kazanıyordu); (c) kazanan yazıya (AH-vs-Jumbo-vs-Lidl, 32 tıklama) "Verder lezen" bloğu eklendi — 3 ikili karşılaştırma yazısına bağlamsal link. Kapsama analizi: GSC'deki tüm büyük karşılaştırma aileleri için yazı zaten mevcut, boşluk yok — kaldıraç pozisyon/linkleme idi. Etki ölçümü: 1-2 hafta sonra GSC'de `is jumbo goedkoper dan ah` ailesinin pozisyonu.

- [x] **Adım 2 uygulandı — niyet-uyumlu Flink kartı market sayfalarında** (`components/FlinkDeliveryCard.tsx` + `MarketPage.tsx`): stats bloğunun hemen altında, grid'in üstünde ince bir kart — "Geen tijd om naar {market} te gaan? Boodschappen in minuten thuisbezorgd → Bekijk Flink". `getAffiliateLink('Flink')` tek doğruluk kaynağından (komisyonlu Daisycon linki), GA4 `affiliate_click` eventi (`source_page` ile hangi market sayfasından geldiği izlenebilir). Mantık: market sayfası ziyaretçisi zaten boodschappen niyetiyle geliyor, market butonları komisyonsuz — Flink niyetle birebir uyumlu tek komisyonlu dokunuş. Etki takibi: GA4'te `affiliate_click{affiliate_name: Flink}` eventleri.

- [x] **Adım 3 uygulandı — ilk AdSense slotu görünür bölgeye taşındı** (`ProductsPage.tsx`): slot `7882410354` (horizontal, 90px) önceden Verloopt Binnenkort + MarketIndex + Combinatie widget'larının altındaydı — canlı ölçümde %31 derinlik, ortalama ziyaretçi (%21 kaydırma) hiç görmüyordu. Stats bölümünün hemen altına taşındı (~%11-12 bandı). Diğer slotlar (%47, %61) yerinde bırakıldı — sayfa aşırı reklam yüklemesin. AdSense hâlâ "Hazırlanıyor" olduğu için etki onay sonrası görülecek; yerleşim şimdiden hazır.

- [x] **Adım 4 (faz 1) uygulandı — ana sayfa mobil performans** (`ProductsPage.tsx` + `globals.css`): PSI teşhisi — ana JS chunk'ı 2.059ms script eval, mount'ta tam ürün fetch'i (151KB + 1689 ürün state churn) hidrasyonun ortasında, 22k px DOM'un tamamı ilk yüklemede render (Style&Layout 616ms), Material Symbols 447KB (dokunulmadı — ayrı iş), AdSense/gtag ~380KB (review beklerken dokunulmaz). İki cerrahi fix: (1) tam ürün fetch'i idle'a ertelendi (`requestIdleCallback` timeout 4sn + scroll/pointerdown erken tetikleme, eski Safari fallback'li) — SSR'daki top 60 görsel olarak yeterli; (2) fold-altı 5 büyük bölüme `content-visibility: auto` (`.cv-auto`: MarktenShowcase, Verloopt Binnenkort, MarketIndex, CombinatieDeals, alt SEO bloğu) — HTML DOM'da kalıyor (SEO güvenli), render maliyeti görünene kadar erteleniyor. Build ✅. **Önce/sonra PSI (mobil, lab):** skor 25→**37**, TBT 2.050ms→**640ms (-69%)** — fetch ertelemesi tam hedefi vurdu. FCP 6,2→6,5s, LCP 11,5→12,8s (değişmedi, tek-koşu lab varyansı ±%10-15) — LCP bu iki fix'in hedefi değildi; LCP'nin kökü FCP'nin kendisinin 6,5s olması (render-blocking font/CSS yolu + JS parse). **Faz 2 adayları:** Material Symbols 447KB, font yükleme stratejisi, bundle küçültme (framer-motion vb.) — ayrı oturum.

- [x] 🐛 **Dış AI raporu doğrulandı — 1 gerçek bug bulundu ve düzeltildi ("Aldi 1 deals" / "9 winkels")**: `MarktenShowcase` market kartı sayılarını client state'ten hesaplıyordu; başlangıçta sadece top-60 ürün yüklü (SSR) + tam fetch artık idle'a ertelenmiş olduğu için az temsil edilen marketler "1 deals", top-60'ta hiç ürünü olmayanlar (ör. Hoogvliet) tamamen gizli görünüyordu ("9 winkels"). **Fix:** `app/page.tsx` sunucuda gerçek `marketCounts` + `totalCount` hesaplayıp geçiriyor; `MarktenShowcase` `Math.max(clientCount, serverCount)` kullanıyor; Stats bölümündeki "Aanbiedingen Vandaag" da artık gerçek toplamı gösteriyor (önceden tam fetch'e kadar "60" yazıyordu).
- [x] **"Ontdek" listesi Kruidvat yığılması düzeltildi**: market-başına-2 garantisinden SONRAKİ "rest" bölümü indirim sıralı olduğu için Kruidvat parfümlerine yığılıyordu — rest de artık market bazlı round-robin interleave ediliyor (yalnızca default görünümde; arama/filtre sıralamaları değişmedi).
- [x] **Dış rapor düzeltmeleri (aksiyon gerekmedi):** "9 winkels" metni iddiası SSR'da yok (HTML tutarlı "tien winkels" diyor — sorun yukarıdaki client kartlarıydı); Consumentenbond referansı ana sayfada hiç olmamış, Dirk/Hoogvliet/Vomar sayfa içerik+FAQ'larında yaşıyor (tasarım gereği); ikinci dış AI mesajındaki "In winkelwagen kaldırıldı", "dün 2'li grid" ve "300 gösterim/10 tıklama" iddiaları bizim işlerle örtüşmüyor (halüsinasyon — gerçek rakamlar: 28 gün 115 tıklama/65,2K gösterim, dünkü analizde).

## ✅ Tamamlanan (2026-07-11)

- [x] **Repo toparlama**: birikmiş commit'lenmemiş dosyalar temizlendi. `qa-check.js` (API veri kalitesi + Playwright browser QA) ve `frontend-next/scripts/site-audit.mjs` (24 sayfa/API health-check) git'e eklendi, alakasız/kullanılmayan bir ekran görüntüsü (`public/Ekran görüntüsü 2026-06-21 203814.png`) silindi.
- [x] 🐛 **`site-audit.mjs`'te gerçek script bug'ı bulundu ve düzeltildi**: script API sağlık kontrollerini (`/api/push/preferences` vb.) frontend domain'ine (`www.dealhunter4u.nl`) atıyordu, ama bu uçlar sadece Railway backend'inde var — frontend `/api/push/*`'i proxy'lemiyor, tarayıcı doğrudan backend'e gidiyor (`PushNotificationButton.tsx:6`, `NEXT_PUBLIC_API_URL`). Script her çalıştırıldığında yanlış 404 raporluyordu. Backend URL'i ayrı sabit (`API_ORIGIN`) olarak eklendi, ilgili kontroller oraya yönlendirildi — artık 24/24 gerçek sonuç veriyor.
- [x] **Tam QA taraması yapıldı (`qa-check.js` + `site-audit.mjs`)**: 1689 ürün, tüm marketler beklenen aralıkta (AH 708, Jumbo 174, Aldi 160, Kruidvat 148, Plus 126, Dirk 113, DekaMarkt 102, Lidl 83, Vomar 60, Hoogvliet 15), market içi duplicate yok, sıfır/negatif fiyat yok, süresi geçmiş ürün yok. 24 sayfa + API uç noktası hepsi 200, title/desc/canonical/schema/FAQ tutarlı. İki düşük öncelikli bulgu: 29 kırık görsel (bilinen Kruidvat/AH CDN proxy bayatlığı, scraper'la kendiliğinden düzeliyor) ve 404 ürünün indirim yüzdesi eksik/0.
- [x] **`qa-check.js`'in "Kruidvat butonu bulunamadı" uyarısı araştırıldı — site bug'ı değil, script eskimişliği**: V9 redesign'dan sonra ana sayfadaki market filtreleri artık ayrı `market-pill` butonlar değil, tek bir "Filters" paneline taşınmış (`.market-pill` sayısı 4: Alle/Alleen Acties/Kassakoopjes/Filters). Script hâlâ eski inline pill UI'ını arıyor. Düşük öncelik — istenirse script'in Filters panelini açıp içindeki market seçimini test edecek şekilde güncellenmesi ayrı bir iş.

- [x] **Vomar görselsizliği tekrar araştırıldı, kod değişikliği yapılmadı**: Publitas'ın `spreads.json` endpoint'i her flyer sayfası için imzasız/hazır bir tam-sayfa görsel URL'si veriyor (teknik olarak erişilebilir), ama iki nedenden kullanışsız: (1) `ProductCard.tsx` görsel alanı (`h-36` + `object-contain`) tek dikey sayfa taramasını minik/okunamaz gösterir — tasarım tek ürün fotoğrafı için, tam sayfa için değil; (2) bir sayfada 15-20 ürün varsa hepsi AYNI sayfa görselini paylaşır, ürüne özel değil. Publitas'ın "hotspot" verisi de sadece sponsor linkleri içeriyor, ürün bazlı kırpma koordinatı yok. **Karar (kullanıcı onayı):** 8 Temmuz'daki "yanlış görsel yoktan kötü" kararı korunuyor — Vomar ürünleri `imageUrl: null` kalmaya devam ediyor, fallback ikonu gösteriliyor. Kod değişikliği yok.

## ✅ Tamamlanan (2026-07-08)

- [x] 🐛 **Vomar: Open Food Facts görsel eşleştirmesi tamamen kaldırıldı** — kullanıcı "görseller uygun değil" dedi, canlı görselleri indirip incelerken 2. kez yanlış eşleşme bulundu: **"Slagers Filet Americain"** (gerçek et ürünü) için **"De Vegetarische Slager"** markasının vejetaryen alternatifi gösteriliyordu. Metin benzerliği kategori farkını (et vs vejetaryen) hiç görmüyor. Kullanıcı kararıyla OFF eşleştirmesi tamamen kaldırıldı — Vomar'ın tüm ürünleri artık `imageUrl: null`, mevcut temiz fallback ikonuna düşüyor. Commit `d8dc1b3`, deploy edildi, doğrulandı.
- [x] **Plus tekrar düştü (135→21) ama bu SEFER bug değildi**: Vomar fix'inin redeploy'u sunucuyu yeniden başlattı → başlangıç temizliği çalıştı → dünkü Plus verisinin `expiresAt: '2026-07-07'` olan kısmı, gün gerçekten geçtiği (bugün 08 Temmuz) için **doğru şekilde** silindi (dün düzelttiğimiz fix'in beklenen davranışı). Plus'ın kendi GH Action'ı henüz çalışmamıştı (09:00 UTC'de çalışır, o an saat 03:00 UTC'ydi). Kendi bilgisayarımdan tekrar taratıp 21→**125 ürüne** geri yüklendi. **Not:** Plus'ın çoğu teklifi tek-günlük olduğu için, her gün gece yarısı (UTC) ile 09:00 UTC arası Plus verisi doğal olarak düşük görünecek — bu normal, müdahale gerekmiyor (GH Action otomatik tazeler).
- [x] 🐛 **Vomar görsel fix'i doğrulandı**: manuel scraper sonrası 39 Vomar ürününün TAMAMI `imageUrl: null` — sıfır OFF görseli kaldı.
- [x] 🐛 **Microsoft Clarity yanlış projeye veri gönderiyordu**: Kullanıcı Clarity hesabını kontrol ettirmiş (başka bir AI aracıyla), sitedeki kodun proje kimliği (`wq9ux76fx9`) kullanıcının kendi Clarity hesabındaki tek projeyle (`x232q20xdj`, "DealHunter4U") eşleşmiyordu — muhtemelen ilk kurulumda farklı bir hesaba ait kod kopyalanmış. `app/layout.tsx:120`'deki hardcoded ID düzeltildi, commit `c6b2d87`, push edildi. **Önemli:** şimdiye kadarki TÜM Clarity verisi (session recording, heatmap, CWV) kullanıcının erişemediği bir hesaba gidiyordu — bugünden itibaren doğru projeye kaydedilmeye başlayacak, ama geçmiş veri kurtarılamaz.

## ✅ Tamamlanan (2026-07-07)

- [x] **`ANTHROPIC_API_KEY` backend'e (Railway `dealhunter` servisi) eklendi** — Vomar LLM parsing artık aktif. İlk denemede kullanıcı yanlışlıkla `dealhunter-frontend` servisine eklemişti, doğru servise taşındı, deploy doğrulandı.
- [x] 🚨 **Kritik regresyon bulundu ve düzeltildi: günlük temizlik "bugün biten" ürünleri erken siliyordu**. Kullanıcı "Plus'ta 21 ürün var, az" dedi. Kök neden: dün eklenen `clearExpiredProducts()` (`backend/db.js`), tarih-only `expiresAt` (ör. `'2026-07-07'`) değerini `TIMESTAMPTZ`'e cast edince gece yarısı (00:00 UTC) oluyordu — cron/restart günün HERHANGİ bir saatinde çalışsa "bugün biten" ürünler saatler önce henüz geçerliyken siliniyordu. ANTHROPIC_API_KEY eklenince tetiklenen redeploy sunucuyu yeniden başlattı, başlangıç temizliği 267 ürünü sildi — bunların 123'ü Plus'ın o an geçerli 136 teklifinden. **Düzeltme:** karşılaştırma `expiresAt::DATE < CURRENT_DATE` yapıldı (gün bazlı, saat yok) — "bugün biten" ürün art��k gün sonuna kadar kalıyor. Commit `36969b8`, deploy edildi. Plus, kendi bilgisayarımdan (`plus-scraper.js`, Railway IP'sinden değil) yeniden taranıp 21→**135 ürüne** geri yüklendi, doğrulandı.
- [x] **Yan bulgu:** Plus scraper çalışırken "versionInfo değişti — plus-scraper.js güncellenmeli" uyarısı çıktı (Plus'ın OutSystems API'si sürüm değiştirmiş). Bu sefer sorun çıkarmadı (136 ürün toplandı) ama gelecekte script'i kırabilir — ileride Plus scraper hata verirse ilk bakılacak yer burası.
- [x] **Vomar LLM parsing: Anthropic → Gemini geçişi ve model düzeltmesi**: `ANTHROPIC_API_KEY` eklenip test edilince hesapta kredi olmadığı görüldü ("credit balance too low"). Kullanıcının isteğiyle ücretsiz alternatife geçildi: kod Gemini API'ye çevrildi (commit `0975b22`, env değişkeni `GEMINI_API_KEY`). İlk key'de de sorun çıktı — `gemini-2.0-flash` modeli bu key için ücretsiz kotada `limit: 0` veriyordu (429). 5 model canlı test edildi: `gemini-2.5-flash` ve `gemini-2.5-flash-lite` çalışıyor (200 OK), `gemini-2.0-flash`/`gemini-2.0-flash-lite` çalışmıyor (429), `gemini-1.5-flash` hiç yok (404). Kod `gemini-2.5-flash-lite`'a güncellendi, commit `49150db`, push edildi, deploy `SUCCESS` (05:15).
- [x] **Vomar LLM parsing doğrulandı — BAŞARILI**: `gemini-2.5-flash-lite` ile Vomar **9 → 59-69 ürüne** çıktı (haftalık beklenen 40-60 aralığında, tam kapsam). Loglarda ara sıra tekil sayfalarda geçici `429`/`503` hatası görüldü (rate limit / Gemini tarafı geçici), o sayfalar tasarım gereği otomatik regex'e düştü — genel sonucu etkilemedi. Vomar'ın düşük kapsam sorunu artık kapandı. (İsteğe bağlı ince ayar: eşzamanlı istek sayısını (`LLM_CONCURRENCY=5`) düşürüp 429'ları tamamen önlemek — düşük öncelik, mevcut sonuç zaten iyi.)
- [x] **Site sağlık kontrolü (yatmadan önce)**: scraper (10 market, hepsi güncel), deploy'lar (frontend+backend `SUCCESS`), backend logları (sadece bilinen 403'ler), canlı site (ana sayfa/Vomar/energie, konsol hatası yok, 3x tekrar test edildi) — hepsi temiz.
- [x] **Mail taraması (24 saat, ~17-18 yeni onay)**: **Westwing (NL)** (mobilya/dekorasyon, si=17294) ve **Sembo (NL)** (paket tatil, si=20811) eklendi — ikisi de tanınmış marka, mevcut kategorilere (Wonen/Reizen) tam uyuyor. Diğer ~11-16 onay (Bushcraftshop, Verwenboxen, Udacity, Skala.nl, Vograce, Herbolist, ve Polonya/Finlandiya'ya özel 6 program) editoryal uyumu zayıf/belirsiz veya bölgesel olarak alakasız olduğu için kullanıcı kararıyla atlandı. Commit `8fbee50`, push edildi. Untracked (si numarası, li/domain CSV export bekliyor).

## ✅ Tamamlanan (2026-07-06)

- [x] **"Faz 2: Büyüme & Gelir Planı (20 Adım)" harici Google Doc'u denetlendi**: 24 adımlık öncekiyle aynı desen — **13/20 madde zaten kodda mevcut** (arama/Fuse.js, favoriler, alışveriş listesi+WhatsApp paylaşım, fiyat düşünce push bildirimi, haftalık bülten (Brevo, gerçekten gönderiyor), affiliate tek-kaynak tablosu, AdSense altyapısı, enerji/reizen/mode kategori genişlemesi, PWA (manifest+SW+install prompt), Capacitor/Android app, push altyapısı, GA4, WhatsApp otomasyonu). Gerçek eksikler: tıklama takibinin DB'ye gitmemesi (sadece GA4), Türkçe içerik/hreflang'ın hiç olmaması, sponsorlu bölümün hardcoded olması, Play Store listing'in başlanmamış olması, **ve süresi geçmiş ürün temizliğinin sadece sunucu restart'ında çalışması**.
- [x] 🐛 **Süresi geçmiş/orphan ürün temizliği günlük cron'a bağlandı**: `clearExpiredProducts()`/`clearOrphanProducts()` (`backend/db.js`) zaten yazılmıştı ama sadece sunucu başlangıcında (10sn sonra, bir kerelik `setTimeout`) çalışıyordu — Railway deploy'ları arası (günler sürebilir) süresi geçmiş ürünler DB'de birikiyordu. Artık günlük 08:00 UTC scraper cron'unun sonunda çalışıyor, scraper başarısız olsa bile (ayrı try/catch). Commit `12d80e0`, push edildi.
- [x] 🐛 **Kullanıcı bildirdi: Kwantum'a tıklayınca 404** → araştırırken **sistemik bir bug** bulundu. Eski `si=16070` formatındaki 14 merchant'tan **11'i** `dl=` (deeplink) parametresiyle çift URL'e düşüp 404/hata sayfası veriyordu (`curl -sIL` ile canlı doğrulandı) — bunlardan 3'ü (**ENGIE, Oxxio, Pure Energie**) `/energie` sayfasının ana sağlayıcılarıydı, yani revenue-kritik sayfa da etkileniyordu. `dl=` kaldırılıp ana sayfaya yönlendirme yapıldı (11 merchant: ENGIE, Oxxio, Pure Energie, ONVZ, Nationale-Nederlanden, DELA, Monuta, Vakantiediscounter, Witgoedhuis, Sinner, Vitaminstore, Kwantum). CheapTickets/Prijsvrij/Oad test edilip sorunsuz bulundu, dokunulmadı. Commit `9029ef9`, push edildi.

## ✅ Tamamlanan (2026-07-05)

- [x] **Tam site denetimi + Para Kazanma Yol Haritası yeniden yazıldı** (`PARA_KAZANMA_YOLHARITASI.md`) — GSC export (Grafik.csv trend: gösterim Haziran başı ~240/gün → sonu ~3.700/gün, 15x büyüme ama TO hâlâ %0.1-0.5), canlı `/api/health/scraper` (1436 ürün), tarayıcıdan sayım (5 AdSense slotu, 51 affiliate link ana sayfada) ile gerçek verilere dayandırıldı. **Kritik bulgu:** süpermarket linkleri `network: 'direct'` (komisyonsuz) — trafik parayı AdSense + energie/telecom switch + widget üzerinden kazanıyor, marketlerin kendisi değil. Öncelik sırası buna göre yeniden kuruldu: AdSense re-review takibi, CTR fix'lerinin ölçümü, energie içerik kümesi — yeni büyük iş başlatmadan önce. Commit `7a58351`.
- [x] **Market bazlı OG image eklendi** (`app/supermarkt/[slug]/opengraph-image.tsx`) — önceden sadece ana sayfa ve blog'da dinamik paylaşım görseli vardı, 10 market sayfası site varsayılanına düşüyordu. Her market artık kendi marka rengi, hafta numarası, canlı deal sayısı ve en yüksek indirim yüzdesiyle kendi görselini üretiyor; Albert Heijn "Bonus" markalaşmasını da yansıtıyor. İki Satori (next/og) sınırlaması bulunup düzeltildi: (1) hex+alpha (`${color}18`) render olmuyor, `rgba()`'ya çevrilmesi gerekiyor; (2) "✓" karakteri glyph olarak desteklenmiyor, kutucuk çıkıyor — kaldırıldı. Build + görsel doğrulama yapıldı, commit `5513193`.
- [x] **`/zomeracties` sayfası eklendi** — 24 adımlık plandan geriye kalan son madde ("zomeractie supermarkt", 107 gösterim, poz 58). Tek bir DB kategorisi değil, çapraz kategori kelime filtresiyle (BBQ vlees, ijs, zomerfruit, koele drankjes) `getProducts()` üzerinden filtrelendi; mevcut `CategoryPage` komponenti + `categoryContent.ts`/`categoryFaqs.ts` deseni yeniden kullanıldı (yeni bileşen icat edilmedi). Test sırasında bir false-positive bulundu ("wijn" kelimesi geçen bir diş macunu yanlışlıkla eşleşmişti) — regex daraltıldı, 271→254 sonuca düştü, temiz. Footer'a link eklendi, sitemap'e eklendi. Commit `6ab78de`, canlıda doğrulandı.
- [x] **`/energie` pilot sayfası eklendi** — [[positioning-strategy]] kararının ilk somut adımı. 3 enerji sağlayıcı (ENGIE, Oxxio, Pure Energie) + 2 solar affiliate (noSun, Renogy) karşılaştırma kartları + gerçek editoryal içerik (vast/variabel contract, groene stroom herkomst, overstappen mekaniği) — market sayfalarının aksine canlı taranmış fiyat verisi olmadığı için **uydurma tasarruf rakamı kullanılmadı**, sadece doğrulanabilir genel bilgi yazıldı. 5 affiliate widget'ın kendi DS()/DC() çağrılarından `affiliate.ts`'e taşındı (tek doğruluk kaynağı, `/go?m=...` artık bunları da kapsıyor). FAQ schema, breadcrumb, footer link, sitemap eklendi. Commit `59e670c`, canlıda doğrulandı — tüm 5 affiliate linki doğru tracking URL'sine çözülüyor.
- [x] **Energie içerik kümesi eklendi (Faz A'nın ilk uygulaması)**: 3 yeni blog yazısı — "Energie vergelijken 2026" (692 kelime), "Vast of variabel energiecontract" (554 kelime), "Zonnepanelen terugverdientijd" (582 kelime). İlk taslak 342-483 kelimeydi, "thin content" dersine göre genişletildi. Hepsi `/energie`'ye ve birbirine link veriyor, `/energie` sayfasına "Lees ook" bölümü eklendi. FAQ'lar dahil, uydurma rakam yok. Commit `d8e4d5a`, canlıda doğrulandı (3 URL de 200 dönüyor, title'lar doğru).
- [x] **Faz B başladı — 3 yeni karşılaştırma yazısı**: "Is Dirk Goedkoper dan Aldi?" (562 kelime), "Is Plus Goedkoper dan Jumbo?" (587 kelime), "Is DekaMarkt Goedkoper dan Dirk?" (537 kelime) — roadmap'in "kanıtlanmış tek format" bulgusuna göre (albert-heijn-vs-jumbo-vs-lidl 25 tıklama ile sitenin en çok tıklanan sayfası). Roadmap'teki eksik ikili listesi tamamlandı ("Kruidvat vs Etos" hariç, Etos sitede taranmıyor). Toplam blog sayısı 45. Commit'ler `4a4570c`, `dae7e43`, canlıda doğrulandı.
- [x] **Kruidvat GH Action kontrol edildi + haftalıktan günlüğe çevrildi**: `.github/workflows/kruidvat-scraper.yml` haftada 1 kez (Pazartesi 08:15 UTC) çalışıyordu — backend'deki 7 marketle aynı "5-6 gün bayatlama" tasarım boşluğu. Bug değildi (son çalışma 30 Haziran'da başarıyla tamamlanmış, sıradaki otomatik çalışma zaten 6 Temmuz Pazartesi'ydi) ama tutarlılık için günlüğe çevrildi (`'15 8 * * *'`). Aynı taramada **Plus**'ın GH Action'ı da (`plus-scraper.yml`) haftalık bulundu — Plus'ın Railway'in kendi taraması 403 aldığı için TEK veri kaynağı bu action, Kruidvat'tan daha riskliydi, o da günlüğe çevrildi (`'0 9 * * *'`). Dirk'e dokunulmadı çünkü Railway'in kendi günlük cron'u zaten Dirk'i başarıyla tarıyor (403 yok), GH Action sadece yedek. Commit `3faf65a`, push edildi.
- [x] 🖼️ **Vomar scraper bug'ı bulundu ve düzeltildi**: Publitas OCR metin sırası bazen tek başına bir birim kelimesini ("STUK", "STUKS", "KRAT") ürün adı gibi bırakıyordu; bu garbage adlar Open Food Facts'te görsel arandığında rastgele/alakasız sonuçlar döndürüyordu (kanıt: "STUK" ürünü canlı sitede Chavroux keçi peyniri görseli gösteriyordu — indirilip görsel olarak doğrulandı). İki düzeltme: (1) `VOMAR_UNIT_ONLY_NAME` regex'i ile tek başına birim kelimesi olan sahte ürün adları artık scraper'a hiç girmiyor, (2) OFF görsel eşleşmesi artık sorgudaki en az bir anlamlı kelimenin dönen üründe geçmesini şart koşuyor — yoksa `imageUrl: null` kalıyor (mevcut fallback ikon devreye giriyor, yanlış görsel yerine). Manuel scraper tetiklenip canlı doğrulandı: Vomar 12→9 ürün (3 garbage kayıt silindi), sıfır yanlış görsel kaldı. Commit `c57b2c1`. **Not:** market sayfaları `revalidate=3600` (1 saatlik ISR) kullanıyor, sayfa HTML'i en geç 1 saat içinde yeni veriyi yansıtacak — API tarafı anlık doğrulandı.

- [x] **10 commit'lik dünkü birikim deploy edildi ve canlıda doğrulandı** (WhatsApp numarası, market sayısı, sitemap fix, blog derinleştirme, yeni merchantlar) — `git push origin main`, Railway otomatik deploy etti
- [x] **Albert Heijn "Bonus" title fix** — dinamik title formülü (25 Haziran) AH'nin `ctaTitle`'ındaki "Bonus" kelimesini sessizce düşürüyordu (H1'de var, `<title>`'da yoktu). Yeni `dealBrandTerm` alanı eklendi, artık "Albert Heijn Bonus Aanbiedingen Week 27 ✓ N Actuele Deals" — GSC'nin "bonus aanbiedingen" (poz 15.8) ve "bonus aanbiedingen deze week" (poz 16.4) hedef sorgularıyla tutarlı (`0c98de7`)
- [x] 🚨 **Büyük bulgu: AH/Jumbo/Lidl/Aldi/Hoogvliet/Vomar/DekaMarkt canlı API'de 0 ürün döndürüyordu** (1591 → 321 toplam ürün). Railway loglarına bakıldı (CLI zaten kurulu/giriş yapılmış, backend servis adı **"dealhunter"**): kök neden — bu 7 marketin backend'deki kendi scraper'ı **haftada sadece 1 kez** (Pazartesi 08:00 UTC) çalışıyordu; 6 gün sonra (Pazar) deal'lerin `expiresAt` tarihi geçmişti, container restart'ında otomatik temizlik rutini 1270 süresi geçmiş ürünü sildi. Dirk/Plus/Kruidvat hayatta kaldı çünkü onlar ayrıca GitHub Actions ile daha sık besleniyor.
- [x] **Manuel scraper tetikleme ile risk testi yapıldı** (`POST /api/scraper/run`, `railway run` ile ADMIN_TOKEN'ı hiç ekrana yazdırmadan header'a enjekte edildi — güvenlik: secret asla transcript'e girmedi). Sonuç: AH/Jumbo/Lidl/Aldi/Hoogvliet/Vomar/DekaMarkt **hiçbir botlanma olmadan** temiz tarandı (~3 dakika, 321→1561 ürün). Sadece **Coop (403)** ve **Plus (403)** Railway IP'sinden engelleniyor — ikisi de zaten bilinen/ayrı yönetilen durumlar (Coop gizli market, Plus zaten GitHub Actions'a taşınmıştı).
- [x] **Backend scraper cron'u haftalıktan günlüğe çevrildi**: `cron.schedule('0 8 * * 1', ...)` → `'0 8 * * *'` — Cuma-Pazar boşluk sorunu kalıcı çözüldü (`e9106da`, deploy edildi)

## Eski tamamlananlar (2026-07-04)

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
- [x] **JW Verzekeringen** (Daisycon si=21167) eklendi — kategori sekmelerini test ederken bulundu, daha önce "okunmuş" işaretli olduğu için `is:unread` taramasında hiç görünmemişti (`814b02e`)
- [x] **GSC CTR analizi (24 adımlık dış plan denetlendi)**: Kullanıcı Google Doc'tan 24 adımlık bir "TO artırma planı" paylaştı, kodla karşılaştırdım. Sonuç: adımların çoğu (dinamik title formülü, Product/Offer schema, FAQ schema, karşılaştırma blog yazıları) **zaten canlıda mevcut** — plan bunları bilmeden yeniden öneriyordu. Gerçek Search Console export'unu (`Downloads/...Performance-on-Search-2026-07-01.zip`) okuyup en yüksek gösterimli 10 sorguyu Kutu A/B/C'ye ayırdım: "aldi" (14K gösterim, poz 7.8, TO %0.03), "plus aanbiedingen" (2968, poz 8.8), "dirk aanbiedingen" (2478, poz 7.8) — hepsi Kutu A (snippet zaten düzeltilmiş, Google'ın yeni title'ı alıp almadığı doğrulandı — almış). Kutu B: "bonus aanbiedingen" (poz 15.8), "bonus aanbiedingen deze week" (poz 16.4) — bunlar hâlâ açık, AH'nin "Bonus" markalaşmasına içerik güçlendirmesi gerekiyor.
- [x] **Gerçek bug bulundu ve düzeltildi**: `SiteFooter.tsx`'te WhatsApp linki sahte placeholder numaraydı (`wa.me/31000000000`) → gerçek numaraya (`+31649305079`) düzeltildi
- [x] **"8 supermarkt / 11 winkel" tutarsızlığı düzeltildi** → gerçek görünür market sayısı **10** (Coop bilinçli gizli). `layout.tsx`, ana sayfa FAQ, `ProductsPage.tsx` (NL/EN/TR), 11 blog CTA'sı düzeltildi. Bir yazıdaki "8 supermarkten" başlığı kasıtlı bırakıldı çünkü o yazı özellikle 8 marketi karşılaştırıyor (`9e0ea18`→`39e470e`)
- [x] ⚠️ **Güvenlik: `git add -A` yanlışlıkla `.env.whatsapp.txt`'i (Green API token) commit'e soktu** — hemen fark edilip `git rm --cached` + amend ile TÜM commit geçmişinden temizlendi (doğrulandı: `git log --all -p` sıfır sonuç). **Push edilmemişti, dışarı hiç çıkmadı.** `.gitignore`'a `.env` / `.env.*` eklendi (`58e18f3`). **Ders: bu repoda kökte `.env.whatsapp.txt` var, ASLA `git add -A` kullanma, dosyaları isimle ekle.**

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

- [x] **Vomar düşük kapsam sorunu araştırıldı**: haftada 40-60 ürün olmasına rağmen sadece 9-11'i yakalanıyordu. Bu haftaki 42 sayfayı canlı çekip inceledim — kök neden regex ile güvenle çözülemeyecek kadar dağınık OCR metni (farklı ürünlerin isim/fiyatları sırasız iç içe geçiyor). Vomar'ın kendi ürün API'si yok (`api.vomar.nl` sadece site içeriği için). Regex'i daha da gevşetmek yanlış isim-fiyat eşleşmesi riski taşıyordu (önceki oturumda tam bunu düzeltmiştik). **Çözüm: regex yerine Claude Haiku ile sayfa ayrıştırma eklendi** (`parseVomarPageWithLLM`, commit `98a1f0a`) — `ANTHROPIC_API_KEY` yoksa mevcut regex'e sessizce düşüyor (sıfır risk, dormant). **Aktifleştirmek için: Railway'de `dealhunter` (backend) servisine `ANTHROPIC_API_KEY` env değişkeni eklenmesi gerekiyor** — eklendikten sonra manuel scraper tetikleyip Vomar ürün sayısındaki artışı doğrularım.

## 🔜 Sıradaki adımlar (gelince buradan devam)

- [ ] **Faz A durumu:** energie içerik kümesi ✅ bitti. Kalan Faz A maddeleri: AdSense re-review takibi (dashboard, benim erişimim yok), CTR ölçümü (1-2 hafta sonra), Daisycon CSV export (kullanıcı tarafında). Detay/Faz B-C için `PARA_KAZANMA_YOLHARITASI.md`'ye bak.
- [x] **6 Temmuz doğrulandı**: backend cron'u (08:02 UTC, 7 market), Kruidvat GH Action (12:16 UTC, 167 ürün — dün 161'den arttı) ve Plus GH Action (12:36 UTC, 136 ürün) hepsi yeni günlük zamanlamayla sorunsuz çalıştı, hepsi bugünün tarihini taşıyor. Toplam 1610 ürün canlıda.
- [x] **2026-07-05 CSV export incelendi**: 5 bekleyen merchant'tan 2'si (**Minisforum EU** si=20771, **Jwverzekeringen** si=21167) bulundu ve tam tracked hale getirildi (`affiliate.ts` + `MeerBesparenWidget.tsx`, commit `ec6ab3f`). Housefinan (DE), Kredanta (DACH), Minisforum (FR) bu bulk export'ta hiç yoktu (program ID ile de arandı, sıfır sonuç) — muhtemelen bulk export kapsamına girmiyorlar.
- [x] **Housefinan, Kredanta, Minisforum (FR)** — bulk export'ta yoktu, kullanıcı Daisycon panelinde "Advertisements" bölümünden tek tek si/li bulup ekledi (bkz. aşağıdaki `ecabcf2` maddesi) — tamamen tracked, backlog kapandı
- [x] **Mail taraması: 201 mail arasında 27 onay maili bulundu, 24'ü hiç işlenmemişti**. En değerlisi 6 enerji şirketi — **Essent, Essent Zakelijk, energiedirect, Frank Energie, Gewoon Energie, Powerpeers** (Essent ve energiedirect Hollanda'nın en büyük sağlayıcılarından) — revenue roadmap'in en değerli kanalı olduğu için hemen eklendi (`affiliate.ts` + `MeerBesparenWidget.tsx`, commit `8b9aafa`), untracked (sadece si numarası, CSV export bekliyor). Kalan 18 yeni onay (Donald Duck Shop, Go Puzzle FR/DE, Jortt.nl, BUNNI, wunderwerk, Huurzone.nl/Huurstunt, 123opzeggen, PVCvloeren, vb.) editoryal uyumu belirsiz olduğu için kullanıcı kararıyla atlandı.
- [x] **6 enerji şirketi gerçek tracking'e sarıldı**: kullanıcı yeni bir Daisycon export'u indirdi (`2026-07-06__campaigns.xlsx`, 539 program — önceki 524'lük CSV'den daha geniş). Essent, Essent Zakelijk, energiedirect, Frank Energie, Gewoon Energie, Powerpeers'ın hepsi bu export'ta bulundu, gerçek si/li/domain ile `affiliate.ts` + `MeerBesparenWidget.tsx`'e işlendi (commit `0eff769`, push edildi).
- [x] **Housefinan, Kredanta, Minisforum (FR) de tam tracked oldu** — kullanıcı Daisycon panelinde "Advertisements" (bulk export/Deeplinks aracının kapsamadığı) bölümünden gerçek si/li değerlerini buldu. Housefinan ve Kredanta deeplink desteklemiyor (tek link "Landing Page" reklam materyali, Levi's/Rakuten ile aynı durum) — `destinationUrl` doğrudan tam tracking linkine eşitlendi, `trackingBase` kasıtlı olarak boş bırakıldı ki `wrapAffiliate()` `&dl=` eklemesin. Minisforum FR deeplink destekliyor, normal `trackingBase` kalıbı kullanıldı. Commit `ecabcf2`, push edildi. **Böylece tüm bekleyen 9 merchant (6 enerji + bu 3'ü) artık tam tracked — affiliate backlog tamamen kapandı.**
- [ ] **GSC "Doğrula" (Validate Fix)** — sitemap + içerik derinleştirme değişiklikleri deploy olduktan birkaç hafta sonra GSC'de tekrar doğrulama tetiklenmeli
- [ ] **"aldi" / "plus aanbiedingen" / "dirk aanbiedingen" / "bonus aanbiedingen" TO takibi** — title formülleri Google'da canlı, ama GSC verisi henüz bunu yansıtmıyor. 1-2 hafta sonra taze export alıp gerçek TO değişimini ölç.
- [x] **CTR takip dosyası oluşturuldu** (`docs/ctr-takip.md`) — dağınık GSC rakamları (aldi/plus/dirk/bonus aanbiedingen sorguları, 07-01 export baseline) tek tabloda toplandı, gelecekteki export'lar için "Sonraki ölçüm" sütunu hazır. Sadece gerçek ölçülmüş rakamlar girildi, boş hücreler `—` (uydurma yok).
- [x] **24 adımlık dış plan artık tamamen kapandı** — market bazlı OG image + zomeracties sayfası bugün bitti
- [x] **Enerji pilot kategorisi başladı: `/energie` sayfası canlıda** — sonraki adım birkaç hafta GSC'de "energie vergelijken" gibi sorguların gösterim/pozisyonunu izlemek, sonuca göre reizen/mode'a aynı şablonu uygulamaya karar vermek
- [x] 🐛 **Kruidvat manuel scraper anomalisi kök nedeni bulundu ve düzeltildi**: `backend/scraper/index.js`'deki `scrapeKruidvat()` diğer 10 marketin aksine döndürdüğü ürün objelerine `market: 'Kruidvat'` alanını hiç eklemiyordu. `server.js`'deki `runScraperJob()` ekleme aşamasında `if (!p.market || !p.name) return false` kontrolü bunların hepsini sessizce eliyordu — log'da "161 ürün" görünse de DB'ye hiçbiri yazılmıyordu, hatta eski 64 kaydı bile temizlenmiyordu (`clearProductsByMarket` da `market: undefined` yüzünden hiç tetiklenmiyordu). Tek satır fix (`market: 'Kruidvat'` eklendi), commit `56349ac`, deploy edildi, manuel tetiklemeyle doğrulandı: Kruidvat 64→**161** ürün, `last_scraped` bugüne güncellendi.
- [x] 🐛 **İkinci bug: cross-market dedup sadece isme göre yapılıyordu**: `scrapeFlyerProducts()`'ın sonunda tüm marketler birleştirildikten sonraki "duplicate temizliği" `p.name.toLowerCase().trim()` anahtarıyla çalışıyordu — market'i hesaba katmıyordu. İki farklı markette birebir aynı isimli bir ürün varsa (yaygın: ulusal markalar) sadece ilk taranan marketin kopyası hayatta kalıyor, diğeri sessizce kayboluyordu — bu hem o marketin ürün sayısını hem de `buildComparisonGroups()`'ın yakalayabileceği cross-market karşılaştırma fırsatlarını azaltıyordu. Anahtar `${market}:${name}` yapıldı (insert aşamasındaki `server.js`'in zaten kullandığı kapsamla aynı). Commit `467ae7e`, deploy edildi. Etkisi sonraki scraper çalışmasında (günlük cron veya manuel tetikleme) görülecek, ayrıca doğrulama yapılmadı.
- [x] **Coop scraper'ı** — **kapatıldı, tekrar denenmeyecek.** 403 sorunu değilmiş: Coop, PLUS'a katıldı ve `coop.nl`'in tamamı `plus.nl`'e yönleniyor (2026-08-20: ana sayfa, `/aanbiedingen`, `/winkels` — üçü de). `fetch` yönlendirmeyi takip ettiği için scraper plus.nl HTML'ini çekip `market: 'Coop'` diye parse etmeye çalışıyordu; bugün 0 ürün dönüyor ama parser tutsaydı PLUS ürünleri Coop olarak veritabanına girerdi. `scrapeCoop()` artık başta `return []` yapıyor
- [ ] **AdSense review takibi** — deploy sonrası 3-7 gün içinde dashboard'da "Hazırlanıyor" → "Hazır" değişimini kontrol et
- [x] **CWV/hydration kontrolü yapıldı (gstack browse ile)**: React #418 hydration hatası artık hiç görünmüyor. Ana sayfada 4 tane 404 bulundu — hepsi Kruidvat CDN görsel proxy'si, kök neden bilinen Kruidvat veri bayatlığı (yarınki günlük scrape ile kendiliğinden düzelir).
- [x] **Kullanıcı kendi Google hesabından ücretsiz PageSpeed Insights API key aldı** (`.secrets/psi-key.txt.txt`, gitignore'da) — gerçek sayısal CWV ölçümü yapıldı.
- [x] 🐛 **Gerçek performans bug'ı bulundu ve düzeltildi**: `lib/similarity.ts`'deki `buildComparisonGroups()` ana sayfada HER ziyaretçide çalışıyor ve O(n²) karşılaştırma döngüsü içinde `tokenize()` (regex+split) her seferinde yeniden hesaplanıyordu — ~1432 üründe ~2 milyon gereksiz regex işlemi. Düzeltme: her ürünün token'ları bir kere hesaplanıp `Map`'te cache'lendi (mantık/çıktı aynı, sadece O(n²) → O(n) regex çağrısı). Commit `a877160`, deploy edildi, PSI ile önce/sonra ölçüldü:
  - **Desktop:** Script Evaluation 3547ms→2034ms (-43%), TBT 2490ms→970ms (-61%), TTI 5.6s→4.2s (-25%)
  - **Mobile:** Script Evaluation ~3278ms→1559ms (chunk bazında yarıya indi), ama LCP/TTI (~15s) neredeyse değişmedi — mobilde asıl darboğaz farklı: `ProductsPage` client-side render, Lighthouse'un mobil testi 4x CPU yavaşlatma uyguluyor. **CrUX gerçek kullanıcı verisi hâlâ yok** (trafik yetersiz), yani bu 15s laboratuvar-en-kötü-senaryo, gerçek ziyaretçi deneyimi bilinmiyor.
  - **Karar:** mobil LCP/render mimarisi işi (server-side ilk render, ağır client hesaplamalarını erteleme) kullanıcı tarafından **ayrı bir görev olarak** ertelendi — bu fix'in devamı değil, kendi başına planlanması gereken bir iş. Bkz. memory `performance-cwv-2026-07-05.md`.
- [ ] **Mammotion (INT)** — Daisycon'da henüz onaylı değil, sadece bültende duyuruldu
- [ ] **Green API token rotasyonu** — düşük öncelik (hiç push edilmedi, dışarı çıkmadı) ama tam iç rahatlığı için Green API panelinden yenilenebilir

## Referanslar

- Site: https://www.dealhunter4u.nl
- Repo: dealhunter-market (main branch)
- Railway: proje "pleasing-learning" — frontend servis adı `dealhunter-frontend`, **backend servis adı `dealhunter`** (loglara bakmak için: `railway logs -s dealhunter`, deployment listesi: `railway deployment list -s dealhunter`)
- Backend API: https://dealhunter-production-d900.up.railway.app (health: `/api/health/scraper`, manuel tetikleme: `POST /api/scraper/run` — `ADMIN_TOKEN` gerektirir, `railway run -s dealhunter` ile env'i hiç yazdırmadan enjekte et)
- Son commit'ler: `c6b2d87` (Clarity yanlış hesap fix), `d8dc1b3` (Vomar OFF görsel kaldırıldı), `8fbee50` (Westwing/Sembo eklendi), `49150db`/`0975b22` (Vomar LLM parsing → Gemini), `36969b8` (expiresAt::DATE cleanup fix), `98a1f0a` (Vomar LLM parsing eklendi), `9029ef9` (11 merchant dl= bug fix), `12d80e0` (günlük expired-cleanup cron), `3faf65a` (Kruidvat/Plus GH Action haftalık→günlük)
- GEMINI_API_KEY ve ANTHROPIC_API_KEY (kullanılmıyor artık) Railway `dealhunter` servisinde tanımlı — Vomar LLM parsing bunu kullanıyor (`gemini-2.5-flash-lite`)
- `.secrets/psi-key.txt.txt` — PageSpeed Insights API key, gitignore'da, CWV ölçümü için tekrar kullanılabilir
