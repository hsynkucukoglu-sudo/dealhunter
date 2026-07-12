'use client'
import React, { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Product } from '@/lib/types'
import { ProductCard } from './ProductCard'
import { AdBanner } from './AdBanner'
import { ShoppingListSidebar } from './ShoppingListSidebar'
import { LanguageSwitcher } from './LanguageSwitcher'
import { DealHunterLogo } from './DealHunterLogo'
import { useShoppingList } from '@/context/ShoppingListContext'
import { MarketFAQ } from './MarketFAQ'
import { FlinkDeliveryCard } from './FlinkDeliveryCard'
import { NewsletterCTA } from './NewsletterCTA'
import { MarketLogo } from './MarketLogo'
import { MARKET_FAQS, FAQ } from '@/lib/marketFaqs'
import { MARKET_CONTENT } from '@/lib/marketContent'
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
  const PAGE_SIZE = 48
  const [search, setSearch] = useState('')
  const [campaignsOnly, setCampaignsOnly] = useState(false)
  const [page, setPage] = useState(1)
  const { itemCount, setIsCartOpen } = useShoppingList()
  const faqs: FAQ[] = MARKET_FAQS[market.slug] ?? []

  const filtered = useMemo(() => {
    const result = initialProducts.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchCampaign = campaignsOnly ? p.isCampaign : true
      return matchSearch && matchCampaign
    })
    // Highest discount first
    return result.sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0))
  }, [initialProducts, search, campaignsOnly])

  const displayed = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page])
  const hasMore = displayed.length < filtered.length

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }, [])

  const handleCampaignToggle = useCallback(() => {
    setCampaignsOnly(v => !v)
    setPage(1)
  }, [])

  const avgDiscount = useMemo(() => {
    const withDiscount = filtered.filter(p => p.originalPrice > p.discountedPrice)
    if (!withDiscount.length) return 0
    const avg = withDiscount.reduce((sum, p) => sum + ((p.originalPrice - p.discountedPrice) / p.originalPrice * 100), 0) / withDiscount.length
    return Math.round(avg)
  }, [filtered])

  return (
    <div className="min-h-screen" style={{ background: '#F5EDE3' }}>

      {/* Navbar — V9 sticky full-width */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-white"
        style={{ borderBottom: '1px solid rgba(228,190,183,0.4)', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}
      >
        <div className="flex justify-between items-center max-w-[1280px] mx-auto px-4 md:px-16 h-16 w-full">
          <div className="flex items-center gap-3">
            <Link href="/">
              <DealHunterLogo height={32} />
            </Link>
            <span className="text-sm" style={{ color: '#C9C1B6', fontFamily: 'JetBrains Mono' }}>›</span>
            <span className="hidden md:block text-sm font-medium" style={{ color: '#6B6259', fontFamily: 'JetBrains Mono' }}>{market.name}</span>
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
        </div>
      </nav>

      <main className="max-w-[1280px] mx-auto px-4 md:px-16 pt-20 pb-20">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: '#9C9389', fontFamily: 'JetBrains Mono' }}>
          <Link href="/" className="hover:text-primary transition-colors">DealHunter4U</Link>
          <span style={{ color: '#C9C1B6' }}>›</span>
          <Link href="/" className="hover:text-primary transition-colors">Supermarkten</Link>
          <span style={{ color: '#C9C1B6' }}>›</span>
          <span style={{ color: '#1A1A1A' }}>{market.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-2xl overflow-hidden shadow-sm flex-none">
              <MarketLogo market={market.name} size={56} />
            </div>
            <div>
              <h1
                className="font-headline font-bold leading-tight"
                style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#1A1A1A', fontFamily: 'Space Grotesk', letterSpacing: '-0.02em' }}
              >
                {market.ctaTitle
                  ? market.ctaTitle.split(' | ')[0].replace(' Deze Week', '')
                  : `${market.name} Aanbiedingen`}
              </h1>
              <p className="text-sm mt-1" style={{ color: '#9C9389', fontFamily: 'JetBrains Mono' }}>
                Deze week · {filtered.length} aanbiedingen
              </p>
            </div>
          </div>
          <p className="text-base max-w-2xl" style={{ color: '#6B6259', fontFamily: 'Hanken Grotesk' }}>{market.description}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg" style={{ color: '#8C8478' }}>search</span>
            <input
              type="text"
              placeholder={`Zoek in ${market.name}...`}
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-3 rounded-full text-sm focus:outline-none focus:ring-2 transition-all"
              style={{ background: 'white', border: '1.5px solid #E0D8CE', color: '#1A1A1A' }}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCampaignToggle}
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

        {/* Intent-uyumlu affiliate: bezorging (komisyonlu) */}
        <FlinkDeliveryCard marketName={market.name} />

        {/* Grid */}
        {filtered.length === 0 ? (
          initialProducts.length === 0 ? (
            <div className="text-center py-20 rounded-3xl" style={{ background: 'rgba(255,255,255,0.6)' }}>
              <span className="material-symbols-outlined text-6xl mb-4 block" style={{ color: '#C9C1B6' }}>schedule</span>
              <p className="text-xl font-headline font-bold mb-2" style={{ color: '#1A1A1A' }}>
                {market.name} aanbiedingen worden bijgewerkt
              </p>
              <p className="text-sm max-w-md mx-auto mb-6" style={{ color: '#9C9389' }}>
                We zijn de nieuwste {market.name}-deals aan het ophalen. Bekijk in de tussentijd de actuele aanbiedingen van andere supermarkten.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['albert-heijn', 'jumbo', 'lidl', 'aldi']
                  .filter(s => s !== market.slug)
                  .map(slug => (
                    <Link key={slug} href={`/supermarkt/${slug}`}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-white"
                      style={{ background: 'white', border: '1.5px solid #E0D8CE', color: '#1A1A1A' }}>
                      {slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')} aanbiedingen
                    </Link>
                  ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 rounded-3xl" style={{ background: 'rgba(255,255,255,0.6)' }}>
              <span className="material-symbols-outlined text-6xl mb-4 block" style={{ color: '#C9C1B6' }}>search_off</span>
              <p className="text-xl font-headline font-bold" style={{ color: '#1A1A1A' }}>Geen aanbiedingen gevonden</p>
            </div>
          )
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {displayed.map((product, i) => (
                <motion.div key={product.id}
                  initial={{ opacity: 0, y: i < 8 ? 20 : 0 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -40px 0px' }}
                  transition={{ duration: 0.3, delay: i < 8 ? i * 0.04 : 0 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setPage(p => p + 1)}
                  className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm cursor-pointer transition-all"
                  style={{ background: '#1A1A1A', color: 'white', fontFamily: 'Space Grotesk' }}
                >
                  <span className="material-symbols-outlined text-base">expand_more</span>
                  Toon meer ({filtered.length - displayed.length} aanbiedingen)
                </motion.button>
              </div>
            )}
          </>
        )}

        {/* Reklam — ürün gridi ile SEO içeriği arasında doğal mola */}
        {filtered.length > 0 && (
          <AdBanner slot="6569328687" format="auto" className="mt-12" minHeight={280} />
        )}

        {/* Market content — rich text for SEO */}
        {MARKET_CONTENT[market.slug] && (
          <section
            className="mt-16 rounded-3xl p-6 md:p-8 prose prose-sm max-w-none"
            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(201,193,182,0.4)' }}
            dangerouslySetInnerHTML={{ __html: MARKET_CONTENT[market.slug] }}
          />
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

        <NewsletterCTA variant="market" marketName={market.name} />

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
