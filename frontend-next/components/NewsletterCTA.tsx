'use client'
import React, { useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dealhunter-production-d900.up.railway.app'

type Variant = 'blog' | 'market'

export function NewsletterCTA({ variant = 'blog', marketName }: { variant?: Variant; marketName?: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      setStatus(res.ok ? 'ok' : 'err')
    } catch {
      setStatus('err')
    }
  }

  const heading = variant === 'market' && marketName
    ? `📬 Mis geen ${marketName} deal meer`
    : '📬 Elke week de beste supermarktdeals'

  const sub = variant === 'market' && marketName
    ? `Ontvang de ${marketName} weekaanbiedingen direct in je inbox — gratis, afmelden met 1 klik.`
    : 'De beste aanbiedingen van alle supermarkten, elke week gratis in je inbox. Geen spam, altijd afmelden.'

  return (
    <section
      className="mt-12 rounded-3xl p-6 md:p-8"
      style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2520 100%)' }}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1">
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: 'white', fontFamily: 'Space Grotesk' }}
          >
            {heading}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#C9C1B6', fontFamily: 'Hanken Grotesk' }}>
            {sub}
          </p>
          <a
            href="https://wa.me/31649305079"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: '#4ADE80', fontFamily: 'JetBrains Mono' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Of volg ons op WhatsApp
          </a>
        </div>

        <div className="md:w-72 flex-none">
          {status === 'ok' ? (
            <div className="text-center py-4">
              <span className="text-3xl">🎉</span>
              <p className="text-sm font-bold mt-2" style={{ color: '#4ADE80', fontFamily: 'Space Grotesk' }}>
                Bijna klaar! Check je inbox
              </p>
              <p className="text-xs mt-1" style={{ color: '#9C9389', fontFamily: 'JetBrains Mono' }}>
                Bevestig je aanmelding via de email die we stuurden.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <input
                type="email"
                required
                placeholder="jouw@email.nl"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  color: 'white',
                  fontFamily: 'Hanken Grotesk',
                }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: '#E33D26',
                  color: 'white',
                  fontFamily: 'Space Grotesk',
                  opacity: status === 'loading' ? 0.7 : 1,
                }}
              >
                {status === 'loading' ? 'Aanmelden…' : 'Gratis aanmelden →'}
              </button>
              {status === 'err' && (
                <p className="text-xs text-center" style={{ color: '#FCA5A5', fontFamily: 'JetBrains Mono' }}>
                  Probeer het opnieuw
                </p>
              )}
              <p className="text-[10px] text-center" style={{ color: '#6B6259', fontFamily: 'JetBrains Mono' }}>
                Geen spam · 1 email/week · afmelden met 1 klik
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
