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

---

## 7. İkinci çalıştırma sonucu (2026-08-27)

Taranan: 14–27 Ağustos mail (Daisycon, 26 thread). Panel oturumu yoktu, `li`/`si`
taraması yapılamadı — doğrulama isim bazlı grep ile `frontend-next/lib/affiliate.ts`,
`frontend-next/components/MeerBesparenWidget.tsx`, `data/affiliates.json` üzerinde.

**Aksiyon alınanlar:** Yok — hiçbir kullanılan program etkilenmedi.

**Kontrol edilip aksiyon gerekmeyenler:**

| Bildirim | Sonuç |
|---|---|
| 32 program reddi (Platekompaniet NO, Plusshop×5, BrandSaver×2, Bazta×5, Frivannsliv NO, Hiusverkko/Akkukauppa/Kaalimato.com/Finink/HotLips/Salapalatsi FI, Milrab SE, Høie of Scandinavia NO, Hobbyhall.fi, Naturelleshop.com INT, CanvasHifi NORDIC, Silfen DK, CuliStack NL, 5× BE eğitim kampanyası, Quiso, Spartoo SE, Homeshop DK, avXperten DK/NO, Permild & Rosengreen DK/DE) | Hiçbiri kullanılmıyor — hepsi niş/ülke dışı |
| Kantoormeubelenplus durdu | İlk çalıştırmada zaten "yanlış alarm" — teyit edildi |
| Nu.nl Shop durdu (1 Eylül) | İlk çalıştırmada zaten `AFFILIATE_MAP`'ten silinmişti — teyit edildi |
| Lego (EU) — Magazine Signup komisyonu kaldırıldı | Ayrı kampanya, ana Lego'yu etkilemiyor; zaten kullanmıyoruz |
| Coach (EU) — Promotion on Hold | Kullanmıyoruz |
| McAfee (NL/DE/FR/UK/IT) — Promotion on Hold | Kullanmıyoruz |
| Tsar Bomba — kupon kaldırıldı | Zaten bilinen bilgi (bkz. §6), link hâlâ çalışıyor |
| 5 yeni program onayı (Droptelegram, Evolar NL, Tiny Library, 123waldo.nl, Arganwinkel) | Henüz kullanılmıyor, eklenmesi istenirse ayrı değerlendirilebilir — acil değil |

**Oturum durumu:** Daisycon/Awin panel oturumu açık değildi; doğrulama
tamamen Gmail + kod taramasıyla yapıldı. Panelin kendi bildirim merkezinde
(721 abonelik + 74 güncelleme + 9 durdurma) mailde karşılığı olmayan çok
daha büyük bir kuyruk var — bu sadece mailde görünenleri kapsıyor, panele
girmeden tam triyaj mümkün değil.

---

## 8. Üçüncü çalıştırma sonucu (2026-08-29)

İlk kez **panel oturumu açıkken** çalıştırıldı (Playwright MCP ile tarayıcı
otomasyonu; kurulum: proje kökünde `.mcp.json` + `@playwright/mcp`). Bu sayede
§3'te tarif edilen `li` → program çözümlemesi ilk defa **tam** yapılabildi.

### 🔴 Ana bulgu: sitedeki 14 link abone olmadığımız programlara gidiyor

`li` bazlı tarama, isim/`si` bazlı taramanın göremediği bir sorunu ortaya
çıkardı. Sitedeki 106 `li` değerinden **83'ü sağlıklı**, ama 14 tanesi
**aktif ama abone/onaylı olmadığımız** programlara işaret ediyor:

| Program | ID | Abonelik | Not |
|---|---|---|---|
| ENGIE | 365 | yok | §6'da "kullanıyoruz, öne çıkarma fırsatı" diye not edilmişti |
| Eneco | 12392 | yok | kodda `€102 per lead` notu var; panel toplist'te tıklama alıyor |
| KPN Residential NL | 19864 | yok | kodda `€100 per lead` notu var |
| Vattenfall | 2036 | yok | |
| Oxxio Energie | 2028 | yok | |
| Nationale-Nederlanden Zorg | 2340 | yok | |
| ONVZ Zorgverzekeraar | 7185 | yok | |
| Monuta Verzekeringen | 9073 | yok | |
| DELA UitvaartPlan | 9087 | yok | |
| De Vakantiediscounter | 7805 | yok | |
| Kwantum (NL) | 7762 | yok | |
| Vitaminstore | 5676 | yok | |
| Sinner | 1281 | **canceled** | abonelik iptal edilmiş |
| Housefinan (DE) | 21988 | yok | program API'den hiç dönmüyor (204) |

