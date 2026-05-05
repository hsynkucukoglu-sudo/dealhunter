import { Product } from './types'

const STOP_WORDS = new Set([
  'de', 'het', 'een', 'van', 'per', 'in', 'op', 'en', 'of', 'met',
  'voor', 'bij', 'uit', 'aan', 'tot', 'als', 'ook', 'zijn', 'pak',
  'stuk', 'stuks', 'liter', 'gram', 'kilo', 'kg', 'ml', 'cl', 'set',
])

function tokenize(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
}

export interface ComparisonGroup {
  name: string
  products: Product[]
  cheapest: Product
}

export function buildComparisonGroups(products: Product[]): ComparisonGroup[] {
  const used = new Set<string>()
  const groups: ComparisonGroup[] = []

  for (const product of products) {
    if (used.has(product.id)) continue

    const tokens = new Set(tokenize(product.name))
    if (tokens.size < 2) continue

    const matches = products.filter(p => {
      if (p.id === product.id || p.market === product.market || used.has(p.id)) return false
      const otherTokens = tokenize(p.name)
      const overlap = otherTokens.filter(t => tokens.has(t)).length
      return overlap >= 2
    })

    if (matches.length === 0) continue

    const group = [product, ...matches]
    group.forEach(p => used.add(p.id))

    const cheapest = group.reduce((a, b) => a.discountedPrice < b.discountedPrice ? a : b)
    const mostExpensive = group.reduce((a, b) => a.discountedPrice > b.discountedPrice ? a : b)

    // Fiyat farkı en az %5 olsun — anlamsız karşılaştırmalar çıkmasın
    const priceDiff = mostExpensive.discountedPrice - cheapest.discountedPrice
    const diffPercent = (priceDiff / mostExpensive.discountedPrice) * 100
    if (diffPercent < 5) continue

    groups.push({ name: product.name, products: group, cheapest })
  }

  // En fazla fiyat farkı olana göre sırala, ilk 5'i göster
  return groups
    .sort((a, b) => {
      const diffA = Math.max(...a.products.map(p => p.discountedPrice)) - Math.min(...a.products.map(p => p.discountedPrice))
      const diffB = Math.max(...b.products.map(p => p.discountedPrice)) - Math.min(...b.products.map(p => p.discountedPrice))
      return diffB - diffA
    })
    .slice(0, 5)
}
