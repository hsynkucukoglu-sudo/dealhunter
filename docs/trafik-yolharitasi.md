---
date: 2026-08-08
tags: [dealhunter, trafik, sosyal-medya, seo, yol-haritasi]
status: active
---

# Trafik Analizi & Yol Haritası — 2026-08-08

> **Durum güncellemesi 2026-08-15** (detay: `docs/analiz-2026-08-15.md`)
> - ✅ Faz 1 bloğu (AH scraper ölümü) çözüldü — ölçüm artık yapılabilir
> - ✅ Faz 0 deploy edildi ve canlıda doğrulandı
> - 🟢 İlk olumlu sinyal: tıklama/gün **3,8 → 4,6 → 5,5**; `/supermarkt/lidl`
>   Temmuz'un en çok büyüyen sayfası (+17)
> - 🔴 EPC ölçümü kapandı: gerçek giden tıklama **ayda ~6**
> - 🔴 Outreach: 4 gönderim → 1 bounce, 0 yanıt
> - Bir sonraki ölçüm **21 Ağustos**, üç soru revize edildi (bkz. bölüm 6)

**Kısıt (kullanıcı kararı, 2026-08-08):** sosyal medyaya ayrılabilecek zaman **~0 saat/hafta**.
Elle post gerektiren hiçbir plan bu dokümanda önerilmiyor. Aktif tek sosyal kanal: WhatsApp
grubu (GitHub Actions, günde 8 mesaj).

---

## 1. Nerede duruyoruz (ölçülmüş)

| Metrik | Değer | Kaynak |
|---|---|---|
| Organik tıklama (3 ay, 4 May–3 Ağu) | **356** (~3,9/gün) | GSC |
| Gösterim (aynı dönem) | **125.000** | GSC |
| TO | **%0,3** (sektör: %3-5) | GSC |
| Ort. pozisyon | 9,6 | GSC |
| Mobil payı | %69 | GSC |
| Sayfa/oturum | **1,02** | Clarity |
| Geri dönen kullanıcı | **%0** | Clarity |
| Etkin oturum süresi | 17s | Clarity |

**Sayfa tipine göre ters orantı (3 ay, GSC):**

| Tip | Gösterim | Tıklama | TO |
|---|---|---|---|
| `/supermarkt/*` | ~91.000 | 67 | **%0,07** |
| Blog karşılaştırma | ~30.600 | 86 | %0,28 |
| `/vergelijk/*` | ~800 | ~9 | **%1,1** |
| Ana sayfa (marka trafiği) | 538 | 138 | %25,7 |

Gösterimin %73'ü, tıklamanın %19'unu üreten sayfalarda. **Gösterim sorunu yok — tıklama ve
niyet uyumu sorunu var.**

---

## 2. Sosyal medyadan neden trafik gelmiyor

Üç ayrı sebep var, üçü de doğrulandı. Karıştırılmamalı:

### 2.1 Arz yok — kanallar ölü

| Kanal | Gerçek durum | Kanıt |
|---|---|---|
| WhatsApp grubu | ✅ Çalışıyor, günde 8 mesaj | `.github/workflows/whatsapp-sender.yml` |
| Instagram | ⚠️ Hesap var, footer'da linkli, **düzenli post yok** | `SiteFooter.tsx:41`, kullanıcı teyidi |
| TikTok / Reels | ❌ Video üretici hazır, hesap/yükleme yok | `tools/tiktok-video/`, `out/` içinde 2 test videosu |
| YouTube Shorts | ❌ Otomasyon kodlu ama OAuth secret'ları girilmemiş | `.github/workflows/weekly-video.yml` |

### 2.2 Sitede paylaşım yüzeyi **hiç yok** (kod düzeyinde doğrulandı)

`navigator.share`, paylaş butonu, "Deel deze deal" — tüm frontend'de **sıfır sonuç**. Tek
istisna alışveriş listesi kenar çubuğundaki WhatsApp paylaşımı (`ShoppingListSidebar.tsx:36`).

