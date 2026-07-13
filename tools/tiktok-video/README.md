# TikTok Video Üretici

Haftalık "Top 5 Supermarkt Deals" videosu üretir — canlı API verisinden,
1080x1920 dikey, ~21 saniye, H.264 mp4. TikTok/Reels/Shorts'a direkt yüklenebilir.

## Kullanım

```bash
cd tools/tiktok-video
npm i            # ilk seferde (sadece ffmpeg-static)
node make-video.mjs
# → out/dealhunter-top5-weekNN.mp4
```

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
- Ses yok: TikTok'ta yüklerken uygulama içinden trend ses ekle (reach + telif).
- Önerilen caption: `Week NN: de 5 beste supermarkt deals van NL 🛒🔥
  #aanbiedingen #besparen #boodschappen #supermarkt`
- Tasarım ayarları `make-video.mjs` içindeki CSS bloğunda (renkler sitenin
  V9 paletiyle aynı: cream #F5EDE3, rood #E33D26, groen #1B9E4B).
