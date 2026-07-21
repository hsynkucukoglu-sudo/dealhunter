// Basit market-karşılaştırma eşleştiricisi — haftalık bülten için "Marktkampioen"
// bölümü. frontend-next/lib/similarity.ts'teki (buildComparisonGroups) isim-token
// eşleştirme mantığının backend'e taşınmış, sadeleştirilmiş halidir. Ayrı repo
// paketi olduğu için doğrudan import edilemiyor — bkz. o dosyadaki yorum, aynı
// kriterler burada da geçerli: sadece unitType her iki tarafta da varsa eşleştir,
// yoksa o çifti tamamen atla (fallback'siz — e-postada yanlış karşılaştırma
// göstermek canlı sayfadan çok daha riskli, düzeltme imkanı yok).

const STOP_WORDS = new Set([
  'de', 'het', 'een', 'van', 'per', 'in', 'op', 'en', 'of', 'met',
  'voor', 'bij', 'uit', 'aan', 'tot', 'als', 'ook', 'zijn', 'pak',
  'stuk', 'stuks', 'liter', 'gram', 'kilo', 'kg', 'ml', 'cl', 'set',
  'g', 'gr', 'l', 'dl',
])

const SIZE_RE = /\b\d+[,.]\d+\b|\b\d+[-\s]*(g|gr|ml|cl|dl|l|kg|kilo|x|stuks?|stuk|pack|pak|pck)\b/gi

function tokenize(name) {
  return name
    .replace(SIZE_RE, ' ')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
}

/**
 * Haftanın "marktkampioen"ini bulur: aynı ürünün marketler arasında en büyük
 * fiyat farkı olduğu grup. Sadece unitType her iki tarafta da bilinen ve
 * (varsa) pack-grootte birbirine yakın (%15 tolerans) ürünler eşleştirilir.
 * Minimum %15 fark şartı — e-postada öne çıkan içerik marjinal/gürültü bir
 * farkı "kampiyon" diye sunmasın.
 * @returns {{ name: string, cheapest: object, mostExpensive: object, savingPercent: number } | null}
 */
export function findWeeklyChampion(products) {
  const used = new Set()
  let best = null

  for (const seed of products) {
    if (used.has(seed.id) || !seed.unitType) continue
    const seedTokens = new Set(tokenize(seed.name))
    if (seedTokens.size < 2) continue

    const byMarket = new Map([[seed.market, seed]])
    for (const p of products) {
      if (p.id === seed.id || p.market === seed.market || used.has(p.id) || !p.unitType) continue
      if (p.unitType !== seed.unitType) continue
      if (seed.unitSize != null && p.unitSize != null) {
        const ratio = Math.max(seed.unitSize, p.unitSize) / Math.min(seed.unitSize, p.unitSize)
        if (ratio > 1.15) continue
      }
      const overlap = tokenize(p.name).filter((t) => seedTokens.has(t)).length
      if (overlap < 2) continue

      const existing = byMarket.get(p.market)
      const score = (x) => x.unitPrice ?? x.discountedPrice
      if (!existing || score(p) < score(existing)) byMarket.set(p.market, p)
    }

    const group = Array.from(byMarket.values())
    if (group.length < 2) continue
    group.forEach((p) => used.add(p.id))

    const score = (p) => p.unitPrice ?? p.discountedPrice
    const cheapest = group.reduce((a, b) => (score(a) < score(b) ? a : b))
    const mostExpensive = group.reduce((a, b) => (score(a) > score(b) ? a : b))
    const savingPercent = ((score(mostExpensive) - score(cheapest)) / score(mostExpensive)) * 100
    if (savingPercent < 15) continue

    if (!best || savingPercent > best.savingPercent) {
      best = { name: seed.name, cheapest, mostExpensive, savingPercent }
    }
  }

  return best
}