Yani gelen kullanıcı bir fırsatı beğense bile paylaşacak bir düğme bulamıyor. Sosyal
dağıtımın en ucuz biçimi (kullanıcının kendisi) kapalı.

### 2.3 Format uyumsuzluğu — bu ürün feed ürünü değil

"Bu haftanın süpermarket indirimleri" içeriğinin doğası:

- **Düşük paylaşılabilirlik:** kimse Instagram'da "Robijn %74 indirimde" paylaşmaz.
- **Yüksek tekrar-kullanım değeri:** aynı kişi her hafta tekrar bakar.

Bu profilin doğru kanalı **abonelik kanalı** (WhatsApp / push / bülten), feed kanalı
(IG/TikTok) değil. Sessiz otomatik video da TikTok/Reels'te yapısal olarak erişim almaz
(ses uygulama içinden eklenir — `weekly-video.yml` yorumunda zaten kayıtlı).

---

## 3. En önemli tespit: sosyal medya yanlış kaldıraç

Kaba hesap, kendi verinle:

| Senaryo | 3 aylık ek tıklama |
|---|---|
| Market sayfalarının TO'su %0,07 → %0,5 (hâlâ blog'unun altında, sektörün çok altında) | **+390** |
| Tam otomatik, iyi giden bir IG/Shorts kanalı (iyimser, ilk 3 ay) | +50-100 |

**Aynı gösterimle TO düzeltmesi, başarılı bir sosyal kanaldan 4-8 kat fazla getiriyor —
ve sıfır içerik üretimi gerektiriyor.** Sosyal medya "eksik" olabilir ama darboğaz değil.

Asıl kanamalı yer başka: **geri dönen kullanıcı %0, sayfa/oturum 1,02.** Haftalık indirim
sitesinde bu, edinilen her ziyaretçinin bir kez kullanılıp atıldığı anlamına geliyor.
Trafik eklemeden önce gelen trafiği tutmak gerekiyor — ve tutma altyapısı (push, bülten,
WhatsApp) zaten kurulu, sadece pasif duruyor.

---

## 4. Yol Haritası

Sıra bilinçli: önce kayıp durdurma (kod), sonra ölçüm, sonra kaldıraç, en son sosyal.

### FAZ 0 — Sıfır bakım maliyetli kod işleri ✅ TAMAMLANDI (2026-08-08)

**0.1 — Paylaş butonu eklendi.** `components/ShareButton.tsx` (yeni). Mobilde native
paylaşım penceresi (`navigator.share` — WhatsApp zaten içinde), desteklemeyen masaüstü
tarayıcılarda "link kopyala". Bilinçli olarak **kendi popover menüsü yazılmadı**: ürün
kartı `overflow-hidden`, menü kırpılırdı. Yerleşim:
- **Ürün kartı** — favori/takip/🔥 sırasının yanına ikon (mobilde her zaman görünür).
  Paylaşım metni "Ürün — €4,99 (-74%) bij Dirk", link market sayfası (tek bir dealin
  kendi URL'i yok, `/product/*` zaten anahtar kelime sayfası).
- **Market sayfası** — sticky nav'da, `hidden md:inline-flex` (mobil nav'dan yer çalmasın;
  mobilde zaten karttan paylaşılıyor).
- **Blog yazısı** — makale gövdesinin hemen altında, okuma bittiği yerde.
- İzleme: `trackClick('share', ...)` → `click_events`, backend allowlist'e `share` eklendi.

**0.2 — WhatsApp linkleri düzeltildi (gerçek bug bulundu).** Grup linki 3 yerde ayrı ayrı
hardcode'lanmıştı ve **ikisi yanlıştı**: `SiteFooter` ve `NewsletterCTA` kişisel WhatsApp
numarasına (`wa.me/31649305079`) gidiyordu — yani "volg ons op WhatsApp" diyen ziyaretçi
günde 8 mesaj akan grubun yerine boş bir DM'e düşüyordu. Üçü de `lib/social.ts`'teki tek
kaynağa bağlandı, `trackClick('whatsapp', ...)` eklendi (footer / newsletter-cta /
floating-button ayrı ayrı ölçülüyor).

