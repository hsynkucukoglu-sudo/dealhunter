import { ImageResponse } from 'next/og'
import { getProducts } from '@/lib/api'
import { computeMarketCounts } from '@/lib/marketStats'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * /tr icin paylasim gorseli. Sayfanin kendisi Turkce oldugu icin bu gorsel de
 * Turkce — diger sayfalarin Felemenkce kalip degil. Zie app/energie/
 * opengraph-image.tsx voor de rest van de inhaalslag-toelichting.
 *
 * BEWUST GEEN Turkse diakrieten (s-cedilla, g-breve, dotless i, o/u-umlaut).
 * lib/ogText.ts loste net op dat het vinkje (U+2713) als leeg blokje rendert
 * omdat Satori alleen het meegeleverde basisfont gebruikt; dezelfde klasse fout
 * is denkbaar bij Latin Extended-A tekens die niet in dat font zitten. Zonder
 * een lokale test op dat font is "leesbaar Turks zonder diakrieten" de veiligere
 * keuze dan het risico op een tweede stille lege-blokje-bug.
 */
export default async function OgImage() {
  const products = await getProducts()
  const marketCount = Object.keys(computeMarketCounts(products)).length

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
        <div style={{ position: 'absolute', top: -130, right: -90, width: 560, height: 560, borderRadius: '50%', background: '#E33D26', opacity: 0.1, display: 'flex' }} />

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
          Haftalik Firsatlar
        </div>

        <div style={{ fontSize: 62, fontWeight: 900, color: '#1A1A1A', lineHeight: 1.1, display: 'flex', flexDirection: 'column' }}>
          <span>Hollanda Supermarket</span>
          <span style={{ color: '#E33D26' }}>Indirimleri</span>
        </div>

        <div style={{ fontSize: 30, color: '#6B6259', marginTop: 24, display: 'flex' }}>
          {products.length} urun · {marketCount} supermarket — tek yerde karsilastir
        </div>

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
          dealhunter4u.nl/tr
        </div>
      </div>
    ),
    { ...size }
  )
}
