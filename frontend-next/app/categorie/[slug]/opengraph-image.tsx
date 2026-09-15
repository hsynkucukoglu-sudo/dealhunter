import { ImageResponse } from 'next/og'
import { getProductsByCategory } from '@/lib/api'
import { CATEGORIES, MARKET_COLORS } from '@/lib/types'
import { getISOWeek } from '@/lib/schema'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Deelplaatje voor /categorie/<id>.
 *
 * Laatste stuk van de og:image-inhaalslag: van de 105 sitemappagina's misten er
 * 38 een deelplaatje, waarvan 10 categoriepagina's. /supermarkt, /blog,
 * /vergelijk en /product hebben er inmiddels een.
 *
 * BEWUST GEEN EMOJI, ook al heeft elke categorie er een in CATEGORIES. Satori
 * haalt glyphs die niet in het basisfont zitten als "dynamic font" op, en dat
 * faalt hier: tijdens de build komt voor elke bestaande og:image met een vinkje
 * in de titel "Failed to load dynamic font for ✓ (Status: 400)" voorbij. Een
 * emoji zou hetzelfde doen en als leeg blokje landen — juist op het plaatje dat
 * bedoeld is om gedeeld te worden.
 */
export async function generateStaticParams() {
  return CATEGORIES.map(c => ({ slug: c.id }))
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cat = CATEGORIES.find(c => c.id === slug)
  const week = getISOWeek(new Date())

  const label = cat?.label ?? 'Aanbiedingen'
  const products = cat ? await getProductsByCategory(slug) : []
  const deals = products.filter(p => (p.discount ?? 0) > 0)
  const marketCount = new Set(products.map(p => p.market)).size
  const topDeal = deals.length > 0
    ? [...deals].sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0))[0]
    : null
  const accent = (topDeal && MARKET_COLORS[topDeal.market]) || '#E33D26'

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
        <div style={{ position: 'absolute', bottom: -140, left: -110, width: 520, height: 520, borderRadius: '50%', background: accent, opacity: 0.1, display: 'flex' }} />
        <div style={{ position: 'absolute', top: -120, right: -80, width: 460, height: 460, borderRadius: '50%', background: '#1A1A1A', opacity: 0.05, display: 'flex' }} />

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

        {products.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 34 }}>
            <div style={{ fontSize: 34, color: '#1A1A1A', fontWeight: 700, display: 'flex' }}>
              {products.length} producten bij {marketCount} {marketCount === 1 ? 'supermarkt' : 'supermarkten'}
            </div>
            {topDeal && (
              <div style={{ fontSize: 27, color: '#6B6259', marginTop: 12, display: 'flex' }}>
                Scherpste deze week: {topDeal.discount}% korting bij {topDeal.market}
              </div>
            )}
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
          dealhunter4u.nl/categorie/{slug}
        </div>
      </div>
    ),
    { ...size }
  )
}