Housefinan hariç 13'ü de `status: active` ve **katılıma açık** — yani şu an
başvurulabilir durumda.

**Neden gözden kaçmış:** 14 linkin 11'i `si=16070` (Flink) taşıyor — §3'te
uyarılan "eskimiş si" kalıbı. `si` taraması bunları "onaylı" gösteriyor,
çünkü Flink gerçekten onaylı. Yalnızca `li` çözümlemesi doğruyu veriyor.
Bu linkler büyük olasılıkla program kataloğundan kanonik URL kopyalanarak
eklenmiş, abonelik adımı hiç yapılmamış.

**Etki:** Bu linklere gelen tıklamalar komisyon üretmiyor. Enerji / telecom /
sigorta kategorisi `ProductsPage.tsx` yorumunda "asıl komisyon kaynağı"
olarak geçiyor — yani en değerli linkler boşa çalışıyor.

**Aksiyon (kullanıcı onayı bekliyor):** 13 programa panelden abone ol; onay
gelince linkler olduğu gibi çalışmaya başlar (URL'ler zaten kanonik ve doğru,
değiştirilmesi gerekmiyor). Sinner'ın iptali ayrıca sorgulanmalı.

### Kampanya durdurma bildirimleri (9 okunmamış)

Kantoormeubelenplus (11150), Donald Duck Shop (15835), Sheyas SE (21294),
Letsleds (16578), Verwenboxen (20132), PureVPN INT (18818), Scootworld
PL/DE/SE (18363/16966/16965). **Hiçbiri sitede kullanılmıyor** — aksiyon yok.
15835 ve 18818'e hâlâ aboneyiz ama kullanmıyoruz; abonelik bırakılabilir.

### Panel API tarifi (tıklama harcamadan sorgulama)

Oturum açıkken, sayfa context'inden:

```js
const tok = JSON.parse(localStorage.getItem('auth')).token   // JWT, ~30 dk ömürlü
fetch('/api/publishers/478402/programs', {
  method: 'POST',
  headers: { authorization: 'Bearer ' + tok,
             'x-http-method-override': 'GET',      // ← GET'i POST'la tünelliyor
             'content-type': 'application/json' },
  body: JSON.stringify({ page: 1, per_page: 1000 })
})
```

- `/programs` → her programın kanonik URL'i (`li` buradan çözülür), `status`
- `/subscriptions` → `{program_ids[], status}`; `media_id` 420902 = DealHunter4U
- `/notifications`, `/trafficnotifications/summary` → bildirim kuyruğu
- Publisher ID **478402**. Tıklama üretmez, güvenli.

**Kuyruk durumu:** Campaign stop 9 · Campaign updates 75 · Campaign
subscriptions 728. Gmail bunların yalnızca küçük bir kısmını yolluyor;
abonelik bildirimleri (728) neredeyse tamamen onay/ret akışı ve §7'de
incelenmişti.

### Abonelik aksiyonu — 2026-08-29, kullanıcı onayıyla uygulandı

Kullanıcı 13 programa abone olmayı onayladı. Uygulamada her programın kendi
**şartlar ve koşulları** çıktı; hepsi tek tek okundu. Sonuç:

**✅ Abone olundu (6) — durum `open`, reklamveren onayı bekleniyor**

