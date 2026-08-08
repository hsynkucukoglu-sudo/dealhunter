---
date: 2026-08-08
tags: [dealhunter, trafik, sosyal-medya, seo, yol-haritasi]
status: active
---

# Trafik Analizi & Yol Haritası — 2026-08-08

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

> ⚠️ Henüz commit/deploy edilmedi.

### FAZ 1 — Deploy edilmiş fix'leri ölç (2-4 hafta, yeni iş başlatma)

Bunlar canlıda ama etkileri henüz ölçülmedi. Kendi kuralın: ölçmeden yeni iş başlatma.

- [ ] `064b899` — başlıklardan hafta numarası kaldırıldı (evergreen). **Market sayfası TO'su
      %0,07'den kıpırdadı mı?** Bu tek başına tablonun en büyük kalemi.
- [ ] `500c531` — `/vergelijk/` başlıkları "goedkoper" niyetiyle eşleştirildi
- [ ] `7fe29a8` — 5 vergelijk çifti index'e açıldı
- [ ] `cf5716a` — AH paket dedup (614→368); `/supermarkt/albert-heijn` pozisyonu (12,7)
      diğerlerine (8,5-9,0) yaklaştı mı?
- [ ] `788c9ad` — tıklama takibi; **~21 Ağustos'ta** `?days=14` ile EPC hesabı

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
- [ ] Mr FOB için alternatif iletişim kanalı (contact sayfası 404)
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

**~21 Ağustos** (Faz 1 penceresinin sonu + tıklama takibi 2 haftalık verisi):
taze GSC export + Clarity çekimi + `/api/track/stats?days=14`.

Bakılacak üç sayı:
1. `/supermarkt/*` TO'su %0,07'den yukarı kıpırdadı mı? (evergreen başlık fix'i)
2. Sayfa/oturum 1,02'den kıpırdadı mı? (iç linkleme + Faz 0 CTA'ları)
3. Tıklama başına kanal dağılımı — market mi, sponsor mu, Flink mi para getiriyor?
