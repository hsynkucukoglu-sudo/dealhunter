import type { Metadata } from 'next'
import Link from 'next/link'
import { PRODUCT_KEYWORDS } from '@/lib/productKeywords'
import { buildBreadcrumbSchema } from '@/lib/schema'
import { DealHunterLogo } from '@/components/DealHunterLogo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { SiteFooter } from '@/components/SiteFooter'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Product Aanbiedingen per Categorie ✓ Vergelijk Alle Supermarkten | DealHunter4U',
  description: 'Zoek je rundergehakt, kipfilet, wasmiddel of koffie in de aanbieding? DealHunter4U vergelijkt alle supermarktdeals per product — wekelijks bijgewerkt.',
  alternates: { canonical: 'https://www.dealhunter4u.nl/product' },
}

const CATEGORIES = [
  { id: 'vlees-vis', label: 'Vlees & Vis' },
  { id: 'zuivel', label: 'Zuivel' },
  { id: 'dranken', label: 'Dranken' },
  { id: 'maaltijden', label: 'Maaltijden & Pasta' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'huishouden', label: 'Huishouden' },
  { id: 'verzorging', label: 'Verzorging' },
  { id: 'overig', label: 'Overig' },
]

const CATEGORY_ICONS: Record<string, string> = {
  'vlees-vis': '🥩',
  'zuivel': '🥛',
  'dranken': '🍺',
  'maaltijden': '🍝',
  'snacks': '🍿',
  'huishouden': '🧺',
  'verzorging': '🧴',
  'overig': '🛒',
}

export default function ProductIndexPage() {
  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Producten', url: '/product' },
  ])

  return (
    <div className="min-h-screen" style={{ background: '#F5EDE3' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-white"
        style={{ borderBottom: '1px solid rgba(228,190,183,0.4)', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}
      >
        <div className="flex justify-between items-center max-w-[1280px] mx-auto px-4 md:px-16 h-16 w-full">
          <div className="flex items-center gap-3">
            <Link href="/"><DealHunterLogo height={32} /></Link>
            <span className="text-sm" style={{ color: '#C9C1B6', fontFamily: 'JetBrains Mono' }}>›</span>
            <span className="text-sm font-medium" style={{ color: '#1A1A1A', fontFamily: 'JetBrains Mono' }}>Producten</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-[1280px] mx-auto px-4 md:px-16 pt-20 pb-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: '#9C9389', fontFamily: 'JetBrains Mono' }}>
          <Link href="/" className="hover:opacity-70">DealHunter4U</Link>
          <span style={{ color: '#C9C1B6' }}>›</span>
          <span style={{ color: '#1A1A1A' }}>Producten</span>
        </nav>

        {/* Header */}
        <h1
          className="font-bold leading-tight mb-3"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#1A1A1A', fontFamily: 'Space Grotesk', letterSpacing: '-0.02em' }}
        >
          Product Aanbiedingen Vergelijken
        </h1>
        <p className="text-base max-w-2xl mb-12" style={{ color: '#6B6259', fontFamily: 'Hanken Grotesk' }}>
          Selecteer een product en zie direct bij welke supermarkt je het deze week het goedkoopst kunt kopen.
          DealHunter4U vergelijkt {PRODUCT_KEYWORDS.length} populaire producten bij alle grote supermarkten.
        </p>

        {/* Grouped by category */}
        {CATEGORIES.map(cat => {
          const keywords = PRODUCT_KEYWORDS.filter(k => k.category === cat.id)
          if (keywords.length === 0) return null
          return (
            <div key={cat.id} className="mb-10">
              <h2
                className="font-bold mb-4 flex items-center gap-2"
                style={{ fontSize: '1.1rem', color: '#1A1A1A', fontFamily: 'Space Grotesk' }}
              >
                <span>{CATEGORY_ICONS[cat.id]}</span>
                {cat.label}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {keywords.map(k => (
                  <Link
                    key={k.slug}
                    href={`/product/${k.slug}`}
                    className="group flex flex-col gap-1 p-4 rounded-2xl transition-all hover:shadow-md hover:-translate-y-0.5"
                    style={{ background: 'white', border: '1.5px solid #E0D8CE', textDecoration: 'none' }}
                  >
                    <span className="font-bold text-sm" style={{ color: '#1A1A1A', fontFamily: 'Space Grotesk' }}>{k.label}</span>
                    <span className="text-[11px]" style={{ color: '#8C8478' }}>Vergelijk aanbiedingen →</span>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}

        {/* CTA */}
        <div className="mt-12 rounded-3xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(201,193,182,0.4)' }}>
          <h2 className="font-bold mb-2" style={{ fontSize: '1.2rem', color: '#1A1A1A', fontFamily: 'Space Grotesk' }}>
            Alle aanbiedingen bekijken?
          </h2>
          <p className="text-sm mb-4" style={{ color: '#6B6259' }}>
            Bekijk alle actuele supermarktdeals op de homepage.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:opacity-90"
            style={{ background: '#E33D26', color: 'white', textDecoration: 'none' }}
          >
            Bekijk alle deals →
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
