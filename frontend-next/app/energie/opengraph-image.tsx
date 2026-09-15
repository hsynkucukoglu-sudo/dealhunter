import { ImageResponse } from 'next/og'
import { ogSafeText } from '@/lib/ogText'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Deelplaatje voor /energie. Laatste 6 losse pagina's zonder og:image, gevonden
 * toen de 99/105-telling na de /vergelijk- en /product-inhaalslag nog 6 kale
 * pagina's overhield: dit zijn stuk voor stuk leaf routes (geen [slug]) die niet
 * onder de root opengraph-image.tsx vallen — Next.js erft dat conventiebestand
 * niet naar subroutes, elke route heeft zijn eigen nodig.
 */
export default function OgImage() {
  const title = ogSafeText('Energie Vergelijken 2026')

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
        <div style={{ position: 'absolute', top: -130, right: -90, width: 560, height: 560, borderRadius: '50%', background: '#FFB300', opacity: 0.14, display: 'flex' }} />

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
          Gas · Stroom · Zonnepanelen
        </div>

        <div style={{ fontSize: 74, fontWeight: 900, color: '#1A1A1A', lineHeight: 1.05, display: 'flex' }}>
          {title}
        </div>

        <div style={{ fontSize: 30, color: '#6B6259', marginTop: 24, display: 'flex' }}>
          Vergelijk energieleveranciers en bespaar op je vaste lasten
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
          dealhunter4u.nl/energie
        </div>
      </div>
    ),
    { ...size }
  )
}
