import type { Metadata } from 'next'
import { getProducts } from '@/lib/api'
import { ProductsPage } from '@/components/ProductsPage'

export const metadata: Metadata = {
    title: 'Verlopende Aanbiedingen: Sorteer op Einddatum | DealHunter4U',
    description: 'Alle actuele deals gesorteerd op verloopdatum — zie precies welke aanbiedingen het eerst verdwijnen. Vergelijk prijzen en mis geen deal meer.',
    alternates: {
          canonical: 'https://www.dealhunter4u.nl/deals',
    },
    openGraph: {
          title: 'Verlopende Aanbiedingen: Sorteer op Einddatum | DealHunter4U',
          description: 'Alle actuele deals gesorteerd op verloopdatum — zie precies welke aanbiedingen het eerst verdwijnen.',
          url: 'https://www.dealhunter4u.nl/deals',
    },
}

export default async function DealsPage() {
    const products = await getProducts()
    return (
        <ProductsPage
            initialProducts={products}
            defaultSort="expiring"
            heroOverride={{
                title1: 'Mis geen deal',
                title2: 'meer',
                subtitle: 'Alle aanbiedingen gesorteerd op verloopdatum — bovenaan zie je wat het eerst verdwijnt.',
            }}
        />
    )
}
