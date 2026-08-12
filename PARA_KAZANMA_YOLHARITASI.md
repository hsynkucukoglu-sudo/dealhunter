# DealHunter — Para Kazanma Yol Haritası

**Site:** https://www.dealhunter4u.nl
**Güncelleme:** 11 Ağustos 2026 (5 Temmuz sürümü ölçümle çürüdü, yeniden yazıldı)

---

## 🔴 Önce dürüst tablo: Ağustos projeksiyonu tutmadı

5 Temmuz'daki plan Ağustos için **€50-150/ay** öngörüyordu. Ağustos geldi. Gerçek:

| Varsayım (5 Tem) | Gerçek (11 Ağu) |
|---|---|
| "TO %1'e çıktı, 30-50 tık/gün" | **TO %0,3 — 5,5 tık/gün** |
| "AdSense onaylı, gelir akıyor" | Onaylı ✅ ama **kimlik doğrulama yapılmadı → €0 ödeme** |
| "energie 1-2 switch" | `/energie` GSC ilk 21 sayfada **yok**, trafik ~0 |
| **€50-150/ay** | **fiilen €0** |

Sapma ~20 kat. Sebebi hesap hatası değil, **projeksiyonun olmayan trafiği varsayması.**

---

## 📐 Gelir aritmetiği — neden her kanal şu an rounding error

Ölçülmüş girdiler (GSC 28 gün + Clarity 7 gün, 11 Ağustos):

- Organik tıklama: **155 / 28 gün** = 5,5/gün
- Sayfa/oturum: **1,0** → gösterim başına ~1 sayfa
- Toplam oturum (bot hariç): ~134/hafta ≈ 560/ay — ama **%16'sı** `/contact`, `/contact-us`, `/privacy` yani affiliate uyum tarayıcıları → gerçek insan ~470/ay
- Giden tıklama: 134 oturumun **8'i** (%6) → ~28 giden tıklama/ay

Bundan çıkan tavan:

| Kanal | Hesap | Aylık |
|---|---|---|
| AdSense | 470 sayfa görüntüleme × €5-15 RPM | **€2 – €7** |
| Süpermarket linkleri | 28 giden tıklamanın çoğu | **€0** — `network: 'direct'`, komisyon yok (13 giriş) |
| MeerBesparen widget (129 merchant) | kalan birkaç tıklama | **ölçülmedi, muhtemelen €0-2** |
| Energie/telecom (yüksek birim) | trafik yok | **€0** |

**Sonuç: mevcut trafikle üst sınır ~€10/ay.** Bu, monetizasyon yüzeyi eksikliğinden
değil, trafikten kaynaklanıyor.

---

## ⚠️ Yol haritasının asıl kusuru

**Bu, trafiği olan bir sitenin planı.** Faz A/B/C sıralaması mantıklı ama gizlediği
şey şu: gelirin üç çarpanı var — **trafik × dönüşüm × ödeme** — ve trafik diğer
ikisinden 2-3 kat büyüklük mertebesinde geride. Yeni merchant, yeni dikey, yeni
widget eklemek bu denklemde **sıfırla çarpılıyor.**

Kurulu olan yüzeyler: AdSense (5 slot), 129 merchant widget, 86 affiliate girişi,
energie/telecom/verzekering dikeyleri, Bol.com, Flink, maaltijdbox. **Eksik olan
yüzey değil.**

> **Karar: monetizasyon yüzeyine yeni bir şey EKLENMEYECEK.** Trafik hareket edene
> kadar bu alandaki her yeni iş negatif beklenen değere sahip — geliştirme zamanı
> yiyor, sayfa ağırlaştırıyor ve ölçülemiyor.

---

## ✅ Hâlâ geçerli olan yapısal içgörü

> **Süpermarket içeriği = trafik motoru. Para = o trafiği yüksek komisyonlu
> dikeylere ve reklama çevirmek.**

AH/Jumbo/Lidl vb. hepsi `network: 'direct'` — Hollanda'da süpermarketlerin affiliate
programı yok. Bu değişmedi ve doğru. Sadece sırası önemli: **önce trafik, sonra
çevirme.**

---

## 🗺️ Şimdi ne yapılacak

### 1. AdSense kimlik doğrulama — tek gerçek monetizasyon işi
Reklamlar yayında, gösterim birikiyor, ama kimlik doğrulama yapılmadan **ödeme
yapılmıyor**. Getirisi bugün €2-7/ay, yani küçük — ama maliyeti 10 dakika ve eşiğe
gelindiğinde zaten şart. **Kullanıcı işi, panel erişimi gerekiyor.**

### 2. EPC ölçüldü ✅ (11 Ağustos, ilk veri)

`click_events` 7 Ağustos'tan beri topluyor. İlk 5 günün tamamı:

