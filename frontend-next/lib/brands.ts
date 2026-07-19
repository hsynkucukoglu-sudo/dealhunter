import { getProducts } from './api'
import type { Product } from './types'

// Common Dutch words that _extractBrand()'s capitalized-first-word fallback
// mistakes for brand names (e.g. "Hollandse aardbeien" -> "Hollandse").
// Keep lowercase; compared case-insensitively.
const BRAND_STOPWORDS = new Set([
  'alle', 'hollandse', 'nederlandse', 'verse', 'vers', 'rode', 'kies', 'royal',
  'roomboter', 'frambozen', 'jumbo', 'beste', 'extra', 'grote', 'kleine', 'nieuwe',
  'halve', 'hele', 'diverse', 'bio', 'witte', 'zwarte', 'gele', 'groene', 'blauwe',
  'div', 'stuks', 'div.', 'div',
])

// Below this many active deals a brand page is too thin to list in the sitemap
// or /merk index — but the page itself still renders (see MIN_DEALS_EXIST) so
// it doesn't flicker between 200 and 404 as daily scraped inventory dips below
// this bar, which was eroding Google's trust in the URL (GSC indexing test
// rejected /merk/milka when its count briefly dropped to 2, 2026-07-19).
const MIN_DEALS_SITEMAP = 5

// Below this many matches there's no brand identity to render at all (no name
// to derive). 1 is the real floor — any lower and the page has nothing to show.
const MIN_DEALS_EXIST = 1

export interface BrandInfo {
  slug: string
  name: string
  count: number
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function isRealBrand(raw: string): boolean {
  return raw.length > 0 && !BRAND_STOPWORDS.has(raw.toLowerCase())
}

export async function getBrandList(): Promise<BrandInfo[]> {
  const products = await getProducts()
  const counts = new Map<string, { name: string; count: number }>()

  for (const p of products) {
    const raw = (p.brand ?? '').trim()
    if (!isRealBrand(raw)) continue
    const slug = slugify(raw)
    if (!slug) continue
    const existing = counts.get(slug)
    if (existing) existing.count++
    else counts.set(slug, { name: raw, count: 1 })
  }

  return [...counts.entries()]
    .map(([slug, v]) => ({ slug, name: v.name, count: v.count }))
    .filter(b => b.count >= MIN_DEALS_SITEMAP)
    .sort((a, b) => b.count - a.count)
}

export interface BrandPageData {
  name: string
  products: Product[]
  marketCount: number
  cheapestMarket: string | null
  avgDiscount: number
}

export async function getBrandPageData(slug: string): Promise<BrandPageData | null> {
  const products = await getProducts()
  const matches = products.filter(p => {
    const raw = (p.brand ?? '').trim()
    return isRealBrand(raw) && slugify(raw) === slug
  })

  if (matches.length < MIN_DEALS_EXIST) return null

  const nameCounts = new Map<string, number>()
  matches.forEach(p => {
    const n = p.brand!.trim()
    nameCounts.set(n, (nameCounts.get(n) ?? 0) + 1)
  })
  const name = [...nameCounts.entries()].sort((a, b) => b[1] - a[1])[0][0]

  const marketBestDiscount = new Map<string, number>()
  matches.forEach(p => {
    const cur = marketBestDiscount.get(p.market) ?? -1
    if ((p.discount ?? 0) > cur) marketBestDiscount.set(p.market, p.discount ?? 0)
  })
  const cheapestMarket = [...marketBestDiscount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  const avgDiscount = Math.round(matches.reduce((s, p) => s + (p.discount ?? 0), 0) / matches.length)

  return {
    name,
    products: [...matches].sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0)),
    marketCount: marketBestDiscount.size,
    cheapestMarket,
    avgDiscount,
  }
}
