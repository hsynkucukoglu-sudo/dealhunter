import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProducts } from '@/lib/api'
import { MARKETS } from '@/lib/types'
import { buildBreadcrumbSchema, buildFaqSchema, buildProductListSchema, getISOWeek } from '@/lib/schema'
import { MarketPage } from '@/components/MarketPage'
import { MARKET_FAQS } from '@/lib/marketFaqs'
import { getPostsByMarket } from '@/lib/posts'

export const revalidate = 3600

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

  const week = getISOWeek(new Date())
  const year = new Date().getFullYear()
  const baseTitle = market.ctaTitle ?? `${market.name} Aanbiedingen Deze Week | DealHunter`
  const pageTitle = baseTitle.replace('Deze Week', `Week ${week} ${year}`)

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
  const relatedPosts = getPostsByMarket(slug)

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Supermarkten', url: '/supermarkt' },
    { name: `${market.name} Aanbiedingen`, url: `/supermarkt/${slug}` },
  ])
  const faqs = MARKET_FAQS[slug] ?? []
  const faqSchema = faqs.length ? buildFaqSchema(faqs) : null
  const productListSchema = products.length > 0
    ? buildProductListSchema(products, market.name, slug)
    : null

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
      {productListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productListSchema) }}
        />
      )}
      <MarketPage market={market} initialProducts={products} relatedPosts={relatedPosts} />
    </>
  )
}