| Kanal | Hedef | Tıklama |
|---|---|---|
| market | Plus | 2 |
| market | Dirk | 2 |
| market | Vomar | 1 |
| market | Aldi | 1 |
| sponsor | `test-verify` | 1 — doğrulama tıklaması, gerçek kullanıcı değil |

**Gerçek kullanıcı tıklaması: 6.** Sıfır olanlar: `sponsor` (129 merchant), `share`,
`whatsapp`, `flink`, `blog`.

**Yorum sınırı:** 6 tıklama, kendi kuralımızın (20 tıklama) çok altında. Merchant
düzeyinde "widget değersiz" sonucu **çıkarılamaz**.

**Ama yapısal olarak söylenebilecek:** ölçülen giden tıklamaların **%100'ü komisyon
ödemeyen hedeflere** gitti. Bu artık varsayım değil, first-party ölçüm. Sonucu:
widget'ın tıklanma oranı 10 katına çıksa bile gelir €0 kalır — sorun tıklama hacmi
değil, **trafiğin ne istediği**. Bize gelen kullanıcı süpermarket fırsatı arıyor;
süpermarketler ödemiyor.

**Olumlu doğrulama:** izleme altyapısı çalışıyor (4 market, 4 ayrı gün, gerçek
kullanıcı trafiği).

**Karar noktası ~21 Ağustos:** 2 haftalık veriyle tekrar bak. Sponsor kanalı hâlâ
sıfırsa widget'ın sayfa ağırlığı/dikkat maliyeti tartışılır — o zaman veriyle.

### 3. Yeni merchant/dikey eklemeyi DONDUR
Daisycon/Awin onayları gelmeye devam edecek. Trafik hareket edene ve EPC verisi
oluşana kadar eklenmeyecek. (Kapanan programları temizlemek istisna — o bakım.)

### 4. Trafik tarafı zaten yol haritasında
Gelirin binding constraint'i orada: `docs/trafik-yolharitasi.md` ve
`docs/analiz-2026-08-09.md`. Faz 1 ölçümü **21 Ağustos**.

---

## 📊 Gerçekçi projeksiyon (yeniden yazıldı)

Eski tablo trafik varsayımı üzerine kuruluydu; bu sefer **eşik** olarak yazıyorum:

| Trafik eşiği | Aylık gelir bandı | Not |
|---|---|---|
| Bugün (~470 oturum/ay) | **€0-10** | AdSense doğrulaması yapılırsa €2-7 |
| 5.000 oturum/ay | €25-75 | AdSense + ilk widget satışları |
| 20.000 oturum/ay | €150-400 | + energie/verzekering lead'leri anlamlı olur |
| 50.000+ oturum/ay | €500-1.500 | + sponsored listing, media kit |

**Tarih vermiyorum.** Önceki sürümün hatası tarih vermekti; trafik ne zaman hangi
eşiğe gelir bilinmiyor, uydurmak yol haritasını çöpe çeviriyor.

---

## 🚫 Bilinçli olarak yapılmayacaklar

| Şey | Neden |
|---|---|
| Yeni merchant/dikey ekleme | Trafik hareket edene kadar sıfırla çarpılıyor |
| Premium üyelik (€1,99/ay) | Kitle **~0** (1 push, 1 bülten abonesi — ölçüldü 9 Ağu) |
| Media kit / sponsored listing | 20K+/ay trafik gerektirir, 470'teyiz |
| Play Store yayını ($25) | Kitle 0 iken dağıtım kanalı değil, bakım yükü |
| Bol.com ürün eşleştirme | Geliştirme maliyeti yüksek, mevcut trafikte ölçülemez |

---

## ✏️ 5 Temmuz sürümünden düzeltilenler

- ❌ "AdSense re-review bekliyor" → **29 Temmuz'da ONAYLANDI**; engel kimlik doğrulama
- ❌ "Aldi tek-sayfa bağımlılığı %64" → bağımlılık **Lidl'e kaydı (%43)**; ve
  gerçekleşen risk Google güncellemesi değil, o gösterimlerin **%0,1 TO'da** dönmesi
- ❌ "price_history kullanıcıya açılmadı" → **açıldı**; `PriceHistoryChart` ürün
  kartında, "Laagste prijs" rozeti canlı
- ❌ "Email/WhatsApp kitle boyutu bilinmiyor" → **ölçüldü: ~0** (1 push, 1 bülten)
- ❌ "Folderz/Reclamefolder'da OLMAYAN özellik" (fiyat verisi) → folderz'in **online
  teklif sayfalarında tam fiyat var** (10 Ağu ölçümü). Fiyat *geçmişi* grafiği hâlâ
  farklı olabilir ama "onlarda fiyat yok" iddiası kullanılamaz.
  Bkz. `docs/rakip-analizi-2026-08-10.md`
- ❌ Tarihli gelir projeksiyonu → **eşik tabanlı** projeksiyona çevrildi