**0.3 — YAPILMADI, bilinçli karar.** İki sebep:
1. Zaten var — ürün kartında favori + **prijsalert (çan ikonu)** butonları mevcut
   (`ProductCard.tsx`, `useFavorites`). Yeniden yazılacak bir şey yok.
2. Market sayfasına fold üstüne yeni CTA eklemek **zararlı olurdu**: 2026-08-02 fold
   denetiminde ilk ürün kartı zaten 738px'de. Yukarıya bir şey eklemek "lidl aanbiedingen"
   arayan kullanıcıyı tek bir aanbieding görmeden çıkarma sorununu büyütür.
   → Yerleşim işi Faz 2'deki fold çalışmasına bırakıldı, orada tek seferde çözülecek.

**0.4 — Kitle sayaçları ölçülebilir hale geldi.** `GET /api/audience/stats?key=...`
(`TRACK_STATS_KEY` ile korumalı, tıklama raporuyla aynı anahtar). Dönenler: push abone
(toplam / son 30 gün / segmentli), favori kullanıcısı ve öğe sayısı, bağlı email,
deal_alerts (toplam/onaylı) + Brevo bülten abonesi. **Brevo verisi alınamazsa `null`
dönüyor, 0 değil** — "abone yok" ile "ölçemedik" karışmasın.

**Doğrulama:** `tsc --noEmit` temiz, `next build` başarılı (exit 0), `next start` ile
gerçek HTML kontrol edildi — market sayfasında 49 paylaş butonu (48 kart + nav), blogda
"Deel dit artikel" render oluyor, kişisel WhatsApp numarası sitede **0 yerde** kaldı.
Backend `node --check` temiz.

> ✅ **Deploy edildi ve canlıda doğrulandı (2026-08-15).** Paylaş butonu ürün
> kartlarında render oluyor, kişisel WhatsApp numarası sitede **0 yerde**,
> `/api/audience/stats` yanıt veriyor.

### ✅ FAZ 1 BLOĞU ÇÖZÜLDÜ (2026-08-15)

AH scraper tekrar çalışıyor: **367 ürün, son tarama 2026-08-15 08:42.** Aşağıdaki
teşhis tarihsel kayıt olarak duruyor; Faz 1 ölçümü artık yapılabilir durumda.

<details>
<summary>Orijinal arıza kaydı (2026-08-08)</summary>

Faz 1'in öncü gösterge kontrolü sırasında ortaya çıktı. **Ölçüm işi değil, canlı arıza.**

**Kanıt:**

| Kontrol | Sonuç |
|---|---|
| AH `last_scraped` (`/api/health/scraper`) | **2026-08-04** — diğer 8 market 08-07 |
| AH API yerel (residential) IP'den | token HTTP 200, arama HTTP 200, 50 ürün ✅ |
| Railway'den | 0 ürün → kod sessizce `[]` dönüyor |
| AH ürünlerinin `expiresAt`'i | **614/614 → 2026-08-08 (bugün)** |

**Sonuçları:**
1. **AH paket-dedup fix'i (`cf5716a`) hiç uygulanmadı.** Canlıdaki 614 ürün 4 Ağustos
   snapshot'ı; "Knorr Good noodles kip" hâlâ 6 varyantla duruyor (2/4/6pack + tireli
   halleri). Faz 1'deki "`/supermarkt/albert-heijn` pozisyonu 12,7'den düzeldi mi"
   ölçümü **geçersiz** — ölçülecek değişiklik canlıya hiç çıkmadı.
2. **En büyük market bugün/yarın boşalıyor** — tüm AH ürünleri bugün sona eriyor.
3. **Sessiz arıza deseni üçüncü kez tekrarladı** (Hoogvliet/Imperva, Kruidvat/Akamai,
   şimdi AH/Akamai): scraper 0 dönünce scheduler eski veriyi bilinçli silmiyor, hiçbir
   uyarı çıkmıyor. Kalıcı ders: **0-ürün dönüşü bir alarm üretmeli.**

