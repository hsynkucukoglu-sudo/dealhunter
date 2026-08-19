# Günlük Takip

> `node scripts/gunluk-metrik.mjs` ile otomatik yazılır; her sabah Windows Görev Zamanlayıcı çalıştırır.
> Buraya yalnızca ölçülen sayı girer — yorum ve strateji analiz dokümanlarına yazılır.

## 2026-08-18

### Clarity
| Pencere | Oturum | Sayfa/ot | Kaydırma | Etkin süre | Geri dönen | Giden tık | Arama |
|---|---|---|---|---|---|---|---|
| Dün | 20 | 1 | 30% | 1,4 dk. | 0 | 2 | — |
| 7 gün | 116 | 1.06 | 31.85% | 52 sn | 0 | 7 | 2 |
| 30 gün | 640 | 1.02 | 31.94% | 33 sn | 0 | 31 | 10 |

### GSC
Dizine eklenen **168** · eklenmeyen **108** (noindex 32 · robots 32 · keşfedildi 29 · tarandı 8 · kopya 3)

28 gün: tıklama **141** · gösterim **60,4 B** · TO 0,2 · konum 9,8

### AdSense
bugün €0,10 · dün €0,08 · son 7 gün €0,41 · bu ay €1,18 (hesap /u/0)

## 2026-08-19

### Clarity
| Pencere | Oturum | Sayfa/ot | Kaydırma | Etkin süre | Geri dönen | Giden tık | Arama |
|---|---|---|---|---|---|---|---|
| Dün | 24 | 1.29 | 30.84% | 53 sn | 0 | 1 | — |
| 7 gün | 105 | 1.07 | 32.5% | 56 sn | 0 | 7 | 2 |
| 30 gün | 589 | 1.01 | 32.54% | 35 sn | 0 | 28 | 10 |

### GSC
Dizine eklenen **168** · eklenmeyen **108** (noindex 32 · robots 32 · keşfedildi 29 · tarandı 8 · kopya 3)

28 gün: tıklama **141** · gösterim **60,4 B** · TO 0,2 · konum 9,8

### AdSense
bugün €0,00 · dün €0,10 · son 7 gün €0,45 · bu ay €1,18 (hesap /u/0)

---

## Okuma notları (19 Ağustos)

**İlk gün-üstü-gün karşılaştırma.** Yorum buraya değil `analiz-2026-08-15.md`'ye
yazılır; burada yalnızca veriyi doğru okumak için gereken uyarılar durur.

### Beklenen hareketler — alarm değil

| Gözlem | Sebep |
|---|---|
| 30 gün oturum 640 → 589 (−51) | Bot kapısı (`3139c4d`). Trafik kaybı değil, temizlik. Düşüş ~94'e kadar sürer. |
| Geri dönen kullanıcı hâlâ 0 | Clarity çerezi 18 Ağu akşamı düzeldi. Birinin "geri dönen" sayılması için düzeltmeden **sonra** gelip **tekrar** gelmesi gerekir. Anlamlı okuma 1-2 hafta sonra. |
| GSC sayıları sabit | GSC dizin raporu haftalık gecikmeli. `/go` düzeltmesi (`53c4717`) ~26 Ağustos'ta görünür. |
| AdSense "bugün €0,00" | Gün başındaysa normal; panel gün içinde dolar. |

### ✅ Test trafiği kirliliği: ölçüldü, sorun değil

18 Ağustos'ta canlı sitede onlarca Puppeteer testi yapıldı ve hepsi ana sayfaya
gidiyordu. Şüphe: kendi trafiğimiz sayfa/oturum'u şişirmiş olabilir mi?

**Hayır.** O gün Clarity'de ana sayfa **yalnızca 4 görüntüleme** aldı ve
**63 oturum bot olarak elendi** — Clarity'nin bot tespiti headless Chrome'u
yakalamış. Sayfa/oturum hareketi gerçek okurlardan geliyor:

| Sayfa | Görüntüleme |
|---|---|
| `/blog/albert-heijn-vs-jumbo-vs-lidl-wie-is-goedkoper` | **8** |
| `/blog/is-lidl-goedkoper-dan-albert-heijn` | **5** |
| `/` | 4 |
| 9 sayfa daha | 1'er |

Yine de kural: canlı siteye giden test script'leri `clarity.ms` isteğini iptal
etsin (bkz. hafıza notu `canli-test-trafigi`). Bot tespiti bir savunma ama
güvenilecek bir savunma değil.

### Dikkat çeken

- **Dün sayfa/oturum 1,00 → 1,29.** Bu metriğin ilk kez 1,0x'ten çıkışı. Örneklem
  24 oturum — zayıf ama gerçek bir sinyal, test kirliliği değil.
- Trafiğin yarısı iki karşılaştırma blog yazısında (8+5 / ~26 görüntüleme).
  GSC'de karşılaştırma sorgularının en yüksek TO'lu grup olması bulgusuyla
  tutarlı.
- Kaydırma iki bağımsız pencerede de +0,6 puan (7g %32,5 · 30g %32,5).
