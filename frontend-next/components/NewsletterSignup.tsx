'use client'
import { useState } from 'react'

export function NewsletterSignup() {
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
      } else {
        setStatus('error')
        setErrorMsg(data.error || 'Aanmelding mislukt')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Probeer het later opnieuw')
    }
  }

  return (
    <section style={{
      background: '#1A1A1A',
      borderRadius: '24px',
      padding: '40px 32px',
      margin: '0 0 48px',
      textAlign: 'center',
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#1B9E4B', marginBottom: 12, display: 'block' }}>
        mail
      </span>
      <h2 style={{ color: '#FFFFFF', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px', fontFamily: 'Space Grotesk, sans-serif' }}>
        Nooit een deal missen?
      </h2>
      <p style={{ color: '#C9C1B6', fontSize: '0.95rem', margin: '0 0 24px' }}>
        Ontvang de beste deals van de week in je inbox — plus een seintje bij grote kortingen.
      </p>

      {status === 'success' ? (
        <div style={{ background: 'rgba(27,158,75,0.15)', border: '1px solid rgba(27,158,75,0.3)', borderRadius: 12, padding: '16px 24px' }}>
          <p style={{ color: '#1B9E4B', fontWeight: 700, margin: 0 }}>
            Bijna klaar! Check je inbox voor de bevestigingsmail.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, maxWidth: 440, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="jouw@email.nl"
            required
            style={{
              flex: '1 1 220px',
              padding: '12px 16px',
              borderRadius: 12,
              border: '1.5px solid #333',
              background: '#2A2A2A',
              color: '#FFFFFF',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              border: 'none',
              background: '#1B9E4B',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              opacity: status === 'loading' ? 0.7 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {status === 'loading' ? 'Aanmelden...' : 'Aanmelden'}
          </button>
          {status === 'error' && (
            <p style={{ color: '#E53935', fontSize: '0.85rem', width: '100%', margin: '4px 0 0', textAlign: 'center' }}>
              {errorMsg}
            </p>
          )}
        </form>
      )}

      <p style={{ color: '#666', fontSize: '0.75rem', margin: '16px 0 0' }}>
        Geen spam. Afmelden kan altijd. GDPR-conform.
      </p>
    </section>
  )
}