**Henüz doğrulanmamış:** Railway'in tam olarak neye takıldığı. Kod doğru satırı zaten
logluyor (`scraper/index.js:910` → `[AH] token alınamadı: …`, `:933` → `[AH] S1 p0 HTTP N`).
Railway → backend servisi → Logs → `[AH]` araması kesin nedeni verir. **Kullanıcı kararı:
önce log okunacak, fix ona göre yapılacak.**

</details>

> **Not (2026-08-15):** AH artık `ah-ingest` yoluyla besleniyor (ağ katmanı GitHub
> Actions'ta, parse backend'de) — bu deseni Aldi de kullanıyor. "0 ürün dönerse
> markete dokunma" koruması o endpoint'lerde mevcut, yani aynı sessiz arıza artık
> canlı veriyi silmiyor.

### 📊 Kitle taban ölçümü — 2026-08-09 (Faz 0.4 sonucu)

`/api/audience/stats` ilk kez okundu:

```
push_total 1 | push_last_30d 0 | push_segmented 0
favorite_users 0 | favorite_items 0 | linked_emails 0
deal_alerts_total 0 | deal_alerts_confirmed 0
newsletter.subscribers 1
```

**Sunucu tarafı, tartışmasız:** kitle ≈ **sıfır**. 1 push + 1 bülten abonesi, ikisi de
neredeyse kesin kendi testlerimiz. Giriş yapmış kullanıcı yok.

**Ölçülemeyen (yanlış okumaya karşı uyarı):** favoriler ve watchlist localStorage
öncelikli; favoriler DB'ye ancak Google girişi varsa yazılıyor. `favorite_users: 0`
"kimse favorilemedi" DEĞİL, "giriş yapan yok" demek. Anonim kullanım sunucudan
görünmüyor.

**🔴 Bulunan kusur: watchlist (çan ikonu) sunucuya HİÇ yazmıyor.**
`FavoritesContext.toggleWatch` sadece `localStorage.dh_watchlist`'e yazıyor; backend'de
`watchlist` kelimesi tek bir yorum satırı dışında geçmiyor. Hedefli push
(`getSubscriptionsForFavoritedProducts`) `user_favorites`'a JOIN atıyor, watchlist'e
değil. Sonuç: kullanıcı çana bassa da — giriş yapmış olsa bile — hiçbir fiyat alarmı
kaydı oluşmuyor. Buton görsel olarak durum değiştiriyor, arkasında bir şey yok.
(Faz 0.3'te "prijsalert butonu zaten var, yazılacak bir şey yok" demiştim — yanlıştı,
buton var ama işlevi yok.)

**Stratejik sonuç:** retention altyapısının tamamı (push segmentasyonu, watchlist
e-postaları, bülten, deal alerts) **1 kişiye hizmet ediyor.** 1 kişilik tabanın üstüne
yeni retention özelliği koymak erken optimizasyon. Bu, yol haritasının ana tezini
zayıflatmıyor — **güçlendiriyor**: önce trafik/TO (Faz 1-2), sonra dönüşüm.

**Ama bir önkoşul var:** trafik geldiğinde dönüşecek bir yüzey olmalı. Şu an bülten
CTA'sı market/blog sayfalarının en altında, kaydırma derinliği %29 — yani pratikte
hiç görülmüyor. Bu Faz 2'deki fold çalışmasıyla birlikte çözülecek; fold üstüne ayrı
bir CTA eklemek ilk ürün kartını daha da aşağı iter (bkz. Faz 0.3 kararı).

### FAZ 1 — Deploy edilmiş fix'leri ölç (2-4 hafta, yeni iş başlatma)

**✅ Öncü gösterge ölçüldü (2026-08-08): evergreen başlık fix'i indekse girdi.**

`site:dealhunter4u.nl/supermarkt` SERP'i (headed tarayıcı — Google headless'ı CAPTCHA'ya
düşürüyor):

| Tarih | Eski hafta numarası gösteren sayfa |
|---|---|
| 2026-08-01 (fix öncesi) | **7 / 10** |
| 2026-08-08 (fix sonrası) | **1 / 10** — sadece Lidl ("Week 29") |

