import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductsByMarket } from '@/lib/api'
import { MARKETS, VISIBLE_MARKETS } from '@/lib/types'
import { buildBreadcrumbSchema, buildFaqSchema, buildProductListSchema, getISOWeek } from '@/lib/schema'
import { MarketPage } from '@/components/MarketPage'
import { MARKET_FAQS } from '@/lib/marketFaqs'
import { getPostsByMarket } from '@/lib/posts'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return VISIBLE_MARKETS.map(m => ({ slug: m.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const market = MARKETS.find(m => m.slug === slug)
  if (!market) return {}

  const week = getISOWeek(new Date())
  const year = new Date().getFullYear()
  const products = await getProductsByMarket(market.name)
  const dealCount = products.length
  const topDiscount = products.length > 0
    ? Math.max(...products.map(p => p.discount || 0))
    : 0

  // Deal sayısı varsa dinamik title (CTR için ✓ + rakam), yoksa statik fallback
  // dealBrandTerm: marketin eigen aanbiedingsmerk (bv. AH's "Bonus") — H1 ile ve GSC hedef sorgularıyla tutarlı olsun diye title/description'a da eklenir
  const brandTerm = (market as { dealBrandTerm?: string }).dealBrandTerm
  const brandPrefix = brandTerm ? `${brandTerm} ` : ''
  const baseTitle = market.ctaTitle ?? `${market.name} Aanbiedingen Deze Week | DealHunter4U`
  const pageTitle = dealCount > 0
    ? `${market.name} ${brandPrefix}Aanbiedingen Week ${week} ✓ ${dealCount} Actuele Deals | DealHunter4U`
    : baseTitle.replace('Deze Week', `Week ${week} ${year}`)

  const discountStr = topDiscount > 0 ? ` — tot ${topDiscount}% korting` : ''
  const dynamicDesc = dealCount > 0
    ? `✓ ${dealCount} actuele ${market.name} ${brandPrefix}aanbiedingen voor week ${week}${discountStr}. ${market.description}`
    : market.description

  return {
    title: pageTitle,
    description: dynamicDesc,
    keywords: market.keywords,
    openGraph: {
      title: pageTitle,
      description: dynamicDesc,
      url: `https://www.dealhunter4u.nl/supermarkt/${slug}`,
      siteName: 'DealHunter4U',
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
  if (!market || (market as { hidden?: boolean }).hidden) notFound()

  const products = await getProductsByMarket(market.name)
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