| Program | Şart | Not |
|---|---|---|
| Eneco | ACM kaynaklı içerik kuralı | Sitedeki metin "groene **stroom**" diyor — kuralın izin verdiği ifade; "groene energie" sitede hiç geçmiyor. Uyumlu. |
| Vattenfall | Tazminat (indemnity) maddesi | Standart; Daisycon'u reklamveren taleplerine karşı vareste kılıyor |
| KPN Residential NL | İçerik yasakları (erotik/kumar/telif) | Süpermarket fırsat sitesi, uyumlu |
| Vitaminstore | KOAG/KAG — tıbbi iddia yasak | Metin "Vitamines & supplementen", iddia içermiyor |
| De Vakantiediscounter | Onay süreci açıklaması | Bilgilendirme niteliğinde |
| Sinner | Şart yok | İptal edilmiş abonelik yenilendi |

**⛔ Abone OLUNMADI (8) — her biri gerçek bir engel yüzünden**

| Program | Engel |
|---|---|
| **ONVZ, Nationale-Nederlanden Zorg, Monuta (€145), DELA (€145)** | Şartı kabul etmek "gerekli anketi doğruya uygun doldurdum" **beyanı** demek. Panelde 4 anketin dördü de `completed: false` — beyan yalan olurdu, bu yüzden yapılmadı. **Önce "Affiliate financial-service compliance declaration (NL)" anketi doldurulmalı** (sadece hesap sahibinin bilebileceği iş bilgileri soruyor). |
| **Oxxio** | Şart: ziyaretçiye gösterilen metin Oxxio'dan gelmeli, Daisycon onayı şart; aksi halde programdan çıkarılma + satışların reddi. Sitede `app/energie/page.tsx` ve `lib/posts.ts` içinde kendi yazdığımız Oxxio metinleri var. Karar gerekiyor: metni onaylatmak ya da riski kabul etmek. |
| **ENGIE, Kwantum** | API reddetti: `No pending invite or media type not permitted by the program`. Reklamveren bu medya tipini kabul etmiyor — abone olmak mümkün değil. ENGIE sitede aktif kullanılıyor (`app/energie/page.tsx` + blog), yani **o link hiçbir zaman komisyon üretmeyecek**; kaldırmak veya davet istemek gerek. |
| **Housefinan (DE)** | Program API'den hiç dönmüyor (204) — erişilebilir değil, muhtemelen kapanmış. Link kaldırılmalı. |

**Kullanılan API çağrıları** (POST, `x-http-method-override` YOK — bunlar gerçek create):
- Şart kabul: `/api/publishers/478402/programs/{id}/agreementterms/accept` gövde `{"state":"accepted"}` → 201
- Abonelik: `/api/publishers/478402/programs/{id}/subscriptions/420902` gövde `{}` → 201
- Şartları okumak: `/programs/{id}/agreementterms` → `{terms:[{language_id,terms}], agreement_state:[]}`
  (⚠️ yanıt `results` değil **`terms`** anahtarında; yanlış parse edilirse "şart yok" sanılır)
- Anket durumu: `/media/420902/questionnaires` → `completed` alanı

**Sıradaki adımlar:** (1) finans anketini doldur → 4 sigorta programı açılır, ikisi
€145/satış; (2) Oxxio metni için karar ver; (3) ENGIE/Kwantum/Housefinan linklerini
siteden kaldır ya da davet iste; (4) 6 aboneliğin onayını birkaç gün içinde takip et.

### Awin denetimi — 2026-08-29 (aynı yöntem, panel oturumuyla)

Daisycon'daki "link var ama abonelik yok" sorunu Awin'de de var mı diye
bakıldı. Şüphe sebebi: Awin'de 27 tıklama / 0 işlem — Daisycon'un semptomunun
aynısı.

**Yöntem:** `My Programmes` (`/merchant-directory/index/tab/active`) üç sayfa,
sayfa başına 40 kayıt → **86 katılınmış program**. Satır içindeki
`a[data-merchantid]` özniteliğinden ID çekilir. Sitedeki 13 Awin kaydı
(`network: 'awin'`, `programId` alanı) bu listeyle karşılaştırıldı.

**Sonuç: Awin sağlıklı — 13 mağazanın 12'si katılmış durumda.**