Lidl'inki kod bug'ı değil: 10 canlı sayfanın **10'u** da evergreen ("Deze Week"), yani
Google henüz Lidl'i yeniden taramadı. Kendiliğinden düzelecek, aksiyon yok.
→ Başlıklar artık doğru; **TO ölçümü için önkoşul sağlandı.** Asıl TO okuması yine
2-4 hafta sonra (~21 Ağustos).

Bunlar canlıda ama etkileri henüz ölçülmedi. Kendi kuralın: ölçmeden yeni iş başlatma.

- [~] `064b899` — başlıklardan hafta numarası kaldırıldı (evergreen). **Market sayfası TO'su
      %0,07'den kıpırdadı mı?** Bu tek başına tablonun en büyük kalemi.
      → **İlk sinyal olumlu (2026-08-15):** Temmuz GSC e-postasında `/supermarkt/lidl`
      **+17 tıklamayla sitenin en çok büyüyen sayfası** ve 17 tıklamayla ana sayfayı
      (15) geçip 2. sıraya çıktı. Market sayfalarının "donmuş" olduğu tezinin ilk
      istisnası, zaman olarak bu fix'le örtüşüyor. **Tek sayfa/tek ay — kanıt değil.**
      21 Ağustos'un 1 numaralı sorusu: yayıldı mı, yoksa Lidl'e özel bir SERP olayı mıydı?
- [ ] `500c531` — `/vergelijk/` başlıkları "goedkoper" niyetiyle eşleştirildi
- [ ] `7fe29a8` — 5 vergelijk çifti index'e açıldı
- [ ] `cf5716a` — AH paket dedup (614→368); `/supermarkt/albert-heijn` pozisyonu (12,7)
      diğerlerine (8,5-9,0) yaklaştı mı? *(AH scraper 8-15 Ağu arası ölüydü, fix o
      pencerede canlıya çıkmamıştı — artık çalışıyor, ölçüm geçerli.)*
- [x] `788c9ad` — tıklama takibi; ~~`?days=14` ile EPC hesabı~~
      → **EPC ölçülemez, madde kapandı (2026-08-15).** `?days=30` ilk kez okundu:
      17 market tıklaması, ama **11'i tek günde ve beş market 8 saniye içinde**
      (affiliate uyum botu deseni). Burst dışında **6 tıklama/30 gün**. Bu hacimde
      kanal karlılığı hesaplanamaz. Soru "EPC nedir"den **"giden tıklama hacmi nasıl
      ölçülebilir seviyeye çıkar"**a dönüştü.

### FAZ 2 — Asıl kaldıraç: TO + niyet yüzeyi (4-8 hafta)

- [ ] **Market sayfası TO'su** — 91K gösterim %0,07'de. Faz 1 ölçümü kıpırdama göstermezse
      sıradaki hipotez: mobilde ilk ürün kartı 738px'de (fold denetimi, 2026-08-02) — SERP'ten
      gelen kullanıcı tek bir aanbieding görmeden çıkıyor.
- [ ] **Sorgu madenciliği** — GSC'de hem hacmi olan hem "goedkoper / vs / welke / hoeveel"
      niyetli sorguları çıkar. **DİKKAT:** "daha çok karşılaştırma yazısı yaz" 2026-08-01'de
      veriyle çürütüldü (46 yazı var, 9'u karşılaştırma, konum 3-6'da ama 3 ayda 30-100
      gösterim — sorgu hacmi yok). Yeni yazı ancak kanıtlanmış hacimli sorgu bulunursa.
- [ ] **Head-term'lere efor harcama** — `aldi` (11.947 gösterim → 4 tıklama) yapısal olarak
      kazanılamaz; 1-2. sıra marketin kendi sitesi. Bu karar 12 Tem + 21 Tem + 1 Ağu'da üç
      kez doğrulandı, tekrar açılmayacak.

### FAZ 3 — Otomatikleştirilebilir sosyal (arka planda, düşük beklenti)

