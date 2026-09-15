import { ImageResponse } from 'next/og'
import { getKortingsindex } from '@/lib/kortingsindex'
import { getISOWeek } from '@/lib/schema'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const MONTHS_NL = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
]

/**
 * Deelplaatje voor /kortingsindex.
 *
 * Bewust GEEN top-3 of "beste keten": de pagina zelf sorteert alfabetisch en
 * legt uit waarom een ranglijst hier misleidt (zie lib/kortingsindex.ts) — van
 * de ene keten volgen we enkele tientallen kopdeals, van de andere honderden
 * producten inclusief kleine kortingen, dus een gemiddelde meet vooral wat wij
 * ophalen. Hetzelfde probleem dat /vergelijk had (commit 2d2d4c6) voor dit
 * plaatje dus niet herhalen: alleen het totaal aantal deals en het aantal
 * ketens, geen vergelijkend cijfer.
 */
export default async function OgImage() {
  const entries = await getKortingsindex()
  const totalDeals = entries.reduce((s, e) => s + e.dealCount, 0)
  const marketCount = entries.length
  const week = getISOWeek(new Date())
  const now = new Date()
  const month = MONTHS_NL[now.getMonth()]

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
          Week {week} · Alfabetisch, geen ranglijst
        </div>

        <div style={{ fontSize: 68, fontWeight: 900, color: '#1A1A1A', lineHeight: 1.05, display: 'flex', flexDirection: 'column' }}>
          <span>Kortingsindex</span>
          <span style={{ color: '#E33D26', fontSize: 40, fontWeight: 700 }}>{month} 2026</span>
        </div>

        <div style={{ fontSize: 32, color: '#1A1A1A', fontWeight: 700, marginTop: 30, display: 'flex' }}>
          {totalDeals} aanbiedingen bij {marketCount} supermarkten
        </div>
        <div style={{ fontSize: 26, color: '#6B6259', marginTop: 8, display: 'flex' }}>
          Rechtstreeks uit de officiële folders
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
          dealhunter4u.nl/kortingsindex
        </div>
      </div>
    ),
    { ...size }
  )
}
