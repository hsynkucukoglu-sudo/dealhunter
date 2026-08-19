---
tags: [dealhunter, rutin, kontrol, affiliate, adsense, gsc]
---

# Genel kontrol

Kullanıcı **"genel kontrol yap"** dediğinde çalıştırılacak rutin.
İlk çalıştırma: 2026-08-19.

Kapsam: **mailler · Awin · Daisycon · AdSense · TradeTracker**
Amaç: bildirimleri sitedeki gerçek kullanımla çapraz kontrol edip **aksiyon
çıkarmak** — sadece rapor değil.

---

## 1. Erişim haritası

| Kaynak | Yöntem | Durum notu |
|---|---|---|
| **Mailler** | Gmail MCP (`search_threads` + `get_thread`) | Sorunsuz |
| **AdSense** | `~/Downloads/gsc-profile` (hyuseyink@gmail.com) | Sorunsuz |
| **GSC** | `~/Downloads/metrics-profile` (hsyn.kucukoglu@gmail.com) | Sorunsuz |
| **Clarity** | `~/Downloads/metrics-profile` | Oturum süreli, düşebiliyor |
| **TradeTracker** | `~/Downloads/tradetracker-profile` | Temmuz'dan beri açık |
| **Daisycon** | `~/Downloads/daisycon-profile` | ⚠️ **oturum sık düşüyor** |
| **Awin** | `~/Downloads/awin-v3-profile` | ⚠️ 19 Ağu'da düşmüştü |

Oturum düşerse otomatik giriş **denenmez** — Google/ağ bot tespiti engelliyor.
Profili otomasyon bayrağı olmadan aç, kullanıcı girsin:
`chrome --user-data-dir=<profil>` (ayrıntı: `metrik-profilleri` hafıza notu).

---

## 2. Mail taraması — sinyali gürültüden ayır

Gelen kutusu **çoğunlukla gürültü**: Awin'in reklam kampanyası duyuruları,
tanıtım e-postaları. 19 Ağustos taramasında 30 mailden yalnızca 5'i eyleme
değerdi.

**Eyleme değer olanlar:**

| Tür | Örnek konu | Aciliyet |
|---|---|---|
| Program kapanışı | `Programme CLOSED` · `Program Closure` | 🔴 link ölür |
| Kampanya durdurma | `Campaign stop` | 🔴 tarihli, link ölür |
| Onay iptali | `Campaign disapproval` | 🔴 kazanç durur |
| Komisyon değişikliği | `Changes to your commission rates` | 🟡 |
| GSC dizin/manuel işlem | `sc-noreply@google.com` | 🔴 |
| AdSense politika/ödeme | `adsense-noreply@google.com` | 🔴 |

