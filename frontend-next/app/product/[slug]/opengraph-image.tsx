import { ImageResponse } from 'next/og'
import { PRODUCT_KEYWORDS, getProductKeywordData } from '@/lib/productKeywords'
import { MARKET_COLORS } from '@/lib/types'
import { getISOWeek } from '@/lib/schema'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Deelplaatje voor /product/<keyword>.
 *
 * Van de 105 pagina's in de sitemap hadden er 38 geen og:image; de 15
 * productpagina's zaten daarbij. /supermarkt (10/10), /blog (48/49) en sinds
 * kort /vergelijk (7/7) hebben er wel een.
 *
 * Deze pagina's mikken op keywordvraag ("kipfilet aanbieding", "wasmiddel
 * aanbieding") en hun waarde zit in het prijsverschil tussen winkels, dus dat
 * is wat het plaatje toont: de laagste prijs van deze week, bij welke keten, en
 * hoeveel winkels we ervoor vergeleken.
 *
 * Geen "bespaar X%" of superlatieven: net als op de vergelijkpagina's staat er
 * alleen wat we ook echt gemeten hebben. Zonder producten deze week wordt het
 * een neutraal plaatje in plaats van een belofte die de pagina niet waarmaakt.
 */
export async function generateStaticParams() {
  return PRODUCT_KEYWORDS.map(k => ({ slug: k.slug }))
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getProductKeywordData(slug)
  const week = getISOWeek(new Date())

  const label = data?.keyword.label ?? 'Aanbiedingen'
  const products = data?.products ?? []
  const marketCount = data?.marketCount ?? 0
  const cheapest = products.length > 0
    ? [...products].sort((a, b) => a.discountedPrice - b.discountedPrice)[0]
    : null
  const accent = (cheapest && MARKET_COLORS[cheapest.market]) || '#E33D26'

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#F5EDE3',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px 100px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: -130, right: -90, width: 560, height: 560, borderRadius: '50%', background: accent, opacity: 0.12, display: 'flex' }} />

        <div style={{
          background: '#1A1A1A',
          color: 'white',
          fontSize: 18,
          fontWeight: 900,
          padding: '8px 20px',
          borderRadius: 30,
          letterSpacing: 3,
          textTransform: 'uppercase',
          marginBottom: 32,
          display: 'flex',
        }}>
          Week {week} · Uit de officiële folders
        </div>

        <div style={{
          fontSize: label.length > 14 ? 62 : 78,
          fontWeight: 900,
          color: '#1A1A1A',
          lineHeight: 1.05,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <span>{label}</span>
          <span style={{ color: accent }}>aanbiedingen</span>
        </div>

        {cheapest ? (
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 34 }}>
            <div style={{ fontSize: 34, color: '#1A1A1A', fontWeight: 700, display: 'flex' }}>
              Laagste deze week: €{cheapest.discountedPrice.toFixed(2).replace('.', ',')} bij {cheapest.market}
            </div>
            <div style={{ fontSize: 27, color: '#6B6259', marginTop: 12, display: 'flex' }}>
              {products.length} aanbiedingen vergeleken bij {marketCount} {marketCount === 1 ? 'winkel' : 'winkels'}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 30, color: '#6B6259', marginTop: 34, display: 'flex' }}>
            Alle actuele aanbiedingen op één plek
          </div>
        )}

        <div style={{
          position: 'absolute',
          bottom: 60,
          right: 100,
          background: '#1A1A1A',
          color: 'white',
          fontSize: 22,
          fontWeight: 700,
          padding: '12px 28px',
          borderRadius: 30,
          display: 'flex',
        }}>
          dealhunter4u.nl/product/{slug}
        </div>
      </div>
    ),
    { ...size }
  )
}
