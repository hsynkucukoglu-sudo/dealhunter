import { getProducts } from '@/lib/api'
import type { Product } from '@/lib/types'
import { ProductCard } from './ProductCard'
import Link from 'next/link'

export interface DealEmbedConfig {
  title: string
  category?: string
  keyword?: string
  markets?: string[]
  limit?: number
  ctaHref?: string
  ctaLabel?: string
}

async function fetchEmbedProducts(config: DealEmbedConfig): Promise<Product[]> {
  const all = await getProducts()
  const active = all.filter(p => p.originalPrice > p.discountedPrice && p.discountedPrice > 0)

  let filtered = active

  if (config.markets && config.markets.length > 0) {
    filtered = filtered.filter(p =>
      config.markets!.some(m => p.market.toLowerCase().includes(m.toLowerCase()))
    )
  }

  if (config.category) {
    filtered = filtered.filter(p => p.category === config.category)
  }

  if (config.keyword) {
    const kw = config.keyword.toLowerCase()
    filtered = filtered.filter(p => p.name.toLowerCase().includes(kw))
  }

  return filtered
    .sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0))
    .slice(0, config.limit ?? 3)
}

export async function EmbeddedDeals({ config }: { config: DealEmbedConfig }) {
  const products = await fetchEmbedProducts(config)

  if (products.length === 0) return null

  return (
    <aside
      className="my-8 rounded-3xl overflow-hidden"
      style={{ border: '1.5px solid #E0D8CE', background: 'rgba(245,237,227,0.6)' }}
    >
      <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-2">
        <h3
          className="font-bold text-base"
          style={{ color: '#1A1A1A', fontFamily: 'Space Grotesk' }}
        >
          {config.title}
        </h3>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: '#1B9E4B', color: 'white' }}
        >
          LIVE
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-4 pb-4">
        {products.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <div className="px-5 pb-4 text-center">
        <Link
          href={config.ctaHref ?? '/'}
          className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: '#E33D26', textDecoration: 'none' }}
        >
          {config.ctaLabel ?? 'Bekijk alle deals'} →
        </Link>
      </div>
    </aside>
  )
}
