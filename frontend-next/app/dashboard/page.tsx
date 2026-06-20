'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  market: string
  originalPrice: number
  discountedPrice: number
  discount: number
  imageUrl: string | null
  isCampaign: boolean
  source: string
  expiresAt: string
  category?: string
  campaignType?: string | null
}

interface ScraperStats {
  total: number
  markets: Array<{
    market: string
    total: number
    with_discount: number
    avg_discount_pct: number
    last_scraped: string
  }>
}

export default function Dashboard() {
  const [stats, setStats] = useState<ScraperStats | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMarket, setSelectedMarket] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dealhunter-production-d900.up.railway.app'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch stats
        const statsRes = await fetch(`${API_URL}/api/stats`)
        if (!statsRes.ok) throw new Error(`Stats API: ${statsRes.status}`)
        const statsData = await statsRes.json()
        setStats(statsData)

        // Fetch products
        const productsRes = await fetch(`${API_URL}/api/products`)
        if (!productsRes.ok) throw new Error(`Products API: ${productsRes.status}`)
        const productsData = await productsRes.json()
        setProducts(productsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredProducts = selectedMarket === 'all'
    ? products
    : products.filter(p => p.market === selectedMarket)

  const totalSavings = filteredProducts.reduce((sum, p) => {
    if (p.originalPrice > p.discountedPrice) {
      return sum + (p.originalPrice - p.discountedPrice)
    }
    return sum
  }, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            🛒 DealHunter Dashboard
          </h1>
          <p className="text-slate-400">Supermarkt aanbiedingen in real-time</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 text-red-200">
            ⚠️ {error}
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-lg p-6">
              <div className="text-slate-400 text-sm font-medium mb-2">Totaal Producten</div>
              <div className="text-3xl font-bold text-white">{stats.total.toLocaleString()}</div>
            </div>
            <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-lg p-6">
              <div className="text-slate-400 text-sm font-medium mb-2">Markten</div>
              <div className="text-3xl font-bold text-white">{stats.markets.length}</div>
            </div>
            <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-lg p-6">
              <div className="text-slate-400 text-sm font-medium mb-2">Totale Besparing</div>
              <div className="text-3xl font-bold text-green-400">€{totalSavings.toFixed(2)}</div>
            </div>
            <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-lg p-6">
              <div className="text-slate-400 text-sm font-medium mb-2">Gefilterde Producten</div>
              <div className="text-3xl font-bold text-blue-400">{filteredProducts.length}</div>
            </div>
          </div>
        )}

        {/* Market Stats */}
        {stats && (
          <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">📊 Markt Statistieken</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.markets.map(market => (
                <div
                  key={market.market}
                  className="bg-slate-800/50 rounded p-4 cursor-pointer hover:bg-slate-700/50 transition"
                  onClick={() => setSelectedMarket(market.market)}
                >
                  <div className="font-semibold text-white mb-2">{market.market}</div>
                  <div className="text-sm text-slate-300 space-y-1">
                    <div>📦 {market.total} producten</div>
                    <div>💰 {market.with_discount} met korting</div>
                    <div>📉 Gem. {market.avg_discount_pct?.toFixed(1) || 0}% korting</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedMarket('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedMarket === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Alle Markten
          </button>
          {stats?.markets.map(market => (
            <button
              key={market.market}
              onClick={() => setSelectedMarket(market.market)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedMarket === market.market
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {market.market} ({market.total})
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-slate-400 mt-4">Producten laden...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-lg overflow-hidden hover:border-slate-500 transition group"
              >
                {/* Image */}
                {product.imageUrl ? (
                  <div className="relative h-48 bg-slate-800 overflow-hidden">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-slate-800 flex items-center justify-center text-slate-500">
                    📷 Geen afbeelding
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <div className="text-xs font-semibold text-blue-400 mb-1 uppercase">
                    {product.market}
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-green-400">
                        €{product.discountedPrice.toFixed(2)}
                      </span>
                      {product.originalPrice > product.discountedPrice && (
                        <span className="text-sm text-slate-400 line-through">
                          €{product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {product.discount > 0 && (
                      <div className="text-xs text-red-400 font-semibold mt-1">
                        -{product.discount}% korting
                      </div>
                    )}
                  </div>

                  {/* Campaign Type */}
                  {product.campaignType && (
                    <div className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded mb-2 inline-block">
                      {product.campaignType}
                    </div>
                  )}

                  {/* Expires */}
                  <div className="text-xs text-slate-400">
                    ⏰ Tot {product.expiresAt}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">Geen producten gevonden</p>
          </div>
        )}
      </div>
    </div>
  )
}

