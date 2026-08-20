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

## "Geri dönen kullanıcı 0" — dönüşte yanlış okuma tuzağı

`gunluk-takip.md`'de geri dönen kullanıcı hâlâ **0** görünüyor. Bu bir arıza
değil, henüz ölçüm penceresi açılmadı.

2026-08-20'de canlı sitede doğrulandı: CMP'de "Alles accepteren"e tıklandığında
`clarity('consent')` **ateşleniyor**. Köprü çalışıyor.

Sayının kıpırdaması için birinin onay verip `_clck` çerezini alması ve **sonraki
bir gün** geri gelmesi gerekiyor. Düzeltme 19 Ağustos'ta yayına girdiği için 7 ve
30 günlük pencereler hâlâ ağırlıklı olarak düzeltme öncesi oturum taşıyor.

> Not: onay verilmeden test edilirse hiçbir çağrı görünmez — bu beklenen
> davranış, arıza değil. İlk denemede tam bu yüzden yanlış alarm verilmişti.

---

# 🔖 DÖNÜŞTE BURADAN DEVAM — bu bilgisayar

Son oturum: **2026-08-20 20:30**. Aşağısı bu makinedeki duruma özel.

## İlk iş: AdSense oturumu (bozuk, sebebi ben)

`gsc-profile` (hyuseyink@gmail.com) oturumu **düştü** — profil kilidini
temizlerken Chrome süreçlerini zorla öldürdüm ve oturum uçtu.

**Her sabah 08:30'daki metrik görevi bu oturuma bağlı**, yani tatil boyunca
AdSense rakamları eksik yazılacak. Clarity ve GSC etkilenmedi.

```
chrome --user-data-dir=C:\Users\ASUS\Downloads\gsc-profile
```

## Oturum durumu (2026-08-20 ölçümü)

| Kaynak | Durum | Ömür |
|---|---|---|
| GSC · Clarity (`metrics-profile`) | ✅ açık | günlerce dayanıyor |
| TradeTracker | ✅ açık | temmuzdan beri |
| Daisycon · Awin | ⛔ düşer | **40 dakika** — önceden giriş yapma, tarama anında yap |
| AdSense (`gsc-profile`) | 🔴 düşük | yukarı bak |

Kısa ömürlü panellerde çalışan yöntem: profili `--remote-debugging-port` ile
aç, giriş yap, **pencereyi kapatma**, `puppeteer.connect({browserURL})` ile
canlı pencereye bağlan.

## Yarım kalan tek iş

**Genel kontrol** — 20 Ağustos'ta beş ayaktan dördü tamamlandı:

| Ayak | Sonuç |
|---|---|
| Mailler (8 gün, 40 thread) | ✅ bildirilen 15 programın hiçbiri bizde değil |
| Daisycon | ✅ 600 program tarandı, ölü program yok |
| Awin | ✅ 10 programın hepsi Joined + Online |
| GSC | ✅ 404'ler bulundu (aşağıda) |
| **AdSense politika + ödeme** | ⛔ **yapılamadı — oturum yok** |

## Karar bekleyen üç konu

**1. `/merk/` sayfaları geçici.** GSC 404 uyarısının kaynağı bu:
`/merk/kokosdeurmat` 404, `/merk/mora` şu an 200. Marka sayfaları haftalık
ürün verisinden üretiliyor; marka fırsattan çıkınca sayfa kayboluyor.
Sitemap'te hiç `/merk/` yok, Google iç linkten buluyor. Seçenekler: 404
bırakmak (doğru HTTP semantiği), ya da sayfayı kalıcı yapıp "şu an bu markada
fırsat yok" göstermek.

**2. Coop ölü yapılandırma.** `types.ts`'te market olarak tanımlı ama ürünü
yok, `/supermarkt/coop` canlıda 404. Ayrıca `coop.nl` tamamen `plus.nl`'e
yönleniyor (Coop, PLUS'a katıldı). Kaydı silmek mi, PLUS'a mı bağlamak?

**3. Repo herkese açık.** `hsynkucukoglu-sudo/dealhunter` public, yani
`docs/gunluk-takip.md` üzerinden **AdSense gelirin ve trafik verilerin
görünür durumda**. Bilinçli tercih mi, bilmiyorum — tek taraflı değiştirmedim.

## Kapanan maddeler (tekrar bakma)

- ✅ **Aldi `brandVerified`** — 20 Ağu 08:58 scrape'inde doğrulandı: marka dolu
  22/189 → **143/189**, kısaltılmış marka 0.
- ✅ **Holland & Barrett** — UTM'li yönlendirme ana sayfaya düşürüyordu,
  `/shop/offers/` ile düzeltildi ve tarayıcıyla doğrulandı.
- ✅ **Consent köprüsü** — çalışıyor; "geri dönen 0" arıza değil, ölçüm
  penceresi henüz açılmadı.
- ✅ **Karşılaştırma içerik açığı** — yok, yazısı olmayan çiftler toplam
  21 gösterim. Yeni yazı yazma.

## Yedek

`D:\DealHunter-Yedek-2026-08-20\` (Intenso External USB 3.0) — proje +
`.git` geçmişi + tatil paketi + hafıza, 5850 dosya, birebir doğrulandı.
Chrome profilleri **kasıtlı alınmadı**, kullanıcı her seferinde elle giriyor.

---

## Takvim

| Tarih | Ne |
|---|---|
| 20 Ağu 10:20 | Aldi scraper — `brandVerified` düzeltmesinin ilk gerçek testi (19 Ağu'daki koşu düzeltmeden önceydi, doğrulanmadı) |
| ~26 Ağu | `/go` robots.txt düzeltmesi GSC'de görünür |
| 1 Eylül | Nu.nl Shop kampanyası kapanıyor — kaydı silindi, aksiyon yok |
