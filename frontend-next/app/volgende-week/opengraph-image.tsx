import { ImageResponse } from 'next/og'
import { getISOWeek } from '@/lib/schema'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Zie de toelichting in app/energie/opengraph-image.tsx — zelfde inhaalslag. */
export default function OgImage() {
  const week = getISOWeek(new Date()) + 1

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
        <div style={{ position: 'absolute', top: -130, right: -90, width: 560, height: 560, borderRadius: '50%', background: '#00A0E2', opacity: 0.12, display: 'flex' }} />

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
          Vooruitblik week {week}
        </div>

        <div style={{ fontSize: 68, fontWeight: 900, color: '#1A1A1A', lineHeight: 1.05, display: 'flex', flexDirection: 'column' }}>
          <span>Aanbiedingen</span>
          <span style={{ color: '#00A0E2' }}>Volgende Week</span>
        </div>

        <div style={{ fontSize: 30, color: '#6B6259', marginTop: 24, display: 'flex' }}>
          Vroeg weten wat er in de folder komt
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
          dealhunter4u.nl/volgende-week
        </div>
      </div>
    ),
    { ...size }
  )
}
