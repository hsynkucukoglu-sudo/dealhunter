import { ImageResponse } from 'next/og'
import { getAllPairs, parsePairSlug, getMarketStats, getWinner, isComparable } from '@/lib/vergelijk'
import { getISOWeek } from '@/lib/schema'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Deelplaatje voor /vergelijk/<a>-vs-<b>.
 *
 * Waarom deze bestaat: van de 105 pagina's in de sitemap hadden er 38 geen
 * og:image, en de zeven vergelijkpagina's zaten daarbij. Juist die mikken op de
 * zoekvraag die het best presteert (`jumbo vs lidl` 20% CTR, `jumbo of ah` 25%,
 * `is jumbo duur` 33%) en zijn dus het meest deelbaar — maar wie ze in WhatsApp
 * of op social plakte, kreeg een kale link zonder plaatje.
 *
 * Belangrijk: dit plaatje volgt dezelfde eerlijkheidsregel als de pagina zelf.
 * Staat er "geen eerlijke winnaar" op de pagina omdat de dekkingsgraden te veel
 * verschillen (zie isComparable in lib/vergelijk.ts), dan zet het plaatje ook
 * geen winnaar neer. Een deelplaatje dat "Aldi wint" roept terwijl de pagina dat
 * juist weerspreekt, zou de fout die daar is rechtgezet via de achterdeur weer
 * binnenhalen — en een plaatje reist verder dan de pagina.
 */
export async function generateStaticParams() {
  return getAllPairs().map(p => ({ slug: p.slug }))
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const pair = parsePairSlug(slug)

  if (!pair) {
    return new ImageResponse(
      (
        <div style={{ width: 1200, height: 630, background: '#F5EDE3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, fontWeight: 900, color: '#1A1A1A' }}>
          DealHunter4U
        </div>
      ),
      { ...size }
    )
  }

  const { a, b } = pair
  const [sa, sb] = await Promise.all([getMarketStats(a), getMarketStats(b)])
  const winner = getWinner(a, sa, b, sb)
  const comparable = isComparable(sa, sb)
  const week = getISOWeek(new Date())

  const verdict = winner
    ? `Deze week de scherpste kortingen: ${winner.market.name}`
    : comparable
      ? 'Deze week vrijwel gelijk'
      : 'Bekijk de deals naast elkaar'

  const Column = ({ name, color, dealCount, assortment, maxDiscount }: {
    name: string; color: string; dealCount: number; assortment: number; maxDiscount: number
  }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 440 }}>
      <div style={{ fontSize: name.length > 11 ? 52 : 64, fontWeight: 900, color, lineHeight: 1.05, display: 'flex', textAlign: 'center' }}>
        {name}
      </div>
      <div style={{ fontSize: 30, color: '#1A1A1A', marginTop: 20, fontWeight: 700, display: 'flex' }}>
        {dealCount} van {assortment} afgeprijsd
      </div>
      <div style={{ fontSize: 26, color: '#6B6259', marginTop: 8, display: 'flex' }}>
        {maxDiscount > 0 ? `tot ${maxDiscount}% korting` : 'wordt bijgewerkt'}
      </div>
    </div>
  )

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#F5EDE3',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 70px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Achtergrondvlakken in de twee marktkleuren, links/rechts gespiegeld */}
        <div style={{ position: 'absolute', top: -140, left: -120, width: 520, height: 520, borderRadius: '50%', background: a.color, opacity: 0.1, display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: -140, right: -120, width: 520, height: 520, borderRadius: '50%', background: b.color, opacity: 0.1, display: 'flex' }} />

        <div style={{
          background: '#1A1A1A',
          color: 'white',
          fontSize: 18,
          fontWeight: 900,
          padding: '8px 20px',
          borderRadius: 30,
          letterSpacing: 3,
          textTransform: 'uppercase',
          marginBottom: 40,
          display: 'flex',
        }}>
          Week {week} · Uit de officiële folders
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Column name={a.name} color={a.color} dealCount={sa.dealCount} assortment={sa.assortmentCount} maxDiscount={sa.maxDiscount} />
          <div style={{ fontSize: 44, fontWeight: 900, color: '#C9C1B6', width: 120, display: 'flex', justifyContent: 'center' }}>
            vs
          </div>
          <Column name={b.name} color={b.color} dealCount={sb.dealCount} assortment={sb.assortmentCount} maxDiscount={sb.maxDiscount} />
        </div>

        <div style={{ fontSize: 32, color: '#1A1A1A', fontWeight: 700, marginTop: 48, display: 'flex', textAlign: 'center' }}>
          {verdict}
        </div>

        <div style={{
          position: 'absolute',
          bottom: 42,
          background: '#E33D26',
          color: 'white',
          fontSize: 20,
          fontWeight: 700,
          padding: '10px 26px',
          borderRadius: 30,
          display: 'flex',
        }}>
          dealhunter4u.nl
        </div>
      </div>
    ),
    { ...size }
  )
}
