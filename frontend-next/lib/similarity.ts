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
const SIZE_RE = /\b\d+[,.]\d+\b|\b\d+[-\s]*(g|gr|ml|cl|dl|l|kg|kilo|x|stuks?|stuk|pack|pak|pck)\b/gi

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

interface ProductMeta {
  unitType: string | null
  unitPrice: number | null
  unitSize: number | null
}

function getMeta(p: Product): ProductMeta {
  return p.unitType != null
    ? { unitType: p.unitType, unitPrice: p.unitPrice ?? null, unitSize: p.unitSize ?? null }
    : parseProductMeta(p.name, p.discountedPrice)
}

export interface MarketEquivalent {
  market: string
  product: Product
}

/**
 * Voor één product: het goedkoopste equivalent per andere supermarkt.
 * Zelfde matchcriteria als buildComparisonGroups (naam-tokens, unit type, pack-grootte),
 * maar voor een enkel seed-product tegen een kandidatenpool — gebruikt door de
 * winkelmandje-marktvergelijking (welke supermarkt is deze lijst het goedkoopst?).
 */
export function findMarketEquivalents(seed: Product, candidates: Product[]): MarketEquivalent[] {
  const seedTokens = new Set(tokenize(seed.name))
  if (seedTokens.size < 2) return []
  const seedMeta = getMeta(seed)

  const byMarket = new Map<string, Product>()
  for (const p of candidates) {
    if (p.id === seed.id || p.market === seed.market) continue
    const overlap = tokenize(p.name).filter(t => seedTokens.has(t)).length
    if (overlap < 2) continue

    const pMeta = getMeta(p)
    if (seedMeta.unitType && pMeta.unitType && seedMeta.unitType !== pMeta.unitType) continue
    if (seedMeta.unitType === 'stuks' && seedMeta.unitSize != null) {
      if (pMeta.unitType !== 'stuks' || pMeta.unitSize !== seedMeta.unitSize) continue
    }
    if (seedMeta.unitType && seedMeta.unitType !== 'stuks' && seedMeta.unitSize != null && pMeta.unitSize != null) {
      const ratio = Math.max(seedMeta.unitSize, pMeta.unitSize) / Math.min(seedMeta.unitSize, pMeta.unitSize)
      if (ratio > 1.15) continue
    }

    const existing = byMarket.get(p.market)
    const pScore = pMeta.unitPrice ?? p.discountedPrice
    const exScore = existing ? (getMeta(existing).unitPrice ?? existing.discountedPrice) : Infinity
    if (pScore < exScore) byMarket.set(p.market, p)
  }
  return Array.from(byMarket.entries()).map(([market, product]) => ({ market, product }))
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

  // tokenize() runs a few regexes per call — with an O(n²) comparison below,
  // recomputing it inside the inner loop meant ~n² regex passes (2M+ at
  // 1400 products). Precompute once per product so the inner loop is O(1) lookups.
  const tokenMap = new Map(products.map(p => [p.id, tokenize(p.name)]))

  for (const product of products) {
    if (used.has(product.id)) continue

    const tokens = new Set(tokenMap.get(product.id))
    if (tokens.size < 2) continue

    const seedMeta = metaMap.get(product.id)!
    const seedUnitType = seedMeta.unitType

    const matches = products.filter(p => {
      if (p.id === product.id || p.market === product.market || used.has(p.id)) return false
      const otherTokens = tokenMap.get(p.id)!
      const overlap = otherTokens.filter(t => tokens.has(t)).length
      if (overlap < 2) return false
      const pMeta = metaMap.get(p.id)!
      // Unit types must match when both are known (don't compare ml vs g)
      if (seedUnitType && pMeta.unitType && seedUnitType !== pMeta.unitType) return false
      // For countable products (stuks): require exact same count — 24 stuks ≠ 48 stuks
      if (seedUnitType === 'stuks' && seedMeta.unitSize != null) {
        if (pMeta.unitType !== 'stuks' || pMeta.unitSize !== seedMeta.unitSize) return false
      }
      // For liquid/weight (ml, g, l, kg): require near-equal pack size — 1L ≠ 2L
      // Without this, "savings" mix up absolute price across different volumes (e.g. 1L vs 2L milk)
      if (seedUnitType && seedUnitType !== 'stuks' && seedMeta.unitSize != null && pMeta.unitSize != null) {
        const ratio = Math.max(seedMeta.unitSize, pMeta.unitSize) / Math.min(seedMeta.unitSize, pMeta.unitSize)
        if (ratio > 1.15) return false
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

    // When the group is NOT unit-normalized (at least one product has no parseable
    // size, e.g. "Ariel of Lenor" or "Campina Melk"), the score falls back to raw
    // price. A large raw gap then almost always reflects different pack sizes
    // (1L vs 2L) rather than a genuine cross-market deal — skip it to avoid the
    // nonsensical "-11.91" / "-0.96" savings the compare bar showed before.
    const unitNormalized = group.every(p => metaMap.get(p.id)!.unitPrice != null)
    if (!unitNormalized && diffPercent > 40) continue

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

export interface BasketMarketTotal {
  market: string
  total: number
}

/**
 * Voor een winkelmandje: totaalbedrag per supermarkt als je exact dezelfde
 * lijst daar zou kopen (eigen items tegen eigen prijs, rest via findMarketEquivalents).
 * Een supermarkt zonder equivalent voor ALLE items wordt weggelaten — liever geen
 * vergelijking dan een misleidend te-laag totaal door ontbrekende producten.
 * Oplopend gesorteerd (goedkoopste eerst).
 */
export function compareBasketAcrossMarkets(
  cartItems: (Product & { quantity: number })[],
  catalog: Product[]
): BasketMarketTotal[] {
  if (cartItems.length === 0) return []

  const allMarkets = new Set(catalog.map(p => p.market))
  cartItems.forEach(i => allMarkets.add(i.market))

  // Per item: prijs per markt — eigen markt = eigen prijs, anders het goedkoopste equivalent
  const perItemPrices = cartItems.map(item => {
    const prices = new Map<string, number>([[item.market, item.discountedPrice]])
    for (const { market, product } of findMarketEquivalents(item, catalog)) {
      if (!prices.has(market)) prices.set(market, product.discountedPrice)
    }
    return prices
  })

  const totals: BasketMarketTotal[] = []
  for (const market of allMarkets) {
    let total = 0
    let complete = true
    for (let i = 0; i < cartItems.length; i++) {
      const price = perItemPrices[i].get(market)
      if (price == null) { complete = false; break }
      total += price * cartItems[i].quantity
    }
    if (complete) totals.push({ market, total })
  }

  return totals.sort((a, b) => a.total - b.total)
}
