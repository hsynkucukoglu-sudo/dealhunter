import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProducts } from '@/lib/api'
import { CATEGORIES } from '@/lib/types'
import { CategoryPage } from '@/components/CategoryPage'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return CATEGORIES.map(c => ({ slug: c.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cat = CATEGORIES.find(c => c.id === slug)
  if (!cat) return {}

  const title = `${cat.emoji} ${cat.label} Aanbiedingen — DealHunter`
  const description = `Bekijk alle actuele ${cat.label} aanbiedingen van Albert Heijn, Jumbo, Lidl, Dirk en meer. Vergelijk prijzen en bespaar op ${cat.label.toLowerCase()}.`

  return {
    title,
    description,
    keywords: `${cat.label.toLowerCase()} aanbieding, ${cat.label.toLowerCase()} supermarkt, goedkope ${cat.label.toLowerCase()}`,
    openGraph: {
      title,
      description,
      url: `https://dealhunter4u.nl/categorie/${slug}`,
      siteName: 'DealHunter',
      locale: 'nl_NL',
      type: 'website',
    },
    alternates: {
      canonical: `https://dealhunter4u.nl/categorie/${slug}`,
    },
  }
}

export default async function CategoriePageRoute({ params }: Props) {
  const { slug } = await params
  const cat = CATEGORIES.find(c => c.id === slug)
  if (!cat) notFound()

  const allProducts = await getProducts()
  const products = allProducts.filter(p => p.category === slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${cat.label} Aanbiedingen`,
    description: `Actuele ${cat.label} aanbiedingen van Nederlandse supermarkten`,
    url: `https://dealhunter4u.nl/categorie/${slug}`,
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
          seller: { '@type': 'Organization', name: p.market },
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
      <CategoryPage category={cat} initialProducts={products} />
    </>
  )
}
