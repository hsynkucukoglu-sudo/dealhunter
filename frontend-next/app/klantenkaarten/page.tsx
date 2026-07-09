import type { Metadata } from 'next'
import { KlantenKaartenClient } from './KlantenKaartenClient'
import Link from 'next/link'
import { DealHunterLogo } from '@/components/DealHunterLogo'

export const metadata: Metadata = {
  title: 'Digitale Klantenkaarten — AH Bonuskaart, Jumbo Extra\'s & Meer | DealHunter4U',
  description: 'Sla je supermarkt klantenkaarten op in de DealHunter app. Altijd je AH Bonuskaart, Jumbo Extra\'s, Lidl Plus of Aldi klantenkaart bij de hand — direct oproepen als barcode.',
  alternates: { canonical: 'https://www.dealhunter4u.nl/klantenkaarten' },
}

export default function KlantenKaartenPage() {
  return (
    <div className="min-h-screen" style={{ background: '#F5EDE3' }}>
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-white"
        style={{ borderBottom: '1px solid rgba(228,190,183,0.4)', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}
      >
        <div className="flex justify-between items-center max-w-[1280px] mx-auto px-4 md:px-16 h-16 w-full">
          <Link href="/"><DealHunterLogo height={32} /></Link>
        </div>
      </nav>

      <main className="max-w-[640px] mx-auto px-4 pt-24 pb-24">
        <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: '#9C9389', fontFamily: 'JetBrains Mono' }}>
          <Link href="/" className="hover:opacity-70">DealHunter4U</Link>
          <span style={{ color: '#C9C1B6' }}>›</span>
          <span style={{ color: '#1A1A1A' }}>Klantenkaarten</span>
        </nav>

        <h1
          className="font-bold leading-tight mb-2"
          style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: '#1A1A1A', fontFamily: 'Space Grotesk', letterSpacing: '-0.02em' }}
        >
          Digitale Klantenkaarten
        </h1>
        <p className="text-base mb-8 max-w-lg" style={{ color: '#6B6259', fontFamily: 'Hanken Grotesk' }}>
          Sla je klantenkaart op als barcode. Toon direct bij de kassa — geen fysieke kaart meer nodig.
          Gegevens worden alleen lokaal op jouw apparaat opgeslagen.
        </p>

        <KlantenKaartenClient />
      </main>
    </div>
  )
}
