'use client'
import { useMemo } from 'react'
import { Product, MARKET_COLORS, CATEGORY_LABELS } from '@/lib/types'

interface Combo {
  category: string
  categoryLabel: string
  items: Product[]
  totalNormal: number
  totalDeal: number
  totalSaving: number
}

function buildCombos(products: Product[], maxCombos = 5): Combo[] {
  const discounted = products.filter(
    p => p.originalPrice > p.discountedPrice && p.originalPrice > 0 && p.category && p.category !== 'overig'
  )

  const byCategory = new Map<string, Product[]>()
  for (const p of discounted) {
    const list = byCategory.get(p.category) ?? []
    list.push(p)
    byCategory.set(p.category, list)
  }

  const combos: Combo[] = []

  for (const [category, prods] of byCategory) {
    if (prods.length < 2) continue

    // Sort by discount % descending, pick top 3 from different markets
    const sorted = [...prods].sort((a, b) =>
      ((b.originalPrice - b.discountedPrice) / b.originalPrice) -
      ((a.originalPrice - a.discountedPrice) / a.originalPrice)
    )

    const picked: Product[] = []
    const usedMarkets = new Set<string>()
    for (const p of sorted) {
      if (picked.length >= 3) break
      if (!usedMarkets.has(p.market)) {
        picked.push(p)
        usedMarkets.add(p.market)
      }
    }
    // Allow same market if not enough variety
    if (picked.length < 2) {
      for (const p of sorted) {
        if (picked.length >= 3) break
        if (!picked.includes(p)) picked.push(p)
      }
    }
    if (picked.length < 2) continue

    const totalNormal = picked.reduce((s, p) => s + p.originalPrice, 0)
    const totalDeal = picked.reduce((s, p) => s + p.discountedPrice, 0)
    const totalSaving = totalNormal - totalDeal
    if (totalSaving < 0.5) continue

    const catLabel = CATEGORY_LABELS[category]?.nl ?? category
    combos.push({ category, categoryLabel: catLabel, items: picked, totalNormal, totalDeal, totalSaving })
  }

  return combos
    .sort((a, b) => b.totalSaving - a.totalSaving)
    .slice(0, maxCombos)
}

export function CombinatieDealsWidget({ products }: { products: Product[] }) {
  const combos = useMemo(() => buildCombos(products), [products])

  if (combos.length === 0) return null

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span style={{ fontSize: 18 }}>🛒</span>
        <h2
          className="text-base font-black uppercase tracking-wide"
          style={{ color: '#1A1A1A', fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Combineer &amp; bespaar meer
        </h2>
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full ml-auto"
          style={{ background: '#007B5E', color: 'white' }}
        >
          Slimmer boodschappen
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {combos.map((combo, ci) => (
          <div
            key={combo.category + ci}
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(201,193,182,0.4)',
              boxShadow: '0 2px 0 #DDD0C4',
            }}
          >
            {/* Category header */}
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#F5EDE3', color: '#6B6259' }}>
                {combo.categoryLabel}
              </span>
              <span className="text-xs font-black ml-auto" style={{ color: '#007B5E' }}>
                Bespaar €{combo.totalSaving.toFixed(2)}
              </span>
            </div>

            {/* Products */}
            <div className="flex flex-col gap-2 mb-3">
              {combo.items.map((p, i) => {
                const color = MARKET_COLORS[p.market] ?? '#1A1A1A'
                const discPct = Math.round(((p.originalPrice - p.discountedPrice) / p.originalPrice) * 100)
                const imgSrc = p.imageUrl
                  ? p.imageUrl.startsWith('ah-product-id:')
                    ? `/api/ah-image/${p.imageUrl.replace('ah-product-id:', '')}`
                    : p.imageUrl
                  : null

                return (
                  <div key={p.id ?? i} className="flex items-center gap-2">
                    {/* Image */}
                    <div
                      className="flex-none w-10 h-10 rounded-xl overflow-hidden"
                      style={{ background: '#F5EDE3' }}
                    >
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={p.name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-[10px] font-black"
                          style={{ color: 'white', background: color }}
                        >
                          {p.market.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Name + price */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: '#1A1A1A' }}>
                        {p.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] font-black" style={{ color }}>
                          €{p.discountedPrice.toFixed(2)}
                        </span>
                        <span className="text-[10px] line-through" style={{ color: '#C9C1B6' }}>
                          €{p.originalPrice.toFixed(2)}
                        </span>
                        <span
                          className="text-[10px] font-bold px-1 rounded"
                          style={{ background: '#E33D26', color: 'white' }}
                        >
                          -{discPct}%
                        </span>
                      </div>
                    </div>

                    {/* Market dot */}
                    <div
                      className="flex-none w-2 h-2 rounded-full"
                      style={{ background: color }}
                      title={p.market}
                    />
                  </div>
                )
              })}
            </div>

            {/* Total + CTA */}
            <div
              className="flex items-center justify-between pt-2"
              style={{ borderTop: '1px solid rgba(201,193,182,0.3)' }}
            >
              <div>
                <p className="text-[10px]" style={{ color: '#9C9389' }}>
                  Totaal samen
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-black" style={{ color: '#1A1A1A' }}>
                    €{combo.totalDeal.toFixed(2)}
                  </span>
                  <span className="text-[11px] line-through" style={{ color: '#C9C1B6' }}>
                    €{combo.totalNormal.toFixed(2)}
                  </span>
                </div>
              </div>
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-xl"
                style={{ background: '#1A1A1A', color: 'white' }}
              >
                {combo.items.length} deals
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
