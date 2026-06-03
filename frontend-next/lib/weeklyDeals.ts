import { getISOWeek } from './schema'
import { Product } from './types'

export function currentWeekSlug(): string {
  const now = new Date()
  return `week-${getISOWeek(now)}-${now.getFullYear()}`
}

export function parseWeekSlug(slug: string | undefined | null): { week: number; year: number } | null {
  if (!slug) return null
  const m = slug.match(/^week-(\d+)-(\d{4})$/)
  if (!m) return null
  const week = parseInt(m[1])
  const year = parseInt(m[2])
  if (week < 1 || week > 53 || year < 2024) return null
  return { week, year }
}

export function getTopDeals(products: Product[], limit = 15): Product[] {
  return products
    .filter(p => p.originalPrice > p.discountedPrice && p.originalPrice > 0)
    .map(p => ({
      ...p,
      _pct: Math.round(((p.originalPrice - p.discountedPrice) / p.originalPrice) * 100),
    }))
    .sort((a, b) => (b as Product & { _pct: number })._pct - (a as Product & { _pct: number })._pct)
    .slice(0, limit)
}
