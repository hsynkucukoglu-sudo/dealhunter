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

---

## 9. Daisycon finans anketi — hazırlanan cevaplar (2026-08-29)

**Neden önemli:** "Affiliate financial-service compliance declaration (NL)"
anketi **106 programı** açıyor — sadece §8'de takılan 4 sigorta programını
değil. Panelde yolu: Settings → Media → DealHunter4U → **Show questionnaires**
→ Open → *Answer questionnaire* (soru soru ilerleyen sihirbaz).

Cevapların çoğu sitenin gerçek davranışından doğrulandı, uydurulmadı:

| # | Soru (NL) | Cevap | Dayanak |
|---|---|---|---|
| 1 | Tekenbevoegd? | Ja | Hesap sahibi teyit etti |
| 2 | Welke financiële producten? | Hypotheek, Lening, Levensverzekering, Zorgverzekering, Schadeverzekering | Widget 🏥 Verzekering: ONVZ, NN, DELA, Monuta, Housefinan, Kredanta, JW Verzekeringen |
| 3 | AFM vergunning? | Nee | Hesap sahibi teyit etti |
| 4 | Vergunningnummer | `geen` | — |
| 5 | Advies + bemiddeling? | Nee, geen AFM vergunning | — |
| 6 | Vergelijk je fin. producten? | **Nee — enkel banners/tekstlinks** | Sitede `/verzekering` sayfası yok; sigortalar yalnızca dışa link veren kartlar, kullanıcı seçim/filtre yapamıyor |
| 7 | Extra gegevens (leeftijd, inkomen)? | Nee | Finansal ürün için hiçbir form yok |
| 8 | Anders betrokken bij overeenkomst? | Nee | Sadece yönlendirme |
| 9 | Provisieverbod-producten vergelijken? | Nee | 6'nın doğal sonucu |
| 10 | Complexe producten — reclame aangeven? | Ik vergelijk geen complexe fin. producten | 9'un doğal sonucu |
| 11 | Oordeel (beste/goedkoopste)? | Nee | Tarandı: "goedkoopste" yalnızca süpermarketler için, finansal ürün için iddia yok |
| 12 | Contactmogelijkheid? | Ja, geen vergunning **maar duidelijk aangegeven dat ik geen vragen mag beantwoorden** | `/contact` sayfasına eklenen AFM bloğu (bu commit'te) |

**⚠️ 12. sorunun ön koşulu:** O seçenek ancak açıklama **canlı sitede**
yazıyorsa doğru. Bu yüzden sıra şu: önce `contact/page.tsx` deploy edilir,
`www.dealhunter4u.nl/contact` üzerinde doğrulanır, *sonra* anket gönderilir.

**Açık risk — tagline'lardaki "vergelijken":** ONVZ "Zorgverzekering
vergelijken", Housefinan "Hypotheek vergelijken", Kredanta "Krediet
vergelijken", JW "Autoverzekering vergelijken" diyor; ankette ise
"karşılaştırma yapmıyorum" cevabı veriliyor. Teknik olarak tutarlı
(karşılaştırma reklamverenin sitesinde oluyor, biz link veriyoruz) ama bir
denetçi çelişki görebilir. Tagline'ları "…afsluiten" / "Naar de vergelijker"
gibi ifadelere çevirmek bu belirsizliği tamamen kaldırır — henüz yapılmadı.

### Anket gönderildi — sonuç (2026-08-29)

Sıra doğru işletildi: `contact/page.tsx` deploy edildi → `www.dealhunter4u.nl/contact`
üzerinde AFM metni canlı doğrulandı → *sonra* anket gönderildi. Böylece 12. sorudaki
"açıkça belirtiyorum" beyanı gönderildiği anda doğruydu.

**Anket durumu:** `completed: true`, `status: pending`.
Beyan `hsyn.kucukoglu@gmail.com` adına, 29 Ağu 2026 14:26'da kaydedildi.
12 sorunun 12'si cevaplandı, cevapsız soru yok.

**4 sigorta programının şartları kabul edildi** (ONVZ, Nationale-Nederlanden Zorg,
Monuta, DELA — hepsi 201). Ancak abonelik henüz açılmadı:

> **"Questionnaire is being reviewed by Daisycon"**

API'nin verdiği `Not all questionnaire questions are answered for this media`
hatası **yanıltıcı** — tüm sorular cevaplı; gerçek sebep Daisycon'un inceleme
sürecinin sürmesi. Panelin arayüzü doğru mesajı gösteriyor.

**Bekleyen:** Daisycon anketi onaylayınca ONVZ (€55), Nationale-Nederlanden (€50),
Monuta (€145) ve DELA (€145) aboneliği açılabilir hale gelecek. Onay geldiğinde
tek yapılacak: `/api/publishers/478402/programs/{id}/subscriptions/420902` POST.
Şartlar zaten kabul edilmiş durumda, tekrar gerekmiyor.

### Tagline düzeltmesi — "vergelijken" belirsizliği kapatıldı (2026-08-29)

§9'da açık bırakılan risk giderildi. Ankette 6. soru ("Vergelijk je financiële
producten?") **"Nee, enkel banners of tekstlinks"** diye cevaplandı; buna karşın
widget'taki finansal kartlar "…vergelijken" diyordu. Beyanla metin artık uyumlu:

| Kart | Eski | Yeni |
|---|---|---|
| ONVZ | Zorgverzekering **vergelijken** | Zorgverzekering bij ONVZ |
| Housefinan | Hypotheek **vergelijken** (DE) · cta *Vergelijk rente* | Hypotheek afsluiten (DE) · cta *Bekijk rente* |
| Kredanta | Krediet **vergelijken** (DACH) · cta *Vergelijk krediet* | Krediet aanvragen (DACH) · cta *Bekijk aanbod* |
| JW Verzekeringen | Autoverzekering **vergelijken** | Autoverzekering afsluiten |

DELA, Monuta ve Nationale-Nederlanden zaten "vergelijken" içermiyordu, dokunulmadı.

**Kapsam kararı:** Enerji/telecom kartlarındaki "Vergelijk tarief" **bilerek
korundu** — enerji AFM'nin finansal ürün tanımına girmiyor, bu anketin kapsamı
dışında. Sadece finansal ürünler düzeltildi.

Kod içine gerekçe yorumu eklendi (kategori başında), ileride biri "vergelijken"
kelimesini geri getirmesin diye. Site geneli tarandı: finansal ürün + "vergelijk"
birlikte geçen başka yer kalmadı.

**Hâlâ açık:** Housefinan (21988) programı Daisycon'da erişilemiyor (API 204) —
metni düzeltildi ama link ölü, kaldırılması ayrıca değerlendirilmeli.

### Ölü kayıtlar temizlendi (2026-08-29)

Bugünkü denetimlerde iki program "erişilemez" çıkmıştı; ikisi de siteden kaldırıldı.

| Kayıt | Neden ölü | Nerede duruyordu |
|---|---|---|
| **Housefinan (DE)** — Daisycon 21988 | `/programs/21988` → **204**, abone olunamıyor; §8'de abonelik denemesi de başarısızdı | `affiliate.ts` (AFFILIATE_MAP) **+ widget'ta görünür kart** — ziyaretçi tıklayabiliyordu |
| **Eonon** — Awin 2471 | `merchant-profile/2471` → **404**, "closed" sekmesinde de yok | Yalnızca `affiliate.ts`; hiçbir yerde render edilmiyordu (uykuda kayıt) |

Housefinan'ın kaldırılması 🏥 Verzekering kategorisini 7 karttan 6'ya indiriyor —
kalanlar: ONVZ, Nationale-Nederlanden, DELA, Monuta, Kredanta, JW Verzekeringen.

`affiliate.ts`'teki "Housefinan/Kredanta deeplink desteklemiyor" yorumu yalnızca
**Kredanta**'ya daraltıldı; Kredanta hâlâ aktif ve o kısıt onun için geçerli.
Kod tarafında `Housefinan`, `Eonon`, `21988`, `1926905`, `si=2471` için kalıntı
yok (grep ile doğrulandı). Docs/backlog dosyalarındaki tarihsel kayıtlar
bilerek bırakıldı — onlar geçmişin kaydı.

**Not:** Ölü linkler ziyaretçiye bozuk sayfa gösterdiği *ve* komisyon
üretmediği için bu bir UX + gelir düzeltmesi; §8'deki "abonesiz link"
sorunundan farklı bir kategori (orada program yaşıyordu, abonelik yoktu).

---

## 10. Trafik teşhisi ve blog savings-strip (2026-08-29)

### GSC + Clarity birlikte okunduğunda: üç halkalı sızıntı

**49.800 gösterim → 187 tıklama → 533 oturum → 6 affiliate tıklaması → 0 dönüşüm**

| Halka | Ölçüm | Sebep |
|---|---|---|
| Gösterim → tıklama (%0,4) | GSC 28 gün | Gösterimlerin ~2/3'ü kazanılamaz head-term'lerden: `aldi` 5.212 gösterim/%0 CTR, `aanbiedingen lidl` 1.356/%0,1, `dirk aanbiedingen` 1.071/%0,1. Konum 8-15. `/supermarkt/lidl` tek başına gösterimlerin %22'si, 8 tıklama. |
| Tıklama → affiliate (%1,1) | Clarity 30 gün | Yüksek değerli linkler `MeerBesparenWidget`'te, o da yalnızca `ProductsPage`'de (`/`, `/deals`, `/tr`) ve varsayılan kapalı. `meer_besparen_open` = 3/533 oturum (%0,56). |
| Affiliate → gelir | §8 | Linklerin 14'ü abone olunmamış programlara gidiyordu — bugün düzeltildi. |

### Kazanan ve kaybeden sorgu aileleri

Aynı sitede, aynı dönemde:

| Kaybeden (marka/folder) | | Kazanan (karşılaştırma) | |
|---|---|---|---|
| `aldi` | %0 CTR, konum 8,6 | `jumbo vs lidl` | **%20**, konum 1,4 |
| `aanbiedingen lidl` | %0,1, konum 9,2 | `jumbo of ah` | **%25**, konum 5,0 |
| `dirk aanbiedingen` | %0,1, konum 9,4 | `is jumbo duur` | **%33**, konum 4,3 |
| `plus aanbiedingen` | %0,1, konum 9,2 | `is ah duurder dan jumbo` | %8, konum 5,3 |

Perakendeci kendi marka sorgusunu sahipleniyor; "Jumbo AH'den ucuz mu?" sorusuna ise
cevap veremiyor. **Kazanılabilir alan karşılaştırma sorguları.** Bu, `supermarkt/[slug]`
içindeki "head-term title optimizasyonu 4 kez çürütüldü, konum 8-9 bandındaydı"
notuyla birebir örtüşüyor — o ders burada bağımsız olarak doğrulandı.

### Yapılan: blog savings-strip

**Tespit:** Arama tıklamalarının ~%68'i blog karşılaştırma yazılarına iniyor,
yalnızca ~%14'ü çekmecenin bulunduğu `/` ve `/tr`'ye. Yani yüksek değerli linkler
trafiğin indiği sayfalarda **hiç yoktu**.

Çözüm olarak ana sayfadaki çekmeceyi zorla açmak yerine (ziyaretçilerin %86'sına
dokunmaz, üstelik ~60 kartlık blok asıl içeriği aşağı iter), blog şablonuna
kompakt bir şerit eklendi: `components/BlogSavingsStrip.tsx`.

- Yerleşim `dealEmbed` ile aynı desende — ilk `<h2>`'den önce, yani ölçülen
  %32 kaydırma bandının içinde. Şablondaki mevcut yorum bu dersi zaten
  belgeliyordu ("marktlinks zaten in de onderste helft en werden dus nooit gezien").
- Kesme noktası artık `dealEmbed`'e bağlı değil: 46 yazının yalnızca 6'sında
  dealEmbed var, şerit ise hepsinde görünmeli. `<h2>` yoksa tek bloğa düşüyor.
- **Yalnızca aboneliği `approved` olan programlar:** Frank Energie (si 16978),
  Pure Energie (9321), Ziggo (17174), hollandsnieuwe (21994). Dördü de bugünkü
  §8 taramasının "abone değil" listesinde yok. Eneco/KPN/Vattenfall/ENGIE/Oxxio
  ve 4 sigorta programı **bilerek dışarıda** — onay bekliyorlar, eklenirse §8'de
  düzelttiğimiz hatanın aynısı üretilirdi. Component yorumunda bu uyarı yazıyor.
- "Advertentie" etiketi eklendi; `/contact`'taki AFM metni ve `/over-ons`'taki
  affiliate açıklamasıyla tutarlı.

**Beklenti yönetimi:** En yüksek komisyonlu programlar hâlâ onayda. Yerleşim şimdi
yapıldı ki onaylar gelince hazır olsun — ilk hafta rakamlarına bakıp "işe yaramadı"
sonucu çıkarılmamalı.

---

## 11. `intentTerm` ölçümü — hipotez çürütüldü (2026-08-29)

§10'daki plan maddesi "önce ölç, sonra yay" idi. Ölçüldü: **yaymayın.**

**Kurulum:** `intentTerm` 2026-08-16'da eklendi (commit `000191f`), yalnızca Lidl
("Dagdeal") ve Hoogvliet ("Dagdeals"). GSC'nin son verisi 26 Ağustos, dolayısıyla
sonrası penceresi 16-26 Ağu (11 gün); öncesi eşit uzunlukta 5-15 Ağu alındı.
Kontrol grubu olarak `intentTerm` verilmeyen 8 market sayfası da ölçüldü — aksi
halde genel bir trend değişikliğin etkisi sanılabilirdi.

**Hedef sorgu ailesinde sonuç:**

| Sorgu | Gösterim sonra/önce | TO sonra/önce | Konum sonra/önce |
|---|---|---|---|
| `lidl dagdeal` | 174 / 164 | **%0 / %0** | 7,5 / 6,2 |
| `dagdeal lidl` | 32 / 26 | %0 / %0 | 8,2 / 7,0 |
| `lidl dagdeals` | 1 / 5 | %0 / %0 | 3,0 / 4,4 |
| `lidl dagaanbieding` *(hipotezin dayandığı sorgu)* | 6 / 12 | **%0 / %8,3** | 5,5 / 4,0 |
| `hoogvliet dagdeals` | 87 / 65 | %0 / %1,5 | 10,8 / 9,3 |
| `dagdeals hoogvliet` | 50 / 20 | %0 / %0 | 11,7 / 8,9 |

**Yorum:** `lidl dagdeal` değişiklikten sonra **174 gösterim** aldı — gerçek bir
etki olsaydı görmeye yeterdi (konum 7,5'te %1-2 bile 2-3 tıklama demek). TO tam
olarak %0'da kaldı. Hoogvliet'in sorguları 1-7 gösterimlik; oradaki oynamalar
(`hoogvliet weekaanbieding` %0→%20) tek tıklamadan ibaret, gürültü.

Sayfa düzeyinde de aynı: `/supermarkt/lidl` TO %0,1 → %0,1, konum 9,1 → 10,8.
Kontrol grubu da genel olarak düşmüş, yani ayrı bir "işe yaradı" sinyali yok.

**Kayıt için:** Hipotezin dayandığı gözlem (aynı SERP bölgesinde, sorgunun
kelimesi başlıkta geçtiğinde TO 27 kat fark) **gerçekti** — ama müdahale onu
üretmedi. Korelasyon nedensellik vermedi. Bu, bu sayfalardaki başlık
denemelerinin **5.'si ve yine başarısız**. Önceki 4'ü konum 8-9 bandındaydı;
burayı "4-6 bandı, kazanılabilir" varsaymıştık, oysa `lidl dagdeal` gerçekte
6-7,5'te ve sonuç değişmedi.

`app/supermarkt/[slug]/page.tsx` içindeki yorum buna göre düzeltildi — orada
`intentTerm` "kanıtlanmış" diye duruyordu; sonraki okuyucu ona güvenip 8 markete
yaymasın diye ölçüm sonucu koda işlendi.

**Aynı pencerede kazanan ne?** Yine karşılaştırma sorguları:
`is jumbo goedkoper dan ah` 0→2 tıklama (%3,7, konum 5,4),
`jumbo vs albert heijn` 0→1 (%1,8, konum 5,7). Plan §10'un 2. maddesi
(karşılaştırma içeriğini çoğalt) tek ayakta kalan büyüme yolu.

---

## 12. Karşılaştırma içeriği — talep analizi ve ilk yazı (2026-08-29)

§10'un 2. maddesi ("karşılaştırma içeriğini çoğalt") uygulanmadan önce **hangi
ikilinin yazılacağı** GSC 3 aylık veriyle belirlendi. Sonuç, naif beklentiyi
bozdu: talep zaten kapsanan ikililerde toplanmış.

| İkili | Gösterim (3 ay) | Tıklama | Blog var mı |
|---|---|---|---|
| albert-heijn + jumbo | **2.415** | 20 | 3'lü yazıda |
| albert-heijn + lidl | 329 | 4 | ✅ |
| jumbo + lidl | 266 | 6 | ✅ |
| aldi + lidl | 66 | 0 | ✅ |
| **albert-heijn + vomar** | **29** | 0 | ❌ |
| etos + kruidvat | 17 | 0 | ✅ |
| albert-heijn + aldi | 13 | 0 | ❌ (/vergelijk indexli) |
| albert-heijn + hoogvliet | 10 | 0 | ❌ (/vergelijk indexli) |

**AH+Jumbo için ayrı yazı YAZILMADI.** Git geçmişi bunun denenip geri alındığını
gösteriyor: `22c98fb` (10 Tem) ayrı "Jumbo vs AH" yazısını ekliyor, `521c97d`
(24 Tem) `fix(seo): AH-vs-Jumbo keyword-kannibalisatie opgelost` ile geri alıyor.
Talep 3'lü yazıya akıyor ve o konum 5,2'de çalışıyor; ikinci bir sayfa sinyali
böler. Geri alınmış bir karar tekrarlanmamalı.

**Yazılan:** `is-vomar-goedkoper-dan-albert-heijn` — repo'nun kendi kuralına
(talep var + blog karşılığı yok + kanibalizasyon riski yok) uyan tek temiz aday.
`/vergelijk/albert-heijn-vs-vomar` zaten `INDEXED_PAIR_SLUGS` dışında (noindex),
yani 25 Tem kuralıyla da tutarlı — değişiklik gerekmedi.

İçerik sitenin kendi verisine dayandırıldı, uydurulmadı: Consumentenbond 2026
(Vomar %10-15 AH'den ucuz), ~60 filiale/Noord-Holland, N+M gratis ve dagknallers,
huismerk %20-30 ucuz — hepsi `marketFaqs.ts` / `marketContent.ts` içinde zaten
yazılı. AH tarafı: 1.000+ şube, Bonuskaart, 1+1 gratis = etkin %50, ~30.000 ürün,
Jumbo'dan %2-5 pahalı. Yazının tezi bu ikisinin çatışmasından çıkıyor: **temel
fiyatta Vomar, promosyonda AH kazanıyor; ve Vomar Noord-Holland dışında yok, yani
çoğu okuyucu için posta kodu hesap makinesinden önce karar veriyor.**

996 kelime (repo hedefi 800+), 6 bölüm, 4 SSS, 4 iç link. İkisi bilerek
**girişe yakın** konuldu — §10'daki ölçüm alt yarıdaki linklerin görülmediğini
gösteriyordu. Intro 375 karakter, şablonun ilk `<h2>` bölme mantığının beklediği
211-558 bandında. Sitemap `getAllPosts()` üzerinden otomatik.

**Beklenti:** 29 gösterimlik bir ikili; tek başına trafiği değiştirmez. Değeri,
formatın doğrulanmış olması — blog karşılıkları konum 3-6'da çalışırken
`/vergelijk` eşleri 10,8'de kalıyor. Asıl kısıt hâlâ hacim, içerik değil.
