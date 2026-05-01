import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact — DealHunter',
  description: 'Neem contact op met DealHunter4U.',
}

export default function ContactPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'Space Grotesk, sans-serif', color: '#1A1A1A' }}>
      <Link href="/" style={{ color: '#E33D26', textDecoration: 'none', fontSize: 14 }}>← Terug naar home</Link>

      <h1 style={{ fontSize: 36, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>Contact</h1>
      <p style={{ color: '#666', marginBottom: 40 }}>Heeft u een vraag, opmerking of samenwerking in gedachten? Neem gerust contact op.</p>

      <div style={{ background: '#FFF8F6', border: '2px solid #F5E6C8', borderRadius: 16, padding: 32, marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Contactgegevens</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>📧</span>
            <div>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 2 }}>E-mail</div>
              <a href="mailto:info@dealhunter4u.nl" style={{ color: '#E33D26', fontWeight: 600, textDecoration: 'none' }}>info@dealhunter4u.nl</a>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>🌐</span>
            <div>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 2 }}>Website</div>
              <a href="https://www.dealhunter4u.nl" style={{ color: '#E33D26', fontWeight: 600, textDecoration: 'none' }}>www.dealhunter4u.nl</a>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>🇳🇱</span>
            <div>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 2 }}>Locatie</div>
              <span style={{ fontWeight: 600 }}>Nederland</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: '#F0FDF4', border: '2px solid #BBF7D0', borderRadius: 16, padding: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Samenwerking?</h2>
        <p style={{ color: '#444', lineHeight: 1.7 }}>
          Bent u een supermarkt of merk en wilt u uw aanbiedingen uitlichten op DealHunter?
          Wij bieden mogelijkheden voor gesponsorde vermeldingen. Stuur ons een e-mail voor meer informatie.
        </p>
      </div>
    </div>
  )
}
