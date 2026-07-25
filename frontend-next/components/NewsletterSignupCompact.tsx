'use client'
import { useState } from 'react'
import { trackNewsletterSignup } from '@/lib/analytics'

// Compacte variant van NewsletterSignup — zelfde /api/newsletter/subscribe contract,
// maar één regel hoog i.p.v. een volle dark section, zodat hij past binnen de ~21%
// scroll-depth zone naast MeerBesparenWidget (zie ProductsPage.tsx commentaar bij
// AD #1). De volle versie blijft onderaan de pagina staan als tweede kans.
export function NewsletterSignupCompact() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (data.success) {
        setStatus('success')
        setEmail('')
        trackNewsletterSignup()
      } else {
        setStatus('error')
        setErrorMsg(data.error || 'Aanmelding mislukt')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Probeer het later opnieuw')
    }
  }

  if (status === 'success') {
    return (
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-6"
        style={{ background: 'rgba(27,158,75,0.1)', border: '1.5px solid rgba(27,158,75,0.3)' }}
      >
        <span className="text-2xl">✅</span>
        <p className="text-sm font-semibold" style={{ color: '#1B9E4B' }}>
          Bijna klaar! Check je inbox voor de bevestigingsmail.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 mb-6"
      style={{ background: '#1A1A1A' }}
    >
      <span className="text-2xl flex-none">📬</span>
      <div className="flex-1 min-w-[180px]">
        <p className="text-white font-bold text-sm leading-tight">Nooit een deal missen?</p>
        <p className="text-[11px]" style={{ color: '#9C9389' }}>Wekelijks de beste deals in je inbox — geen spam.</p>
      </div>
      <div className="flex gap-2 flex-none w-full sm:w-auto">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="jouw@email.nl"
          required
          className="flex-1 sm:w-48"
          style={{
            padding: '9px 12px',
            borderRadius: 10,
            border: '1.5px solid #333',
            background: '#2A2A2A',
            color: '#FFFFFF',
            fontSize: '0.85rem',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex-none"
          style={{
            padding: '9px 16px',
            borderRadius: 10,
            border: 'none',
            background: '#1B9E4B',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            opacity: status === 'loading' ? 0.7 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          {status === 'loading' ? '...' : 'Aanmelden'}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-xs w-full" style={{ color: '#E53935' }}>{errorMsg}</p>
      )}
    </form>
  )
}
