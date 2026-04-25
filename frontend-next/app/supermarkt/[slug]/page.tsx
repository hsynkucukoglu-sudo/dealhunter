import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProducts } from '@/lib/api'
import { MARKETS } from '@/lib/types'
import { MarketPage } from '@/components/MarketPage'

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

  return {
    title: `${market.name} Aanbiedingen Deze Week — DealHunter`,
    description: market.description,
    keywords: market.keywords,
    openGraph: {
      title: `${market.name} Aanbiedingen — DealHunter`,
      description: market.description,
      url: `https://dealhunter4u.nl/supermarkt/${slug}`,
      siteName: 'DealHunter',
      locale: 'nl_NL',
      type: 'website',
    },
    alternates: {
      canonical: `https://dealhunter4u.nl/supermarkt/${slug}`,
    },
  }
}

export default async function SupermarktPage({ params }: Props) {
  const { slug } = await params
  const market = MARKETS.find(m => m.slug === slug)
  if (!market) notFound()

  const allProducts = await getProducts()
  const products = allProducts.filter(p => p.market === market.name)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${market.name} Aanbiedingen`,
    description: market.description,
    url: `https://dealhunter4u.nl/supermarkt/${slug}`,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 50).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        offers: {
          '@type': 'Offer',
          price: p.discountedPrice,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          priceValidUntil: p.expiresAt,
          seller: { '@type': 'Organization', name: market.name },
        },
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketPage market={market} initialProducts={products} />
    </>
  )
}
