import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProducts } from '@/lib/api'
import { MARKETS } from '@/lib/types'
import { buildBreadcrumbSchema, buildFaqSchema } from '@/lib/schema'
import { MarketPage } from '@/components/MarketPage'
import { MARKET_FAQS } from '@/lib/marketFaqs'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return MARKETS.map(m => ({ slug: m.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const market = MARKETS.find(m => m.slug === slug)
  if (!market) return {}

  const pageTitle = market.ctaTitle ?? `${market.name} Acties & Aanbiedingen Deze Week | DealHunter`

  return {
    title: pageTitle,
    description: market.description,
    keywords: market.keywords,
    openGraph: {
      title: pageTitle,
      description: market.description,
      url: `https://www.dealhunter4u.nl/supermarkt/${slug}`,
      siteName: 'DealHunter',
      locale: 'nl_NL',
      type: 'website',
    },
    alternates: {
      canonical: `https://www.dealhunter4u.nl/supermarkt/${slug}`,
    },
  }
}

export default async function SupermarktPage({ params }: Props) {
  const { slug } = await params
  const market = MARKETS.find(m => m.slug === slug)
  if (!market) notFound()

  const allProducts = await getProducts()
  const products = allProducts.filter(p => p.market === market.name)

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Supermarkten', url: '/supermarkt' },
    { name: `${market.name} Aanbiedingen`, url: `/supermarkt/${slug}` },
  ])
  const faqs = MARKET_FAQS[slug] ?? []
  const faqSchema = faqs.length ? buildFaqSchema(faqs) : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <MarketPage market={market} initialProducts={products} />
    </>
  )
}
