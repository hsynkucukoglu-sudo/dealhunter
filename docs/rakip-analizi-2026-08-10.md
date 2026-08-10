---
date: 2026-08-10
tags: [dealhunter, rakip, analiz]
status: active
---

# Rakip Analizi — 2026-08-10

## ⚠️ Önce ölçüm sınırı

**Rakiplerin trafik kaynağı kırılımı (organik/direkt/sosyal) ÖLÇÜLEMEDİ.** O veri
Similarweb/Ahrefs/SEMrush gibi ücretli araçlardan gelir; elimizde yok. Aşağıdaki her
şey doğrudan gözlemle ölçüldü: sitemap sayımı, canlı sayfa çekimi, HTTP yanıtları.
Trafik dağılımı hakkında rakam verilmiyor — verilseydi uydurma olurdu.

---

## 1. Ölçek farkı — en çarpıcı bulgu

**folderz.nl sitemap yapısı (sayıldı):**

| Sitemap tipi | Dosya | Tahmini URL |
|---|---|---|
| `offers-sitemap-offline` | 102 | ~510.000 |
| `offers-sitemap-online` | 15 | ~75.000 |
| `stores-sitemap` | 1 | **1.146** |
| `store-location-cities` | 4 | — |
| `cities`, `product-keywords`, `flyers`, `categories`, `other` | 5 | — |
| **Toplam** | **128** | **~590.000** |

Doğrulama: `offers-sitemap-online-1.xml` tam **5.000 URL** içeriyor.

**Bizim sitemap: 110 URL.**

Yani ~5.400 kat. Stratejileri açık: **teklif başına bir sayfa** (programatik SEO),
URL deseni `/winkels/{magaza}/aanbiedingen/{urun-slug}-aanbieding-{id}/`. Üstelik
sadece süpermarket değil — 1.146 mağaza (bol.com, DA, Gall & Gall, Van Cranenbroek…).

---

## 2. 🔴 Kayıtlı "moat" iddiamız KISMEN YANLIŞ

`docs/ajan-kurallari.md` ve `docs/outreach.md`'de şu yazıyordu:

> "Folder siteleri sadece PDF yayınlıyor, ürün bazlı fiyat verisi veremezler."

**Ölçüm bunu çürüttü.** folderz.nl'in *online* teklif sayfasında tam fiyat verisi var:

```
Hozelock Compact Wandslanghouder
Geldig: 10 aug t/m 16 aug
€ 38,94  →  € 35,99
Je bespaart €2,95        [Voeg toe]
```

Nüans şu: sitemap ayrımı gerçek bir ürün ayrımı.
- **offline** (~510 B sayfa, %87): folder taramasından, çoğu fiyatsız — sadece
  "Nu in de aanbieding bij DA: … Actie geldig van 10-08 t/m 23-08" + "Bekijk folder"
- **online** (~75 B sayfa, %13): webshop teklifleri, **eski/yeni fiyat + tasarruf tutarı**

Yani "sadece PDF" iddiası offline taraf için doğru, online taraf için yanlış.
**Outreach ve basın metinlerinde bu iddiayı kullanma.** Savunulabilir fark:
süpermarket odağı + market-arası fiyat karşılaştırması, "fiyat verisi var/yok" değil.

---

## 3. reclamefolder.nl = DPG Media

Ana sayfa `myprivacy.dpgmedia.nl` onay kapısına yönlendiriyor. **DPG Media**
Hollanda'nın en büyük medya grubu (Volkskrant, AD, Parool, Trouw).

Bu, "head-term'leri kovalama" kararını **kalıcı olarak** doğruluyor. Rekabet ettiğimiz
şey bir folder sitesi değil, ulusal bir medya konglomerasının alan otoritesi ve
çapraz tanıtımı. `lidl aanbiedingen` (11.457 gösterim → 2 tıklama, konum 8,4)
sonucu bununla tutarlı.

---

## 4. Sayfa kalitesinde biz ÖNDEYİZ — sorun orada değil

Birebir karşılaştırma, Albert Heijn sayfası:

| | folderz.nl | biz |
|---|---|---|
| Title | `Albert Heijn aanbiedingen en acties` | `Albert Heijn Bonus Aanbiedingen Deze Week ✓ 378 Actuele Deals` |
| H1 | `Albert Heijn aanbiedingen` | benzer |
| Sayfadaki fiyatlı teklif | **26** | **378** |

Onların başlığında ne rakam var ne ✓ ne kanca. Buna rağmen head-term'lerde
önümüzdeler (2026-08-01 SERP ölçümü).

**Sonuç: fark sayfa kalitesinde değil, alan otoritesi + yüzey genişliğinde.**
Bu, başlık optimizasyonunun tavanının sanıldığından düşük olduğu anlamına geliyor —
TO iyileştirmesi hâlâ doğru iş ama head-term'lerde sıralama kazandırmayacak.

---

## 5. yenom.nl — tek farklılaşan rakip

Ana sayfa: *"WEEKMENU — Geen idee wat je moet eten? Ingrediënten met een linkje naar
de aanbiedingen"*

Folder listelemiyor; **haftalık yemek menüsü kuruyor ve malzemeleri o haftanın
indirimlerine bağlıyor.** Diğer dördünün hiçbirinde bu yok.

**Bu bir GÖZLEM, öneri değil.** Bizim için anlamlı olup olmadığını söylemek için
gereken veri elimizde yok: "weekmenu boodschappen" tipi sorguların hacmi ölçülmedi.
Öneriye dönüşmesi için önce GSC/anahtar kelime verisiyle hacim doğrulanmalı.

---

## 6. Teknik notlar

| Site | Durum |
|---|---|
| folderz.nl | **AWS WAF** arkasında — script/datacenter isteğine HTTP 202 + challenge. Gerçek tarayıcı şart |
| reclamefolder.nl | DPG onay kapısı (302) |
| allefolders.nl | `jafolders.com` beyaz etiket platformu üzerinde — muhtemelen çok ülkeli bir ağın parçası |
| yenom.nl | Erişim serbest |
| foldoo.app | 307 yönlendirme |

folderz'in mobil uygulaması var ("Download onze app"), yani organik dışı bir kanalları
da mevcut — büyüklüğü ölçülemedi.

---

## 7. Sonuç

1. **Ölçek yarışına girmeyeceğiz.** 590.000 sayfaya karşı 110 sayfayla programatik
   SEO yarışı kaybedilir; ayrıca 1.146 mağazanın verisi bizde yok.
2. **Head-term kararı kalıcı olarak doğrulandı** — karşımızda DPG Media var.
3. **"Sadece PDF yayınlıyorlar" iddiası düzeltilmeli** — outreach'te kullanılmamalı.
4. **Sayfa kalitesi bizde daha iyi** (378 vs 26 teklif); bu da darboğazın içerik
   değil otorite olduğunu gösteriyor.
5. Ölçülemeyen: trafik kaynağı kırılımı, uygulama trafiği, gerçek sıralamaları.
