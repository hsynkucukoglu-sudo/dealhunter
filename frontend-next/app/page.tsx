import type { Metadata } from 'next'
import { getProducts } from '@/lib/api'
import { buildHomePageSchema } from '@/lib/schema'
import { ProductsPage } from '@/components/ProductsPage'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.dealhunter4u.nl',
  },
}

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const allProducts = await getProducts()
  const markets = [...new Set(allProducts.map(p => p.market))].join(', ')
  const schema = buildHomePageSchema(markets)

  // HTML boyutunu 1MB altında tutmak için sadece top 60 ürün SSR ile gönder.
  // Geri kalanlar ProductsPage içinde client-side API'den yüklenir.
  const initialProducts = allProducts
    .filter(p => p.originalPrice > p.discountedPrice && p.originalPrice > 0)
    .sort((a, b) => ((b.originalPrice - b.discountedPrice) / b.originalPrice) - ((a.originalPrice - a.discountedPrice) / a.originalPrice))
    .slice(0, 60)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ProductsPage initialProducts={initialProducts} initialSearch={q ?? ''} />
    </>
  )
}
