import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBrandList, getBrandPageData } from '@/lib/brands'
import { CATEGORY_LABELS } from '@/lib/types'
import { buildBreadcrumbSchema, buildFaqSchema, buildMultiMarketProductListSchema, getISOWeek } from '@/lib/schema'
import { DealHunterLogo } from '@/components/DealHunterLogo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ProductCard } from '@/components/ProductCard'
import { MarketFAQ } from '@/components/MarketFAQ'

function categoryLabel(id: string): string {
  return CATEGORY_LABELS[id]?.nl ?? id
}

function topCategoryOf(products: { category: string }[]): string | null {
  const counts = new Map<string, number>()
  products.forEach(p => counts.set(p.category, (counts.get(p.category) ?? 0) + 1))
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
  return sorted[0]?.[0] ?? null
}

export const revalidate = 3600
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const brands = await getBrandList()
  return brands.map(b => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getBrandPageData(slug)
  if (!data) return {}
  const week = getISOWeek(new Date())
  const url = `https://www.dealhunter4u.nl/merk/${slug}`
  const title = `${data.name} Aanbieding Deze Week ✓ ${data.products.length} Deals bij ${data.marketCount} Winkels | DealHunter4U`
  const description = `✓ Alle ${data.name} aanbiedingen van deze week naast elkaar — ${data.products.length} deals bij ${data.marketCount} supermarkten. Wekelijks bijgewerkt.`

  return {
    title,
    description,
    openGraph: { title, description, url, siteName: 'DealHunter4U', locale: 'nl_NL', type: 'website' },
    alternates: { canonical: url },
  }
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params
  const data = await getBrandPageData(slug)
  if (!data) notFound()
  const { name, products, marketCount, cheapestMarket, avgDiscount } = data
  const week = getISOWeek(new Date())

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Merken', url: '/merk' },
    { name, url: `/merk/${slug}` },
  ])
  const faqs = [
    {
      question: `Wat zijn de beste ${name} aanbiedingen deze week?`,
      answer: `Deze week zijn er ${products.length} actuele ${name} aanbiedingen bij ${marketCount} supermarkten, met een gemiddelde korting van ${avgDiscount}%. DealHunter4U verzamelt dagelijks alle ${name} deals uit de officiële folders.`,
    },
    {
      question: `Bij welke supermarkt is ${name} het goedkoopst?`,
      answer: cheapestMarket
        ? `Deze week heeft ${cheapestMarket} de scherpste ${name} aanbieding. Vergelijk hieronder alle ${name} deals per supermarkt om de beste prijs te vinden.`
        : `Vergelijk hieronder alle ${name} deals per supermarkt om de beste prijs te vinden.`,
    },
    {
      question: `Hoe vaak wisselen de ${name} aanbiedingen?`,
      answer: 'De meeste supermarkten wisselen hun folder wekelijks, meestal op zondag of woensdag. DealHunter4U wordt dagelijks bijgewerkt zodat je altijd de actuele deals ziet.',
    },
  ]
  const faqSchema = buildFaqSchema(faqs)
  const productListSchema = products.length > 0
    ? buildMultiMarketProductListSchema(products, `${name} Aanbiedingen`, `/merk/${slug}`)
    : null

  const topDeal = products[0] ?? null
  const topCategory = topCategoryOf(products)

  return (
    <div className="min-h-screen" style={{ background: '#F5EDE3' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {productListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productListSchema) }} />
      )}

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
            <span className="hidden md:block text-sm font-medium" style={{ color: '#6B6259', fontFamily: 'JetBrains Mono' }}>{name}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-[1280px] mx-auto px-4 md:px-16 pt-20 pb-20">
        <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: '#9C9389', fontFamily: 'JetBrains Mono' }}>
          <Link href="/" className="hover:text-primary transition-colors">DealHunter4U</Link>
          <span style={{ color: '#C9C1B6' }}>›</span>
          <Link href="/merk" className="hover:text-primary transition-colors">Merken</Link>
          <span style={{ color: '#C9C1B6' }}>›</span>
          <span style={{ color: '#1A1A1A' }}>{name}</span>
        </nav>

        <div className="mb-10">
          <h1
            className="font-headline font-bold leading-tight mb-2"
            style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#1A1A1A', fontFamily: 'Space Grotesk', letterSpacing: '-0.02em' }}
          >
            {name} Aanbiedingen
          </h1>
          <p className="text-sm" style={{ color: '#9C9389', fontFamily: 'JetBrains Mono' }}>
            Week {week} · {products.length} aanbiedingen bij {marketCount} winkels
          </p>
        </div>

        {avgDiscount > 0 && (
          <div className="flex items-center gap-2 mb-8 p-3 rounded-2xl w-fit" style={{ background: 'rgba(27,158,75,0.08)' }}>
            <span className="material-symbols-outlined" style={{ color: '#1B9E4B' }}>trending_down</span>
            <span className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
              Gemiddeld <strong style={{ color: '#1B9E4B' }}>{avgDiscount}% korting</strong> op {name}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-16">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {topDeal && (
          <section className="rounded-3xl p-6 md:p-8 mb-10" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(201,193,182,0.4)' }}>
            <h2 className="text-xl font-headline font-bold mb-3" style={{ color: '#1A1A1A' }}>
              {name} aanbiedingen deze week
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#6B6259', fontFamily: 'Hanken Grotesk' }}>
              Deze week zijn er {products.length} {name} aanbiedingen te vinden bij {marketCount} supermarkten,
              met een gemiddelde korting van {avgDiscount}%. De sterkste aanbieding is op dit moment{' '}
              <strong>{topDeal.name}</strong> bij {topDeal.market}: van €{topDeal.originalPrice.toFixed(2)} voor{' '}
              €{topDeal.discountedPrice.toFixed(2)}, een korting van {topDeal.discount}%.
              {topCategory && ` De meeste ${name} deals vallen deze week in de categorie ${categoryLabel(topCategory)}.`}{' '}
              DealHunter4U vergelijkt dagelijks alle {name} aanbiedingen uit de officiële folders, zodat je nooit de beste prijs mist.
            </p>
          </section>
        )}

        <MarketFAQ faqs={faqs} marketName={`${name}`} />

        <section className="mt-20">
          <h2 className="text-xl font-headline font-bold mb-4" style={{ color: '#1A1A1A' }}>Alle merken</h2>
          <Link
            href="/merk"
            className="inline-block px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:bg-white"
            style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid #E0D8CE', color: '#1A1A1A' }}
          >
            Bekijk alle merken →
          </Link>
        </section>
      </main>
    </div>
  )
}
