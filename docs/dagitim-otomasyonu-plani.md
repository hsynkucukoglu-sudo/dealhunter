---
tags: [dealhunter, otomasyon, dagitim, whatsapp, telegram, trafik, plan]
---

# Dağıtım otomasyonu — "WhatsApp kartı" formatını tüm kanallara

**Hedef (kullanıcı, 2026-08-19):** bir otomasyon kurmak ve fırsatları/reklamları
WhatsApp grubunda paylaştığımız formata döndürmek.

O format zaten çalışıyor ve zaten otomatik. Bu plan onu **tek bir içerik
motoruna** çevirip birden fazla kanala besliyor.

---

## Çalışan format (değiştirmiyoruz)

```
🔥 *Aanbieding van de dag!*

🛒 *Ürün adı*
🏪 Market  |  📉 -*X%* korting
💰 ~€eski~ → *€yeni*
📅 Geldig t/m 24 augustus

👉 Meer deals: dealhunter4u.nl/supermarkt/lidl

🤖 _DealHunter4U · Elke dag besparen_
```

Günde 8 mesaj: 5 ürün + 3 affiliate, Green API + GitHub Actions cron.

---

## Bugünkü durum ve bulunan arıza

| Kanal | Durum |
|---|---|
| WhatsApp grubu | ✅ çalışıyor, günde 8 mesaj |
| YouTube Shorts | 🟡 kod hazır, OAuth bekliyor (`youtube-shorts-plan.md`) |
| Telegram | ❌ yok |
| TikTok / Instagram | ❌ kapalı (ses + denetim; IG kullanıcı kararıyla kapalı) |

### 🔴 Faz 0 — bugün düzeltildi (`a94cd32`)

Affiliate listesi script içinde **sabit** ve sitedeki canlı listeden **kopuk**
olduğu için sapmıştı. 12 kayıttan 3'ü bozuktu ve günde 3 kez gruba gidiyordu:

| Kayıt | Sorun |
|---|---|
| Bjorn Borg | Program kapalı (Daisycon panelinde yok) + hedef 404 |
| McAfee | Program kapalı |
| Smartbox & Bongo | Hedef 503 (NL sitesi taşınmış) |
| Bol.com | URL `/supermarkt/albert-heijn`'e gidiyordu — ne Bol linki ne komisyon |
| Holland & Barrett | "Megaweek t/m 12 juli" — süresi geçmiş metin |

Hepsi düzeltildi. **Ama kök neden duruyor:** liste hâlâ iki yerde yaşıyor.

---

## Faz 1 — Tek kaynak (kök neden)

**Sorun:** affiliate listesi iki yerde:
`frontend-next/lib/affiliate.ts` (+ widget) ve `scripts/whatsapp-sender.mjs`.
Biri güncellenince diğeri sessizce eskiyor — bugünkü arıza tam bu.

**Çözüm:** `data/affiliates.json` — repo kökünde tek dosya, hem Next (TS import)
hem düz `.mjs` script'ler okuyabilir. Yapı:

```json
{ "id": "ziggo", "naam": "Ziggo", "emoji": "📡",
  "tagline": "Internet, TV & bellen aanbieding",
  "url": "https://jf79.net/c/?si=17174&li=1742299&wi=420902",
  "kanallar": ["whatsapp", "telegram", "site"],
  "programId": 17174 }
```

