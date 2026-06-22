'use client'
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Product, VISIBLE_MARKETS } from '@/lib/types'
import { MarketLogo } from './MarketLogo'

interface Props {
  products: Product[]
  onSelectMarket: (market: string) => void
}

export function MarktenShowcase({ products, onSelectMarket }: Props) {
  const marketStats = useMemo(() => {
    return VISIBLE_MARKETS.map(m => {
      const mProducts = products.filter(p => p.market === m.name)
      const withDiscount = mProducts.filter(p => p.originalPrice > p.discountedPrice && p.discount > 0)
      const bestDeal = withDiscount.length > 0
        ? withDiscount.reduce((a, b) => (b.discount > a.discount ? b : a))
        : null
      return {
        ...m,
        count: mProducts.length,
        dealCount: withDiscount.length,
        bestDeal,
      }
    }).filter(m => m.count > 0)
  }, [products])

  if (marketStats.length === 0) return null

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-headline font-bold" style={{ color: '#1A1A1A' }}>
          🏪 Supermarkten &amp; Drogisterijen
        </h2>
        <span className="text-xs font-medium" style={{ color: '#8C8478' }}>
          {marketStats.length} winkels
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {marketStats.map((m, i) => (
          <motion.div
            key={m.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.03 }}
            className="group"
          >
            <Link
              href={`/supermarkt/${m.slug}`}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer transition-all hover:shadow-md"
              style={{
                background: 'rgba(255,255,255,0.85)',
                border: '1.5px solid rgba(201,193,182,0.35)',
                textDecoration: 'none',
                display: 'flex',
              }}
            >
              {/* Market logo */}
              <div className="group-hover:scale-105 transition-transform shadow-sm rounded-2xl overflow-hidden">
                <MarketLogo market={m.name} size={52} />
              </div>

              {/* Market name */}
              <span className="font-semibold text-xs text-center leading-tight" style={{ color: '#1A1A1A' }}>
                {m.name}
              </span>

              {/* Stats */}
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[11px] font-medium" style={{ color: '#8C8478' }}>
                  {m.count} aanbiedingen
                </span>
                {m.bestDeal && (
                  <span
                    className="text-[11px] font-black px-2 py-0.5 rounded-full"
                    style={{ background: '#E8F5EC', color: '#1B9E4B' }}
                  >
                    tot -{m.bestDeal.discount}%
                  </span>
                )}
              </div>

              <span className="text-[10px] font-bold" style={{ color: '#E33D26' }}>
                Bekijk alle →
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
