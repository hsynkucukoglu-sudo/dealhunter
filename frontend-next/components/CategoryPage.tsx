'use client'
import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Product, CATEGORIES, CATEGORY_LABELS } from '@/lib/types'
import { MarketLogo } from './MarketLogo'
import { ProductCard } from './ProductCard'
import { ShoppingListSidebar } from './ShoppingListSidebar'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useShoppingList } from '@/context/ShoppingListContext'
import { useLanguage } from '@/context/LanguageContext'
import { CATEGORY_CONTENT } from '@/lib/categoryContent'
import { BlogPost } from '@/lib/posts'

interface Category {
  id: string
  label: string
  emoji: string
}

// Sadece slug+label — ProductKeyword tipini import etmek client bundle'a lib/api'yi de çekerdi
interface RelatedProduct {
  slug: string
  label: string
}

export function CategoryPage({ category, initialProducts, relatedPosts = [], relatedProducts = [] }: { category: Category; initialProducts: Product[]; relatedPosts?: BlogPost[]; relatedProducts?: RelatedProduct[] }) {
  const [search, setSearch] = useState('')
  const [selectedMarket, setSelectedMarket] = useState('all')
  const { itemCount, setIsCartOpen } = useShoppingList()

  const { lang } = useLanguage()
  const markets = useMemo(() => Array.from(new Set(initialProducts.map(p => p.market).filter(Boolean))).sort(), [initialProducts])

  const catLabel = CATEGORY_LABELS[category.id]?.[lang] ?? category.label

  const ui = {
    allMarkets: lang === 'tr' ? 'Tüm marketler' : lang === 'en' ? 'All markets' : 'Alle markten',
    deals: lang === 'tr' ? 'fırsatlar' : lang === 'en' ? 'deals' : 'aanbiedingen',

    found: lang === 'tr' ? 'fırsat bulundu' : lang === 'en' ? 'deals found' : 'aanbiedingen gevonden',
    noDeals: lang === 'tr' ? 'Fırsat bulunamadı' : lang === 'en' ? 'No deals found' : 'Geen aanbiedingen gevonden',
    otherCats: lang === 'tr' ? 'Diğer kategoriler' : lang === 'en' ? 'Other categories' : 'Andere categorieën',
    popularProducts: lang === 'tr' ? 'Bu kategorideki popüler ürünler' : lang === 'en' ? 'Popular products in this category' : 'Populaire producten in deze categorie',
    searchPlaceholder: lang === 'tr' ? `${catLabel} içinde ara...` : lang === 'en' ? `Search in ${catLabel}...` : `Zoek in ${catLabel}...`,
    dealsTitle: lang === 'tr' ? 'Fırsatları' : lang === 'en' ? 'Deals' : 'Aanbiedingen',
    descText: lang === 'tr'
      ? `Albert Heijn, Jumbo, Lidl, Dirk ve daha fazlasından tüm güncel ${catLabel.toLowerCase()} fırsatlarını görün. Fiyatları karşılaştırın ve ${catLabel.toLowerCase()} ürünlerinde tasarruf edin.`
      : lang === 'en'
      ? `View all current ${catLabel.toLowerCase()} deals from Albert Heijn, Jumbo, Lidl, Dirk and more. Compare prices and save on ${catLabel.toLowerCase()}.`
      : `Bekijk alle actuele ${catLabel.toLowerCase()} aanbiedingen van Albert Heijn, Jumbo, Lidl, Dirk en meer. Vergelijk prijzen en bespaar op ${catLabel.toLowerCase()}.`,
  }

  const filtered = useMemo(() => initialProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchMarket = selectedMarket === 'all' || p.market === selectedMarket
    return matchSearch && matchMarket
  }), [initialProducts, search, selectedMarket])

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
          <Link href="/" className="text-xl font-black tracking-tighter font-headline" style={{ color: '#E33D26' }}>
            DEALHUNTER
          </Link>
          <span className="hidden md:block text-sm" style={{ color: '#8C8478' }}>›</span>
          <span className="hidden md:block text-sm font-bold" style={{ color: '#1A1A1A' }}>{category.emoji} {catLabel}</span>
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
          <span style={{ color: '#1A1A1A' }}>{catLabel}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-headline font-bold mb-3" style={{ color: '#1A1A1A' }}>
            {category.emoji} {catLabel} <span style={{ color: '#E33D26' }}>{ui.dealsTitle}</span>
          </h1>
          <p className="text-base max-w-2xl" style={{ color: '#6B6259' }}>
            {ui.descText}
          </p>
        </div>

        {/* Market pills — WRAPPEN, niet horizontaal scrollen.
            Eerdere opzet was één scrollrij met een rand-fade als hint. Gemeten op
            /categorie/groente-fruit: 9 pillen, scrollWidth 1.475px tegen een
            clientWidth van 358px = 1.117px overflow. De laatste twee (de lijst is
            alfabetisch, dus meestal Plus en Vomar) waren pas bereikbaar na ~3
            schermbreedtes zijwaarts vegen op een strook van ~40px hoog. Een fade
            vertelt dát er meer is, maar maakt het niet bereikbaar — twee
            gebruikersmeldingen op rij gingen hierover.
            Wrappen lost het op: alle markten staan tegelijk in beeld, geen
            zijwaartse gebaren meer. market-pill-compact houdt de extra hoogte
            beperkt (zie globals.css). */}
        {markets.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMarket('all')}
              className={`market-pill market-pill-compact ${selectedMarket === 'all' ? 'market-pill-active' : ''}`}>
              <span className="material-symbols-outlined text-base">bolt</span>
              {ui.allMarkets}
            </motion.button>
            {markets.map(m => (
              <motion.button key={m} whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedMarket(m)}
                className={`market-pill market-pill-compact ${selectedMarket === m ? 'market-pill-active' : ''}`}>
                <MarketLogo market={m} size={18} className="flex-none" />
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
              placeholder={ui.searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full text-sm focus:outline-none transition-all"
              style={{ background: 'white', border: '1.5px solid #E0D8CE', color: '#1A1A1A' }}
            />
          </div>
          {avgDiscount > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-full" style={{ background: 'rgba(27,158,75,0.08)' }}>
              <span className="material-symbols-outlined text-sm" style={{ color: '#1B9E4B' }}>trending_down</span>
              <span className="text-sm font-bold" style={{ color: '#1B9E4B' }}>Gemiddeld {avgDiscount}% goedkoper</span>
            </div>
          )}
        </div>

        <p className="text-sm mb-6" style={{ color: '#8C8478' }}>{filtered.length} {ui.found}</p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 rounded-3xl" style={{ background: 'rgba(255,255,255,0.6)' }}>
            <span className="material-symbols-outlined text-6xl mb-4 block" style={{ color: '#C9C1B6' }}>search_off</span>
            <p className="text-xl font-headline font-bold" style={{ color: '#1A1A1A' }}>{ui.noDeals}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product, i) => (
              // MarketPage'deki fix'le aynı desen (2026-07-26/27): eerste 8 kaarten
              // boven de vouw meteen zichtbaar (SSR-HTML wacht anders op hydration,
              // en de oude i*0.03 stagger liep bij grote lijsten op tot seconden
              // vertraging). Rest fade't in bij scroll + content-visibility:auto.
              <motion.div key={product.id}
                className={i >= 8 ? 'cv-auto-card' : undefined}
                initial={i < 8 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -40px 0px' }}
                transition={{ duration: 0.3, delay: 0 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Categorie content — unieke redactionele tekst voor SEO */}
        {CATEGORY_CONTENT[category.id] && (
          <section
            className="mt-16 rounded-3xl p-6 md:p-8 prose prose-sm max-w-none"
            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(201,193,182,0.4)' }}
            dangerouslySetInnerHTML={{ __html: CATEGORY_CONTENT[category.id] }}
          />
        )}

        {/* Related blog posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-headline font-bold mb-5" style={{ color: '#1A1A1A' }}>
              Lees ook op ons blog
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedPosts.map(post => (
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

        {/* Populaire producten — /product/* sayfalarına tek iç link kaynağı.
            Öncesinde bu sayfalara sadece /product index'inden link vardı ve 20'nin
            14'ü GSC'de "keşfedildi ama taranmadı" durumundaydı (2026-08-01). */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-headline font-bold mb-4" style={{ color: '#1A1A1A' }}>{ui.popularProducts}</h2>
            <div className="flex flex-wrap gap-3">
              {relatedProducts.map(p => (
                <Link key={p.slug} href={`/product/${p.slug}`}
                  className="px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:bg-white"
                  style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid #E0D8CE', color: '#1A1A1A' }}>
                  {p.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Andere categorieën */}
        <section className="mt-20">
          <h2 className="text-xl font-headline font-bold mb-4" style={{ color: '#1A1A1A' }}>{ui.otherCats}</h2>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.filter(c => c.id !== category.id).map(c => (
              <Link key={c.id} href={`/categorie/${c.id}`}
                className="px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:bg-white"
                style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid #E0D8CE', color: '#1A1A1A' }}>
                {c.emoji} {CATEGORY_LABELS[c.id]?.[lang] ?? c.label}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <ShoppingListSidebar />
    </div>
  )
}