**Yok sayılabilenler:** advertiser promosyon duyuruları ("Summer Sale up to
80%"), yeni program davetleri, ülke dışı kampanyalar (PL/US/DACH).

---

## 3. ⚠️ Çapraz kontrol — en kritik adım

**Hiçbir bildirime, sitede gerçekten kullanıp kullanmadığımızı doğrulamadan
aksiyon alma.** 19 Ağustos'ta bildirilen 9 programın yalnızca 3'ü bizimdi.

### İsimle eşleştirme YANLIŞ sonuç verir

`Kantoormeubelenplus` araması eşleşti — ama eşleşen şey **OfficeCity NL**'in
tagline'ıydı (`"Kantoormeubelen & supplies"`), program değil. Program bizde
hiç yoktu.

### Doğru yöntem: program kimliği, hem `si` hem `li` üzerinden

Daisycon linki `ds1.nl/c/?si=X&li=Y&wi=420902` biçiminde.

- `li` **otoriter** — program kimliğine güvenilir şekilde çözümlenir
- `si` **eskimiş olabilir** — sitede 10 farklı satıcı `si=16070` (Flink) ile
  duruyor, ama `li` değerleri doğru programlara gidiyor

Bu yüzden ikisi de taranmalı:

```js
const siKullanilan = new Set([...metin.matchAll(/[?&]si=(\d+)/g)].map(m => m[1]))
const liKullanilan = new Set([...metin.matchAll(/[?&]li=(\d+)/g)].map(m => m[1]))
// li -> program id, panelin kendi url alanindan
const kullanilan = new Set([...siKullanilan, ...liKullanilan.map(li => liToProg.get(li))])
```

Taranacak dosyalar: `frontend-next/lib/affiliate.ts` ·
`frontend-next/components/MeerBesparenWidget.tsx` · `data/affiliates.json`

### Benzer isimlere dikkat

`Frank Energy (ES)` reddedildi — bizde **`Frank Energie (NL)`** var, **farklı
program** (19823 ↔ 16978). Kimlik kontrol edilmeseydi çalışan bir link
gereksiz yere silinecekti.

---

## 4. Panel kontrolleri

### Daisycon — ölü program taraması, TIKLAMA HARCAMADAN

`node scripts/affiliate-check.mjs`

Trackinglinke tıklamak ağda **tıklama olarak sayılır**; ~10 linkle tam da
okumaya çalıştığımız veriyi kirletir. Bunun yerine panelin API'si:
`/api/publishers/478402/programs?status=joined`, `Authorization` başlığı ağ
isteklerinden yakalanır (cookie tek başına 401 verir).

### AdSense

`scripts/gunluk-metrik.mjs` zaten günlük çekiyor — bugün/dün/7 gün/bu ay.
Genel kontrolde ayrıca bakılacak: politika uyarısı, ödeme eşiği, yeni
"Ads.txt" veya "Policy center" bildirimi.

### TradeTracker

Panel → Rapor → Kampanyalar, dönem **This year**. Ayrıca bekleyen kampanya
başvurularının durumu (`/affiliateCampaign/view/ID/{id}`).

### Awin

Oturum açıksa `ui.awin.com` → programme listesi. Mailde bildirilen kapanışları
buradan teyit et.

---

## 5. Aksiyon eşiği

| Bulgu | Aksiyon |
|---|---|
| Kullandığımız program kapandı/durduruldu | Kaydı **sil**, commit et |
| Kullandığımız programdan reddedildik | Kaydı **sil** |
| Kullanmadığımız program kapandı | Aksiyon yok, not bile gerekmez |
| Komisyon düştü | Not et, tek başına silme gerekçesi değil |
| Komisyon arttı / bonus kampanya | Kullanıyorsak öne çıkarmayı düşün |
| Hedef URL 404/503 | Önce **hedefi** düzelt; program da kapalıysa kaydı sil |

---

## 6. İlk çalıştırma sonucu (2026-08-19)

Taranan: 7 günlük mail (30 thread) + Daisycon panel verisi.

**Aksiyon alınanlar:**

| Program | Bulgu | Yapılan |
|---|---|---|
| **Vipio** (15569) | Onay iptali — "hedef kitlemiz değil" | Widget'tan silindi |
| **Nu.nl Shop** (15818) | Kampanya 1 Eylül'de duruyor | `AFFILIATE_MAP`'ten silindi |

**Kontrol edilip aksiyon gerekmeyenler:**

| Bildirim | Sonuç |
|---|---|
| Kantoormeubelenplus durdu | Kullanmıyoruz (isim eşleşmesi yanlış alarmdı) |
| Frank Energy (ES) reddi | Bizdeki **Frank Energie (NL)**, farklı program |
| MeinSpiel (DACH) reddi | Kullanmıyoruz |
| Awin: Alquicoche, Abib, Casarolio kapanışı | Üçünü de kullanmıyoruz |
| Awin komisyon değişiklikleri (Dexam, Joybuy, City Game, OnsMagazijn) | Dördünü de kullanmıyoruz |
| Tsar Bomba — kupon kabul edilmiyor | Link çalışıyor, sadece bilgi |
| ENGIE — "Tot €750" bonus kampanya | Kullanıyoruz; öne çıkarma fırsatı, not edildi |

**Oturum durumu:** Daisycon ve Awin oturumları düşmüştü, panel doğrulaması
mail + kayıtlı panel verisiyle yapıldı.
