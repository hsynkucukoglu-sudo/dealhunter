import { DealHunterLogo } from '@/components/DealHunterLogo'
import Link from 'next/link'
import { GoogleLoginButton } from './GoogleLoginButton'

const BENEFITS = [
  {
    icon: '🔔',
    title: 'Prijsalerts',
    desc: 'Ontvang een melding zodra jouw favoriete product in de aanbieding gaat.',
  },
  {
    icon: '❤️',
    title: 'Favorieten bewaren',
    desc: 'Sla deals op en vergelijk prijzen van meerdere supermarkten.',
  },
  {
    icon: '🛒',
    title: 'Boodschappenlijst',
    desc: 'Maak een persoonlijke lijst en bespaar elke week slim.',
  },
]

export default function LoginPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: '#FAF6F0' }}
    >
      {/* Back to home */}
      <Link
        href="/"
        className="flex items-center gap-1.5 mb-10 text-sm font-medium transition-opacity hover:opacity-70"
        style={{ color: '#8C8478' }}
      >
        <span className="material-symbols-outlined text-base leading-none">arrow_back</span>
        Terug naar deals
      </Link>

      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{
          background: 'white',
          border: '1.5px solid #E0D8CE',
          boxShadow: '0 8px 40px rgba(0,0,0,0.07)',
        }}
      >
        {/* Header */}
        <div
          className="flex flex-col items-center pt-10 pb-8 px-8"
          style={{ borderBottom: '1.5px solid #F0EBE5' }}
        >
          <Link href="/" className="mb-6">
            <DealHunterLogo height={44} />
          </Link>
          <h1 className="text-xl font-headline font-black mb-1.5" style={{ color: '#1A1A1A' }}>
            Inloggen op DealHunter
          </h1>
          <p className="text-sm text-center leading-relaxed" style={{ color: '#8C8478' }}>
            Log in en mis nooit meer een aanbieding bij jouw supermarkt.
          </p>
        </div>

        {/* Benefits */}
        <div className="px-8 py-6 flex flex-col gap-4" style={{ borderBottom: '1.5px solid #F0EBE5' }}>
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex items-start gap-3">
              <span className="text-xl leading-none mt-0.5">{b.icon}</span>
              <div>
                <p className="text-sm font-semibold leading-tight" style={{ color: '#1A1A1A' }}>
                  {b.title}
                </p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#8C8478' }}>
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Sign-in form */}
        <div className="px-8 pt-6 pb-8">
          <GoogleLoginButton />

          <p className="mt-5 text-xs text-center leading-relaxed" style={{ color: '#B8AFA6' }}>
            Door in te loggen ga je akkoord met ons{' '}
            <Link href="/privacy" className="underline underline-offset-2 hover:opacity-70" style={{ color: '#8C8478' }}>
              privacybeleid
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-8 text-xs text-center" style={{ color: '#C9C1B6' }}>
        Gratis · Geen wachtwoord nodig · Altijd uitloggen via je profiel
      </p>
    </main>
  )
}
