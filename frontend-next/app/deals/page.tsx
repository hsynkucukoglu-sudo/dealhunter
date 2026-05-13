import type { Metadata } from 'next'
import { getProducts } from '@/lib/api'
import { ProductsPage } from '@/components/ProductsPage'

export const metadata: Metadata = {
    title: 'Alle Deals & Aanbiedingen | DealHunter4U',
    description: 'Bekijk alle actuele supermarkt deals en aanbiedingen van Albert Heijn, Jumbo, Lidl, Dirk en meer. Vergelijk prijzen en bespaar op uw boodschappen.',
    alternates: {
          canonical: 'https://www.dealhunter4u.nl/deals',
    },
    openGraph: {
          title: 'Alle Deals & Aanbiedingen | DealHunter4U',
          description: 'Bekijk alle actuele supermarkt deals en aanbiedingen van Albert Heijn, Jumbo, Lidl, Dirk en meer.',
          url: 'https://www.dealhunter4u.nl/deals',
    },
}

export default async function DealsPage() {
    const products = await getProducts()
    return <ProductsPage initialProducts={products} />
}
