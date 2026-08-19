---
tags: [dealhunter, youtube, shorts, trafik, plan]
---

# YouTube Shorts — günlük yayın planı

**Durum (2026-08-19):** kod tarafı bitti ve test edildi. Kalan iki engel de
Google Cloud Console'da, ikisini de yalnızca hesap sahibi açabilir.

---

## 1. Neden Shorts

Trafik yol haritası elle sosyal medyayı ve ücretli reklamı gerekçeli olarak
kapattı (`trafik-yolharitasi.md` §5). Geriye **otomatik** kanal kalıyor.

Bugünün verisi de bunu destekliyor: AdSense RPM ≈ **€3,5/1000 oturum** — NL için
normal. Yani reklam yerleşimi sorun değil, **hacim** sorun. Aylık €100 için
~30.000 sayfa görüntüleme gerekiyor, mevcut ~640. Gelir tarafında oynanacak tek
gerçek kaldıraç trafik.

---

## 2. Ne hazır

| Parça | Dosya | Durum |
|---|---|---|
| Video üretici | `tools/tiktok-video/make-video.mjs` | ✅ çalışıyor, 1080×1920 · 21,5 sn · H.264 |
| Günlük edisyonlar | `tools/tiktok-video/editions.mjs` | ✅ 7 edisyon, canlı veriyle test edildi |
| YouTube yükleyici | `tools/tiktok-video/upload-youtube.mjs` | ✅ Data API v3 resumable |
| Token üretici | `tools/tiktok-video/get-youtube-token.mjs` | ✅ tek seferlik, yerel |
| Workflow | `.github/workflows/weekly-video.yml` | ✅ hazır, **cron kapalı** |

### Fiyat hatası koruması

Üretici %70 üstü indirimleri **bilerek atlıyor** — o bantta birim verisi olan
ürün oranı %0'a düşüyor ve orada gerçek hatalar var. 19 Ağustos çalışmasında
elenenler arasında `Kruidvat Sun Vaatwastabletten €99,99→€29,99` vardı. Bu koruma
kaldırılmamalı: yanlış fiyatlı bir video, videodan gelen ilk izlenimi yakar.

---

## 3. Günlük edisyon takvimi

Aynı top-5'i yedi kez yüklemek yinelenen içerik okunur ve hiçbir şey katmaz.
Her gün **aynı veri setinin farklı bir kesiti**:

| Gün | Edisyon | İçerik | Örnek başlık |
|---|---|---|---|
| Pazartesi | `top5` | market başına en iyi, top 5 | Top 5 Supermarkt Deals — Week 34 |
| Salı | `categorie` | rotasyonlu kategori | Maaltijden aanbiedingen — week 34 |
| Çarşamba | `markt` | rotasyonlu market | Vomar aanbiedingen — week 34 |
| Perşembe | `kassakoopjes` | < €5 | 5 supermarktdeals onder €5 |
| Cuma | `bespaar` | € cinsinden en çok tasarruf | Hier bespaar je het meest |
| Cumartesi | `categorie` | farklı rotasyon offset'i | Huishouden aanbiedingen |
| Pazar | `actie` | 1+1 · 2e halve prijs | 1+1 gratis & 2e halve prijs |

Kategori ve market **haftaya göre dönüyor**, yani ardışık haftalar aynı kesiti
almıyor. Cumartesi'nin offset'i Salı'dan farklı, ikisi aynı hafta çakışmıyor.

Elle çalıştırmada `EDITIE=kassakoopjes node make-video.mjs` ile herhangi bir
edisyon zorlanabilir; workflow'da da açılır liste var.

**Güvenlik freni:** bir edisyon 5 karttan az üretirse üretici **hata verip
duruyor**. Üç kartlık bir video ve "tot %X korting" diyen bir hook, boş bir
yükleme yapmaktan kötüdür.

---

## 4. Hafta sonu yapılacaklar (senin adımların)

### Adım 1 — OAuth uygulamasını "In production" yap

`console.cloud.google.com` → APIs & Services → **OAuth consent screen** →
Publishing status **"In production"**.

> **Bu adım atlanırsa geri kalan her şey 7 gün sonra kırılır.** "Testing"
> durumundaki uygulamaların refresh token'ı 7 günde bir geçersiz oluyor; günlük
> cron ertesi hafta sessizce hata vermeye başlar. 11 Ağustos'ta haftalık cron
> tam bu yüzden kapatıldı ve o hata mailleri gerçek scraper alarmlarını bastırdı.