Sadece **tek seferlik kurulum + sonrasında sıfır bakım** olanlar. Beklenti bilinçli olarak
düşük tutuluyor (bkz. bölüm 3).

| # | İş | Kullanıcı maliyeti | Gerçekçi getiri |
|---|---|---|---|
| 3.1 | **YouTube Shorts otomasyonunu bitir** — kod hazır, sadece 3 GitHub secret eksik (`YOUTUBE_CLIENT_ID/SECRET/REFRESH_TOKEN`). Tuzak: OAuth app "In production" olmalı, yoksa refresh token 7 günde ölür | ~20 dk, bir kez | Düşük ama batık maliyet ~0 |
| 3.2 | **Instagram Graph API ile otomatik post** — Business hesap + FB sayfa bağlanınca haftalık top-5 görseli API'den otomatik yayınlanabilir. Kodu ben yazarım | ~30 dk Meta app yetkilendirmesi, bir kez | Düşük-orta |
| 3.3 | TikTok Direct Post | ❌ **Yapılamaz** — audit onayı şart, elle yükleme gerekir | — |

### FAZ 4 — Sosyal olmayan ama gerçek dış trafik: atıf/backlink

Feed'lerden değil, **veri otoritesinden** gelen trafik. Moat gerçek: 10+ markette canlı fiyat
verisi var; folder siteleri sadece PDF yayınlıyor, "Lidl bu hafta AH'den ucuz mu" sorusuna
sayıyla cevap veremiyorlar.

- [ ] **🔴 GECİKMİŞ: One Broke Girl takip maili** — 26 Tem'de gönderildi, takip ~5 Ağustos
      planlanmıştı (`docs/outreach.md`), bugün 8 Ağustos. Tek mail, bir kez, sonra bırak.
      → **15 Ağustos: hâlâ gönderilmedi, gecikme 10 gün.** Gmail'den doğrulandı.
- [ ] **🔴 sparenenbesparen.nl hiç ulaşmamış** — 26 Tem gönderimi `550 No such recipient`
      ile **bounce** etti (Gmail'de doğrulandı, 2026-08-15'te fark edildi). Adres yanlış
      veya kapanmış; alternatif adres bulunmadıkça bu hedef listeden düşer.
- [ ] Mr FOB için alternatif iletişim kanalı (contact sayfası 404)

