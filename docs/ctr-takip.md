---
date: 2026-07-12
tags: [dealhunter, seo, gsc, ctr]
status: active
---

# CTR Takip — Title/Meta Değişikliklerinin Etkisi

Amaç: title/meta/içerik güçlendirmesi yapılan sorguların Search Console'daki pozisyon/gösterim/TO
değerlerini değişiklik öncesi ve sonrası karşılaştırmak. **Sadece gerçek GSC export verisi
girilir, tahmini/uydurma rakam yok** — bir hücre ölçülmediyse `—` olarak bırakılır.

## Nasıl güncellenir

1. Search Console → Performans → Sorgular sekmesinden yeni export al (`Downloads/...Performance-on-Search-YYYY-MM-DD.zip`)
2. Aşağıdaki tablodaki ilgili sorguyu bul, yeni Pozisyon/Gösterim/TO değerlerini "Sonraki ölçüm" sütununa ekle
3. Değişiklik anlamlıysa (pozisyon veya TO belirgin hareket ettiyse) kısa bir not düş, tarihi güncelle

## Sorgu Takip Tablosu

| Sorgu | İlgili değişiklik | Deploy | Baseline (2026-07-01 export) | 2026-07-12 ölçüm (28 gün: 13 Haz–10 Tem) | 2026-07-21 ölçüm (GSC UI export, 3 ay kümülatif: 21 Nis–18 Tem) |
|---|---|---|---|---|---|
| `aldi` | Dinamik title formülü + snippet güncellemesi (Google'ın yeni title'ı aldığı 07-01 export sırasında doğrulandı) | `0c98de7` civarı (07-04) | Gösterim 14.000/gün-toplam*, poz 7.8, TO %0.03 | 15 tıklama / 37.815 gösterim / TO %0 (~0,04) / poz 8,2 — pozisyon hafif kötüleşti (7.8→8.2), TO aynı derecede düşük kaldı | 15 tıklama / 38.001 gösterim / TO %0,04 / poz 8,17 — **3 aylık toplamla 28 günlük rakam neredeyse aynı**, yani tüm tıklamalar zaten o 28 günlük pencerede olmuş, öncesi/sonrası praktik olarak sıfır. Durum donmuş. |
| `plus aanbiedingen` | Aynı title formülü ailesi | `0c98de7` civarı (07-04) | Gösterim 2968, poz 8.8, TO — | 0 tıklama / 3.066 gösterim / TO %0 / poz 8,9 — **sıfır tıklama** | 0 tıklama / 3.266 gösterim / TO %0 / poz 9,01 — **3 ay boyunca kümülatif sıfır tıklama.** Artık şansa bağlanamaz, kanıtlanmış navigasyonel sorgu. |
| `dirk aanbiedingen` | Aynı title formülü ailesi | `0c98de7` civarı (07-04) | Gösterim 2478, poz 7.8, TO — | 2 tıklama / 5.689 gösterim / TO %0 (~0,03) / poz 8,2 | 3 tıklama / 7.598 gösterim / TO %0,04 / poz 8,3 — aynı donmuş durum |
| `bonus aanbiedingen` | AH "Bonus" markalaşması — `dealBrandTerm` eklendi, title artık "Albert Heijn Bonus Aanbiedingen Week N" | `0c98de7` (07-04) | Poz 15.8, gösterim — , TO — | 0 tıklama / 185 gösterim / TO %0 / poz 15,2 — pozisyon hafif iyileşti (15.8→15.2) ama hâlâ sayfa 2, sıfır tıklama | 0 tıklama / 339 gösterim / TO %0 / poz 14,55 — **3 ay boyunca kümülatif sıfır tıklama**, pozisyon marjinal iyileşmeye rağmen |
| `bonus aanbiedingen deze week` | Aynı AH Bonus fix | `0c98de7` (07-04) | Poz 16.4, gösterim — , TO — | 0 tıklama / 135 gösterim / TO %0 / poz 15,2 — pozisyon iyileşti (16.4→15.2), hâlâ sıfır tıklama | 0 tıklama / 263 gösterim / TO %0 / poz 14,41 — **3 ay boyunca kümülatif sıfır tıklama** |
| `lidl aanbiedingen` | (aynı aile, yeni bu turda ayrı takibe alındı) | — | — | — | 1 tıklama / 4.123 gösterim / TO %0,02 / poz 8,99 — `aldi`/`dirk`'ten bile daha düşük TO, aynı navigasyonel desen |
| `energie vergelijken` | `/energie` pilot sayfası + 3 blog yazısı canlıya alındı | `59e670c`, `d8e4d5a` (07-05) | Ölçülmedi (sayfa henüz yeniydi) | Bu sorgu 28 günlük en-çok-gösterim listesinde görünmedi (düşük hacim, ayrı sorgu bazlı bakılmalı) | `/energie` sayfası "Sayfa sayısı" raporunda 0 tıklama / 97 gösterim / poz 57,98 (3 ay) — hâlâ çok zayıf pozisyon, pilot henüz meyve vermedi |
| `aldi` (50% korting FAQ) | Aldi sayfası içerik güçlendirmesi (title/desc CTR opt + FAQ) | `bf4fac0` (~07-09) | — (bu değişiklik 07-01 export'undan sonra) | Yukarıdaki `aldi` satırına dahil — deploy'dan sadece birkaç gün geçmiş, henüz ayrıştırılamaz | Yukarıdaki `aldi` satırına dahil — 3 aylık toplamda hâlâ ayrıştırılamıyor, etki yok gibi görünüyor |
| `bonus aanbiedingen` / `deze week` (AH içerik) | AH sayfası 'bonus aanbiedingen'/'deze week' hedefli içerik güçlendirme | `75a87f9` (~07-09) | — | Yukarıdaki `bonus aanbiedingen` satırlarına dahil — henüz çok erken | Yukarıdaki satırlara dahil — 3 ay kümülatif hâlâ sıfır, bu içerik güçlendirmesi TO'yu değiştirmedi |
| `deal van de dag` / `goedkoper dan jumbo` | Lidl sayfası içerik güçlendirme | `ab3f3e7` (~07-09/10) | — | Bu sorgular 28 günlük en-çok-gösterim listesinde ayrı görünmedi, henüz erken | 3 aylık "En çok yapılan sorgular" listesinde de ayrı görünmüyor (düşük hacim) — ölçülemez durumda |

**🔴 Ana bulgu (2026-07-12, sayfa+cihaz+ülke kırılımıyla derinleştirilmiş analiz):**

Site geneli %0,2 TO bir **karışım yanılsaması** — tek bir sayfa tabloyu boğuyor:

*Sayfa kırılımı (28 gün):*
| Sayfa | Tıklama | Gösterim | TO |
|---|---|---|---|
| `/blog/albert-heijn-vs-jumbo-vs-lidl-wie-is-goedkoper` | 32 | 3.840 | %0,83 |
| `/` (ana sayfa, marka aramaları) | 27 | 174 | %15,5 |
| `/supermarkt/aldi` | 19 | 40.395 | %0,047 |
| `/supermarkt/dirk` | 9 | 7.655 | %0,12 |
| `/supermarkt/plus` | 1 | 4.091 | %0,024 |

- `/supermarkt/aldi` **tek başına tüm gösterimlerin %62'si** (40.395/65.200). Bu sayfa hariç site TO'su %0,39'a çıkıyor.
- Sorunlu sorgular iki farklı aileye ayrılıyor ve teşhis her biri için farklı:
  1. **Navigasyonel marka sorguları** (`aldi` 37.815 gösterim, `plus aanbiedingen` 3.066, `dirk aanbiedingen` 5.689, `lidl aanbiedingen` 966): toplam ~47.900 gösterim → 17 tıklama = **%0,036 TO**. Bu sorgularda kullanıcı resmî siteyi (aldi.nl, plus.nl) veya Reclamefolder tarzı devleri arıyor — title ne kadar iyi olursa olsun üçüncü parti bir aggregator'a tıklamıyor. Haftalarca süren title iterasyonlarının bu sorgularda hiçbir şey değiştirmemesi bunu doğruluyor. **Bu gösterim hacmi büyük ölçüde kazanılamaz — buraya daha fazla title/meta eforu harcamak verimsiz.**
  2. **Karşılaştırma/soru sorguları** (`lidl vs albert heijn` TO %14,3, `is de lidl goedkoper dan de jumbo` %10, `wie is goedkoper ah of jumbo` %7,1, `is lidl goedkoper dan ah` %5,3, `jumbo of albert heijn goedkoper` %2,9): düşük hacim ama **TO %3-14** — site bu niyette gerçekten tıklanıyor. En çok tıklanan sayfanın karşılaştırma blogu olması (32 tıklama) bu tezi doğruluyor.
- *Cihaz:* Mobil gösterimlerin %74'ü (48.339) ama mobil TO %0,14 vs masaüstü %0,28 — poz 8-10'un mobilde katlanma altında kaldığı tezini destekliyor, ama asıl ayrıştırıcı yukarıdaki niyet farkı.
- *Ülke:* %96 Hollanda — hedefleme sorunu yok.

**📌 Strateji çıkarımı:** Marka sorguları için title optimizasyonu durdurulmalı (kanıt: hiç işe yaramadı, niyet uyuşmuyor). Büyüme kaldıracı kanıtlanmış format olan **karşılaştırma/soru içeriği** — bu sorgu ailesinde hem TO yüksek hem pozisyonlar iyi (3-7). Yapılacak şey daha fazla gösterim kazanmak değil, tıklanabilir niyetteki sorgu yüzeyini büyütmek: yeni karşılaştırma yazıları, mevcut karşılaştırma yazılarının pozisyonunu yükseltme (iç linkleme + derinlik), `/vergelijk/` sayfalarını sorgu ailelerine hizalama.

\* "Gösterim 14.000/gün-toplam" ifadesi kaynak notta belirsiz bırakılmış (günlük mü, export dönemi toplamı mı netleşmedi) — bir sonraki export'ta netleştirilecek.

## 🔴 Ana bulgu (2026-07-21, GSC UI export, 3 ay kümülatif: 21 Nisan–18 Temmuz, sadece Web arama türü)

**12 Temmuz teşhisi 3 aylık pencerede doğrulandı, artık şansa bağlanamaz:** `plus aanbiedingen` (3.266 gösterim), `bonus aanbiedingen` (339), `bonus aanbiedingen deze week` (263) — üçü de **3 ay boyunca kümülatif sıfır tıklama**. `aldi`/`dirk aanbiedingen`'in 28 günlük ve 3 aylık rakamları neredeyse birebir aynı — yani gösterilen tüm tıklamalar zaten o 28 günlük pencerede olmuş, tablo donmuş durumda. Haftalarca sürdürülen title/meta iterasyonunun bu sorgu ailesinde ölçülebilir hiçbir etkisi yok.

**Yeni bulgu — cihaz kırılımı (3 ay):**

| Cihaz | Tıklama | Gösterim | TO | Poz |
|---|---|---|---|---|
| Masaüstü | 122 | 22.345 | %0,55 | 12,3 |
| Mobil | 165 | 62.095 | %0,27 | 8,8 |
| Tablet | 10 | 3.567 | %0,28 | 8,77 |

Masaüstü TO'su mobilin **2 katı (%0,55 vs %0,27) — pozisyonu daha kötü olmasına rağmen (12,3 vs 8,8)**. Bu, 12 Temmuz'daki "mobilde pozisyon 8-10 katlanma altında kalıyor" tezini güçlendiriyor: mobil SERP'te marka aramalarında (aldi, plus aanbiedingen) Google muhtemelen resmi site linkini/site-links'i/knowledge panel'i daha agresif öne çıkarıyor, organik sonuç ekranın daha da altına düşüyor. Masaüstünde bu sıkışma daha az.

**Yeni bulgu — sayfa bazlı (3 ay, tam liste):** Karşılaştırma/blog sayfaları tekrar en yüksek TO'lu grup: `is-kruidvat-goedkoper-dan-etos` (%1,39, poz 5,77), `albert-heijn-vs-jumbo-vs-lidl-wie-is-goedkoper` (%0,82, poz 6,87, 48 tıklama — hâlâ site lideri), `is-jumbo-goedkoper-dan-albert-heijn` (%0,66), `is-lidl-goedkoper-dan-albert-heijn` (%4,26), `is-plus-goedkoper-dan-jumbo` (%5). Buna karşılık supermarkt sayfaları aynı düşük bantta donmuş: aldi %0,05, dirk %0,13, lidl %0,1, plus %0,08. **Ama:** `/vergelijk/` otomatik-kombinasyon sayfalarının çoğu (jumbo-vs-lidl, lidl-vs-aldi, jumbo-vs-hoogvliet vb.) hâlâ 0 tıklama — yalnızca birkaç spesifik ikili (albert-heijn-vs-dekamarkt, -vs-kruidvat, dirk-vs-vomar, dirk-vs-hoogvliet, dirk-vs-plus) tıklama alıyor, hepsi 1'er tıklamalık küçük örneklem. Sonuç: "karşılaştırma formatı işliyor" doğru ama sadece **blog yazısı** formatında güçlü kanıtlanmış; otomatik `/vergelijk/` sayfaları için kanıt hâlâ zayıf/gürültülü.

**Yeni bulgu — `/energie` pilot sayfası zayıf:** 97 gösterim / 0 tıklama / poz 57,98 (3 ay) — mayısta başlayan pilot hâlâ ilk sayfaya bile giremiyor, "kanıtlanmış format" listesine henüz girmedi.

**Yeni bulgu — arama görünümü:** Ürün rich snippet'leri (Product schema) sadece 620 gösterim/1 tıklama/poz 13,89 topluyor — hacim çok küçük, henüz anlamlı bir kanal değil.

**Genel trend güncellemesi (`Grafik.csv`, günlük, 21 Nis–18 Tem):** Gösterim eğrisi 22 Haziran'da zirve yaptı (9.670/gün) ve o zamandan beri kademeli düşüşte — 18 Temmuz'da 1.872/gün (zirveden ~%80 düşüş). **Ama TO aynı dönemde tersine iyileşiyor:** 22-30 Haziran arası TO %0,09-0,15 bandındayken, 12-17 Temmuz arası %0,28-0,47 bandına çıktı (18 Temmuz'da %0,21'e geriledi). Bu, 12 Temmuz'dan beri yapılan iç linkleme + karşılaştırma içeriği önceliklendirmesiyle zaman olarak örtüşüyor — **erken ama olumlu bir sinyal**, gösterim hacmi düşerken TO'nun yükselmesi "daha az ama daha niyetli trafik" tezini destekliyor. Kesin sonuç için birkaç hafta daha izlenmeli.

**📌 Strateji çıkarımı güncellemesi:** 12 Temmuz kararı (marka sorgusu title optimizasyonunu bırak, karşılaştırma içeriğine odaklan) 3 aylık veriyle doğrulandı — değiştirilmiyor. Ek olarak: (1) mobil-masaüstü TO farkı yeni bir araştırma konusu olabilir (SERP özellik sıkışması), ama düşük öncelik; (2) `/vergelijk/` otomatik sayfalarının "kanıtlanmış format" sayılması için henüz erken, sadece blog yazıları güvenilir kanıt taşıyor; (3) `/energie` pilotu 2,5 aydır sonuç vermiyor — reizen/mode'a aynı şablonu uygulama kararı bu veriyle ertelenmeli, önce `/energie`'nin neden çalışmadığı anlaşılmalı (muhtemelen: gerçek fiyat verisi yok, sadece editoryal içerik — market sayfalarının aksine canlı taranmış veri avantajı burada yok).

## Genel Trend (bağlam)

- Haziran başı ~240 gösterim/gün → 22 Haziran zirve ~9.670/gün (15x+ büyüme, kaynak: `Grafik.csv`, `PARA_KAZANMA_YOLHARITASI.md`'de kayıtlı) → 18 Temmuz itibarıyla ~1.872/gün'e geriledi (zirveden -%80)
- TO genel olarak %0.1–0.5 aralığında dalgalanıyor (07-05 tarihli site denetiminde tespit edildi), ama 12-17 Temmuz'da %0,28-0,47 bandına çıkan bir iyileşme sinyali var (yukarıya bkz.) — asıl darboğaz hâlâ gösterim değil, tıklama oranı, ama bu oran son 2 haftada hafif düzeliyor olabilir

## Notlar

- Bu dosya 2026-07-11'de, önceki oturumlarda dağınık halde `devam-edilecekler.md` içine serpiştirilmiş GSC rakamlarını tek yerde toplamak için oluşturuldu.
- Baseline sütunundaki tüm rakamlar 2026-07-01 tarihli gerçek GSC export'undan alınmıştır (bkz. `devam-edilecekler.md` "GSC CTR analizi" maddesi, 07-01 tarihli bölüm).
- 2026-07-21 sütunu kullanıcının paylaştığı GSC UI export'undan (Arama görünümü/Cihazlar/Filtreler/Grafik/Sayfa sayısı/Sorgular/Ülkeler.csv, filtre: Web + Son 3 ay, aralık 2026-04-21–2026-07-18) alınmıştır — **kümülatif 3 aylık rakamlardır, 28 günlük pencerelerle doğrudan toplanamaz**, sadece karşılaştırma/trend amaçlı okunmalıdır.
- `—` işaretli hücreler o an ölçülmemiş demektir, 0 veya "değişmedi" anlamına gelmez.
