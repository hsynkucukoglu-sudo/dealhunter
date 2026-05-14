import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'DealHunter4U — Beste Supermarkt Aanbiedingen Nederland'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
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
        {/* Achtergrond accent */}
        <div style={{
          position: 'absolute',
          top: -120,
          right: -80,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'rgba(227,61,38,0.08)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -100,
          left: -60,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(212,168,85,0.1)',
          display: 'flex',
        }} />

        {/* Badge */}
        <div style={{
          background: '#E33D26',
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
          ELKE WEEK BIJGEWERKT
        </div>

        {/* Titel */}
        <div style={{
          fontSize: 80,
          fontWeight: 900,
          color: '#1A1A1A',
          lineHeight: 1,
          marginBottom: 16,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <span>Beste</span>
          <span style={{ color: '#E33D26' }}>Supermarkt</span>
          <span>Aanbiedingen</span>
        </div>

        {/* Omschrijving */}
        <div style={{
          fontSize: 26,
          color: '#6B6259',
          marginTop: 24,
          display: 'flex',
        }}>
          AH · Jumbo · Lidl · Dirk · Aldi · Plus en meer
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
          dealhunter4u.nl
        </div>
      </div>
    ),
    { ...size }
  )
}
