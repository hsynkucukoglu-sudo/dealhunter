import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacybeleid — DealHunter',
  description: 'Lees ons privacybeleid en hoe wij omgaan met uw gegevens.',
}

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'Space Grotesk, sans-serif', color: '#1A1A1A' }}>
      <Link href="/" style={{ color: '#E33D26', textDecoration: 'none', fontSize: 14 }}>← Terug naar home</Link>

      <h1 style={{ fontSize: 36, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>Privacybeleid</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Laatst bijgewerkt: mei 2026</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>1. Wie zijn wij?</h2>
        <p>DealHunter4U is een prijsvergelijkingswebsite voor supermarktaanbiedingen in Nederland. Wij zijn bereikbaar via <a href="mailto:info@dealhunter4u.nl" style={{ color: '#E33D26' }}>info@dealhunter4u.nl</a>.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>2. Welke gegevens verzamelen wij?</h2>
        <p>Wij verzamelen geen persoonlijke gegevens tenzij u zelf contact met ons opneemt. Bij gebruik van onze website kunnen de volgende gegevens automatisch worden verzameld:</p>
        <ul style={{ marginTop: 12, paddingLeft: 24, lineHeight: 2 }}>
          <li>IP-adres (geanonimiseerd)</li>
          <li>Browsertype en apparaatinformatie</li>
          <li>Bezochte pagina's en klikgedrag (via Google Analytics)</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>3. Waarvoor gebruiken wij uw gegevens?</h2>
        <ul style={{ paddingLeft: 24, lineHeight: 2 }}>
          <li>Verbetering van onze website en diensten</li>
          <li>Tonen van relevante advertenties via Google AdSense</li>
          <li>Statistische analyse van websitegebruik</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>4. Cookies</h2>
        <p>Wij maken gebruik van cookies voor analytics en advertenties. U kunt cookies uitschakelen via uw browserinstellingen. Wij gebruiken:</p>
        <ul style={{ marginTop: 12, paddingLeft: 24, lineHeight: 2 }}>
          <li><strong>Google Analytics</strong> — websitestatistieken</li>
          <li><strong>Google AdSense</strong> — gepersonaliseerde advertenties</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>5. Delen met derden</h2>
        <p>Wij verkopen uw gegevens niet aan derden. Gegevens kunnen worden gedeeld met Google voor analytics- en advertentiedoeleinden conform hun eigen privacybeleid.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>6. Uw rechten</h2>
        <p>U heeft het recht om uw gegevens in te zien, te corrigeren of te verwijderen. Neem hiervoor contact op via <a href="mailto:info@dealhunter4u.nl" style={{ color: '#E33D26' }}>info@dealhunter4u.nl</a>.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>7. Contact</h2>
        <p>Voor vragen over dit privacybeleid kunt u contact opnemen via <a href="mailto:info@dealhunter4u.nl" style={{ color: '#E33D26' }}>info@dealhunter4u.nl</a>.</p>
      </section>
    </div>
  )
}
