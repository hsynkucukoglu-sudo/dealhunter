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

| Sorgu | İlgili değişiklik | Deploy | Baseline (2026-07-01 export) | Sonraki ölçüm (2026-07-12, GSC UI, 28 gün: 13 Haz–10 Tem) |
|---|---|---|---|---|
| `aldi` | Dinamik title formülü + snippet güncellemesi (Google'ın yeni title'ı aldığı 07-01 export sırasında doğrulandı) | `0c98de7` civarı (07-04) | Gösterim 14.000/gün-toplam*, poz 7.8, TO %0.03 | 15 tıklama / 37.815 gösterim / TO %0 (~0,04) / poz 8,2 — pozisyon hafif kötüleşti (7.8→8.2), TO aynı derecede düşük kaldı |
| `plus aanbiedingen` | Aynı title formülü ailesi | `0c98de7` civarı (07-04) | Gösterim 2968, poz 8.8, TO — | 0 tıklama / 3.066 gösterim / TO %0 / poz 8,9 — **sıfır tıklama** |
| `dirk aanbiedingen` | Aynı title formülü ailesi | `0c98de7` civarı (07-04) | Gösterim 2478, poz 7.8, TO — | 2 tıklama / 5.689 gösterim / TO %0 (~0,03) / poz 8,2 |
| `bonus aanbiedingen` | AH "Bonus" markalaşması — `dealBrandTerm` eklendi, title artık "Albert Heijn Bonus Aanbiedingen Week N" | `0c98de7` (07-04) | Poz 15.8, gösterim — , TO — | 0 tıklama / 185 gösterim / TO %0 / poz 15,2 — pozisyon hafif iyileşti (15.8→15.2) ama hâlâ sayfa 2, sıfır tıklama |
| `bonus aanbiedingen deze week` | Aynı AH Bonus fix | `0c98de7` (07-04) | Poz 16.4, gösterim — , TO — | 0 tıklama / 135 gösterim / TO %0 / poz 15,2 — pozisyon iyileşti (16.4→15.2), hâlâ sıfır tıklama |
| `energie vergelijken` | `/energie` pilot sayfası + 3 blog yazısı canlıya alındı | `59e670c`, `d8e4d5a` (07-05) | Ölçülmedi (sayfa henüz yeniydi) | Bu sorgu 28 günlük en-çok-gösterim listesinde görünmedi (düşük hacim, ayrı sorgu bazlı bakılmalı) |
| `aldi` (50% korting FAQ) | Aldi sayfası içerik güçlendirmesi (title/desc CTR opt + FAQ) | `bf4fac0` (~07-09) | — (bu değişiklik 07-01 export'undan sonra) | Yukarıdaki `aldi` satırına dahil — deploy'dan sadece birkaç gün geçmiş, henüz ayrıştırılamaz |
| `bonus aanbiedingen` / `deze week` (AH içerik) | AH sayfası 'bonus aanbiedingen'/'deze week' hedefli içerik güçlendirme | `75a87f9` (~07-09) | — | Yukarıdaki `bonus aanbiedingen` satırlarına dahil — henüz çok erken |
| `deal van de dag` / `goedkoper dan jumbo` | Lidl sayfası içerik güçlendirme | `ab3f3e7` (~07-09/10) | — | Bu sorgular 28 günlük en-çok-gösterim listesinde ayrı görünmedi, henüz erken |

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

## Genel Trend (bağlam)

- Haziran başı ~240 gösterim/gün → Haziran sonu ~3.700 gösterim/gün (15x büyüme, kaynak: `Grafik.csv`, `PARA_KAZANMA_YOLHARITASI.md`'de kayıtlı)
- Buna rağmen TO hâlâ genel olarak %0.1–0.5 aralığında (07-05 tarihli site denetiminde tespit edildi) — asıl darboğaz gösterim değil, tıklama oranı

## Notlar

- Bu dosya 2026-07-11'de, önceki oturumlarda dağınık halde `devam-edilecekler.md` içine serpiştirilmiş GSC rakamlarını tek yerde toplamak için oluşturuldu.
- Baseline sütunundaki tüm rakamlar 2026-07-01 tarihli gerçek GSC export'undan alınmıştır (bkz. `devam-edilecekler.md` "GSC CTR analizi" maddesi, 07-01 tarihli bölüm).
- `—` işaretli hücreler o an ölçülmemiş demektir, 0 veya "değişmedi" anlamına gelmez.
