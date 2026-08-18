# Microsoft Clarity — Engagement Takibi

`ctr-takip.md`'nin (GSC/CTR) engagement karşılığı. Clarity export'larındaki oturum
kalitesi metriklerini tek yerde toplar. Sadece gerçek ölçülmüş rakamlar; `—` = o
dönem ölçülmemiş.

> **Kritik okuma uyarısı:** Clarity'nin oturum sayısı affiliate-ağ doğrulama
> botlarıyla ciddi şekilde kirlenebiliyor (aşağıya bkz. 2026-07-22). Ham "oturum
> sayısı"na değil, referrer + bot kırılımına bakarak gerçek insan trafiğini ayıkla.

## Zaman serisi

| Tarih aralığı | Toplam oturum | Bot | Sayfa/oturum | Kaydırma | Etkin süre | JS hata | Dead click | Geri dönen | Not |
|---|---|---|---|---|---|---|---|---|---|
| 2026-07-08–12 | 39 | — | 1,0 | %21 | 21s | 0 | %12,8 (5) | %0 | Proje 8 Tem'den beri doğru veri alıyor; hydration fix'leri tuttu |
| 2026-07-13 | 28 | ~7-8 | 1,0 | — | — | 0 | — | %0 | 28/28 tek sayfa; gerçek ziyaretçi ~20 |
| **2026-07-20–22** | **94** | **26** | **1,02** | **%29,6** | **17s** | **0** | **%5,32 (5)** | **%0** | ⚠️ 45 oturum `merchant.tradetracker.com`'dan — gerçek insan ~15-20 |
| 2026-07-26–28 | 41 | 248 | 1,0 | %43,4 | 16s | — | %7,32 (3) | %0 | Bot sayısı gerçek oturumun 6 katı |
| 2026-08-09 | — | — | 1,0 | %32,7 | 33s | — | %0 | %0 | `analiz-2026-08-15.md` §5 |
| 2026-08-12–15 | 38 | 51 | 1,0 | %30,9 | 54s | 0 | %0 | %0 | Giden tıklama 1 oturum |
| **2026-08-16–18** | **37** | **178** | **1,0** | **%30,5** | **58s** | **0** | **%10,81 (4)** | **%0** | Giden 4 ot., arama 2 ot. |
| **30 gün (20 Tem–18 Ağu)** | **619** | **883** | **1,00** | **%31,9** | **33s** | **—** | **%5,65 (35)** | **%0** | **En güvenilir taban** |

## 🔴 2026-07-22 ana bulgu: TradeTracker bot kirliliği

**Yönlendiren kırılımı:** `merchant.tradetracker.com` **45 oturum** (Google 13'ün 3+
katı), l.wl.co 3, dealhunter4u 2, gemini 1, tradetracker 1, ui.awin 1.

TradeTracker affiliate ağı (B2Ctelecom.nl bu ağ üzerinden eklendi, commit `0aafb0b`).
Ağ, eklenen affiliate linklerini **otomatik doğrulama botlarıyla** tarıyor — 45
oturum bu doğrulama trafiği, gerçek kullanıcı akışı değil. Clarity'nin kendi bot
sayacı da doğruluyor: 94 oturumun **26'sı bot işaretli, 24'ü suspiciousDevice**.

**Sonuç:** Panel "94 oturum" diyor ama **gerçek insan trafiği ~15-20** (Google 13 +
birkaç direkt). Tüm engagement yüzdeleri bu düzeltilmiş tabana göre okunmalı.

**Aksiyon seçeneği (uygulanmadı, kullanıcı kararı bekliyor):** Clarity Settings →
bot filtering'e `merchant.tradetracker.com` benzeri affiliate-ağ referrer'larını
ekleyerek gelecek export'ları temizlemek. Kod tarafında yapılacak bir şey yok —
site bug'ı değil, veri kalitesi meselesi.

## ✅ Gerçek iyileşme sinyalleri (küçük örnekleme rağmen)