> **Outreach bilançosu (2026-08-15, Gmail'den doğrulandı):** 4 gönderim
> (dejongebelegger.nl + sante.nl 16 Tem, One Broke Girl + sparenenbesparen 26 Tem)
> → **1 bounce, 0 yanıt, 0 takip.** Kanal şu ana kadar sonuç üretmedi.
- [ ] Fiyat geçmişi verisi güvenilir hale gelince (%87 kayıt maat bilgisi eksik) yeni bir
      outreach dalgası — **o güne kadar prijsgeschiedenis pitch'i yapılmayacak**

---

## 5. Bilinçli olarak YAPILMAYACAKLAR

| Şey | Neden |
|---|---|
| Elle IG/TikTok içerik takvimi | 0 saat/hafta kısıtıyla sürdürülemez; başlayıp bırakmak hesabı ölü bırakmaktan kötü |
| Pepper.nl / Facebook grup / Reddit paylaşımı | En yüksek getirili sosyal seçenek ama **insan zamanı şart**; otomatikleştirilirse ban riski. Zaman bütçesi değişirse ilk buraya bakılır |
| Marka sorgusu title optimizasyonu | 3 kez veriyle çürütüldü |
| Yeni karşılaştırma yazısı üretimi | Sorgu hacmi olmadan yazmak 2026-08-01'de çürütüldü |
| Ücretli reklam | Gelir henüz akmıyor (AdSense onaylı ama RPM ölçülmedi); pozitif ROI varsayımı yok |

---

## 6. Bir sonraki ölçüm

**~21 Ağustos** (Faz 1 penceresinin sonu): taze GSC export + Clarity çekimi.

> **Üç soru 2026-08-15'te revize edildi** (gerekçe: `docs/analiz-2026-08-15.md`).
> Panellere ajan erişimi yok — GSC export'unu ve Clarity çekimini kullanıcı almalı.

1. **Lidl'deki hareket diğer market sayfalarına yayıldı mı?**
   Yayıldıysa evergreen fix çalışıyor ve market sayfası yüzeyi "kazanılamaz"
   kategorisinden çıkar. Yayılmadıysa Lidl tekil bir SERP olayıydı.
2. **Tıklama/gün 5,5'ten yukarı devam etti mi?**
   TO **kasıtlı olarak bırakıldı**: Temmuz'da 111 sayfa ilk kez gösterim aldı
   (Haziran'da 23), payda şişti ve TO mekanik olarak sulandı. Aynı dönemde
   tıklama/gün kesintisiz yükseliyor: **3,8 (Haz) → 4,6 (Tem) → 5,5 (son 28g).**
   Bu pencerede asıl gösterge tıklama/gün.
3. **Sayfa/oturum 1,0'dan kıpırdadı mı?** (iç linkleme + Faz 0 CTA'ları)
   Clarity'den; 9 Ağustos'tan beri ölçülmedi.

~~4. Tıklama başına kanal dağılımı / EPC~~ — hacim yetersiz, bkz. Faz 1 listesi.

## 7. 2026-08-15 turunda yapılanlar

Ölçüm beklemeden yapılabilecek "kayıp durdurma" işleri (roadmap'in kendi sırası:
önce kayıp durdurma, sonra ölçüm).

**A1 — Boş `/product/` sayfaları indeksten çıkarıldı.** 20 slug'ın tamamı canlı
ölçüldü: luiers 0 ürün/305 kelime, diepvries 0/302, shampoo 1/345, airfryer 2/377
(karşılaştırma: yoghurt 34/1.427). Bu sayfalar Google'a "Aanbieding Deze Week ✓
Vergelijk Alle Winkels" vaat edip "geen aanbiedingen gevonden" gösteriyordu,
`robots` meta yoktu ve sitemap'teydiler. `MIN_PRODUCTS_FOR_INDEX = 3` altındaysa
noindex + sitemap dışı. Sitemap 20→16. Sayfa ziyaretçiye açık kalıyor (deal-alert
CTA'sıyla), envanter dolunca kendiliğinden geri geliyor.

**A2 — Kategori sayfaları ölçüldü, temiz.** Aynı desen var mı diye bakıldı: en
düşük 36 kart (bakkerij). Değişiklik gerekmedi.

**Affiliate: 3 ölü hedef bulundu ve düzeltildi.** Tüm doğrudan mağaza URL'leri
tarandı (tracking linklerine dokunulmadan — çağırmak sahte tıklama üretirdi):
- Holland & Barrett: `/aanbiedingen` → **404** → `/shop/aanbiedingen/`
- BioProphyl: `.com` **sertifika uyuşmazlığı** (`*.your-server.de`) → tarayıcı
  güvenlik uyarısı gösteriyordu → `.be`
- Libelle Shop: `shop.libelle.nl` **DNS'te yok** → `winkelen.libelle.nl`

Doğru hedefler tahminle değil ağdan alındı: tracking linkini hedef parametresi
olmadan çağırınca ağ kendi kayıtlı landing page'ine yönlendiriyor. (Tahmin
tehlikeliydi: `bioprophyl.nl` denendi, **satılık park domain** çıktı.)

**Tek kaynak birleştirmesi.** Aynı satıcı iki yerde tanımlıydı (`AFFILIATE_MAP` +
widget `DEALS`) ve ortak kaynak değildi — yukarıdaki 3 hatanın 2'si tam bu
sapmadan doğdu. 56 örtüşen giriş `M('Ad')` ile map'ten okuyor; bilinmeyen isimde
**throw ediyor**, yani sapma artık sessiz ölü link değil build hatası.
Davranış koruması kanıtlandı: dönüşüm öncesi/sonrası **119/119 URL birebir aynı**.

**Kitle (bir hafta sonra, değişmedi):** push 1, bülten 1, favori 0, deal-alert 0.
