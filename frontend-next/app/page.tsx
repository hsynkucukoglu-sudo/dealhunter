import type { Metadata } from 'next'
import { getProducts } from '@/lib/api'
import { ProductsPage } from '@/components/ProductsPage'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.dealhunter4u.nl',
  },
}

export default async function Home() {
  const products = await getProducts()
  return <ProductsPage initialProducts={products} />
}
