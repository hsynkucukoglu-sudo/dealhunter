import type { Metadata } from 'next'
import { getProducts } from '@/lib/api'
import { buildHomePageSchema } from '@/lib/schema'
import { ProductsPage } from '@/components/ProductsPage'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.dealhunter4u.nl',
  },
}

export default async function Home() {
  const products = await getProducts()
  const schemas = buildHomePageSchema(products)

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <ProductsPage initialProducts={products} />
    </>
  )
}
