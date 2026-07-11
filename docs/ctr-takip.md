---
date: 2026-07-11
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

| Sorgu | İlgili değişiklik | Deploy | Baseline (2026-07-01 export) | Sonraki ölçüm |
|---|---|---|---|---|
| `aldi` | Dinamik title formülü + snippet güncellemesi (Google'ın yeni title'ı aldığı 07-01 export sırasında doğrulandı) | `0c98de7` civarı (07-04) | Gösterim 14.000/gün-toplam*, poz 7.8, TO %0.03 | — |
| `plus aanbiedingen` | Aynı title formülü ailesi | `0c98de7` civarı (07-04) | Gösterim 2968, poz 8.8, TO — | — |
| `dirk aanbiedingen` | Aynı title formülü ailesi | `0c98de7` civarı (07-04) | Gösterim 2478, poz 7.8, TO — | — |
| `bonus aanbiedingen` | AH "Bonus" markalaşması — `dealBrandTerm` eklendi, title artık "Albert Heijn Bonus Aanbiedingen Week N" | `0c98de7` (07-04) | Poz 15.8, gösterim — , TO — | — |
| `bonus aanbiedingen deze week` | Aynı AH Bonus fix | `0c98de7` (07-04) | Poz 16.4, gösterim — , TO — | — |
| `energie vergelijken` | `/energie` pilot sayfası + 3 blog yazısı canlıya alındı | `59e670c`, `d8e4d5a` (07-05) | Ölçülmedi (sayfa henüz yeniydi) | — |
| `aldi` (50% korting FAQ) | Aldi sayfası içerik güçlendirmesi (title/desc CTR opt + FAQ) | `bf4fac0` (~07-09) | — (bu değişiklik 07-01 export'undan sonra) | — |
| `bonus aanbiedingen` / `deze week` (AH içerik) | AH sayfası 'bonus aanbiedingen'/'deze week' hedefli içerik güçlendirme | `75a87f9` (~07-09) | — | — |
| `deal van de dag` / `goedkoper dan jumbo` | Lidl sayfası içerik güçlendirme | `ab3f3e7` (~07-09/10) | — | — |

\* "Gösterim 14.000/gün-toplam" ifadesi kaynak notta belirsiz bırakılmış (günlük mü, export dönemi toplamı mı netleşmedi) — bir sonraki export'ta netleştirilecek.

## Genel Trend (bağlam)

- Haziran başı ~240 gösterim/gün → Haziran sonu ~3.700 gösterim/gün (15x büyüme, kaynak: `Grafik.csv`, `PARA_KAZANMA_YOLHARITASI.md`'de kayıtlı)
- Buna rağmen TO hâlâ genel olarak %0.1–0.5 aralığında (07-05 tarihli site denetiminde tespit edildi) — asıl darboğaz gösterim değil, tıklama oranı

## Notlar

- Bu dosya 2026-07-11'de, önceki oturumlarda dağınık halde `devam-edilecekler.md` içine serpiştirilmiş GSC rakamlarını tek yerde toplamak için oluşturuldu.
- Baseline sütunundaki tüm rakamlar 2026-07-01 tarihli gerçek GSC export'undan alınmıştır (bkz. `devam-edilecekler.md` "GSC CTR analizi" maddesi, 07-01 tarihli bölüm).
- `—` işaretli hücreler o an ölçülmemiş demektir, 0 veya "değişmedi" anlamına gelmez.
