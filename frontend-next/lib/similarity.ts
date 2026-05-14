import { Product } from './types'
import { parseProductMeta } from './productMeta'

const STOP_WORDS = new Set([
  'de', 'het', 'een', 'van', 'per', 'in', 'op', 'en', 'of', 'met',
  'voor', 'bij', 'uit', 'aan', 'tot', 'als', 'ook', 'zijn', 'pak',
  'stuk', 'stuks', 'liter', 'gram', 'kilo', 'kg', 'ml', 'cl', 'set',
  // strip size tokens so "500g" vs "1kg" don't affect name matching
  'g', 'gr', 'l', 'cl', 'ml', 'dl',
])

// Size-like tokens: digits, units, pack patterns — strip before matching
const SIZE_RE = /\b\d+[,.]\d+\b|\b\d+(g|gr|ml|cl|dl|l|kg|kilo|x|stuks?|stuk|pack|pak|pck)\b/gi

function tokenize(name: string): string[] {
  return name
    .replace(SIZE_RE, ' ')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
}

export interface ComparisonGroup {
  name: string
  products: Product[]
  cheapest: Product
  unitType: string | null
}

export function buildComparisonGroups(products: Product[]): ComparisonGroup[] {
  const used = new Set<string>()
  const groups: ComparisonGroup[] = []

  // Pre-compute meta for all products
  const metaMap = new Map(
    products.map(p => [
      p.id,
      p.unitType != null
        ? { unitType: p.unitType, unitPrice: p.unitPrice ?? null, unitSize: p.unitSize ?? null }
        : parseProductMeta(p.name, p.discountedPrice),
    ])
  )

  for (const product of products) {
    if (used.has(product.id)) continue

    const tokens = new Set(tokenize(product.name))
    if (tokens.size < 2) continue

    const seedMeta = metaMap.get(product.id)!
    const seedUnitType = seedMeta.unitType

    const matches = products.filter(p => {
      if (p.id === product.id || p.market === product.market || used.has(p.id)) return false
      const otherTokens = tokenize(p.name)
      const overlap = otherTokens.filter(t => tokens.has(t)).length
      if (overlap < 2) return false
      const pMeta = metaMap.get(p.id)!
      // Unit types must match when both are known (don't compare ml vs g)
      if (seedUnitType && pMeta.unitType && seedUnitType !== pMeta.unitType) return false
      // For countable products (stuks): require exact same count — 24 stuks ≠ 48 stuks
      if (seedUnitType === 'stuks' && seedMeta.unitSize != null) {
        if (pMeta.unitType !== 'stuks' || pMeta.unitSize !== seedMeta.unitSize) return false
      }
      return true
    })

    if (matches.length === 0) continue

    const rawGroup = [product, ...matches]
    rawGroup.forEach(p => used.add(p.id))

    // One product per market — keep the cheapest unit price (or raw price as fallback)
    const byMarket = new Map<string, Product>()
    for (const p of rawGroup) {
      const pMeta = metaMap.get(p.id)!
      const existing = byMarket.get(p.market)
      if (!existing) {
        byMarket.set(p.market, p)
      } else {
        const existMeta = metaMap.get(existing.id)!
        const pScore = pMeta.unitPrice ?? p.discountedPrice
        const exScore = existMeta.unitPrice ?? existing.discountedPrice
        if (pScore < exScore) byMarket.set(p.market, p)
      }
    }
    const group = Array.from(byMarket.values())
    if (group.length < 2) continue

    // Determine shared unit type
    const groupUnitType = group.every(p => metaMap.get(p.id)!.unitType === seedUnitType) ? seedUnitType : null

    // Compare by unit price when available; otherwise raw price
    const score = (p: Product) => metaMap.get(p.id)!.unitPrice ?? p.discountedPrice
    const cheapest = group.reduce((a, b) => score(a) < score(b) ? a : b)
    const mostExpensive = group.reduce((a, b) => score(a) > score(b) ? a : b)

    const priceDiff = score(mostExpensive) - score(cheapest)
    const diffPercent = (priceDiff / score(mostExpensive)) * 100
    if (diffPercent < 5) continue

    groups.push({ name: product.name, products: group, cheapest, unitType: groupUnitType ?? null })
  }

  return groups
    .sort((a, b) => {
      const diffA = Math.max(...a.products.map(p => metaMap.get(p.id)!.unitPrice ?? p.discountedPrice)) -
                    Math.min(...a.products.map(p => metaMap.get(p.id)!.unitPrice ?? p.discountedPrice))
      const diffB = Math.max(...b.products.map(p => metaMap.get(p.id)!.unitPrice ?? p.discountedPrice)) -
                    Math.min(...b.products.map(p => metaMap.get(p.id)!.unitPrice ?? p.discountedPrice))
      return diffB - diffA
    })
    .slice(0, 5)
}
