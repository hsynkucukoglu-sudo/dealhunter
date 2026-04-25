'use client'
import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Product, CATEGORIES, MARKET_COLORS, getMarketInitial } from '@/lib/types'
import { ProductCard } from './ProductCard'
import { ShoppingListSidebar } from './ShoppingListSidebar'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useShoppingList } from '@/context/ShoppingListContext'

interface Category {
  id: string
  label: string
  emoji: string
}

export function CategoryPage({ category, initialProducts }: { category: Category; initialProducts: Product[] }) {
  const [search, setSearch] = useState('')
  const [selectedMarket, setSelectedMarket] = useState('all')
  const { itemCount, setIsCartOpen } = useShoppingList()

  const markets = useMemo(() => Array.from(new Set(initialProducts.map(p => p.market))).sort(), [initialProducts])

  const filtered = useMemo(() => initialProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchMarket = selectedMarket === 'all' || p.market === selectedMarket
    return matchSearch && matchMarket
  }), [initialProducts, search, selectedMarket])

  const totalSavings = useMemo(() =>
    filtered.reduce((sum, p) => sum + (p.originalPrice > p.discountedPrice ? p.originalPrice - p.discountedPrice : 0), 0)
  , [filtered])

  return (
    <div className="min-h-screen" style={{ background: '#F5EDE3' }}>

      {/* Navbar */}
      <nav className="fixed top-4 left-4 right-4 z-50 flex justify-between items-center px-4 md:px-6 h-14 rounded-full navbar-pill">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-black tracking-tighter font-headline" style={{ color: '#E33D26' }}>
            DEALHUNTER
          </Link>
          <span className="hidden md:block text-sm" style={{ color: '#8C8478' }}>›</span>
          <span className="hidden md:block text-sm font-bold" style={{ color: '#1A1A1A' }}>{category.emoji} {category.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCartOpen(true)}
            className="relative cursor-pointer p-2 rounded-full transition-all hover:bg-black/5"
          >
            <span className="material-symbols-outlined" style={{ color: '#1A1A1A' }}>shopping_bag</span>
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 text-[10px] font-bold px-1.5 rounded-full" style={{ background: '#E33D26', color: 'white' }}>
                {itemCount}
              </span>
            )}
          </motion.button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-20">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: '#8C8478' }}>
          <Link href="/" className="hover:underline">DealHunter</Link>
          <span>›</span>
          <span style={{ color: '#1A1A1A' }}>{category.label}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-headline font-bold mb-3" style={{ color: '#1A1A1A' }}>
            {category.emoji} {category.label} <span style={{ color: '#E33D26' }}>Aanbiedingen</span>
          </h1>
          <p className="text-base max-w-2xl" style={{ color: '#6B6259' }}>
            Bekijk alle actuele {category.label.toLowerCase()} aanbiedingen van Albert Heijn, Jumbo, Lidl, Dirk en meer.
            Vergelijk prijzen en bespaar op {category.label.toLowerCase()}.
          </p>
        </div>

        {/* Market pills */}
        {markets.length > 0 && (
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 mb-6">
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMarket('all')}
              className={`market-pill ${selectedMarket === 'all' ? 'market-pill-active' : ''}`}>
              <span className="material-symbols-outlined text-base">bolt</span>
              Alle markten
            </motion.button>
            <div className="w-px h-6 flex-none" style={{ background: '#C9C1B6' }} />
            {markets.map(m => (
              <motion.button key={m} whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedMarket(m)}
                className={`market-pill ${selectedMarket === m ? 'market-pill-active' : ''}`}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-none"
                  style={{ background: MARKET_COLORS[m] || '#6B6259' }}>
                  {getMarketInitial(m)}
                </div>
                {m}
              </motion.button>
            ))}
          </div>
        )}

        {/* Search + stats */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg" style={{ color: '#8C8478' }}>search</span>
            <input
              type="text"
              placeholder={`Zoek in ${category.label}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full text-sm focus:outline-none transition-all"
              style={{ background: 'white', border: '1.5px solid #E0D8CE', color: '#1A1A1A' }}
            />
          </div>
          {totalSavings > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-full" style={{ background: 'rgba(27,158,75,0.08)' }}>
              <span className="material-symbols-outlined text-sm" style={{ color: '#1B9E4B' }}>trending_down</span>
              <span className="text-sm font-bold" style={{ color: '#1B9E4B' }}>€{totalSavings.toFixed(2)} besparing</span>
            </div>
          )}
        </div>

        <p className="text-sm mb-6" style={{ color: '#8C8478' }}>{filtered.length} aanbiedingen gevonden</p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 rounded-3xl" style={{ background: 'rgba(255,255,255,0.6)' }}>
            <span className="material-symbols-outlined text-6xl mb-4 block" style={{ color: '#C9C1B6' }}>search_off</span>
            <p className="text-xl font-headline font-bold" style={{ color: '#1A1A1A' }}>Geen aanbiedingen gevonden</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Andere categorieën */}
        <section className="mt-20">
          <h2 className="text-xl font-headline font-bold mb-4" style={{ color: '#1A1A1A' }}>Andere categorieën</h2>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.filter(c => c.id !== category.id).map(c => (
              <Link key={c.id} href={`/categorie/${c.id}`}
                className="px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:bg-white"
                style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid #E0D8CE', color: '#1A1A1A' }}>
                {c.emoji} {c.label}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <ShoppingListSidebar />
    </div>
  )
}
