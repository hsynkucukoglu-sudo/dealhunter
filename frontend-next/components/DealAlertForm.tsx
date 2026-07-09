'use client'
import React, { useState } from 'react'
import { PRODUCT_KEYWORDS } from '@/lib/productKeywords'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://dealhunter-production-d900.up.railway.app'

export function DealAlertForm({ defaultKeyword = '' }: { defaultKeyword?: string }) {
  const [email, setEmail] = useState('')
  const [keyword, setKeyword] = useState(defaultKeyword)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const suggestions = keyword.length >= 1
    ? PRODUCT_KEYWORDS.filter(k => k.label.toLowerCase().includes(keyword.toLowerCase())).slice(0, 4)
    : []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !keyword) return
    setStatus('loading')
    try {
      const res = await fetch(`${API_BASE}/api/deal-alerts/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, keyword }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(data.message ?? `Alert ingesteld voor "${keyword}"!`)
      } else {
        setStatus('error')
        setMessage(data.error ?? 'Er ging iets mis, probeer opnieuw.')
      }
    } catch {
      setStatus('error')
      setMessage('Verbindingsfout. Probeer het later opnieuw.')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: 'rgba(27,158,75,0.08)', border: '1.5px solid rgba(27,158,75,0.25)' }}>
        <span className="material-symbols-outlined text-xl" style={{ color: '#1B9E4B', fontVariationSettings: '"FILL" 1' }}>check_circle</span>
        <div>
          <p className="font-bold text-sm" style={{ color: '#1A1A1A' }}>Alert ingesteld!</p>
          <p className="text-xs mt-0.5" style={{ color: '#5A534B' }}>{message}</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <input
          type="text"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="Bijv. rundergehakt, wasmiddel..."
          required
          className="w-full px-4 py-3 rounded-2xl text-sm border outline-none transition-all"
          style={{ borderColor: '#E0D8CE', background: '#FAFAF8', fontFamily: 'Hanken Grotesk', color: '#1A1A1A' }}
        />
        {suggestions.length > 0 && keyword && (
          <div
            className="absolute top-full left-0 right-0 mt-1 rounded-2xl overflow-hidden shadow-lg z-10"
            style={{ background: 'white', border: '1.5px solid #E0D8CE' }}
          >
            {suggestions.map(s => (
              <button
                key={s.slug}
                type="button"
                onClick={() => setKeyword(s.label)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                style={{ color: '#1A1A1A', fontFamily: 'Hanken Grotesk' }}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="jouw@email.nl"
        required
        className="w-full px-4 py-3 rounded-2xl text-sm border outline-none transition-all"
        style={{ borderColor: '#E0D8CE', background: '#FAFAF8', fontFamily: 'Hanken Grotesk', color: '#1A1A1A' }}
      />
      {status === 'error' && (
        <p className="text-xs px-1" style={{ color: '#E33D26' }}>{message}</p>
      )}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
        style={{ background: '#1A1A1A', color: 'white', fontFamily: 'Space Grotesk' }}
      >
        {status === 'loading' ? 'Bezig...' : 'Alert instellen →'}
      </button>
      <p className="text-[11px] text-center" style={{ color: '#B0A89E' }}>
        Gratis · Geen account nodig · Uitschrijven met één klik
      </p>
    </form>
  )
}
