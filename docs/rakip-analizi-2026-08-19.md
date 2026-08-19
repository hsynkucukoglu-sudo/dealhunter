---
tags: [dealhunter, rakip, seo, strateji]
---

# Rakip analizi — 2026-08-19

10 Ağustos analizinin devamı. O gün **ölçek** karşılaştırılmıştı (folderz ~590.000
URL ↔ bizde 110). Bugünkü soru farklı: **hangi sorgularda gerçekten para var ve
o sorgularda kim duruyor.**

---

## 1. Rakiplerin içerik mimarisi — doğrudan ölçüldü

Dört rakibin ana sayfası ve sitemap'i çekildi, ilk seviye bölümler sayıldı:

| Site | Üst bölümler | Karşılaştırma bölümü |
|---|---|---|
| **folderz.nl** | `aanbiedingen` (51), `winkels` (44), favorieten, mijn-lijstje | **yok** |
| **reclamefolder.nl** | DPG Media privacy gate ardında | **yok** |
| **allefolders.nl** | `categorieen` (16), mağaza bazlı aanbiedingen | **yok** |
| **yenom.nl** | `Wat-kan-ik-besparen`, `wat-eten-we-vanavond`, budget-recepten | **yok** (1 genel sayfa) |

Sitemap indekslerinde de `vergelijk` / `versus` / `-vs-` desenli tek URL çıkmadı.
yenom'daki üç eşleşme haber yazısı (*"eieren duurder en biologischer"*), fiyat
karşılaştırması değil.

**Sonuç: market-karşılaştırma nişini dört rakibin hiçbiri kapsamıyor.**

---

## 2. Kendi sorgularımız — iki ayrı oyun

GSC'nin tıklamaya göre ilk 10 sorgusu (bu satırlar export'ta temiz, birebir):

| Sorgu | Tık | Gösterim | TO | Konum |
|---|---:|---:|---:|---:|
| jumbo vs albert heijn | 3 | 130 | **%2,3** | 4,8 |
| lidl dagaanbieding | 2 | 46 | **%4,3** | 3,5 |
| is ah duurder dan jumbo | 2 | 21 | **%9,5** | 5,8 |
| aldi offers | 2 | 4 | %50 | 7,5 |
| — | | | | |
| lidl aanbiedingen | 1 | **9.183** | %0 | 8,4 |
| aldi | 1 | **6.100** | %0 | 8,6 |
| dirk aanbiedingen | 1 | **2.612** | %0 | 9,3 |
| aanbiedingen lidl | 2 | **2.296** | %0,1 | 8,7 |

(marka sorguları `dealhunter` / `deal hunter` çıkarıldı)

Tablo ikiye ayrılıyor ve ayrım keskin:

**Oyun 1 — baş terimler.** Dört sorgu tek başına **20.191 gösterim**, toplam
**5 tıklama**. Konum 8-9: birinci sayfanın dibi. Önümüzde marketlerin kendi
siteleri + folderz (590k sayfa) + reclamefolder (DPG Media) var. Bu bir TO
sorunu değil — **yanlış cephe**. Ölçekle kazanılan bir yerde ölçeğimiz yok.

**Oyun 2 — karşılaştırma sorguları.** Hacim küçük ama TO **20-90 kat** yüksek
ve konum 3-6. Üstelik §1'e göre bu alan **savunmasız**.

---

## 3. Başlıklarımız zaten doğru

Şüphelendim, kontrol ettim: `posts.ts` başlıkları sorgu metniyle birebir
örtüşüyor —

- sorgu `is jumbo goedkoper dan ah` → başlık *"Is Jumbo Goedkoper dan AH? ✓ Vergelijking met Lidl 2026"*
- sorgu `is lidl goedkoper dan albert heijn` → *"Is Lidl Goedkoper dan Albert Heijn? ✓ Vergelijking 2026"*

Yani karşılaştırma tarafında düzeltilecek bir başlık/niyet uyumsuzluğu yok.
İçerik hazır ve doğru konumda duruyor.

---

## 4. Doğrulanamayanlar — açıkça

| Şey | Durum |
|---|---|
| **Canlı SERP'te üstümüzde kim var** | ❌ Google **HTTP 429** verdi ("ongebruikelijk verkeer"). Bu IP'den otomatik SERP çekimi yok. Sıralama iddiası yazmadım. |
| Baş terim dışı ince TO kırılımı | ❌ GSC export'unun 1000 satırından yalnızca 10'u tab ayrılmış; kalanında tıklama/gösterim rakamları **yapışık** ve çoğu satırda bölünme tek anlamlı değil. Bu veriden TO karşılaştırması çıkarmadım. |

Temiz kırılım gerekirse GSC'den **CSV export** almak gerekiyor (panelden elle,
oturum otomasyona kapalı).

---

## 5. Ne çıkıyor

**Bırakılacak:** baş terimlerde sıra kovalamak. Ayda 20.000 gösterim alıp
5 tıklama veren bu alan, ölçek farkı kapanmadan dönmez ve ölçek farkı kapanmaz.

**Korunacak:** karşılaştırma nişi. Rakipsiz, TO'su 20-90 kat iyi, içeriği
hazır. Ama **büyüme motoru değil** — 91 karşılaştırma niyetli sorgu varyantının
toplam hacmi ~1.500 gösterim/ay. Mükemmel %8 TO'da bile ~120 tıklama eder.

**Değişmeyen sonuç:** trafik açığını (€100/ay için ~47 kat) arama kapatmıyor.
Kapatacak olan dağıtım — WhatsApp / Telegram / Shorts hattı, ki o zaten kurulu
ve kullanıcı tarafındaki secret'ları bekliyor (`dagitim-otomasyonu-plani.md`).

Bu analizin katkısı bir büyüme fikri değil, bir **eleme**: baş terim SEO'suna
harcanacak emek boşa gider, karşılaştırma nişi ise korunmaya değer bir hendek.
