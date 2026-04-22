import { getProducts } from '@/lib/api'
import { ProductsPage } from '@/components/ProductsPage'

export default async function Home() {
  const products = await getProducts()
  return <ProductsPage initialProducts={products} />
}
