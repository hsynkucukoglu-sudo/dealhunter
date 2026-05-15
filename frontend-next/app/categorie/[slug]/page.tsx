import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProducts } from '@/lib/api'
import { CATEGORIES } from '@/lib/types'
import { buildItemListSchema } from '@/lib/schema'
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
      url: `https://www.dealhunter4u.nl/categorie/${slug}`,
      siteName: 'DealHunter',
      locale: 'nl_NL',
      type: 'website',
    },
    alternates: {
      canonical: `https://www.dealhunter4u.nl/categorie/${slug}`,
    },
  }
}

export default async function CategoriePageRoute({ params }: Props) {
  const { slug } = await params
  const cat = CATEGORIES.find(c => c.id === slug)
  if (!cat) notFound()

  const allProducts = await getProducts()
  const products = allProducts.filter(p => p.category === slug)

  const jsonLd = buildItemListSchema(
    `${cat.label} Aanbiedingen`,
    `Actuele ${cat.label} aanbiedingen van Nederlandse supermarkten`,
    `/categorie/${slug}`,
    products,
  )

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
