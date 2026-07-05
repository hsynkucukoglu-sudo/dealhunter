import { ImageResponse } from 'next/og'
import { getProductsByMarket } from '@/lib/api'
import { MARKETS, VISIBLE_MARKETS } from '@/lib/types'
import { getISOWeek } from '@/lib/schema'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export async function generateStaticParams() {
  return VISIBLE_MARKETS.map(m => ({ slug: m.slug }))
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const market = MARKETS.find(m => m.slug === slug)

  const name = market?.name ?? 'DealHunter4U'
  const color = market?.color ?? '#E33D26'
  const brandTerm = (market as { dealBrandTerm?: string } | undefined)?.dealBrandTerm
  const week = getISOWeek(new Date())
  const products = market ? await getProductsByMarket(market.name) : []
  const dealCount = products.length
  const topDiscount = products.length > 0 ? Math.max(...products.map(p => p.discount || 0)) : 0

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
        {/* Achtergrond accenten in marktkleur */}
        <div style={{
          position: 'absolute',
          top: -120,
          right: -80,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: hexToRgba(color, 0.12),
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -100,
          left: -60,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: hexToRgba(color, 0.08),
          display: 'flex',
        }} />

        {/* Badge */}
        <div style={{
          background: color,
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
          Week {week} · Dagelijks bijgewerkt
        </div>

        {/* Titel */}
        <div style={{
          fontSize: name.length > 12 ? 64 : 80,
          fontWeight: 900,
          color: '#1A1A1A',
          lineHeight: 1.05,
          marginBottom: 16,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <span>{name}</span>
          <span style={{ color }}>{brandTerm ? `${brandTerm} Aanbiedingen` : 'Aanbiedingen'}</span>
        </div>

        {/* Omschrijving */}
        <div style={{
          fontSize: 30,
          color: '#6B6259',
          marginTop: 16,
          display: 'flex',
        }}>
          {dealCount > 0
            ? `${dealCount} actuele deals${topDiscount > 0 ? ` — tot ${topDiscount}% korting` : ''}`
            : 'Alle actuele aanbiedingen op één plek'}
        </div>

        {/* URL badge */}
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
          dealhunter4u.nl/supermarkt/{slug}
        </div>
      </div>
    ),
    { ...size }
  )
}