`programId` alanı önemli: Daisycon panelinden **tıklama harcamadan** ölü program
taraması yapılabiliyor (yöntem `analiz-2026-08-15.md` §13.1'de). Aylık bir
kontrol bugünkü arızanın tekrarını engeller.

**Efor:** orta (yarım gün). **Sahibi:** ben.

---

## Faz 2 — Ortak kart üreticisi

**Sorun:** format `whatsapp-sender.mjs` içinde gömülü. İkinci kanal eklenince
kopyalanacak ve yine sapacak.

**Çözüm:** `scripts/lib/deal-card.mjs`

```js
export function renderCard(deal, { kanal })  // 'whatsapp' | 'telegram'
```

Tek yerde metin, kanala göre yalnızca **kaçış ve vurgu** değişiyor:
WhatsApp `*kalın*` / `~üstü çizili~`, Telegram MarkdownV2 `*kalın*` /
`~üstü çizili~` + farklı kaçış kuralları.

**Efor:** küçük. **Sahibi:** ben.

---

## Faz 3 — Kanal etiketi (ölçüm, şu an kör)

**Sorun:** WhatsApp linkleri `dealhunter4u.nl/supermarkt/lidl` — **etiketsiz.**
O yüzden WhatsApp'tan kaç kişi geldiğini bilmiyoruz. Sitede `/go?m=X&c=blog`
deseni zaten var, kullanılmıyor.

**Çözüm:** her kanal kendi etiketini taşısın —
`?c=whatsapp`, `?c=telegram`, `?c=shorts`. Clarity yönlendiren kırılımı ve
first-party `trackClick` bunu ayırabilir hale gelir.

Bu **Faz 4'ten önce** yapılmalı: yeni kanal eklerken ölçüm yoksa hangisinin işe
yaradığı öğrenilemez.

**Efor:** küçük. **Sahibi:** ben.

---

## Faz 4 — Telegram kanalı

Neden Telegram, TikTok değil:

| | Telegram | TikTok |
|---|---|---|
| Format uyumu | **birebir aynı kart** | video, ayrı üretim |
| Otomasyon | Bot API, onay yok | Content Posting API, **denetim şart** |
| Sessiz içerik cezası | yok | **yüksek** (ses uygulamadan eklenir) |
| Ek üretim maliyeti | ~0 | video zaten var ama ses sorunu kalır |
| Efor | ~40 satır | başvuru + bekleme |

Telegram, WhatsApp'ın çalışan formatını **hiç değiştirmeden** alabilen tek
kanal. Public kanal Google tarafından indekslenebiliyor ve link paylaşımı
serbest — WhatsApp grubunda olmayan iki avantaj.

**Adımlar:**
1. @BotFather'dan bot aç, token al (kullanıcı, 2 dakika)
2. Public kanal aç (`@dealhunter4u` gibi), botu yönetici yap (kullanıcı)
3. `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` secret (kullanıcı)
4. `scripts/telegram-sender.mjs` + workflow — WhatsApp cron'unun aynısı (ben)

**Efor:** küçük. **Sahibi:** kurulum kullanıcı, kod ben.

---

## Faz 5 — Shorts (devam eden)

`docs/youtube-shorts-plan.md`. Hafta sonu OAuth + secret, sonra cron.

---

## Sıra ve gerekçe

```
Faz 0  ✅ bozuk linkler (canlı arıza)          — a94cd32
Faz 1  ✅ tek kaynak · data/affiliates.json    — ef6bec5
Faz 2  ✅ ortak kart · scripts/lib/deal-card   — ef6bec5
Faz 3  ✅ kanal etiketi · ?c=whatsapp          — ef6bec5
Faz 4  🟡 Telegram — kod hazır, secret bekliyor
Faz 5  🟡 Shorts   — kod hazır, OAuth bekliyor
```

Faz 1-3 aynı gün tamamlandı. Kalan ikisi de **yalnızca kullanıcı tarafındaki
kurulumu** bekliyor; kod tarafında yapılacak iş yok.

Faz 1-3 "yeni kanal" değil **altyapı**: onlarsız her yeni kanal aynı sapmayı ve
aynı ölçüm körlüğünü üretir. Üçü birlikte ~1 gün.

---

## Ölçüm — neye bakacağız

Günlük script (`scripts/gunluk-metrik.mjs`) zaten Clarity yönlendiren kırılımını
çekiyor. Faz 3'ten sonra şunlar ayrışır:

- `?c=whatsapp` → grup gerçekten trafik getiriyor mu (bugün bilinmiyor)
- `?c=telegram` → yeni kanalın katkısı
- `t.me` / `youtube.com` yönlendiren satırları

**Beklenti ayarı:** bu kanalların hiçbiri tek başına gereken 47 kat trafiği
vermez (AdSense €3,5 RPM · €100/ay için ~30.000 görüntüleme · mevcut ~640).
Amaç ölçülebilir bir taban kurmak ve hangisinin işe yaradığını **veriyle**
öğrenmek — bugüne kadar WhatsApp'ın katkısı bile ölçülmemiş durumda.

---

## Bilinçli olarak yapılmayanlar

| Şey | Neden |
|---|---|
| Instagram / Reels | Kullanıcı kararı + ses ve elle çalışma sorunu |
| TikTok (şimdilik) | Denetim + sessiz video cezası; Shorts verisi geldikten sonra yeniden bakılır |
| Pepper.nl otomasyonu | Ban riski. Elle paylaşım en yüksek getirili sosyal seçenek ama insan zamanı şart (`trafik-yolharitasi.md` §5) |
| Affiliate listesini widget'la tamamen birleştirmek | Widget'ta kategori/renk/CTA yapısı var; yalnızca **liste** ortaklaştırılıyor, görsel katman ayrı kalıyor |


---

## Faz 4 durumu — kod hazır (2026-08-19)

| Parça | Dosya | Durum |
|---|---|---|
| Gönderici | `scripts/telegram-sender.mjs` | ✅ kuru test edildi |
| Workflow | `.github/workflows/telegram-sender.yml` | ✅ hazır, **cron kapalı** |
| Kart | `scripts/lib/deal-card.mjs` | ✅ ortak, HTML kaçışı doğrulandı |
| Liste | `data/affiliates.json` | ✅ 10 kayıt, `kanallar: [whatsapp, telegram]` |

### WhatsApp'tan iki farkı

**Ürünler fotoğraflı gidiyor.** Telegram `sendPhoto` + bijschrift destekliyor ve
kartta zaten `imageUrl` var. WhatsApp grubuna yalnızca metin gidiyor. Fotoğraf
reddedilirse (hotlink engeli, boyut) script metne düşüyor — fırsat yine de
gidiyor.

**4 dakika sonra gönderiyor** (`:11` vs `:07`). Tek bir aksaklık iki kanalı
birden vurmasın ve loglardan hangisinin düştüğü hemen görülsün diye.

### Sen döndüğünde (5 dakika)

1. **@BotFather** → `/newbot` → token al
2. Açık kanal aç (ör. `@dealhunter4u`), botu **yönetici** yap
3. Secrets → `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (`@kanaladi` yeterli)
4. Actions → *Telegram Deal Sender* → `dry_run: true` ile çalıştır, çıktıyı gör
5. Sonra `dry_run: false` — kanala ilk gerçek mesaj
6. Geçtiyse haber ver, cron'u ben açarım

> Cron bilerek kapalı. Secret yokken her çalışma kırmızı biter; ağustosta o
> faalmail alışkanlığı Hoogvliet ve AH'nin günlerce sessizce bozuk kalmasına yol
> açtı. Önce elle bir geçiş, sonra otomatik.