| Bulgu | Durum |
|---|---|
| Holland & Barrett, BioProphyl, Vitaepro, Direct Running, Direct Volley, Wolfswinkel, OfficeCity, 123watches, buttinette, Pulsetto, Sneakids, Erverte Paris | ✅ Joined |
| **Eonon (2471)** | ❌ `merchant-profile/2471` → **404**; "closed" sekmesinde de yok, yani hesaba hiç açık değil. Yalnızca `affiliate.ts:83`'te duruyor, hiçbir yerde render edilmiyor (ölü/uykuda kayıt). Temizlenebilir, acil değil. |
| Babubas NL (119167) — Awin'de CLOSED | Sitede kullanılmıyor, aksiyon yok |
| AuthorityLayer (127177), Binocular Base (103211), Aesthetic (123670) — maille bildirilen kapanışlar | Üçü de sitede kullanılmıyor, aksiyon yok |

**Önemli çıkarım:** Awin'in sıfır işlemi **teknik bir arıza değil**. 27 tıklama,
tipik %1–3 dönüşümle 0–1 satış demek — istatistiksel olarak beklenen sonuç.
Daisycon'un sıfırı gerçek bir hataydı (14 abonesiz link), Awin'inki sadece
düşük hacim. İkisini aynı kefeye koymamak lazım: Awin'de yapılacak iş
**trafik artırmak**, altyapı düzeltmek değil.

### TradeTracker denetimi — 2026-08-29 (panel oturumuyla)

Kullanıcı ödeme bilgisi maddesini erteledi ("nasıl olsa ödeme almayacağız"),
denetim kampanya/bilet tarafına odaklandı. Hesap: User ID 335428,
affiliate site **511755 = "dealhunter"**.

**Sitede TradeTracker kullanımı: tek bir link.**
`MeerBesparenWidget.tsx:95` → B2Ctelecom.nl,
`partner.b2ctelecom.nl/c?c=4714&m=12&a=511755` (TradeTracker `c`/`m`/`a`
formatı; `a=511755` panel site ID'siyle birebir uyuşuyor).
`affiliate.ts`'te `network: 'tradetracker'` diye bir kayıt hiç yok —
dağılım: daisycon 60, awin 13, direct 12, bol 1.

**Durum: hata yok.**

| Kontrol | Sonuç |
|---|---|
| B2Ctelecom (#4714) aboneliği | ✅ `Accepted / dealhunter` — kampanya aktif, %7 satış komisyonu, 100 gün tracking, Position (40/20/40) atıf modeli |
| 6 bilet (Petsexclusive, Barrelkings ×2, Teaking, Intimico, holidayextras) | Hepsi reklamveren duyurusu (promotion material / feed). **Hiçbirinin kampanyası sitede kullanılmıyor** → aksiyon yok |
| Süresi dolacak kampanyalar (Casualcases 09.09, Consumentenbond 21.09, Plantje 26.09) | Üçü de sitede link olarak yok. ⚠️ `Consumentenbond` kod içinde geçiyor ama **yalnızca editoryal kaynak atfı** ("Volgens de Consumentenbond (2026)…" — `marketFaqs.ts`, `posts.ts`, `marketContent.ts`), affiliate link değil → aksiyon yok |

**Asıl tespit — arıza değil, kullanılmama:** Hesap ~1100 kampanyaya kabul
edilmiş ama sitede yalnızca **1 tanesi** kullanılıyor. `analytics.ts:56`
zaten "TradeTracker: 1 klik in een jaar" diye not düşmüş. Sıfır kazanç
bunun doğal sonucu.

**Üç ağın karşılaştırması (2026-08-29):**

| Ağ | Sıfır kazancın sebebi | Yapılacak iş |
|---|---|---|
| **Daisycon** | 🔴 Gerçek hata — abone olunmamış 14 link, en değerlileri | Tamir (6'sı yapıldı, kalanı anket/karar bekliyor) |
| **Awin** | 🟡 Düşük hacim — 27 tıklama, altyapı sağlam | Trafik artır |
| **TradeTracker** | 🟡 Kullanılmıyor — 1100 kabul, 1 link | Kampanya ekle ya da ağı bırak |

Yani sadece Daisycon'da teknik borç vardı. Awin ve TradeTracker'da yapılacak
iş içerik/trafik tarafında — panel tarafında düzeltilecek bir şey yok.