Aynı ekranda **YouTube Data API v3** etkin olmalı (Library → enable).

### Adım 2 — OAuth istemcisi oluştur

Credentials → Create credentials → **OAuth client ID** → tip **Desktop app**.
Çıkan `client_id` ve `client_secret` bir sonraki adımda gerekiyor.

### Adım 3 — Refresh token üret (yerel, bir kez)

```bash
cd tools/tiktok-video
YOUTUBE_CLIENT_ID=... YOUTUBE_CLIENT_SECRET=... node get-youtube-token.mjs
```

Tarayıcı açılır, video yükleyeceğin **kanalın** hesabıyla giriş yaparsın,
script `refresh_token`'ı basar.

### Adım 4 — Secret'ları ekle

GitHub → repo → Settings → Secrets and variables → **Actions**:

| Secret | Değer |
|---|---|
| `YOUTUBE_CLIENT_ID` | Adım 2 |
| `YOUTUBE_CLIENT_SECRET` | Adım 2 |
| `YOUTUBE_REFRESH_TOKEN` | Adım 3 |

### Adım 5 — Elle bir deneme

Actions → **Daily Deals Video** → Run workflow:
- `editie`: boş (weekday'e göre seçsin) veya `top5`
- `upload_youtube`: **true**
- `privacy`: **private**

Yeşil biterse YouTube Studio'da videoyu aç, izle, başlığı ve açıklamayı kontrol
et.

### Adım 6 — Cron'u aç

Elle deneme **başarılı olduktan sonra** `weekly-video.yml` içindeki
`# on: schedule:` bloğunun yorumunu kaldır (satır ~30). Bunu ben yaparım, sen
"deneme geçti" demen yeterli.

---

## 5. Yayına alma sırası

1. **İlk hafta `private`** — 7 video birikir, hepsini izlersin
2. Sorun yoksa `YOUTUBE_PRIVACY=public`
3. İlk kamuya açık haftadan sonra ölçüm

> `private` bilinçli varsayılan: görülmeden yayına giden bir cron'u geri almak
> zor, tek tek video silmek gerekir.

---

## 6. Bilinmesi gerekenler

**Kota:** YouTube Data API'de bir yükleme **1.600 birim**, günlük varsayılan
kota **10.000**. Günde 1 video rahat sığıyor (6 yüklemeye kadar yer var).
Kota artışı istemeye gerek yok.

**Ses yok.** Videolar sessiz. TikTok/Reels'te sessiz video erişimi öldürür ama
Shorts'ta daha az cezalandırılıyor — zaten elle trend ses eklemek için haftalık
zaman bütçesi yok, bu yüzden TikTok rotası kapalı kaldı.

**Ölçüm.** Videolar `dealhunter4u.nl`'i açıklamada ve outro'da gösteriyor.
Trafik etkisi GSC/Clarity'de **doğrudan görünmez** (YouTube yönlendirmesi
genelde direct/none olarak düşer). Günlük script Clarity yönlendiren kırılımını
zaten çekiyor; `youtube.com` satırı çıkarsa orada görülür.

---

## 7. Kod tarafında yapılanlar (2026-08-19)

- `editions.mjs` eklendi — 7 edisyon, haftalık rotasyon, YouTube metadata üretimi
- `make-video.mjs` — havuz + edisyon seçimi ayrıştırıldı, hook parametrik oldu,
  çıktı `dealhunter-<edisyon>-<tarih>.mp4`, yanına metadata sidecar yazılıyor
- `upload-youtube.mjs` — başlığı artık kendisi türetmiyor, `out/laatste.json`
  okuyor. (Aksi halde kategori videosu "Top 5" başlığıyla yayınlanırdı.)
- Hook başlığı **uzunluğa göre ölçekleniyor** — sabit 230px'te "ONDER €5"
  ekrandan taşıyordu, ölçüldü ve düzeltildi
- Workflow: günlük plan + `editie` seçici + artifact'e sidecar eklendi

Test: 7 edisyonun tamamı canlı veriyle 5 kart üretti; `kassakoopjes`,
`categorie` ve `actie` uçtan uca mp4'e kadar üretildi ve hook kareleri gözle
kontrol edildi.
