---
tags: [dealhunter, operasyon, devir]
---

# Tatil devri — 21 Ağustos 2026

Geliştirme bilgisayarı erişilemez. Bu belge **operasyonel** durumu anlatır:
neyin çalışmaya devam ettiği, neyin durduğu, uzaktan neyin yapılabildiği.

> Karar geçmişi, ölçüm verisi ve strateji notları bu repoda **değil** —
> ayrı bir yerel pakette (`dealhunter-tatil-paketi`). Repo herkese açık
> olduğu için oraya konmadı.

---

## Çalışmaya devam edenler

Bulutta iki ayrı zamanlayıcı var. **İkisi de bu bilgisayardan bağımsız.**

### 1. Railway backend — asıl iş burada (`backend/server.js`)

| Zaman | İş |
|---|---|
| Her gün 08:00 UTC | `runScraperJob()` — AH, Jumbo, Lidl, Aldi, Hoogvliet, Vomar, DekaMarkt |
| Her gün 08:00 UTC | `clearOrphanProducts()` + `clearExpiredProducts()` — süresi geçmiş ürün temizliği |
| Pazartesi 09:00 UTC | Haftalık bülten e-postası |

### 2. GitHub Actions

| Workflow | Durum |
|---|---|
| `ah-scraper`, `aldi-scraper`, `dirk-scraper` | cron açık |
| `kruidvat-scraper`, `petgamma-scraper`, `plein-scraper`, `plus-scraper` | cron açık |
| `whatsapp-sender` | cron açık, günde 8 mesaj |

Site güncellenmeye ve WhatsApp grubu akmaya devam eder. Müdahale gerekmez.

> ⚠️ `hoogvliet-scraper.yml`'nin cron'u kapalı olmasına bakıp "Hoogvliet ölü"
> sonucuna varma — Railway tarafı onu topluyor ve **veri güncel** (19 Ağu'da
> 16 ürün, o günün damgasıyla). GitHub workflow'larının durumu tek başına
> neyin çalıştığını göstermiyor.

## Bilerek kapalı olanlar

| Workflow | Neden |
|---|---|
| `hoogvliet-scraper` | Imperva runner'ı bloke ediyor; kovalamama kararı (2026-08-09) |
| `telegram-sender` | Secret bekliyor — secret'sız her koşu kırmızı biter |
| `weekly-video` | YouTube OAuth bekliyor |

Cron'ları **secret kurulumu bitmeden açma.** Günlük hata maili, gerçek arızayı
kaçırtan bir körlük yaratıyor (ağustosta AH 5 gün sessiz kaldı).

---

## Duran işler — yerel Chrome profillerine bağlı

`~/Downloads/*-profile/` altındaki oturumlar olmadan çalışmayanlar:

- Günlük metrik toplayıcı (`scripts/gunluk-metrik.mjs`, Görev Zamanlayıcı 08:30)
- "Genel kontrol" rutini (`docs/genel-kontrol.md`)
- `scripts/affiliate-check.mjs`

Profiller 5,2 GB ve taşınsalar bile Google yeni cihazda oturumu düşürür.
**Tatilde panel sayısı okunamaz.** Panellere elle bakılıp sayı iletilirse
analiz tarafı normal çalışır.

---

## Uzaktan yapılabilenler

Kod, içerik, analiz ve deploy. Repo klonlanır, `git push` deploy'u tetikler.

⚠️ `git add -A` kullanma — kök dizinde `.env.whatsapp.txt` var. `.gitignore`
koruyor ama repo **public**, tek hata canlı token'ı yayınlar. Dosyaları
adıyla stage'le.

---

## Bekleyen kurulumlar (kod hazır)

**Telegram:** @BotFather token → açık kanal + bot yönetici →
`TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` secret → `dry_run: true` koşu → cron.

**YouTube Shorts:** OAuth consent screen **"In production"** (Testing'de refresh
token 7 günde ölür) → `tools/tiktok-video/get-youtube-token.mjs` → 3 secret →
`privacy: private` elle koşu → cron.

---

## Takvim

| Tarih | Ne |
|---|---|
| 20 Ağu 10:20 | Aldi scraper — `brandVerified` düzeltmesinin ilk gerçek testi (19 Ağu'daki koşu düzeltmeden önceydi, doğrulanmadı) |
| ~26 Ağu | `/go` robots.txt düzeltmesi GSC'de görünür |
| 1 Eylül | Nu.nl Shop kampanyası kapanıyor — kaydı silindi, aksiyon yok |
