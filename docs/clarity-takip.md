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

## Sonraki ölçüm

21 Tem deploy'larının (fold-üstü kart, sepet karşılaştırma, tasarruf sayacı, bülten)
gerçek etkisi bu pencerede görünmez. **1-2 hafta sonra** taze Clarity çekimi +
paralel GSC export'u ile ölç. O çekimde bakılacaklar: sayfa/oturum 1,0'dan kıpırdadı
mı, kaydırma %29,6 üstünde tutunuyor mu, market sayfalarına yeterli gerçek trafik
gelip fold-üstü kart tıklaması ölçülebiliyor mu.
