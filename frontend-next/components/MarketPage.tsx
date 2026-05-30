'use client'
import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Product } from '@/lib/types'
import { ProductCard } from './ProductCard'
import { ShoppingListSidebar } from './ShoppingListSidebar'
import { LanguageSwitcher } from './LanguageSwitcher'
import { DealHunterLogo } from './DealHunterLogo'
import { useShoppingList } from '@/context/ShoppingListContext'
import { MarketFAQ } from './MarketFAQ'
import { MARKET_FAQS, FAQ } from '@/lib/marketFaqs'
import { BlogPost } from '@/lib/posts'

interface Market {
  slug: string
  name: string
  color: string
  description: string
  ctaTitle?: string
}

export function MarketPage({ market, initialProducts, relatedPosts = [] }: {
  market: Market
  initialProducts: Product[]
  relatedPosts?: BlogPost[]
}) {
  const [search, setSearch] = useState('')
  const [campaignsOnly, setCampaignsOnly] = useState(false)
  const { itemCount, setIsCartOpen } = useShoppingList()
  const faqs: FAQ[] = MARKET_FAQS[market.slug] ?? []

  const filtered = useMemo(() => initialProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCampaign = campaignsOnly ? p.isCampaign : true
    return matchSearch && matchCampaign
  }), [initialProducts, search, campaignsOnly])

  const avgDiscount = useMemo(() => {
    const withDiscount = filtered.filter(p => p.originalPrice > p.discountedPrice)
    if (!withDiscount.length) return 0
    const avg = withDiscount.reduce((sum, p) => sum + ((p.originalPrice - p.discountedPrice) / p.originalPrice * 100), 0) / withDiscount.length
    return Math.round(avg)
  }, [filtered])

  return (
    <div className="min-h-screen" style={{ background: '#F5EDE3' }}>

      {/* Navbar */}
      <nav className="fixed top-4 left-4 right-4 z-50 flex justify-between items-center px-4 md:px-6 h-14 rounded-full navbar-pill">
        <div className="flex items-center gap-4">
          <Link href="/">
            <DealHunterLogo height={36} />
          </Link>
          <span className="hidden md:block text-sm" style={{ color: '#8C8478' }}>›</span>
          <span className="hidden md:block text-sm font-bold" style={{ color: '#1A1A1A' }}>{market.name}</span>
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
          <Link href="/" className="hover:underline">Supermarkten</Link>
          <span>›</span>
          <span style={{ color: '#1A1A1A' }}>{market.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg"
              style={{ background: market.color }}>
              {market.name === 'Albert Heijn' ? 'AH' : market.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold" style={{ color: '#1A1A1A' }}>
                {market.name} Acties & Aanbiedingen
              </h1>
              <p className="text-sm mt-1" style={{ color: '#8C8478' }}>Deze week · {filtered.length} aanbiedingen</p>
            </div>
          </div>
          <p className="text-base max-w-2xl" style={{ color: '#6B6259' }}>{market.description}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg" style={{ color: '#8C8478' }}>search</span>
            <input
              type="text"
              placeholder={`Zoek in ${market.name}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full text-sm focus:outline-none focus:ring-2 transition-all"
              style={{ background: 'white', border: '1.5px solid #E0D8CE', color: '#1A1A1A' }}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setCampaignsOnly(!campaignsOnly)}
            className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold transition-all cursor-pointer"
            style={{
              background: campaignsOnly ? '#E33D26' : 'white',
              color: campaignsOnly ? 'white' : '#6B6259',
              border: '1.5px solid #E0D8CE',
            }}
          >
            <span className="material-symbols-outlined text-base">local_fire_department</span>
            Alleen acties
          </motion.button>
        </div>

        {/* Stats */}
        {avgDiscount > 0 && (
          <div className="flex items-center gap-2 mb-6 p-3 rounded-2xl w-fit" style={{ background: 'rgba(27,158,75,0.08)' }}>
            <span className="material-symbols-outlined" style={{ color: '#1B9E4B' }}>trending_down</span>
            <span className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
              Gemiddeld <strong style={{ color: '#1B9E4B' }}>{avgDiscount}% goedkoper</strong>
            </span>
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 rounded-3xl" style={{ background: 'rgba(255,255,255,0.6)' }}>
            <span className="material-symbols-outlined text-6xl mb-4 block" style={{ color: '#C9C1B6' }}>search_off</span>
            <p className="text-xl font-headline font-bold" style={{ color: '#1A1A1A' }}>Geen aanbiedingen gevonden</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product, i) => (
              <motion.div key={product.id}
                initial={{ opacity: 0, y: i < 8 ? 20 : 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -40px 0px' }}
                transition={{ duration: 0.3, delay: i < 8 ? i * 0.04 : 0 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

        {/* FAQ */}
        <MarketFAQ faqs={faqs} marketName={market.name} />

        {/* Related blog posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-headline font-bold mb-5" style={{ color: '#1A1A1A' }}>
              Lees ook op ons blog
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedPosts.slice(0, 3).map(post => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block rounded-2xl p-5 transition-all hover:shadow-md"
                  style={{ background: 'white', border: '1.5px solid #E0D8CE', textDecoration: 'none' }}
                >
                  <span
                    className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full mb-3"
                    style={{ background: '#E33D26', color: 'white', letterSpacing: 1, textTransform: 'uppercase' }}
                  >
                    {post.category}
                  </span>
                  <p className="font-bold text-sm leading-snug mb-2" style={{ color: '#1A1A1A' }}>
                    {post.title}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: '#8C8478' }}>
                    {post.description.slice(0, 90)}…
                  </p>
                  <span className="inline-block mt-3 text-xs font-semibold" style={{ color: '#E33D26' }}>
                    Lees meer →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Andere supermarkten */}
        <section className="mt-20">
          <h2 className="text-xl font-headline font-bold mb-4" style={{ color: '#1A1A1A' }}>Andere supermarkten</h2>
          <div className="flex flex-wrap gap-3">
            {['albert-heijn', 'jumbo', 'lidl', 'dirk', 'aldi', 'hoogvliet']
              .filter(s => s !== market.slug)
              .map(slug => (
                <Link key={slug} href={`/supermarkt/${slug}`}
                  className="px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:bg-white"
                  style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid #E0D8CE', color: '#1A1A1A' }}>
                  {slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
                </Link>
              ))}
          </div>
        </section>
      </main>

      <ShoppingListSidebar />
    </div>
  )
}