- **Kaydırma derinliği %21 → %29,6** (12 Tem'e göre +8 puan). İçerik yeniden
  düzenleme + fold-üstü kartlarla zaman olarak örtüşüyor — erken ama olumlu.
- **JS hataları 0** (hydration fix'leri kalıcı olarak tutuyor).
- **Performans skoru 82,25 / LCP 1,89s / INP 252ms / CLS 0,06.** DİKKAT: örneklem
  %68 masaüstü Chrome (botlar dahil) — bu LCP büyük ölçüde masaüstü/bot hızını
  yansıtıyor, gerçek mobil kullanıcı deneyimini değil. 12 Tem'deki 25/100 mobil
  lab skoruyla doğrudan kıyaslanamaz (farklı ölçüm türü).

## ⚠️ Değişmeyen / bu veriden ölçülemeyen

- **Sayfa/oturum 1,02** — hâlâ tek sayfa, iç linkleme henüz kıpırdatmadı. Ama
  deploy 21 Tem, bu 3 günlük pencere hem çok erken hem bot-kirli — yargı için erken.
- **Fold-üstü karşılaştırma kartının etkisi ölçülemez:** kart market sayfalarında
  (Aldi/Dirk/Lidl), bu pencerede o sayfalar neredeyse hiç ziyaret almamış (Lidl 2,
  AH 2, Kruidvat 4). GSC verisi gelmeden değerlendirilemez.
- **Giden tıklama %3,19 (3 oturum)** — yarı-bot örneklemde anlamsız rakam.

## 🔴 2026-08-18 ölçümü — asıl bulgu: iki metrik 619 oturumda hiç kıpırdamadı

Panelden taze çekim (Puppeteer + `~/Downloads/gsc-profile`). Beş pencere yan yana
okundu: bugün / dün / 3 gün / 7 gün / 30 gün.

### 1. Sayfa/oturum = 1,00 — artık küçük örneklem mazereti yok

30 günlük pencerede **619 oturum, ortalama 1,00 sayfa.** 22 Temmuz'da "94 oturum,
yargı için erken" denmişti. Artık 619 oturum var ve rakam **tam olarak aynı**.

Bu süre içinde denenen ve **hiçbiri metriği oynatmayan** müdahaleler:
iç linkleme (34 blog yazısına 87 market linki, commit `28362fa`), Faz 0 CTA'ları,
fold-üstü karşılaştırma kartı, blog fırsat modülünün girişe taşınması (`c796eb3`).

**Yorum:** ziyaretçi geldiği sayfada ihtiyacını görüyor ve çıkıyor. İkinci sayfaya
gitmesi için verilen her davet reddedildi. Bu bir "link eksikliği" sorunu değil —
sorun, ikinci sayfada gitmeye değer yeni bir şey olduğuna ikna olmamaları.

### 2. Geri dönen kullanıcı = 0 kişi / 619 oturum

619 oturum, **619 benzersiz kullanıcı, 0 geri dönen oturum.** Otuz gün boyunca
siteyi ikinci kez açan tek bir insan yok.

Bu, retention altyapısının (push bildirimi, bülten, watchlist, PWA install prompt)
ölçülebilir etkisinin **sıfır** olduğunun kanıtı. `analiz-2026-08-15.md` §6.5'te
"1 kişiye hizmet ediyor" denmişti; 30 günlük veri bunu sertleştiriyor.

### 3. Arama neredeyse hiç kullanılmıyor — dünkü düzeltmenin tavanı düşük

Akıllı olay kırılımı (30 gün): **Giden 30 oturum · Ara 10 oturum** · Tekrar dene 3 ·
Daha fazla göster 2 · Form gönder 1.

17 Ağustos'ta arama isabeti %65 → %96'ya çıkarıldı (`529e74d`, `b4b03c8`) ve boş
sonuç ekranı düzeltildi (`b27f4fb`). Düzeltmeler doğruydu ama **arama 30 günde
619 oturumun 10'unda (%1,6) kullanılıyor** — bu işin gelir/engagement etkisi
matematiksel olarak küçük kalacak. Aramayı düzeltmek gerekliydi; aramayı
*büyütmek* ayrı bir karar.

### 4. Giden tıklama: 30 oturum / 30 gün (%4,8)

Affiliate gelirinin tabanı bu. 3 günlük pencerede 4 oturum — 12-15 Ağustos'taki
1 oturuma göre yükseliş, ama 4'e karşı 1, istatistiksel olarak yorum kaldırmaz.

### 5. Dead click %5,65 (30g) — izlemede, alarm değil

| Pencere | Dead click oturum | Oran | Sayfa | Toplam tıklama |
|---|---|---|---|---|
| 3 gün | 4 / 37 | **%10,81** | 4 | 6 |
| 7 gün | 5 / 95 | %5,26 | — | — |
| **30 gün** | **35 / 619** | **%5,65** | **36** | **55** |

3 günlük %10,81 ilk bakışta sıçrama gibi duruyor ama 4 oturum. 30 günlük taban
%5,65 ve bu 22 Temmuz'daki %5,32 ile aynı seviyede — **yeni bir regresyon yok**.
Öfke tıklaması, aşırı kaydırma ve hızlı geri dönüş üç pencerede de **%0**.

### 6. ✅ Core Web Vitals iyileşti — INP artık "iyi" bandında

| Pencere | Skor | Sayfa | LCP | INP | CLS |
|---|---|---|---|---|---|
| 3 gün | 85/100 | 16 | 2,0 sn | 210 ms | 0,084 |
| 7 gün | 79/100 | 34 | 2,0 sn | 230 ms | 0,091 |
| **30 gün** | **84/100** | **117** | **2,0 sn** | **190 ms** ✅ | **0,084** |

INP 15 Ağustos'taki 210 ms'den **190 ms'ye** indi ve Google'ın 200 ms "iyi" eşiğini
geçti. CLS 0,093 → 0,084. 15 Ağustos'ta öğrenilen kural burada da geçerli:
**CWV yalnızca 30 günlük pencereden okunur** (3 günlük 16 sayfalık örneklem
oynak).

### 7. Bot kirliliği sürüyor: 883 bot / 619 gerçek (30g)

Yönlendiren (30 gün): `www.google.com` 178 · **`merchant.tradetracker.com` 82** ·
`www.dealhunter4u.nl` 15 (iç) · `gemini.google.com` 8 · `www.ecosia.org` 8 ·
`duckduckgo.com` 5 · `l.wl.co` 5 · `chatgpt.com` 4 · `ui.awin.com` 4 ·
`uygulama.awin.com` 3 · `www.bing.com` 3.

TradeTracker hâlâ Google'dan sonra en büyük ikinci kaynak ve tamamı doğrulama botu.

> **22 Temmuz'daki aksiyon önerisi hatalıydı — düzeltildi.** "Clarity bot
> filtering'e referrer ekle" diye bir ayar **yok**. Clarity'nin tek kalıcı
> dışlama mekanizması **IP** (`Ayarlar → IP`), ve ziyaretçi IP'sini panelde
> göstermediği için TradeTracker'ın IP'si elde edilemiyor. Panel filtresinde
> `Trafik → Gönderen site` serbest metin ve **dışlama kutusu yok** (yalnızca
> dahil etmeye yarıyor); dışlama sadece `Kaynak` / `Orta` alanlarında var.
>
> **Uygulanan çözüm (18 Ağu):** Clarity etiketi `layout.tsx`'te referrer'a göre
> kapılandı — `tradetracker.com`, `awin.com`, `daisycon.com`, `daisycon.io` ve
> alt alan adlarından gelen ziyarette etiket hiç yüklenmiyor. Puppeteer ile
> uçtan uca doğrulandı: google referrer → 5 `clarity.ms` isteği; tradetracker
> ve awin referrer → 0 istek, script DOM'a hiç girmiyor.
>
> `l.wl.co` (5 oturum) **bilerek listeye alınmadı** — affiliate doğrulama botu
> olduğu kesin değil, gerçek ziyaretçiyi kaybetme riskine değmez.
Not: `gemini.google.com` 8 + `chatgpt.com` 4 = **12 oturum LLM yönlendirmesi** —
küçük ama sıfır değil, AEO tarafında ilk sinyal.

### 8. En çok ziyaret edilen sayfalar (30 gün)

| Sayfa | Görüntüleme |
|---|---|
| `/` | **279** |
| `/blog/albert-heijn-vs-jumbo-vs-lidl-wie-is-goedkoper` | 49 |
| `/supermarkt/lidl` | 26 |
| `/blog/is-lidl-goedkoper-dan-albert-heijn` | 22 |
| `/supermarkt/albert-heijn` | 19 |
| `/supermarkt/vomar` | 17 |
| `/supermarkt/aldi` · `/supermarkt/kruidvat` | 13 · 13 |
| `/blog/beste-dag-boodschappen-doen` | 12 |
| `/tr` | 11 |

Ana sayfa tek başına trafiğin ~%45'i. Karşılaştırma blogları GSC'de en yüksek
TO'lu grup olmayı Clarity tarafında da doğruluyor (49 + 22 = ikinci ve dördüncü).

## ⏳ 17 Ağustos deploy'unun etkisi HENÜZ ÖLÇÜLEMEDİ

Ana katalog widget yığınının üstüne taşındı (`40e6f95`, **17 Ağu 20:22**). Ölçüm
penceresi:

| Pencere | Oturum | Kaydırma | Etkin süre | Not |
|---|---|---|---|---|
| Dün (17 Ağu, tam gün) | 20 | %30 | **84 sn** | Neredeyse tamamı deploy ÖNCESİ |
| Bugün (18 Ağu, kısmi) | **2** | %16 | 11 sn | Gün yeni başladı |

Deploy sonrası elde toplam **2 oturum** var. "%27 → ~%70 katalog ulaşımı"
hipotezi bu veriyle test edilemez.

**Doğru ölçüm tarihi: 20-21 Ağustos.** O çekimde bakılacaklar:
1. Kaydırma derinliği %31,9'un üstüne çıktı mı (katalog artık fold'a daha yakın)
2. Giden tıklama 30 gün/30 oturum tabanından yukarı kıpırdadı mı
3. Sayfa/oturum 1,00'dan — beklenti düşük, ama katalog görünürlüğü kategori
   sayfalarına tık üretebilir

## Aksiyon kuyruğu (bu ölçümden çıkan)

| # | İş | Gerekçe | Durum |
|---|---|---|---|
| 1a | Clarity etiketini affiliate-ağ referrer'ında yükleme (kod) | 94/619 oturum (%15) kirlilik | ✅ **yapıldı** |
| 1b | Panelde "Kaynak → Seçimi dışla" segmenti kaydet (geçmiş veri için) | 1a yalnızca bundan sonrasını temizler | **kullanıcı** |
| 2 | 20-21 Ağu'da deploy sonrası çekim | Tek gerçek ölçüm penceresi | planlandı |
| 3 | Sayfa/oturum için link değil **içerik** müdahalesi | 619 oturumda 4 farklı linkleme denemesi başarısız | tartışılmadı |
| 4 | Geri dönen %0 → retention altyapısını ya canlandır ya kapat | 30 günde 0 geri dönen kullanıcı | tartışılmadı |

## Ölçüm yöntemi (tekrarlanabilir)

Clarity paneline API token'ı yok; okuma **ham Puppeteer + kalıcı Chrome profili**
ile yapılıyor (`headless:false`, `userDataDir:'C:/Users/ASUS/Downloads/gsc-profile'`).
Bu profil Microsoft hesabıyla giriş yapılmış durumda ve oturum kalıcı.
Pencereler: `?date=Today|Yesterday|Last%203%20days|Last%207%20days|Last%2030%20days`.
Yapısal metrikler `clarity.microsoft.com/api` GraphQL yanıtlarından
(`projectFeatures.dashboard`) alınabiliyor; gerisi panel `innerText`'inden.
Detay: [[gstack-browser-limitation]] — gstack headed mode bu makinede çalışmıyor,
ham Puppeteer çalışıyor.
