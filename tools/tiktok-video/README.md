# Wekelijkse Deals-video

Haftalık "Top 5 Supermarkt Deals" videosu üretir — canlı API verisinden,
1080x1920 dikey, ~21 saniye, H.264 mp4. TikTok/Reels/Shorts'a direkt yüklenebilir.

## Kullanım (elle)

```bash
cd tools/tiktok-video
npm i            # ilk seferde (sadece ffmpeg-static)
node make-video.mjs
# → out/dealhunter-top5-weekNN.mp4
```

## Otomasyon

`.github/workflows/weekly-video.yml` her Pazartesi 06:30 UTC'de çalışır ve videoyu
**iki yoldan** teslim eder:

1. **Artifact** (`dealhunter-weekly-video`, 30 gün saklanır) → Actions sekmesinden
   indirip TikTok/Reels'e **trend sesle** elle yükle. Ses ancak uygulama içinden
   eklenebiliyor ve sessiz video bu platformlarda belirgin şekilde daha az erişim alıyor.
2. **YouTube Shorts'a otomatik yükleme** → orada sessiz video daha az sorun.

Artifact adımı YouTube adımı patlasa bile çalışır; elle yükleme yolu ona bağımlı değil.

Workflow elle de tetiklenebilir (`workflow_dispatch`), YouTube yüklemesini kapatma
ve privacy seçme girdileriyle.

## YouTube kurulumu (tek seferlik)

1. Google Cloud Console → yeni proje → **YouTube Data API v3**'ü etkinleştir.
2. APIs & Services → Credentials → **OAuth client ID** → tip: **Desktop app**.
   Authorized redirect URI olarak `http://localhost:8731` ekle.
3. Refresh token al:
   ```bash
   YOUTUBE_CLIENT_ID=... YOUTUBE_CLIENT_SECRET=... node get-youtube-token.mjs
   ```
   Tarayıcıda izin ver; token terminale yazılır.
4. GitHub → Settings → Secrets and variables → Actions → şunları ekle:
   `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REFRESH_TOKEN`.

> **Önemli:** OAuth uygulaman "Testing" durumundaysa refresh token **7 günde
> geçersiz olur** — haftalık cron her seferinde ölü tokenla karşılaşır. OAuth consent
> screen'de publishing status'u **"In production"** yap. `youtube.upload` hassas bir
> kapsam olduğu için doğrulanmamış uygulamada izin ekranında uyarı çıkar; kendi
> kanalın için sorun değil.

### Privacy bilinçli olarak `private`

`upload-youtube.mjs` varsayılan olarak **private** yükler. Haftalık bir cron'un
görülmemiş içeriği doğrudan yayına vermesi geri alması zor bir iş. Birkaç hafta
çıktıyı gördükten sonra workflow'daki `privacy` girdisini `public` yap.

## Nasıl çalışır

1. `/api/products`'tan tüm ürünler çekilir; market başına 1 ürün (%20-90 indirim,
   görselli), en yüksek indirimli 5'i seçilir.
2. Animasyonlu HTML şablonu üretilir (marka renkleri, #5→#1 geri sayım,
   hook + 5 kart + outro). AH/Kruidvat görselleri site img-proxy'sinden geçer.
3. Playwright headless Chromium sayfayı 1080x1920 kaydeder (animasyonlar
   görseller yüklenene kadar paused — baştaki ölü süre mp4'te kırpılır).
4. ffmpeg webm→mp4 (30fps, crf 20, faststart).

## Notlar

- **Playwright global kurulumdan çözülür** — bu klasöre browser indirilmez.
  CI'da `npx playwright install chromium` ile kurulur.
- Ses yok: TikTok/Reels'e yüklerken uygulama içinden trend ses ekle (reach + telif).
- TikTok tam otomatik yayınlanamıyor: Content Posting API'de "Direct Post" için
  audit onayı gerekiyor, onaysız sadece taslak/özel gönderilebiliyor. Bu yüzden
  TikTok elle yükleme yolunda bırakıldı.
- Önerilen TikTok/Reels caption: `Week NN: de 5 beste supermarkt deals van NL 🛒🔥
  #aanbiedingen #besparen #boodschappen #supermarkt`
- Tasarım ayarları `make-video.mjs` içindeki CSS bloğunda (renkler sitenin
  V9 paletiyle aynı: cream #F5EDE3, rood #E33D26, groen #1B9E4B).
