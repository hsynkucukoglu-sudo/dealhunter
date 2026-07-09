import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PRODUCT_KEYWORDS, getProductKeywordData } from '@/lib/productKeywords'
import { buildBreadcrumbSchema, buildFaqSchema, buildMultiMarketProductListSchema, getISOWeek } from '@/lib/schema'
import { DealHunterLogo } from '@/components/DealHunterLogo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ProductCard } from '@/components/ProductCard'
import { DealAlertForm } from '@/components/DealAlertForm'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return PRODUCT_KEYWORDS.map(k => ({ slug: k.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getProductKeywordData(slug)
  if (!data) return {}
  const { keyword, products, marketCount } = data
  const week = getISOWeek(new Date())
  const url = `https://www.dealhunter4u.nl/product/${slug}`
  const title = `${keyword.label} Aanbieding Week ${week} ✓ Vergelijk ${marketCount || 'Alle'} Winkels | DealHunter4U`
  const description = `✓ ${products.length} actuele ${keyword.label} aanbiedingen bij ${marketCount} supermarkten — wekelijks bijgewerkt. Vergelijk de laagste prijs en bespaar.`

  return {
    title,
    description,
    openGraph: { title, description, url, siteName: 'DealHunter4U', locale: 'nl_NL', type: 'website' },
    alternates: { canonical: url },
  }
}

export default async function ProductKeywordPage({ params }: Props) {
  const { slug } = await params
  const data = await getProductKeywordData(slug)
  if (!data) notFound()

  const { keyword, products, marketCount, avgDiscount, cheapestMarket } = data
  const week = getISOWeek(new Date())

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Producten', url: '/product' },
    { name: keyword.label, url: `/product/${slug}` },
  ])

  const faqs = [
    {
      question: `Waar is ${keyword.label} deze week het goedkoopst?`,
      answer: cheapestMarket
        ? `Deze week heeft ${cheapestMarket} de scherpste ${keyword.label} aanbieding. Er zijn in totaal ${products.length} deals bij ${marketCount} supermarkten. Vergelijk hieronder alle actuele prijzen.`
        : `Vergelijk hieronder alle actuele ${keyword.label} aanbiedingen bij de verschillende supermarkten.`,
    },
    {
      question: `Hoeveel korting krijg ik op ${keyword.label}?`,
      answer: avgDiscount > 0
        ? `De gemiddelde korting op ${keyword.label} deze week is ${avgDiscount}%. DealHunter4U berekent het werkelijke kortingspercentage ten opzichte van de normale prijs.`
        : `DealHunter4U toont alle actuele ${keyword.label} aanbiedingen inclusief kortingspercentages.`,
    },
    {
      question: `Wanneer is ${keyword.label} het vaakst in de aanbieding?`,
      answer: `Supermarkten wisselen hun folder wekelijks, meestal op woensdag (AH, Jumbo, Dirk) of maandag (Lidl, Aldi). DealHunter4U wordt dagelijks bijgewerkt zodat je nooit een ${keyword.label} aanbieding mist.`,
    },
    {
      question: `Bij welke supermarkten kan ik ${keyword.label} kopen?`,
      answer: `${keyword.label} is verkrijgbaar bij ${marketCount} supermarkten die DealHunter4U vergelijkt: Albert Heijn, Jumbo, Lidl, Aldi, Dirk, Hoogvliet, Vomar, DekaMarkt, Plus en Kruidvat.`,
    },
  ]
  const faqSchema = buildFaqSchema(faqs)
  const productListSchema = products.length > 0
    ? buildMultiMarketProductListSchema(products, `${keyword.label} Aanbiedingen`, `/product/${slug}`)
    : null

  return (
    <div className="min-h-screen" style={{ background: '#F5EDE3' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {productListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productListSchema) }} />
      )}

      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-white"
        style={{ borderBottom: '1px solid rgba(228,190,183,0.4)', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}
      >
        <div className="flex justify-between items-center max-w-[1280px] mx-auto px-4 md:px-16 h-16 w-full">
          <div className="flex items-center gap-3">
            <Link href="/"><DealHunterLogo height={32} /></Link>
            <span className="text-sm" style={{ color: '#C9C1B6', fontFamily: 'JetBrains Mono' }}>›</span>
            <Link href="/product" className="hidden md:block text-sm font-medium hover:opacity-70" style={{ color: '#6B6259', fontFamily: 'JetBrains Mono' }}>Producten</Link>
            <span className="hidden md:block text-sm" style={{ color: '#C9C1B6', fontFamily: 'JetBrains Mono' }}>›</span>
            <span className="hidden md:block text-sm font-medium" style={{ color: '#1A1A1A', fontFamily: 'JetBrains Mono' }}>{keyword.label}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-[1280px] mx-auto px-4 md:px-16 pt-20 pb-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: '#9C9389', fontFamily: 'JetBrains Mono' }}>
          <Link href="/" className="hover:opacity-70">DealHunter4U</Link>
          <span style={{ color: '#C9C1B6' }}>›</span>
          <Link href="/product" className="hover:opacity-70">Producten</Link>
          <span style={{ color: '#C9C1B6' }}>›</span>
          <span style={{ color: '#1A1A1A' }}>{keyword.label}</span>
        </nav>

        {/* Header */}
        <h1
          className="font-headline font-bold leading-tight mb-2"
          style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#1A1A1A', fontFamily: 'Space Grotesk', letterSpacing: '-0.02em' }}
        >
          {keyword.label} Aanbieding Week {week}
        </h1>
        <p className="text-base max-w-2xl mb-6" style={{ color: '#6B6259', fontFamily: 'Hanken Grotesk' }}>
          {keyword.description} {products.length > 0 ? `${products.length} actuele deals bij ${marketCount} supermarkten.` : 'Momenteel geen actieve aanbiedingen gevonden.'}
        </p>

        {/* Stats row */}
        {products.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              { label: 'Deals', value: products.length },
              { label: 'Supermarkten', value: marketCount },
              { label: 'Gem. korting', value: `${avgDiscount}%` },
              ...(cheapestMarket ? [{ label: 'Goedkoopst bij', value: cheapestMarket }] : []),
            ].map(s => (
              <div key={s.label} className="px-4 py-2.5 rounded-2xl" style={{ background: 'white', border: '1.5px solid #E0D8CE' }}>
                <div className="text-base font-black" style={{ color: '#1A1A1A', fontFamily: 'Space Grotesk' }}>{s.value}</div>
                <div className="text-[11px] font-medium" style={{ color: '#8C8478' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Product grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-12">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-16 rounded-3xl mb-12" style={{ background: 'white', border: '1.5px solid #E0D8CE' }}>
            <p className="text-lg font-semibold mb-2" style={{ color: '#1A1A1A' }}>Geen aanbiedingen gevonden</p>
            <p className="text-sm" style={{ color: '#8C8478' }}>Er zijn momenteel geen actuele {keyword.label} aanbiedingen. Kom later terug!</p>
            <Link href="/" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full text-sm font-bold" style={{ background: '#1A1A1A', color: 'white', textDecoration: 'none' }}>
              Bekijk alle deals →
            </Link>
          </div>
        )}

        {/* Deal Alert */}
        <div className="rounded-3xl p-6 md:p-8 mb-8" style={{ background: 'white', border: '1.5px solid #E0D8CE' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-xl" style={{ color: '#E33D26', fontVariationSettings: '"FILL" 1' }}>notifications</span>
            <h2 className="font-bold" style={{ fontSize: '1rem', color: '#1A1A1A', fontFamily: 'Space Grotesk' }}>
              Alert instellen voor {keyword.label}
            </h2>
          </div>
          <p className="text-sm mb-4" style={{ color: '#6B6259' }}>
            Ontvang een e-mail zodra er nieuwe {keyword.label} aanbiedingen zijn — gratis, geen account nodig.
          </p>
          <DealAlertForm defaultKeyword={keyword.label} />
        </div>

        {/* FAQ */}
        <div className="rounded-3xl p-6 md:p-10 mb-8" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(201,193,182,0.4)' }}>
          <h2 className="font-headline font-bold mb-6" style={{ fontSize: '1.25rem', color: '#1A1A1A' }}>
            Veelgestelde vragen over {keyword.label} aanbiedingen
          </h2>
          <div className="space-y-5">
            {faqs.map(faq => (
              <div key={faq.question}>
                <p className="font-bold mb-1" style={{ color: '#1A1A1A' }}>{faq.question}</p>
                <p className="text-sm leading-relaxed" style={{ color: '#5A534B' }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related products */}
        <div>
          <h2 className="font-headline font-bold mb-4" style={{ fontSize: '1.1rem', color: '#1A1A1A' }}>Bekijk ook</h2>
          <div className="flex flex-wrap gap-2">
            {PRODUCT_KEYWORDS.filter(k => k.slug !== slug).slice(0, 10).map(k => (
              <Link
                key={k.slug}
                href={`/product/${k.slug}`}
                className="px-3 py-1.5 rounded-full text-sm font-semibold transition-all hover:shadow-sm"
                style={{ background: 'white', border: '1.5px solid #E0D8CE', color: '#5A534B', textDecoration: 'none' }}
              >
                {k.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
