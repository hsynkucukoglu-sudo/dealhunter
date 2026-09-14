import type { Metadata } from 'next'
import { getProducts } from '@/lib/api'
import { ProductsPage } from '@/components/ProductsPage'

export const metadata: Metadata = {
    title: 'Verlopende Aanbiedingen: Sorteer op Einddatum | DealHunter4U',
    description: 'Alle actuele deals gesorteerd op verloopdatum — zie precies welke aanbiedingen het eerst verdwijnen. Vergelijk prijzen en mis geen deal meer.',
    alternates: {
          canonical: 'https://www.dealhunter4u.nl/deals',
    },
    // 2026-09-14: noindex. GSC meldde "Kopya, Google koos een andere canonical
    // dan de gebruiker". Oorzaak: deze route rendert dezelfde ProductsPage als
    // `/`, alleen met defaultSort="expiring" en een andere hero — de zichtbare
    // tekst komt voor 79% overeen (16.839 vs 16.988 tekens). Google koos `/` als
    // canonical en merkte /deals aan als kopie.
    //
    // Zelfde afweging als bij de 46 dunne /vergelijk-pagina's (13-07): de pagina
    // blijft gewoon bruikbaar (PWA-snelkoppeling + CTA in een blogpost), maar
    // hoort niet in de index. Hij trok ook geen enkele zoekklik.
    // follow: true — de links erop mogen wél gevolgd worden.
    robots: { index: false, follow: true },
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
